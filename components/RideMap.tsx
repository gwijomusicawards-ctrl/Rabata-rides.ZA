"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
export function RideMap(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const token=process.env.NEXT_PUBLIC_MAPBOX_TOKEN;if(!ref.current||!token)return;mapboxgl.accessToken=token;const map=new mapboxgl.Map({container:ref.current,style:"mapbox://styles/mapbox/streets-v12",center:[28.0473,-26.2041],zoom:10});map.addControl(new mapboxgl.NavigationControl(),"top-right");return()=>map.remove()},[]);
 return <div className="map" ref={ref}>{!process.env.NEXT_PUBLIC_MAPBOX_TOKEN&&<div style={{padding:20}}>Add NEXT_PUBLIC_MAPBOX_TOKEN to enable the live map.</div>}</div>;
}
