import Link from "next/link";
export default function NotFound() { return <div className="admin-empty"><h1>Halaman tidak ditemukan</h1><p>Alamat modul tidak tersedia di workspace ini.</p><Link className="admin-button primary" href="/admin/dashboard">Kembali ke dashboard</Link></div>; }
