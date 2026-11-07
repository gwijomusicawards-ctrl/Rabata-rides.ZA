"use client";
import { useState } from "react";
import { browserSupabase } from "@/lib/supabase";
export default function Reset(){const [password,setPassword]=useState("");const [msg,setMsg]=useState("");async function save(e:React.FormEvent){e.preventDefault();const {error}=await browserSupabase().auth.updateUser({password});setMsg(error?error.message:"Password updated. You can now sign in.");}return <main className="page"><h1>Choose a new password</h1><form className="formCard" onSubmit={save}><div className="field"><label>New password</label><input type="password" minLength={10} required value={password} onChange={e=>setPassword(e.target.value)}/></div><button className="button">Update password</button>{msg&&<p className="muted">{msg}</p>}</form></main>}
