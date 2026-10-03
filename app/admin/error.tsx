"use client";
export default function AdminError({ reset }: { reset: () => void }) { return <div className="admin-empty"><h1>Workspace belum dapat dimuat</h1><p>Coba muat ulang halaman. Perubahan demo dalam sesi ini mungkin perlu diulang.</p><button className="admin-button primary" onClick={reset}>Coba lagi</button></div>; }
