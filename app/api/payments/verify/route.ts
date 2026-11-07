import { NextResponse } from "next/server";
import { z } from "zod";
import { serverSupabase } from "@/lib/supabase";
import { paystackRequest } from "@/lib/paystack";
import { adminSupabase } from "@/lib/supabase-admin";
const schema=z.object({reference:z.string().min(8)});
export async function POST(req:Request){
 try{
  const {reference}=schema.parse(await req.json());const sb=await serverSupabase();const {data:{user}}=await sb.auth.getUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const result:any=await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`,undefined,"GET");
  if(result.data.status!=="success")return NextResponse.json({error:"Payment has not been confirmed."},{status:400});
  const rideId=result.data.metadata?.ride_id;if(!rideId)return NextResponse.json({error:"Missing ride reference."},{status:400});
  const {data:ride}=await sb.from("rides").select("id,passenger_id,agreed_fare_cents,driver_id").eq("id",rideId).single();
  if(!ride||ride.passenger_id!==user.id||Number(result.data.amount)!==Number(ride.agreed_fare_cents))return NextResponse.json({error:"Payment verification mismatch."},{status:400});
  const admin = adminSupabase();
  const { data: transaction, error: transactionError } = await admin.from("payment_transactions").select("id,amount_cents,status").eq("provider_reference",reference).single();
  if (transactionError || !transaction || transaction.amount_cents !== ride.agreed_fare_cents) return NextResponse.json({error:"Payment record mismatch."},{status:400});
  if (transaction.status !== "success") {
    const {error}=await admin.from("payment_transactions").update({status:"success",verified_at:new Date().toISOString()}).eq("id",transaction.id);
    if(error)throw error;
    if (ride.driver_id) {
      const fee=Math.round(ride.agreed_fare_cents*Number(process.env.PLATFORM_COMMISSION_PERCENT||15)/100);
      const {error: earningError}=await admin.rpc("record_card_ride_earning",{p_ride_id:ride.id,p_driver_id:ride.driver_id,p_gross_cents:ride.agreed_fare_cents,p_fee_cents:fee});
      if(earningError)throw earningError;
    }
  }
  return NextResponse.json({verified:true});
 }catch(e:any){return NextResponse.json({error:e.message||"Could not verify payment."},{status:400});}
}
