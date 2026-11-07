create extension if not exists pgcrypto;

create type public.account_role as enum ('passenger','driver','admin');
create type public.ride_status as enum ('requested','negotiating','accepted','arrived','in_progress','completed','cancelled');
create type public.payment_method as enum ('cash','card');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null,
 phone text not null,
 role public.account_role not null default 'passenger',
 avatar_url text,
 created_at timestamptz not null default now()
);
create table public.vehicles (
 id uuid primary key default gen_random_uuid(),
 driver_id uuid not null references public.profiles(id) on delete cascade,
 make text not null, model text not null, colour text not null,
 registration_number text not null,
 year int not null check(year between 1990 and 2035),
 vehicle_photo_path text, registration_doc_path text,
 verification_status text not null default 'pending' check(verification_status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(),
 unique(registration_number)
);
create table public.rides (
 id uuid primary key default gen_random_uuid(),
 passenger_id uuid not null references public.profiles(id),
 driver_id uuid references public.profiles(id),
 pickup_address text not null, destination_address text not null,
 pickup_lat double precision, pickup_lng double precision,
 destination_lat double precision, destination_lng double precision,
 passenger_offer_cents int not null check(passenger_offer_cents>0),
 agreed_fare_cents int,
 payment_method public.payment_method not null default 'cash',
 status public.ride_status not null default 'requested',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.ride_offers (
 id uuid primary key default gen_random_uuid(),
 ride_id uuid not null references public.rides(id) on delete cascade,
 driver_id uuid not null references public.profiles(id),
 amount_cents int not null check(amount_cents>0),
 message text,
 status text not null default 'pending' check(status in ('pending','accepted','rejected','withdrawn')),
 created_at timestamptz not null default now()
);
create table public.driver_locations (
 ride_id uuid primary key references public.rides(id) on delete cascade,
 driver_id uuid not null references public.profiles(id),
 latitude double precision not null,
 longitude double precision not null,
 heading double precision,
 updated_at timestamptz not null default now()
);
create table public.payment_transactions (
 id uuid primary key default gen_random_uuid(),
 ride_id uuid not null references public.rides(id),
 passenger_id uuid not null references public.profiles(id),
 provider_reference text not null unique,
 amount_cents int not null,
 status text not null default 'pending',
 verified_at timestamptz,
 created_at timestamptz not null default now()
);
create table public.driver_wallets (
 driver_id uuid primary key references public.profiles(id),
 available_cents bigint not null default 0,
 pending_cents bigint not null default 0,
 currency text not null default 'ZAR',
 updated_at timestamptz not null default now()
);
create table public.wallet_ledger (
 id uuid primary key default gen_random_uuid(),
 driver_id uuid not null references public.profiles(id),
 ride_id uuid references public.rides(id),
 entry_type text not null check(entry_type in ('ride_earning','platform_fee','withdrawal','adjustment')),
 amount_cents bigint not null,
 status text not null default 'available',
 created_at timestamptz not null default now()
);
create table public.withdrawal_requests (
 id uuid primary key default gen_random_uuid(),
 driver_id uuid not null references public.profiles(id),
 amount_cents bigint not null check(amount_cents>0),
 bank_recipient_code text not null,
 transfer_reference text unique,
 status text not null default 'pending',
 created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.rides enable row level security;
alter table public.ride_offers enable row level security;
alter table public.driver_locations enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.driver_wallets enable row level security;
alter table public.wallet_ledger enable row level security;
alter table public.withdrawal_requests enable row level security;

create policy "profiles read own" on public.profiles for select using (auth.uid()=id);
create policy "profiles update own" on public.profiles for update using (auth.uid()=id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid()=id);
create policy "vehicle owner read" on public.vehicles for select using (auth.uid()=driver_id);
create policy "vehicle owner insert" on public.vehicles for insert with check (auth.uid()=driver_id);
create policy "ride parties read" on public.rides for select using (auth.uid()=passenger_id or auth.uid()=driver_id);
create policy "passenger create ride" on public.rides for insert with check (auth.uid()=passenger_id);
create policy "ride parties update" on public.rides for update using (auth.uid()=passenger_id or auth.uid()=driver_id);
create policy "offer driver read own" on public.ride_offers for select using (auth.uid()=driver_id);
create policy "offer driver create" on public.ride_offers for insert with check (auth.uid()=driver_id);
create policy "driver location trip parties read" on public.driver_locations for select using (
 exists(select 1 from public.rides r where r.id=ride_id and (r.passenger_id=auth.uid() or r.driver_id=auth.uid()))
);
create policy "driver location owner upsert" on public.driver_locations for all using (auth.uid()=driver_id) with check (auth.uid()=driver_id);
create policy "payment passenger read" on public.payment_transactions for select using (auth.uid()=passenger_id);
create policy "wallet owner read" on public.driver_wallets for select using (auth.uid()=driver_id);
create policy "ledger owner read" on public.wallet_ledger for select using (auth.uid()=driver_id);
create policy "withdrawal owner read" on public.withdrawal_requests for select using (auth.uid()=driver_id);
create policy "withdrawal owner create" on public.withdrawal_requests for insert with check (auth.uid()=driver_id);

create or replace function public.record_card_ride_earning(p_ride_id uuid,p_driver_id uuid,p_gross_cents int,p_fee_cents int)
returns void language plpgsql security definer set search_path=public as $$
begin
 if p_gross_cents<=0 or p_fee_cents<0 or p_fee_cents>=p_gross_cents then raise exception 'Invalid earning amounts'; end if;
 insert into public.driver_wallets(driver_id,available_cents) values(p_driver_id,p_gross_cents-p_fee_cents)
 on conflict(driver_id) do update set available_cents=driver_wallets.available_cents+(p_gross_cents-p_fee_cents),updated_at=now();
 insert into public.wallet_ledger(driver_id,ride_id,entry_type,amount_cents,status) values
 (p_driver_id,p_ride_id,'ride_earning',p_gross_cents-p_fee_cents,'available'),
 (p_driver_id,p_ride_id,'platform_fee',-p_fee_cents,'settled');
end $$;
revoke all on function public.record_card_ride_earning(uuid,uuid,int,int) from public,anon,authenticated;
grant execute on function public.record_card_ride_earning(uuid,uuid,int,int) to service_role;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,full_name,phone,role)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name','New member'),
 coalesce(new.raw_user_meta_data->>'phone',''),
 case when new.raw_user_meta_data->>'role'='driver' then 'driver'::public.account_role else 'passenger'::public.account_role end)
 on conflict(id) do nothing;
 return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
