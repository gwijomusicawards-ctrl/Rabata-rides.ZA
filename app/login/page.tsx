"use client";
import { useState } from "react";
import Link from "next/link";
import { browserSupabase } from "@/lib/supabase";
export default function Login(){
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [msg,setMsg]=useState(""); const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMsg("");try{const {error}=await browserSupabase().auth.signInWithPassword({email,password});if(error)throw error;window.location.href="/dashboard"}catch(err:any){setMsg(err.message||"Unable to sign in.")}finally{setBusy(false)}}
 return <main className="page"><p className="eyebrow">WELCOME BACK</p><h1>Sign in to Rabalata Rides</h1><form className="formCard" onSubmit={submit}><div className="field"><label>Email address</label><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div><div className="field"><label>Password</label><input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></div><button className="button" disabled={busy}>{busy?"Signing in…":"Sign in"}</button>{msg&&<p className="error">{msg}</p>}<p className="muted"><Link href="/forgot-password">Forgot password?</Link> · <Link href="/register">Create an account</Link></p></form><p className="muted">Email and password sign-in. No one-time PIN is used.</p></main>;
}
