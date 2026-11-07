"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
export function SiteHeader() {
  const [open,setOpen] = useState(false);
  return <header className="header"><Link href="/" className="brand"><Image src="/rabalata-logo.png" alt="Rabalata Rides" width={54} height={54}/><span>RABALATA <i>RIDES</i><small>YOUR JOURNEY. YOUR CHOICE. YOUR RIDE.</small></span></Link>
  <button className="menu" onClick={()=>setOpen(!open)} aria-label="Toggle navigation">☰</button>
  <nav className={open?"nav navOpen":"nav"}><Link href="/#how">How it works</Link><Link href="/about">About us</Link><Link href="/advertise">Adverts</Link><Link href="/login">Sign in</Link><Link className="button smallButton" href="/register">Get started</Link></nav></header>;
}
