"use client";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  const [visible, setVisible] = useState(false);
  const [help, setHelp] = useState(false);
  return <main className="admin-login">
    <section className="login-story">
      <Link className="admin-brand" href="/"><Image src="/logo-mark.png" width={30} height={46} alt="" /><span>hasta<span className="brand-sub">TRAVEL & UMRAH</span></span></Link>
      <div><span className="eyebrow">HASTA WORKSPACE</span><h1>Setiap perjalanan.<br />Dalam satu kendali.</h1><p>Dari niat pertama hingga tiba di Tanah Suci. Kelola jamaah, perjalanan, dan seluruh persiapannya dengan lebih tenang.</p>
        <div className="login-journey"><span>01<br /><b>Terhubung</b></span><ArrowRight /><span>02<br /><b>Terencana</b></span><ArrowRight /><span>03<br /><b>Siap berangkat</b></span></div>
      </div><small>Sebuah karya Kalsara Digital Studio · 2026</small>
    </section>
    <section className="login-panel"><div className="login-form-wrap"><span className="admin-badge amber">Workspace demo</span><h2>Selamat datang kembali</h2><p className="muted">Masuk untuk mengelola operasional travel Anda.</p>
      <form action={action} className="admin-form">
        <label>Email<input type="email" name="email" autoComplete="username" required defaultValue="demo@hasta.example" /></label>
        <div><label htmlFor="admin-password">Kata sandi</label><div className="password-field"><input id="admin-password" type={visible ? "text" : "password"} name="password" autoComplete="current-password" required defaultValue="HastaDemo2026!" /><button type="button" aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
        <div className="flex-between"><label className="checkbox-label"><input type="checkbox" name="remember" /> Ingat saya</label><button className="text-button" type="button" onClick={() => setHelp(!help)}>Lupa kata sandi?</button></div>
        {help && <p className="admin-notice">Akun demo memakai kata sandi di bawah. Pemulihan akun melalui email tersedia setelah autentikasi produksi dihubungkan.</p>}
        {state.error && <p role="alert" className="form-error">{state.error}</p>}
        <button className="admin-button primary" disabled={pending}>{pending ? "Memeriksa sesi…" : "Masuk ke workspace"}<ArrowRight size={17} /></button>
      </form>
      <div className="demo-credentials"><ShieldCheck size={20} /><div><b>Jelajahi dengan akun demo</b><p>demo@hasta.example<br /><code>HastaDemo2026!</code></p><small>Seluruh data dan transaksi merupakan simulasi.</small></div></div>
      <Link href="/" className="text-button">← Kembali ke website Hasta Travel</Link>
    </div></section>
  </main>;
}
