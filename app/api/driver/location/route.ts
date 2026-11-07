import { NextResponse } from "next/server";
import { z } from "zod";
import { serverSupabase } from "@/lib/supabase";
const schema=z.object({rideId:z.string().uuid(),latitude:z.number().min(-90).max(90),longitude:z.number().min(-180).max(180),heading:z.number().optional()});
export async function POST(req:Request){
 try{const input=schema.parse(await req.json());const sb=await serverSupabase();const {data:{user}}=await sb.auth.getUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {data:ride}=await sb.from("rides").select("id,driver_id,status").eq("id",input.rideId).single();if(!ride||ride.driver_id!==user.id||!["accepted","arrived","in_progress"].includes(ride.status))return NextResponse.json({error:"No active assigned trip."},{status:403});
 const {error}=await sb.from("driver_locations").upsert({ride_id:input.rideId,driver_id:user.id,latitude:input.latitude,longitude:input.longitude,heading:input.heading,updated_at:new Date().toISOString()},{onConflict:"ride_id"});if(error)throw error;return NextResponse.json({ok:true});
 }catch(e:any){return NextResponse.json({error:e.message},{status:400});}
}
