"use client";
import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { useDemo } from "./Store";
import { Badge, Confirm, DataTable, Fields, Modal, PageHeader, Panel, SelectFilter, Stat, Tabs } from "./ui";
import HandoverReceipt from "./HandoverReceipt";
import type { DemoState } from "@/content/admin/types";
import { productLabels } from "@/content/admin/types";
import type { InventoryItem, PilgrimKitAllocation, PilgrimKitTemplate } from "@/content/admin/inventory";
import { allocateKit, allocationLabels, delivered, movementLabels, postHandover, postMovement, postReturn, releaseAllocation, remaining, saveInventoryItem, saveKitTemplate, stockBalance } from "@/lib/admin/inventory";
import { dateLabel, packageForBooking, uid } from "@/lib/admin/model";
import { DEMO_TODAY } from "@/content/admin/seed";
import { exportCSV } from "@/lib/admin/export";

type FormKind = { kind: "item"; value?: InventoryItem } | { kind: "template"; value?: PilgrimKitTemplate } | { kind: "movement" } | { kind: "allocate"; bookingId?: string } | { kind: "handover"; allocation: PilgrimKitAllocation } | { kind: "return"; handoverId?: string };
const tabs = ["Overview", "Master Barang", "Barang Masuk/Keluar", "Template Perlengkapan", "Distribusi", "Riwayat Serah Terima", "Laporan"];
export default function Inventory() {
  const { state, resetVersion, transact } = useDemo();
  const [tab, setTab] = useState("Overview"), [warehouse, setWarehouse] = useState(""), [category, setCategory] = useState(""), [product, setProduct] = useState(""), [scope, setScope] = useState("");
  const [form, setForm] = useState<FormKind | null>(null), [detail, setDetail] = useState("");
  const [release, setRelease] = useState<string | null>(null), [report, setReport] = useState("Saldo gudang");
  const allowedItems = new Set(state.kitTemplates.filter(t => !product || t.productType === product).flatMap(t => t.items.map(i => i.itemId)));
  const items = state.inventory.filter(i => (!category || i.category === category) && (!product || allowedItems.has(i.id)));
  const warehouses = state.warehouses.filter(w => !warehouse || w.id === warehouse);
  const balances = items.flatMap(i => warehouses.map(w => ({ ...i, id: `${i.id}:${w.id}`, itemId: i.id, warehouse: w.name, warehouseId: w.id, ...stockBalance(state, i.id, w.id) })));
  const allocations = state.kitAllocations.filter(a => (!warehouse || a.warehouseId === warehouse) && (!product || a.productType === product) && (!scope || a.departureId === scope || a.packageId === scope));
  const registered = state.bookings.filter(b => b.status === "Aktif" && (!product || b.productType === product) && (!scope || b.departureId === scope || b.hajjPackageId === scope));
  const unallocated = registered.filter(b => !state.kitAllocations.some(a => a.bookingId === b.id));
  const handovers = state.handovers.filter(h => (!warehouse || h.warehouseId === warehouse) && (!product || h.productType === product));
  const moves = state.stockMovements.filter(m => (!warehouse || m.warehouseId === warehouse) && items.some(i => i.id === m.itemId)).slice().reverse();
  const targets = [...state.departures.map(d => ({ id: d.id, name: `${d.id} · ${state.packages.find(p => p.id === d.packageId)?.name}`, productType: "UMRAH" })), ...state.hajjPackages.map(p => ({ id: p.id, name: p.name, productType: "HAJJ_SPECIAL" }))];
  const detailItem = state.inventory.find(i => i.id === detail);
  const showBalances = (lowOnly = false) => <DataTable title="saldo persediaan" pageSize={lowOnly ? 5 : 8} rows={balances.filter(b => !lowOnly || (b.active && b.available < b.minimumStock))} columns={[
    { label: "Barang / varian", value: b => `${b.sku} ${b.name} ${b.variant}` }, { label: "Gudang", value: b => b.warehouse },
    { label: "Fisik", value: b => b.physical }, { label: "Reservasi", value: b => b.reserved }, { label: "Tersedia", value: b => b.available }, { label: "Satuan", value: b => b.unit },
    { label: "Status", value: b => !b.active ? "Nonaktif" : b.available < b.minimumStock ? "Perlu restock" : "Cukup", render: b => <Badge>{!b.active ? "Nonaktif" : b.available < b.minimumStock ? "Perlu restock" : "Cukup"}</Badge> },
  ]} />;
  const showMoves = (itemId?: string, recent = false) => <DataTable title="pergerakan stok" rows={(itemId ? moves.filter(m => m.itemId === itemId) : moves).slice(0, recent ? 5 : undefined)} columns={[
    { label: "Tanggal / operator", value: m => `${m.createdAt} ${m.operatorId}`, render: m => <>{dateLabel(m.createdAt)}<small>{m.operatorId}</small></> },
    { label: "Barang (snapshot)", value: m => `${m.itemSnapshot.sku} ${m.itemSnapshot.name} ${m.itemSnapshot.variant}` }, { label: "Gudang", value: m => state.warehouses.find(w => w.id === m.warehouseId)?.name ?? "" },
    { label: "Jenis", value: m => movementLabels[m.type] }, { label: "Jumlah", value: m => `${["HANDOVER", "ADJUSTMENT_OUT"].includes(m.type) ? "−" : "+"}${m.quantity} ${m.itemSnapshot.unit}` }, { label: "Referensi / alasan", value: m => `${m.referenceId} ${m.condition ?? ""} ${m.note}` },
  ]} />;
  const showHandovers = () => <DataTable title="serah terima" rows={handovers.slice().reverse()} columns={[
    { label: "Bukti / tanggal", value: h => h.receiptNumber, render: h => <>{h.receiptNumber}<small>{dateLabel(h.receivedAt)}</small></> }, { label: "Jamaah / booking", value: h => `${h.pilgrimName} ${h.bookingId}` },
    { label: "Paket / produk", value: h => `${h.packageName} ${productLabels[h.productType]}` }, { label: "Penerima", value: h => h.receivedBy }, { label: "Barang diserahkan", value: h => h.items.map(i => `${i.name} ${i.quantity} ${i.unit}`).join(", ") },
    { label: "Bukti / retur", value: h => h.id, render: h => <div className="admin-actions"><HandoverReceipt id={h.id} /><button className="text-button" onClick={() => setForm({ kind: "return", handoverId: h.id })}>Catat retur</button></div> },
  ]} />;
  let reportLabels: string[] = [], reportRows: { id: string; values: (string | number)[] }[] = [];
  if (tab === "Laporan") {
    if (["Saldo gudang", "Stok rendah"].includes(report)) {
      reportLabels = ["SKU / barang", "Gudang", "Fisik", "Reservasi", "Tersedia", "Minimum", "Satuan"];
      reportRows = balances.filter(b => report !== "Stok rendah" || (b.active && b.available < b.minimumStock)).map(b => ({ id: b.id, values: [`${b.sku} · ${b.name}`, b.warehouse, b.physical, b.reserved, b.available, b.minimumStock, b.unit] }));
    } else if (report === "Pergerakan stok") {
      reportLabels = ["Tanggal", "Barang snapshot", "Gudang", "Jenis", "Kuantitas", "Satuan", "Referensi", "Alasan / kondisi"];
      reportRows = moves.map(m => ({ id: m.id, values: [m.createdAt, m.itemSnapshot.name, m.warehouseId, movementLabels[m.type], m.quantity, m.itemSnapshot.unit, m.referenceId, `${m.note} ${m.condition ?? ""}`] }));
    } else if (report === "Serah terima selesai") {
      reportLabels = ["Bukti", "Tanggal", "Jamaah", "Booking", "Penerima", "Barang"];
      reportRows = handovers.map(h => ({ id: h.id, values: [h.receiptNumber, h.receivedAt, h.pilgrimName, h.bookingId, h.receivedBy, h.items.map(i => `${i.name} ${i.quantity} ${i.unit}`).join("; ")] }));
    } else if (report === "Distribusi tertunda") {
      reportLabels = ["Jamaah", "Booking", "Paket", "Template", "Sisa", "Status booking"];
      reportRows = allocations.filter(a => a.allocatedItems.some(i => remaining(state, a, i.itemId) > 0)).map(a => ({ id: a.id, values: [a.pilgrimName, a.bookingId, a.packageName, a.templateName, a.allocatedItems.map(i => `${i.name}: ${remaining(state, a, i.itemId)} ${i.unit}`).join("; "), state.bookings.find(b => b.id === a.bookingId)!.status] }));
      if (!warehouse) reportRows.push(...unallocated.map(b => ({ id: `PENDING-${b.id}`, values: [state.jamaah.find(j => j.id === b.jamaahId)!.name, b.id, packageForBooking(state, b)?.name ?? "", "Belum dipilih", "Belum ada alokasi / gudang", b.status] })));
    } else {
      reportLabels = ["Rombongan", "Template", "Barang", "Booking aktif", "Kebutuhan teoretis", "Belum ada alokasi kit", "Tersedia di gudang terpilih", "Satuan"];
      reportRows = targets.filter(t => (!product || t.productType === product) && (!scope || t.id === scope)).flatMap(t => {
        const bookings = state.bookings.filter(b => b.status === "Aktif" && (b.departureId === t.id || b.hajjPackageId === t.id));
        return state.kitTemplates.filter(k => k.active && k.productType === t.productType).flatMap(k => k.items.filter(i => items.some(v => v.id === i.itemId)).map(i => ({ id: `${t.id}-${k.id}-${i.itemId}`, values: [t.name, k.name, state.inventory.find(v => v.id === i.itemId)!.name, bookings.length, bookings.length * i.requiredQuantity, bookings.filter(b => !state.kitAllocations.some(a => a.bookingId === b.id && a.templateId === k.id)).length * i.requiredQuantity, warehouses.reduce((n, w) => n + stockBalance(state, i.itemId, w.id).available, 0), state.inventory.find(v => v.id === i.itemId)!.unit] })));
      });
    }
  }
  return <div className="inventory-module">
    <PageHeader title="Perlengkapan Jamaah" description="Kelola stok, reservasi kit dan serah terima Umrah maupun Haji Khusus." />
    <p className="admin-notice">Data fiktif · Stok berasal dari ledger. Alokasi mengurangi stok tersedia; serah terima mengurangi fisik sekaligus reservasi. Catatan yang sudah diposting tidak dapat diedit.</p>
    <Tabs items={tabs} value={tab} onChange={setTab} />
    <div className="admin-actions section-gap inventory-filters"><SelectFilter label="Semua gudang" value={warehouse} onChange={setWarehouse} options={state.warehouses.map(w => ({ value: w.id, label: w.name }))} /><SelectFilter label="Semua kategori" value={category} onChange={setCategory} options={[...new Set(state.inventory.map(i => i.category))].map(v => ({ value: v, label: v }))} /><SelectFilter label="Semua produk" value={product} onChange={v => { setProduct(v); setScope(""); }} options={Object.entries(productLabels).map(([value, label]) => ({ value, label }))} />{["Distribusi", "Laporan"].includes(tab) && <SelectFilter label="Semua rombongan" value={scope} onChange={setScope} options={targets.filter(t => !product || t.productType === product).map(t => ({ value: t.id, label: t.name }))} />}</div>
    {tab === "Overview" && <>
      <div className="admin-stats section-gap"><Stat label="Barang aktif" value={items.filter(i => i.active).length} detail="Menurut kategori / produk" /><Stat label="Stok fisik · unit campuran" value={balances.reduce((n, b) => n + b.physical, 0)} detail="Gabungan jenis/satuan; bukan nilai persediaan" /><Stat label="Stok perlu perhatian" value={balances.filter(b => b.active && b.available < b.minimumStock).length} detail="Barang × gudang di bawah minimum" /><Stat label="Alokasi belum selesai" value={allocations.filter(a => a.status === "ALLOCATED" || a.status === "PARTIAL").length} detail={`${unallocated.length} booking belum alokasi; ${handovers.length} bukti diposting`} /></div>
      <Panel title="Mulai pekerjaan gudang"><div className="panel-body admin-actions"><button className="admin-button primary" onClick={() => setForm({ kind: "movement" })}>Catat stok masuk / koreksi</button><button className="admin-button" onClick={() => setTab("Distribusi")}>Alokasi dan serah terima kit →</button><button className="admin-button" onClick={() => setTab("Riwayat Serah Terima")}>Buka bukti serah terima →</button></div></Panel>
      <div className="section-gap"><Panel title="Stok rendah">{showBalances(true)}</Panel></div><div className="section-gap"><Panel title="Pergerakan terbaru">{showMoves(undefined, true)}</Panel></div>
    </>}
    {tab === "Master Barang" && <DataTable title="master barang" rows={items} actions={<button className="admin-button primary" onClick={() => setForm({ kind: "item" })}><Plus size={14} />Tambah barang</button>} columns={[
      { label: "SKU / nama", value: i => `${i.sku} ${i.name}`, render: i => <button className="text-button" onClick={() => setDetail(i.id)}>{i.sku} · {i.name}</button> }, { label: "Kategori", value: i => i.category }, { label: "Varian / ukuran", value: i => i.variant }, { label: "Satuan", value: i => i.unit }, { label: "Minimum", value: i => i.minimumStock }, { label: "Status", value: i => i.active ? "Aktif" : "Nonaktif", render: i => <Badge>{i.active ? "Aktif" : "Nonaktif"}</Badge> }, { label: "Aksi", value: i => i.id, render: i => <button className="admin-button" onClick={() => setForm({ kind: "item", value: i })}>Edit barang</button> },
    ]} />}
    {tab === "Barang Masuk/Keluar" && <><div className="admin-actions section-gap"><button className="admin-button primary" onClick={() => setForm({ kind: "movement" })}>Catat stok masuk / koreksi</button><button className="admin-button" onClick={() => setForm({ kind: "return" })}>Catat retur</button></div><p className="muted section-gap">Koreksi wajib disertai alasan. Retur rusak dicatat masuk lalu dikeluarkan sebagai tidak layak dalam transaksi yang sama.</p>{showMoves()}</>}
    {tab === "Template Perlengkapan" && <DataTable title="template kit" rows={state.kitTemplates.filter(t => !product || t.productType === product)} actions={<button className="admin-button primary" onClick={() => setForm({ kind: "template" })}>Tambah template</button>} columns={[
      { label: "Template", value: t => t.name }, { label: "Produk", value: t => productLabels[t.productType] }, { label: "Isi kit", value: t => t.items.map(i => `${state.inventory.find(k => k.id === i.itemId)?.name}: ${i.requiredQuantity}`).join(", ") }, { label: "Status", value: t => t.active ? "Aktif" : "Nonaktif" }, { label: "Edit", value: t => t.id, render: t => <button className="admin-button" onClick={() => setForm({ kind: "template", value: t })}>Edit template</button> },
    ]} />}
    {tab === "Distribusi" && <><Panel title="Distribusi perlengkapan" subtitle="Pilih booking aktif dan template sesuai produk; tidak ada alokasi barang berdasarkan gender otomatis." action={<button className="admin-button primary" onClick={() => setForm({ kind: "allocate" })}>Alokasikan kit</button>}><div className="panel-body"><p className="muted">Reservasi booking yang dibatalkan tetap terlihat sampai operator merilis sisanya. Kit yang sama tidak dapat dialokasikan dua kali pada satu booking.</p></div></Panel><div className="section-gap"><DataTable title="alokasi kit" rows={allocations.slice().reverse()} columns={[
      { label: "Jamaah / booking", value: a => `${a.pilgrimName} ${a.bookingId}` }, { label: "Paket / template", value: a => `${a.packageName} ${a.templateName}` }, { label: "Gudang", value: a => state.warehouses.find(w => w.id === a.warehouseId)?.name ?? "" },
      { label: "Progres per barang", value: a => a.allocatedItems.map(i => `${i.name}: ${delivered(state, a.id, i.itemId)}/${i.quantity} diterima; ${i.releasedQuantity} rilis; ${remaining(state, a, i.itemId)} sisa`).join(" · ") },
      { label: "Status", value: a => `${allocationLabels[a.status]} · ${state.bookings.find(b => b.id === a.bookingId)?.status}`, render: a => <Badge>{state.bookings.find(b => b.id === a.bookingId)?.status === "Batal" ? "Booking Batal" : allocationLabels[a.status]}</Badge> },
      { label: "Aksi", value: a => a.id, render: a => { const pending = a.allocatedItems.some(i => remaining(state, a, i.itemId) > 0), latest = state.handovers.filter(h => h.allocationId === a.id).at(-1); return <div className="admin-actions"><button className="admin-button primary" disabled={!pending || state.bookings.find(b => b.id === a.bookingId)?.status !== "Aktif"} onClick={() => setForm({ kind: "handover", allocation: a })}>Serahkan</button><button className="text-button" disabled={!pending} onClick={() => setRelease(a.id)}>Rilis sisa</button>{latest && <HandoverReceipt id={latest.id} />}</div>; } },
    ]} /></div></>}
    {tab === "Distribusi" && <details className="admin-panel section-gap"><summary className="panel-heading">Lihat jamaah terdaftar · {registered.length} booking aktif · {unallocated.length} belum alokasi</summary><div className="panel-body stack">{registered.map(b => <div key={b.id} className="flex-between"><div><b>{state.jamaah.find(j => j.id === b.jamaahId)?.name}</b><p className="muted">{b.id} · {packageForBooking(state, b)?.name} · {state.kitAllocations.some(a => a.bookingId === b.id) ? "Memiliki riwayat alokasi" : "Belum dialokasikan"}</p></div><button className="admin-button" aria-label={`Alokasikan kit ${b.id}`} onClick={() => setForm({ kind: "allocate", bookingId: b.id })}>Alokasikan</button></div>)}</div></details>}
    {tab === "Riwayat Serah Terima" && showHandovers()}
    {tab === "Laporan" && <><div className="admin-actions section-gap"><label>Jenis laporan<select value={report} onChange={e => setReport(e.target.value)}>{["Saldo gudang", "Stok rendah", "Pergerakan stok", "Kebutuhan kit", "Distribusi tertunda", "Serah terima selesai"].map(v => <option key={v}>{v}</option>)}</select></label></div><p className="muted section-gap">Kebutuhan kit bersifat teoretis per template, bukan reservasi otomatis. Tidak ada valuasi biaya barang.</p><DataTable<{ id: string; values: (string | number)[] }> key={report} title="laporan inventory" rows={reportRows} columns={reportLabels.map((label, n) => ({ label, value: r => r.values[n] }))} actions={rows => <button className="admin-button" onClick={() => exportCSV(report, reportLabels, rows.map(r => r.values))}>Ekspor CSV</button>} /></>}
    {detailItem && <Modal title={`Detail ${detailItem.name}`} onClose={() => setDetail("")} wide><Fields data={{ SKU: detailItem.sku, Kategori: detailItem.category, Varian: detailItem.variant, Satuan: detailItem.unit, Minimum: detailItem.minimumStock, Status: detailItem.active ? "Aktif" : "Nonaktif" }} /><div className="admin-actions section-gap"><button className="admin-button" onClick={() => { setDetail(""); setForm({ kind: "item", value: detailItem }); }}>Edit barang</button></div>{showMoves(detailItem.id)}</Modal>}
    {release && <Confirm title="Rilis sisa alokasi?" text="Hanya barang yang belum diserahkan akan dilepas dari reservasi. Catatan serah terima dan pergerakan stok tetap tersimpan." onClose={() => setRelease(null)} onConfirm={() => transact(s => releaseAllocation(s, release), "Sisa alokasi perlengkapan dirilis", "Perlengkapan")} />}
    {form && <InventoryForm key={`${form.kind}:${resetVersion}`} form={form} scope={scope} product={product} warehouse={warehouse} onClose={() => setForm(null)} />}
  </div>;
}

type Prepared = { run: (s: DemoState) => void; summary: string };
function RecordForm({ title, children, prepare, onClose, confirm = false }: { title: string; children: ReactNode; prepare: (data: FormData) => Prepared; onClose: () => void; confirm?: boolean }) {
  const { state, transact } = useDemo();
  const [pending, setPending] = useState<Prepared | null>(null), [error, setError] = useState("");
  const save = (value: Prepared) => { if (transact(value.run, value.summary, "Perlengkapan")) onClose(); else setError("Belum tersimpan. Periksa rincian kesalahan pada notifikasi."); };
  return <><Modal title={title} onClose={onClose} wide><form className="admin-form" onSubmit={e => {
    e.preventDefault(); setError("");
    try { const value = prepare(new FormData(e.currentTarget)); value.run(structuredClone(state)); if (confirm) setPending(value); else save(value); }
    catch (e) { setError(e instanceof Error ? e.message : "Periksa isian formulir."); }
  }}>{children}{error && <p role="alert" className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="admin-button" onClick={onClose}>Batal</button><button className="admin-button primary">{confirm ? "Tinjau pencatatan" : "Simpan"}</button></div></form></Modal>{pending && <Confirm title="Konfirmasi pencatatan" text={`${pending.summary}. Pastikan data benar; catatan stok dan bukti yang diposting tidak dapat diedit.`} onClose={() => setPending(null)} onConfirm={() => save(pending)} />}</>;
}
function InventoryForm({ form, scope, product, warehouse, onClose }: { form: FormKind; scope: string; product: string; warehouse: string; onClose: () => void }) {
  const { state } = useDemo();
  const [search, setSearch] = useState(""), [bookingId, setBookingId] = useState(form.kind === "allocate" ? form.bookingId ?? "" : ""), [templateId, setTemplateId] = useState(""), [warehouseId, setWarehouseId] = useState(warehouse || state.warehouses[0].id);
  const [handoverId, setHandoverId] = useState(form.kind === "return" ? form.handoverId ?? "" : "");
  const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
  const warehouseOptions = state.warehouses.filter(w => w.active).map(w => <option key={w.id} value={w.id}>{w.name}</option>);
  if (form.kind === "item") {
    const i = form.value;
    return <RecordForm title={i ? "Edit barang" : "Tambah barang"} onClose={onClose} prepare={f => {
      const value: InventoryItem = { id: i?.id ?? uid("ITM"), sku: text(f, "sku"), name: text(f, "name"), category: text(f, "category"), unit: text(f, "unit"), variant: text(f, "variant"), minimumStock: Number(f.get("minimum")), active: f.get("active") === "on" };
      return { run: s => saveInventoryItem(s, value), summary: `Master barang ${value.name} disimpan` };
    }}><div className="form-grid"><label>SKU<input name="sku" required maxLength={40} defaultValue={i?.sku} /></label><label>Nama barang<input name="name" required minLength={3} maxLength={100} defaultValue={i?.name} /></label><label>Kategori<input name="category" required defaultValue={i?.category} /></label><label>Satuan<input name="unit" required defaultValue={i?.unit ?? "pcs"} /></label><label>Varian / ukuran<input name="variant" defaultValue={i?.variant ?? "Standar"} /></label><label>Stok minimum<input name="minimum" required type="number" min={0} step={1} defaultValue={i?.minimumStock ?? 10} /></label></div><label><span><input name="active" type="checkbox" defaultChecked={i?.active ?? true} /> Barang aktif</span></label><p className="muted">Metadata baru tidak mengubah snapshot historis. Satuan tidak dapat diubah setelah ada ledger.</p></RecordForm>;
  }
  if (form.kind === "template") {
    const t = form.value;
    return <RecordForm title={t ? "Edit template kit" : "Tambah template kit"} onClose={onClose} prepare={f => {
      const value: PilgrimKitTemplate = { id: t?.id ?? uid("KIT"), name: text(f, "name"), productType: text(f, "product") as PilgrimKitTemplate["productType"], active: f.get("active") === "on", items: f.getAll("items").map(v => ({ itemId: String(v), requiredQuantity: Number(f.get(`qty-${v}`)) })) };
      return { run: s => saveKitTemplate(s, value), summary: `Template ${value.name} disimpan; alokasi lama tetap memakai snapshot` };
    }}><label>Nama template<input name="name" minLength={3} required defaultValue={t?.name} /></label><label>Produk<select name="product" defaultValue={t?.productType ?? "UMRAH"}>{Object.entries(productLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><p className="admin-notice">Pilih isi kit secara eksplisit. Barang berdasarkan gender tidak dipilih otomatis. Perubahan hanya berlaku untuk alokasi berikutnya.</p>{state.inventory.filter(i => i.active || t?.items.some(v => v.itemId === i.id)).map(i => <div className="form-grid" key={i.id}><label><span><input type="checkbox" name="items" value={i.id} defaultChecked={t?.items.some(v => v.itemId === i.id)} /> {i.name} · {i.variant}</span></label><label>Jumlah {i.name}<input name={`qty-${i.id}`} type="number" min={1} step={1} defaultValue={t?.items.find(v => v.itemId === i.id)?.requiredQuantity ?? 1} /></label></div>)}<label><span><input name="active" type="checkbox" defaultChecked={t?.active ?? true} /> Template aktif</span></label></RecordForm>;
  }
  if (form.kind === "movement") return <RecordForm title="Catat stok masuk / koreksi" onClose={onClose} confirm prepare={f => {
    const input = { id: uid("MOV"), itemId: text(f, "item"), warehouseId: text(f, "warehouse"), type: text(f, "type") as "RECEIPT" | "ADJUSTMENT_IN" | "ADJUSTMENT_OUT", quantity: Number(f.get("quantity")), createdAt: text(f, "date"), note: text(f, "note"), referenceId: text(f, "reference") };
    return { run: s => postMovement(s, input), summary: `${movementLabels[input.type]} ${input.quantity} ${state.inventory.find(i => i.id === input.itemId)?.unit} ${state.inventory.find(i => i.id === input.itemId)?.name} di ${state.warehouses.find(w => w.id === input.warehouseId)?.name}` };
  }}><div className="form-grid"><label>Jenis pergerakan<select name="type"><option value="RECEIPT">Barang masuk</option><option value="ADJUSTMENT_IN">Koreksi masuk</option><option value="ADJUSTMENT_OUT">Koreksi keluar</option></select></label><label>Barang<select name="item">{state.inventory.map(i => <option key={i.id} value={i.id}>{i.sku} · {i.name}</option>)}</select></label><label>Gudang<select name="warehouse" defaultValue={warehouseId}>{warehouseOptions}</select></label><label>Kuantitas<input name="quantity" type="number" min={1} max={10000000} step={1} required /></label><label>Tanggal transaksi<input name="date" type="date" required defaultValue={DEMO_TODAY} /></label><label>Referensi (opsional)<input name="reference" /></label></div><label>Catatan / alasan koreksi<textarea name="note" rows={3} /></label><p className="muted">Koreksi masuk/keluar wajib memiliki alasan. Tidak ada pengeditan atau penghapusan pergerakan lama.</p></RecordForm>;
  if (form.kind === "allocate") {
    const booking = state.bookings.find(b => b.id === bookingId), template = state.kitTemplates.find(t => t.id === templateId);
    const bookings = state.bookings.filter(b => b.status === "Aktif" && (!scope || b.departureId === scope || b.hajjPackageId === scope) && (!product || b.productType === product));
    return <RecordForm title="Alokasikan kit jamaah" onClose={onClose} confirm prepare={() => {
      const id = uid("ALLOC");
      return { run: s => { allocateKit(s, bookingId, templateId, warehouseId, id); }, summary: `Alokasi ${template?.name ?? "kit"} untuk ${state.jamaah.find(j => j.id === booking?.jamaahId)?.name ?? "jamaah"} dari ${state.warehouses.find(w => w.id === warehouseId)?.name}` };
    }}><label>Cari jamaah / booking<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nama atau nomor booking" /></label><label>Booking aktif<select required value={bookingId} onChange={e => { setBookingId(e.target.value); setTemplateId(""); }}><option value="">Pilih booking</option>{bookings.filter(b => `${b.id} ${state.jamaah.find(j => j.id === b.jamaahId)?.name}`.toLowerCase().includes(search.toLowerCase())).map(b => <option key={b.id} value={b.id}>{state.jamaah.find(j => j.id === b.jamaahId)?.name} · {b.id} · {productLabels[b.productType]}</option>)}</select></label><label>Template kit<select required value={templateId} onChange={e => setTemplateId(e.target.value)}><option value="">Pilih template</option>{state.kitTemplates.filter(t => t.active && t.productType === booking?.productType).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label><label>Gudang alokasi<select value={warehouseId} onChange={e => setWarehouseId(e.target.value)}>{warehouseOptions}</select></label>{booking && <p className="muted">Paket: {packageForBooking(state, booking)?.name}</p>}{template && <div className="stack">{template.items.map(i => { const b = stockBalance(state, i.itemId, warehouseId), item = state.inventory.find(k => k.id === i.itemId)!; return <p key={i.itemId} className={b.available < i.requiredQuantity ? "form-error" : "admin-notice"}>{item.name}: perlu {i.requiredQuantity} {item.unit} · tersedia {b.available} · fisik {b.physical} · reservasi {b.reserved}</p>; })}</div>}</RecordForm>;
  }
  if (form.kind === "handover") {
    const a = state.kitAllocations.find(a => a.id === form.allocation.id) ?? form.allocation;
    return <RecordForm title="Serah terima perlengkapan" onClose={onClose} confirm prepare={f => {
      const quantities = a.allocatedItems.map(i => ({ itemId: i.itemId, quantity: Number(f.get(i.itemId)) }));
      if (quantities.some(i => !Number.isSafeInteger(i.quantity) || i.quantity < 0)) throw new Error("Jumlah aktual harus bilangan bulat nonnegatif.");
      const input = { id: uid("HO"), allocationId: a.id, quantities: quantities.filter(i => i.quantity > 0), receivedBy: text(f, "recipient"), receivedAt: text(f, "date"), notes: text(f, "notes") };
      return { run: s => { postHandover(s, input); }, summary: `Serah terima ${input.quantities.map(i => `${a.allocatedItems.find(k => k.itemId === i.itemId)?.name} ${i.quantity}`).join(", ")} untuk ${a.pilgrimName}, diterima ${input.receivedBy}` };
    }}><p className="admin-notice">{a.pilgrimName} · {a.bookingId} · {a.templateName}. Isi 0 untuk barang yang belum diserahkan pada kesempatan ini.</p>{a.allocatedItems.map(i => <label key={i.itemId}>{i.name} · sudah {delivered(state, a.id, i.itemId)} / {i.quantity} · sisa {remaining(state, a, i.itemId)} {i.unit}<input aria-label={`Serahkan ${i.name}`} name={i.itemId} type="number" min={0} max={remaining(state, a, i.itemId)} step={1} required defaultValue={0} /></label>)}<div className="form-grid"><label>Nama penerima<input name="recipient" maxLength={120} required defaultValue={a.pilgrimName} /></label><label>Tanggal penyerahan<input name="date" type="date" required defaultValue={DEMO_TODAY} /></label></div><label>Catatan penyerahan<textarea name="notes" /></label><p className="muted">Operator demo: Ahmad (USR-1). Bukti PDF hanya memuat barang yang benar-benar diposting.</p></RecordForm>;
  }
  const h = state.handovers.find(h => h.id === handoverId);
  return <RecordForm title="Catat retur perlengkapan" onClose={onClose} confirm prepare={f => {
    const input = { id: uid("RET"), handoverId, itemId: text(f, "item"), quantity: Number(f.get("quantity")), condition: text(f, "condition") as "REUSABLE" | "DAMAGED", createdAt: text(f, "date"), note: text(f, "note") };
    return { run: s => postReturn(s, input), summary: `Retur ${input.quantity} barang dari bukti ${h?.receiptNumber}, ${input.condition === "DAMAGED" ? "rusak, langsung dikeluarkan dari stok layak" : "layak dipakai kembali"}` };
  }}><label>Bukti serah terima<select required value={handoverId} onChange={e => setHandoverId(e.target.value)}><option value="">Pilih bukti</option>{state.handovers.slice().reverse().map(h => <option key={h.id} value={h.id}>{h.pilgrimName} · {h.receiptNumber}</option>)}</select></label><label>Barang yang dikembalikan<select name="item" required key={handoverId}><option value="">Pilih barang</option>{h?.items.map(i => <option key={i.itemId} value={i.itemId}>{i.name} · diserahkan {i.quantity} {i.unit}</option>)}</select></label><div className="form-grid"><label>Kuantitas retur<input name="quantity" type="number" min={1} step={1} required /></label><label>Kondisi / disposisi<select name="condition"><option value="REUSABLE">Layak, kembali ke stok</option><option value="DAMAGED">Rusak, dikeluarkan dari stok</option></select></label><label>Tanggal retur<input name="date" type="date" required defaultValue={DEMO_TODAY} /></label></div><label>Alasan retur<textarea name="note" required /></label><p className="admin-notice">Retur tidak membuka ulang alokasi lama. Retur rusak memiliki RETURN dan koreksi keluar berpasangan, sehingga tidak menambah stok tersedia.</p></RecordForm>;
}
