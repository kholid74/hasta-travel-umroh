"use client";
import dynamic from "next/dynamic";
import { Eye } from "lucide-react";
import { roles } from "@/content/admin/roles";
import { canWriteModule } from "@/lib/admin/access";
import { useDemo } from "./Store";

const Dashboard = dynamic(() => import("./Dashboard"));
const Guide = dynamic(() => import("./Guide"));
const Jamaah = dynamic(() => import("./Jamaah"));
const Packages = dynamic(() => import("./Packages"));
const Departures = dynamic(() => import("./Departures"));
const Finance = dynamic(() => import("./Finance"));
const Hajj = dynamic(() => import("./Hajj"));
const Costing = dynamic(() => import("./Costing"));
const Documents = dynamic(() => import("./Documents"));
const Rooming = dynamic(() => import("./Rooming"));
const Inventory = dynamic(() => import("./Inventory"));
const Operations = dynamic(() => import("./Operations"));
const CRM = dynamic(() => import("./CRM"));
const Partners = dynamic(() => import("./Partners"));
const Communication = dynamic(() => import("./Communication"));
const CMS = dynamic(() => import("./CMS"));
const Reports = dynamic(() => import("./Reports"));
const System = dynamic(() => import("./System"));
const OwnerDashboard = dynamic(() => import("./RoleDashboards").then(m => m.OwnerDashboard));
const SalesDashboard = dynamic(() => import("./RoleDashboards").then(m => m.SalesDashboard));
const FinanceDashboard = dynamic(() => import("./RoleDashboards").then(m => m.FinanceDashboard));
const OperationsDashboard = dynamic(() => import("./RoleDashboards").then(m => m.OperationsDashboard));

/** Read-only roles see a clear notice; mutations are also refused centrally by the store. */
export function AdminScreen({ module, id }: { module: string; id?: string }) {
  const { access } = useDemo();
  const readOnly = module !== "dashboard" && !canWriteModule(access.role, module);
  return <>{readOnly && <p className="admin-notice readonly-notice" role="note"><Eye size={14} aria-hidden="true" /> Mode lihat saja untuk akses demo {roles[access.role].label}: Anda tetap dapat mencari, memfilter, membuka detail, dan mengekspor data. Perubahan pada modul ini dilakukan oleh peran lain.</p>}<ModuleScreen module={module} id={id} /></>;
}
function ModuleScreen({ module, id }: { module: string; id?: string }) {
  const { access } = useDemo();
  if (module === "dashboard") {
    if (access.role === "OWNER") return <OwnerDashboard />;
    if (access.role === "SALES_CS") return <SalesDashboard />;
    if (access.role === "FINANCE") return <FinanceDashboard />;
    if (access.role === "OPERATIONS") return <OperationsDashboard />;
  }
  if (module === "haji-khusus") return <Hajj id={id} />;
  if (module === "hpp") return <Costing id={id} />;
  if (module === "panduan") return <Guide />;
  if (module === "jamaah") return <Jamaah id={id} />;
  if (["paket", "website-paket"].includes(module)) return <Packages id={id} website={module === "website-paket"} />;
  if (module === "keberangkatan") return <Departures id={id} />;
  if (["booking", "invoice", "pembayaran", "pengeluaran"].includes(module)) return <Finance module={module} id={id} />;
  if (["manifest", "dokumen"].includes(module)) return <Documents manifest={module === "manifest"} />;
  if (module === "rooming") return <Rooming />;
  if (module === "perlengkapan") return <Inventory />;
  if (["manasik", "transportasi"].includes(module)) return <Operations module={module} />;
  if (["crm", "leads-website"].includes(module)) return <CRM website={module === "leads-website"} />;
  if (["agen", "komisi", "vendor"].includes(module)) return <Partners module={module} id={id} />;
  if (["broadcast", "notifikasi"].includes(module)) return <Communication module={module} />;
  if (module === "artikel" || module === "testimoni" || module === "galeri") return <CMS kind={module} />;
  if (["laporan", "analytics"].includes(module)) return <Reports analytics={module === "analytics"} />;
  if (["users", "aktivitas", "settings"].includes(module)) return <System module={module} />;
  return <Dashboard />;
}
