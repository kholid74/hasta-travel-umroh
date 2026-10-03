export const navigation = [
  { group: "OVERVIEW", items: [["dashboard", "Dashboard", "dashboard"], ["panduan", "Panduan Admin", "booking"]] },
  { group: "SALES", items: [["crm", "CRM / Leads", "leads"], ["booking", "Booking", "booking"], ["jamaah", "Jamaah", "users"]] },
  { group: "OPERASIONAL", items: [["paket", "Paket Umrah", "package"], ["keberangkatan", "Keberangkatan", "plane"], ["manifest", "Manifest", "list"], ["dokumen", "Dokumen & Visa", "file"], ["rooming", "Rooming List", "bed"], ["manasik", "Manasik", "calendar"], ["transportasi", "Transportasi", "bus"]] },
  { group: "FINANCE", items: [["pembayaran", "Pembayaran", "wallet"], ["invoice", "Invoice", "receipt"], ["pengeluaran", "Pengeluaran", "expense"], ["komisi", "Komisi Agen", "commission"]] },
  { group: "PARTNERS", items: [["agen", "Agen", "handshake"], ["vendor", "Supplier / Vendor", "building"]] },
  { group: "INVENTORY", items: [["perlengkapan", "Perlengkapan Jamaah", "box"]] },
  { group: "COMMUNICATION", items: [["broadcast", "Broadcast", "send"], ["notifikasi", "Notification Center", "bell"]] },
  { group: "REPORTS", items: [["laporan", "Laporan", "chart"], ["analytics", "Analytics", "trend"]] },
  { group: "WEBSITE", items: [["website-paket", "Paket Website", "globe"], ["artikel", "Artikel", "file"], ["testimoni", "Testimoni", "quote"], ["galeri", "Galeri", "image"], ["leads-website", "Leads Website", "leads"]] },
  { group: "SYSTEM", items: [["users", "User & Roles", "shield"], ["aktivitas", "Activity Log", "history"], ["settings", "Settings", "settings"]] },
];
export const adminRoutes = navigation.flatMap(g => g.items.map(([slug]) => slug));
export const moduleTitle = (slug: string) => navigation.flatMap(g => g.items).find(i => i[0] === slug)?.[1] ?? "Detail";
