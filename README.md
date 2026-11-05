Hasta Travel: website publik Umroh & Haji dan admin showcase oleh Kalsara Digital Studio.

Admin: `/admin/login` · `demo@hasta.example` / `HastaDemo2026!`.

Panduan lengkap: [Admin Showcase](docs/ADMIN_SHOWCASE.md) · [Future Backend](docs/FUTURE_BACKEND.md).

M1.1 Haji Khusus & HPP: [Rencana](docs/M1_1_IMPLEMENTATION_PLAN.md) · [Laporan](docs/M1_1_REPORT.md).

## Getting Started

M1.2 dokumen PDF: [Rencana](docs/M1_2_IMPLEMENTATION_PLAN.md) · [Laporan, contoh PDF dan screenshot](docs/M1_2_REPORT.md).

M1.2B penyempurnaan visual: [Laporan dan sampel PDF berlogo](docs/M1_2B_REPORT.md).

M2 Perlengkapan Jamaah: [Rencana](docs/M2_IMPLEMENTATION_PLAN.md) · [Laporan, hasil tes dan sampel bukti PDF](docs/M2_REPORT.md). Buka `/admin/perlengkapan` setelah login untuk penerimaan stok, alokasi kit, serah terima parsial dan laporan.

Riwayat cicilan pada booking, jamaah dan PDF: [Audit dan hasil implementasi](docs/PAYMENT_HISTORY_PDF_AUDIT.md) · [Contoh invoice](docs/samples/payment-history/UMRAH-invoice.pdf) · [Contoh kuitansi](docs/samples/payment-history/UMRAH-receipt.pdf).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

Proyek menggunakan Next.js 16, React 19, Tailwind 4, Manrope dan Instrument Serif. Production login memerlukan environment `ADMIN_SESSION_SECRET` minimal 32 karakter acak. Data operasional merupakan simulasi yang tersimpan di localStorage browser ini setelah disimpan. Refresh mempertahankan data; menu profil → Reset data demo mengembalikan contoh awal. Gunakan data fiktif.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
