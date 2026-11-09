# M3.2 Agent Career Foundation — Implementation Report

> Diverifikasi per **2026-11-09**, branch `feature/hasta-finance-inventory`.
> Full suite **95/95** passed. TypeCheck 0 error. Lint 0 error.

---

## 1. Lingkup dan Keputusan

### Fitur yang diimplementasikan

| Area | Deskripsi |
|---|---|
| **Agent Master V2** | Kode referral unik `HASTA-XX##`, parent upline ID, join date, account status (`ACTIVE`/`SUSPENDED`/`INACTIVE`), career level ID (`CL-1`–`CL-4`), email |
| **Hierarchy Engine** | Ancestor traversal (`ancestorsOf`), cycle detection, depth limit (maks 4), move agent validation (`canMoveAgent`, `moveAgent`), audit logging (`agentHierarchyEvents`) |
| **Attribution & Locking** | Backfill atribusi booking, snapshot locking saat pembayaran pertama diverifikasi (`verifyPayment`), lead-to-booking attribution propagation (`convertLead`) |
| **Career Progression** | Kalkulasi kualifikasi live (`computeCareerProgress`), evaluasi kuartalan (`2026-Q4`), period snapshot (`lockCareerPeriod`), promosi tanpa demosi mid-periode |
| **Storage Migration v3→v4** | `CURRENT_DEMO_VERSION = 4`, flat hierarchy fallback, code generation, attribution backfill, lead field backfill |
| **Admin UI** | `/admin/agen` (tab: Daftar, Jaringan, Level karier, Analitik), `/admin/agen/[id]` (tab: Profil, Jaringan, Jamaah, Booking, Karier, Aktivitas) |
| **Portal Agen** | `/portal/agen` mobile-first: Beranda (referral card, shareable link, stats, progress karier), Jamaah (PII-masked), Tim (direct & network), Karier (requirements & progress), Komisi (Coming Soon M3.3) |

### Keputusan yang diimplementasikan (D6–D11)

| ID | Keputusan | Implementasi |
|---|---|---|
| **D6** | Hierarki multi-level maksimum 4 level kedalaman | `canMoveAgent` reject jika `ancestorsOf` depth ≥ 4 |
| **D7** | Tidak ada demosi otomatis di tengah periode berjalan | `computeCareerProgress` hanya menghitung kualifikasi; promosi manual oleh admin |
| **D8** | Kualifikasi berbasis pelunasan penuh (booking lunas/outstanding = 0) | `isBookingQualifying` cek `financialBalance(state, b).outstanding === 0n` |
| **D9** | Metrik tim: hingga 3 level turunan dihitung | `downlinesOf` di `computeCareerProgress` traversal sampai `maxDepth = 3` |
| **D10** | PII masking nomor telepon di portal agen | `maskPhone("08123456789")` → `"0812-****-6789"` |
| **D11** | Migrasi workspace lama: flat hierarchy (`parentId: ""`) tanpa dihapus | Step migration 3 di `migrateDemo` |

---

## 2. File yang Diubah / Dibuat

### File baru

| File | Deskripsi |
|---|---|
| `content/admin/career.ts` | Domain module: types, fixtures (DEFAULT_CAREER_LEVELS), algoritma hierarchy & career |
| `components/admin/AgentManagement.tsx` | Komponen admin agent module (1012 baris) |
| `components/portal/PortalScreen.tsx` | Portal screens: AgentHome, AgentJamaah, AgentTim, AgentKarier, ComingSoon |
| `tests/m3_2_agents.spec.ts` | Test spec M3.2 (9 test) |
| `tests/fixtures/demo-v3.json` | Frozen fixture pre-M3.2 untuk migration regression test |

### File dimodifikasi

| File | Perubahan |
|---|---|
| `content/admin/types.ts` | Tambah field V4 ke `Agent`, `Booking` (attribution), `Lead` (agentId, referralCode), `DemoState` (careerRuleSets, careerSnapshots, agentHierarchyEvents) |
| `content/admin/seed.ts` | 10 agen dengan hierarki 2-root, kode HASTA-XX##, attribution backfill di semua booking |
| `lib/admin/migrations.ts` | `CURRENT_DEMO_VERSION = 4`, migration step 3 (flat hierarchy, code gen, attribution backfill) |
| `lib/admin/persistence.ts` | Agent code uniqueness check, parentId reference integrity |
| `lib/admin/model.ts` | `addBooking` attach attribution, `verifyPayment` lock attribution & snapshot |
| `lib/admin/hajj.ts` | `registerHajj` attach attribution |
| `lib/whatsapp.ts` | Optional `referralCode` di `WaContext`, append ke pesan WA |
| `components/admin/Partners.tsx` | Route `module === "agen"` → `<AgentManagement />` |
| `components/admin/CreateForm.tsx` | Tampilkan & support agent attribution |
| `components/admin/CRM.tsx` | Tampilkan agent attribution |
| `components/portal/PortalShell.tsx` | Tambah `award` icon ke registry |
| `content/admin/roles.ts` | AGENT `portalTabs`: Beranda, Jamaah, Tim, Karier, Lainnya |
| `app/portal/[[...path]]/page.tsx` | Allow `komisi` subpath untuk AGENT |
| `tests/m3_1_gateway.spec.ts` | Update 2 assertion untuk version bump v4 dan migration field changes |

---

## 3. Arsitektur Hierarki Agen

```
Root (tanpa parentId)
├── AGT-001  Ahmad Hidayat       CL-3 Coordinator   HASTA-AH01
│   ├── AGT-002  Fitria Ramadhani    CL-2 Senior Agent  HASTA-FR02
│   │   ├── AGT-005  Rizal Firmansyah   CL-2 Senior Agent  HASTA-RF05
│   │   │   └── AGT-009  Samsul Arifin      CL-1 Agent         HASTA-SA09
│   │   └── AGT-006  Siti Khadijah      CL-1 Agent         HASTA-SK06
│   └── AGT-003  H. Mansur Ali       CL-1 Agent         HASTA-MA03
└── AGT-004  Nina Herlina        CL-3 Coordinator   HASTA-NH04
    ├── AGT-007  Umar Faruq          CL-3 Coordinator   HASTA-UF07
    │   └── AGT-008  Yuliana Dewi       CL-2 Senior Agent  HASTA-YD08
    └── AGT-010  Laila Fitria        CL-3 Coordinator   HASTA-LF10
```

> Kedalaman maksimum pohon seed = 3 (dalam limit D6 = 4).

---

## 4. Career Levels

| ID | Nama | Rank | Syarat Kualifikasi (per Kuartal) |
|---|---|---|---|
| CL-1 | Agent | 1 | Tanpa syarat minimum (level awal) |
| CL-2 | Senior Agent | 2 | ≥ 2 Jamaah pribadi |
| CL-3 | Coordinator | 3 | ≥ 5 Jamaah pribadi, ≥ 10 Jamaah tim, ≥ 2 Mitra langsung aktif |
| CL-4 | Regional Coordinator | 4 | ≥ 15 Jamaah pribadi, ≥ 40 Jamaah tim, ≥ 5 Mitra langsung aktif |

---

## 5. Skema Storage v4

### Perubahan di `DemoState`

```ts
// Field baru di Agent
code: string            // "HASTA-AH01"
levelId: string         // "CL-1" | "CL-2" | "CL-3" | "CL-4"
parentId: string        // "" jika root
joinedAt: string        // "2026-01-15"
accountStatus: "ACTIVE" | "SUSPENDED" | "INACTIVE"
email: string

// Field baru di Booking
attribution?: BookingAttribution  // {agentId, code, source, attributedAt, attributedBy, lockedAt, uplineSnapshot, levelSnapshot}

// Field baru di Lead
agentId?: string
referralCode?: string

// Field baru di DemoState
careerRuleSets: CareerRuleSet[]
careerSnapshots: CareerSnapshot[]
agentHierarchyEvents: AgentHierarchyEvent[]
```

### Migration steps (kumulatif dari v1)
1. v1→v2: inventory fields
2. v2→v3: users, roles, handovers, tour leader personas
3. v3→v4: agents (code, levelId, parentId, joinedAt, accountStatus, email), bookings (attribution backfill), leads (agentId, referralCode), careerRuleSets, careerSnapshots, agentHierarchyEvents

---

## 6. Hasil Test

### M3.2 Spec (`tests/m3_2_agents.spec.ts`)

| # | Test | Hasil |
|---|---|---|
| 1 | frozen v3 workspace migrates to v4 without touching business balances | ✅ |
| 2 | agent hierarchy logic: ancestor traversal, cycle rejection and max depth limit | ✅ |
| 3 | convertLead transfers agent attribution to booking | ✅ |
| 4 | verifyPayment locks booking attribution on first verified payment | ✅ |
| 5 | career progress computation: personal vs team metrics and qualification | ✅ |
| 6 | period lock generates snapshots and prevents re-locking | ✅ |
| 7 | phone masking helper conceals private phone digits | ✅ |
| 8 | admin agent module: tabs, network tree and detail view render properly | ✅ |
| 9 | agent portal at mobile viewport: referral card, PII masking, team and career | ✅ |

**9/9 passed**

### Full Suite (`npm run test:admin`)

```
Running 95 tests using 1 worker
95 passed (3.5m)
```

**95/95 passed — 0 regressions**

### TypeCheck & Lint

```
npm run typecheck  → 0 errors
npm run lint       → 0 errors, 5 warnings (unused imports di test file — non-blocking)
git status docs/samples → clean
```

---

## 7. Catatan Implementasi

### Locator Playwright
Kode referral `HASTA-AH01` muncul di banyak tempat sekaligus (description `<p>`, `<strong>` di Fields panel, link di portal). Gunakan locator yang spesifik:
- Di tree jaringan: `.first()` 
- Di Profil/portal: `locator("strong", { hasText: "HASTA-AH01" }).first()`
- Di tab button: `getByRole("button", { name: "Profil", exact: true })` untuk menghindari match dengan profile-menu button di navbar

### sameShape Guard
`decodeDemo` di `persistence.ts` memakai `sameShape` yang mensyaratkan semua kunci sample ada di object yang di-decode. Untuk field opsional baru, gunakan empty string `""` atau empty array `[]` sebagai default agar kompatibel lintas migrasi.

### Migration v4 & Test Regression
Migration step 3 (v4) menambah field baru ke `agents`, `bookings`, dan `leads`. Test lama di `m3_1_gateway.spec.ts` yang membandingkan `state[key].toEqual(before.state[key])` untuk koleksi ini perlu dikecualikan dari `preserved` list dan digantikan dengan spot-check finansial (`financialBalance`).

---

## 8. Yang Belum (M3.3)

- `/portal/agen/komisi` saat ini menampilkan *"Segera hadir · M3.3"*
- Kalkulasi komisi, approval payout, laporan komisi
- Lihat `docs/HASTA_V2_ROADMAP.md` §M3.3 untuk detail
