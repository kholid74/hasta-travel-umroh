# Rencana backend Hasta Travel

Dokumen perencanaan, bukan implementasi backend. Tidak ada migrasi, database, API maskapai, visa, payment gateway, WhatsApp, email, atau SISKOPATUH aktif.

## Demo vs Production

| Fitur | Implementasi demo | Kebutuhan produksi |
| --- | --- | --- |
| Data operasional | Mock bertipe dalam React Context | Neon PostgreSQL, transaksi, constraint, otorisasi |
| Penyimpanan browser | Tidak memakai localStorage | Hindari penyimpanan PII di browser; gunakan API terotorisasi |
| Autentikasi | Backend Server Actions, satu kredensial publik, cookie bertanda tangan | Provider auth, user unik, hash password/provider identity, sesi dapat dicabut, rate limit, MFA/reset password |
| Users & Roles | Frontend state, matriks dapat diedit | Izin diperiksa pada setiap pembacaan dan mutasi server |
| Dokumen | Pemilihan file dan status frontend | Object storage privat, URL berumur pendek, pemeriksaan berkas, lifecycle/retensi |
| Pembayaran / refund | Catat, verifikasi, dan ubah status frontend | Ledger, rekonsiliasi, audit, idempotency, webhook terverifikasi |
| Booking dan kursi | Guard pada data demo | Transaction/locking untuk race condition dan constraint kapasitas |
| Kamar, manasik, inventory | Frontend state | Relasi persisten, konkurensi alokasi, stock movement ledger |
| Komisi | Estimasi agregat per agen | Ledger komisi per booking, approval/payout terpisah, aturan pembatalan |
| Broadcast / pengingat | Preview dan riwayat simulasi | Provider resmi, persetujuan penerima, template, antrean, status delivery |
| CMS | Salinan seed dan pratinjau di workspace | Draft/publish terotorisasi, storage media, revalidasi halaman publik |
| Laporan | Derived dari mock, estimasi operasional | Sumber data konsisten, periode/zona waktu, definisi revenue, ekspor skala besar |
| Activity log | Frontend state yang bisa direset | Audit append-only di server, actor/request ID, retensi |
| Integrasi pemerintah | Checklist persiapan ekspor demo | Verifikasi format resmi dan hak akses; hanya integrasi yang tersedia dan diizinkan |

## Entitas yang disarankan

Gunakan ID stabil dan foreign key, nominal rupiah sebagai integer, tanggal perjalanan sebagai `date`, dan timestamp kejadian dengan zona waktu. Jangan menjadikan nama jamaah atau kode tampilan sebagai kunci relasi.

| Kelompok | Entitas dan relasi |
| --- | --- |
| Organisasi | organizations, branches, users, roles, permissions, role_permissions, sessions |
| Sales | leads, lead_notes, follow_ups, sources; conversion menghubungkan lead ke booking |
| Jamaah | jamaah, families, family_members, emergency_contacts |
| Produk | packages, package_prices, itineraries, hotels, package_hotels |
| Operasi | departures → package; bookings → jamaah/departure; harga disalin saat booking |
| Dokumen | documents → jamaah, verification_events, visas; storage key terpisah dari isi file |
| Perjalanan | flights, departure_flights, buses, bus_assignments, rooms, room_assignments |
| Kegiatan | manasik_events, attendance; unik menurut event dan jamaah |
| Finance | invoices, invoice_items, payments, allocations, refunds, expenses, vendors |
| Agen | agents, commissions → booking, commission_approvals, commission_payouts |
| Inventory | inventory_items, stock_movements, inventory_distributions → jamaah |
| Komunikasi | notifications, broadcast_templates, broadcasts, recipients, deliveries |
| Website | articles, testimonials, media, website_inquiries, publishing_events |
| Audit | activities, integration_events, idempotency_keys |

## Jalur integrasi Neon

1. Pilih provider autentikasi yang sesuai deployment. Ganti validasi kredensial demo di `app/admin/actions.ts`; pertahankan batas `getSession` / `requireSession` agar route tidak bergantung pada provider tertentu.
2. Sambungkan Neon hanya dari server. Simpan connection string di environment server, gunakan koneksi/pooling sesuai dokumentasi layanan saat implementasi. Jangan mengeksposnya melalui variabel `NEXT_PUBLIC_*`.
3. Implementasikan jamaah, paket, keberangkatan, dan booking terlebih dahulu. Tambahkan migrasi setelah model produksi disepakati. Gunakan transaksi saat konversi lead supaya booking, jamaah, dan invoice tidak terbentuk sebagian.
4. Ganti operasi `Store.transact` dengan Server Actions/API bertipe per use case. Validasi ulang seluruh input dan izin di server. Frontend guards tetap berguna untuk UX, tetapi bukan batas keamanan.
5. Terapkan transaksi untuk pembelian kursi, verifikasi pembayaran, rooming, dan inventory. Pencegahan duplikasi harus dibantu unique constraint/idempotency, bukan pemeriksaan UI saja.
6. Hubungkan dokumen ke private object storage. Database menyimpan metadata dan hasil verifikasi, bukan base64 file. Gunakan akses terbatas sesuai peran dan jangan mencatat isi PII di log.
7. Hubungkan CMS dan inquiries publik setelah autentikasi serta validasi server tersedia. Pisahkan konten terbit dari draft; revalidasi halaman katalog saat perubahan dipublikasikan.
8. Tambahkan integrasi satu per satu setelah kebutuhan dan akses resmi tersedia. Webhook harus diverifikasi dan idempotent; status eksternal disimpan bersama sumber/waktu terakhir.

## Integrasi eksternal yang belum ada

- WhatsApp Business dan email: preview saat ini tidak mengirim pesan.
- Payment gateway/bank: tombol verifikasi hanya simulasi state, bukan konfirmasi bank.
- Maskapai dan hotel: jadwal/PNR merupakan mock, tanpa reservasi eksternal.
- Visa: pipeline internal, tanpa penerbitan atau pengecekan visa pemerintah.
- SISKOPATUH: ekspor contoh harus dipetakan ke format resmi yang berlaku; jangan menyebutnya integrasi aktif.
- OCR: tidak ada pengenalan teks atau pemeriksaan keaslian dokumen.

## Sebelum memuat data riil

Nonaktifkan demo credentials dan reset fixture, batasi akses server, implementasikan revocation sesi serta pemulihan akun, lakukan threat review dan backup/restore, tentukan kebijakan retensi PII, serta uji konkurensi pada booking/pembayaran. Penerapan role pada UI saja tidak cukup untuk data produksi.
