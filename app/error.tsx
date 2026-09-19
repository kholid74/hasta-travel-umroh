"use client";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="mx-auto w-full max-w-[800px] px-4 py-16 sm:px-6">
      <h1 className="text-4xl">Halaman gagal dimuat</h1>
      <p className="mt-4 text-muted">
        Terjadi kesalahan saat menampilkan halaman ini. Coba muat ulang; kalau tetap gagal, hubungi
        kami lewat WhatsApp.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 inline-flex min-h-12 items-center rounded-card bg-primary px-6 font-semibold text-onprimary"
      >
        Muat ulang halaman
      </button>
    </main>
  );
}
