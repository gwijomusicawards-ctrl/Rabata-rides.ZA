# Rabalata Rides

Next.js + Supabase + Mapbox + Paystack foundation for a South African shuttle marketplace.

## Important status
This is a production-oriented application foundation, not a claim that a live transport/payment service is already activated. Real bookings, maps, card processing, driver payouts, identity checks, and location tracking require the external accounts, secrets, provider approvals, database setup, and final end-to-end testing described below. No demo accounts or fake trip records are included.

## Features in this source
- Email/password authentication; phone number is stored as contact information only.
- Passenger and driver account roles.
- Ride request and fare offer database model.
- Vehicle registration form and approval status model.
- Mapbox map component.
- Server-side Paystack transaction initialization and verification.
- Driver location endpoint restricted to the assigned active trip.
- Driver wallet and ledger schema.
- About page and 60-second promotional video slot.
- Responsive mobile-first interface.

## Run on a phone
1. Install Termux from its official source, or use a computer if available.
2. Install Node.js LTS in Termux: `pkg update && pkg install nodejs-lts git`
3. Put this project folder in a location Termux can access.
4. Run `npm install`
5. Copy `.env.example` to `.env.local` and fill in the provider values.
6. Run `npm run dev -- --hostname 0.0.0.0`
7. Open `http://localhost:3000` in your phone browser.

A phone can edit and upload the project, but initial database and payment-provider configuration is easier in the provider dashboards.

## Supabase setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In Authentication > URL Configuration, set the site URL to your Render URL and add the matching redirect URLs.
4. Enable email/password sign-in and configure email confirmation links. Login uses email + password, not an OTP.
5. Create private storage buckets for `driver-selfies`, `vehicle-photos`, `vehicle-documents`, and `identity-documents`. Add restrictive storage policies. Never make identity documents public.
6. Add the Supabase URL, anon key and service role key to Render environment variables. Never expose the service role key in browser code.

## Mapbox setup
Create a Mapbox account and add `NEXT_PUBLIC_MAPBOX_TOKEN` in Render. Restrict the public token to your website domains. Live navigation, geocoding/search, route directions, and real-time trip sharing still need the map search/directions UI and subscribed trip channel wired into the passenger/driver screens before launch.

## Paystack and driver withdrawals
Set up a South African Paystack merchant account and complete its business verification. Add the secret/public keys in Render. Test card transactions in the provider's test environment first.
- The included routes initialize and verify card transactions on the server. Sensitive transaction records and wallet-credit RPCs use the server-only Supabase service role key; that key must never be added to a NEXT_PUBLIC variable.
- Configure a webhook with signature verification before accepting asynchronous payment status updates in production.
- Driver withdrawals are deliberately not enabled by this starter: Paystack Transfers require eligible merchant access, verified driver bank details, recipient creation, transfer initiation, idempotency and webhook reconciliation. Do not enable withdrawals until these controls and the platform's legal/payment obligations have been reviewed.
- Configure the commission percentage transparently. Have an accountant/legal adviser review VAT, invoicing, consumer terms and transport obligations.

## Render deployment
1. Upload the extracted project contents to a GitHub repository. Keep `package.json` at repository root.
2. In Render choose **New > Web Service**, connect the repository.
3. Runtime: Node.
4. Build command: `npm install && npm run build`
5. Start command: `npm run start`
6. Add every required environment variable from `.env.example` in Render.
7. Deploy. Check `https://YOUR-SERVICE.onrender.com/api/health`.
8. Set the same Render URL in Supabase Authentication URL settings and Mapbox allowed URLs.

## Before accepting public rides
Complete these release blockers:
- Build driver/passenger realtime ride-offer flows and subscription channels.
- Implement address autocomplete, route pricing, live navigation and passenger map updates.
- Add secure camera capture and private document upload, OCR for plate prefill with manual confirmation, and human/admin verification.
- Add admin-only vehicle approval and user/ride moderation.
- Implement Paystack webhook signature verification and idempotent payment reconciliation.
- Implement verified bank recipient creation, withdrawals, payout webhooks and ledger reconciliation.
- Add abuse prevention, rate limiting, audit logs, backups, monitoring, privacy policy, terms, support process and emergency/safety procedures.
- Test with real devices and provider sandbox accounts before going live.

## Advertising video
Render an original 60-second Rabalata Rides promotional video and place the licensed MP4 at `public/rabalata-60s-ad.mp4`. The website includes the player slot. A suggested storyboard is in `docs/60-second-ad-script.md`.

## Credit
Developed by Otsile Graphics © 2026.
