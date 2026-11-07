import { NextResponse } from "next/server";
import { z } from "zod";
import { serverSupabase } from "@/lib/supabase";
import { paystackRequest } from "@/lib/paystack";
import { adminSupabase } from "@/lib/supabase-admin";
const schema=z.object({rideId:z.string().uuid(),email:z.string().email()});
export async function POST(req:Request){
 try{
  const body=schema.parse(await req.json());const sb=await serverSupabase();const {data:{user}}=await sb.auth.getUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const {data:ride,error}=await sb.from("rides").select("id,passenger_id,agreed_fare_cents,status,payment_method").eq("id",body.rideId).single();
  if(error||!ride||ride.passenger_id!==user.id)return NextResponse.json({error:"Ride not found"},{status:404});
  if(ride.status!=="accepted"||ride.payment_method!=="card"||!ride.agreed_fare_cents)return NextResponse.json({error:"Ride is not ready for card payment."},{status:400});
  const result:any=await paystackRequest("/transaction/initialize",{email:body.email,amount:ride.agreed_fare_cents, currency:"ZAR",reference:`RR-${ride.id}-${Date.now()}`,metadata:{ride_id:ride.id,passenger_id:user.id}});
  const admin = adminSupabase();
  const { error: paymentInsertError } = await admin.from("payment_transactions").insert({ride_id:ride.id,passenger_id:user.id,provider_reference:result.data.reference,amount_cents:ride.agreed_fare_cents,status:"pending"});
  if (paymentInsertError) throw paymentInsertError;
  return NextResponse.json({authorization_url:result.data.authorization_url,reference:result.data.reference});
 }catch(e:any){return NextResponse.json({error:e.message||"Unable to initialize payment."},{status:400});}
}
