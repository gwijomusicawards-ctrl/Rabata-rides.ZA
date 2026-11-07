import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({ok:true,service:"Rabalata Rides",timestamp:new Date().toISOString()});}
