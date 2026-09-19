import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-[800px] px-4 py-16 sm:px-6">
      <h1 className="text-4xl">Halaman tidak ditemukan</h1>
      <p className="mt-4 text-muted">
        Alamat yang Anda buka tidak ada, atau paketnya sudah tidak dijual. Lihat daftar paket yang
        masih tersedia.
      </p>
      <Link
        href="/paket-umroh"
        className="mt-6 inline-flex min-h-12 items-center rounded-card bg-primary px-6 font-semibold text-onprimary"
      >
        Buka daftar paket umroh
      </Link>
    </main>
  );
}
