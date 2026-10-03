"use client";
import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("./Dashboard"));
const Guide = dynamic(() => import("./Guide"));
const Jamaah = dynamic(() => import("./Jamaah"));
const Packages = dynamic(() => import("./Packages"));
const Departures = dynamic(() => import("./Departures"));
const Finance = dynamic(() => import("./Finance"));
const Documents = dynamic(() => import("./Documents"));
const Rooming = dynamic(() => import("./Rooming"));
const Operations = dynamic(() => import("./Operations"));
const CRM = dynamic(() => import("./CRM"));
const Partners = dynamic(() => import("./Partners"));
const Communication = dynamic(() => import("./Communication"));
const CMS = dynamic(() => import("./CMS"));
const Reports = dynamic(() => import("./Reports"));
const System = dynamic(() => import("./System"));
export function AdminScreen({ module, id }: { module: string; id?: string }) {
  if (module === "panduan") return <Guide />;
  if (module === "jamaah") return <Jamaah id={id} />;
  if (["paket", "website-paket"].includes(module)) return <Packages id={id} website={module === "website-paket"} />;
  if (module === "keberangkatan") return <Departures id={id} />;
  if (["booking", "invoice", "pembayaran", "pengeluaran"].includes(module)) return <Finance module={module} id={id} />;
  if (["manifest", "dokumen"].includes(module)) return <Documents manifest={module === "manifest"} />;
  if (module === "rooming") return <Rooming />;
  if (["manasik", "transportasi", "perlengkapan"].includes(module)) return <Operations module={module} />;
  if (["crm", "leads-website"].includes(module)) return <CRM website={module === "leads-website"} />;
  if (["agen", "komisi", "vendor"].includes(module)) return <Partners module={module} id={id} />;
  if (["broadcast", "notifikasi"].includes(module)) return <Communication module={module} />;
  if (module === "artikel" || module === "testimoni" || module === "galeri") return <CMS kind={module} />;
  if (["laporan", "analytics"].includes(module)) return <Reports analytics={module === "analytics"} />;
  if (["users", "aktivitas", "settings"].includes(module)) return <System module={module} />;
  return <Dashboard />;
}
