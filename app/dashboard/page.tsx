import Link from "next/link";
import { serverSupabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
export default async function Dashboard(){
 const sb=await serverSupabase();const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/login");
 const {data:profile}=await sb.from("profiles").select("full_name,role").eq("id",user.id).single();
 return <main className="page"><p className="eyebrow">YOUR WORKSPACE</p><h1>Hello, {profile?.full_name||"Rabalata member"}</h1><p className="muted">Account: {profile?.role||"passenger"}</p><div className="dashboardGrid"><section className="panel"><h2>Passenger</h2><p>Request a trip, negotiate a fare and follow your assigned driver.</p><Link className="button" href="/rides/new">Request a ride</Link></section><section className="panel"><h2>Driver</h2><p>Register your vehicle, submit documents and manage trip requests.</p><Link className="button" href="/driver">Driver workspace</Link></section><section className="panel"><h2>Trips</h2><p>Review your ride history and current trip status.</p><Link href="/rides">View rides →</Link></section><section className="panel"><h2>Wallet</h2><p>View eligible card earnings and payout status.</p><Link href="/wallet">Open wallet →</Link></section></div></main>;
}
