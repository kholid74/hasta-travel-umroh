"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { costCategories, type Costing as CostingRecord, type CostItem, type CostPlan } from "@/content/admin/costing";
import type { Departure } from "@/content/admin/types";
import { calculateCosting, costingMoney as money, costingPercent as percent, itemBase, latestCosting, newCosting, reviseCosting, saveCosting, saveCostScenario, saveCostTemplate } from "@/lib/admin/costing";
import { dateLabel, uid } from "@/lib/admin/model";
import { useDemo } from "./Store";
import { Badge, Confirm, DataTable, Empty, Modal, PageHeader, Panel, SelectFilter, Stat, Tabs } from "./ui";

const typeLabels = { person: "Per jamaah", group: "Per grup", unit: "Per unit" };
const audienceLabels = { all: "Seluruh peserta", paying: "Jamaah berbayar", foc: "Peserta gratis / FOC" };
function calculate(plan: CostPlan) {
  try { return { result: calculateCosting(plan), error: "" }; }
  catch (error) { return { result: null, error: error instanceof Error ? error.message : "Periksa input costing." }; }
}

export default function Costing({ id }: { id?: string }) {
  const { state, resetVersion, transact } = useDemo();
  const [packageId, setPackageId] = useState("");
  const [versionId, setVersionId] = useState("");
  const departure = state.departures.find(d => d.id === id);
  if (id && !departure) return <Empty title="Keberangkatan tidak ditemukan" />;
  if (departure) {
    const versions = state.costings.filter(c => c.departureId === departure.id).sort((a, b) => b.revision - a.revision);
    const current = versions.find(c => c.id === versionId) ?? versions[0];
    if (!current) return <>
      <Link className="text-button" href="/admin/hpp">← Semua costing</Link>
      <PageHeader title="Mulai costing keberangkatan" description={`${departure.id} · ${state.packages.find(p => p.id === departure.packageId)?.name}`} />
      <Panel title="Gunakan template paket"><div className="panel-body stack"><p>{state.costTemplates.some(t => t.packageId === departure.packageId) ? "Komponen biaya dan kurs dari template paket akan disalin ke draft baru. Tinjau kuantitas, harga, dan jumlah peserta sebelum menyimpan." : "Paket ini belum memiliki template. Mulai draft kosong dan tambahkan komponen biaya sesuai kebutuhan."}</p><button className="admin-button primary" onClick={() => transact(s => { newCosting(s, departure.id); }, `Draft HPP ${departure.id} dibuat`, "HPP")}>Buat draft costing</button></div></Panel>
    </>;
    return <CostingEditor key={`${current.id}:${resetVersion}`} costing={current} departure={departure} onRevision={setVersionId} versions={<label className="costing-version">Revisi costing<select aria-label="Revisi costing" value={current.id} onChange={e => setVersionId(e.target.value)}>{versions.map(c => <option key={c.id} value={c.id}>Revisi {c.revision} · {c.status}</option>)}</select></label>} />;
  }
  const rows = state.departures.filter(d => !packageId || d.packageId === packageId).map(d => {
    const costing = latestCosting(state, d.id);
    return { ...d, costing, result: costing ? calculate(costing).result : null };
  });
  return <>
    <PageHeader title="HPP & Kalkulasi Paket" description="Rencanakan biaya setiap keberangkatan, uji harga jual, lalu simpan versi yang disepakati." />
    <p className="admin-notice">Demo dalam memori: draft, template, dan skenario tersimpan selama sesi workspace; refresh atau Reset demo mengembalikan data contoh. Harga publik, booking, pembayaran, dan jumlah jamaah aktual tidak berubah.</p>
    <div className="admin-stats section-gap">
      <Stat label="Keberangkatan" value={state.departures.length} detail="Satu paket bisa memiliki HPP berbeda" />
      <Stat label="Costing draft" value={state.departures.filter(d => latestCosting(state, d.id)?.status === "Draft").length} detail="Versi terbaru yang masih dapat diedit" />
      <Stat label="Costing final" value={state.departures.filter(d => latestCosting(state, d.id)?.status === "Final").length} detail="Perubahan melalui revisi baru" />
      <Stat label="Template paket" value={state.costTemplates.length} detail="Komponen dan kurs dapat digunakan ulang" />
    </div>
    <DataTable title="costing" rows={rows} filters={<SelectFilter label="Semua paket" value={packageId} onChange={setPackageId} options={state.packages.map(p => ({ value: p.id, label: p.name }))} />} columns={[
      { label: "Paket", value: r => state.packages.find(p => p.id === r.packageId)?.name ?? "" },
      { label: "Keberangkatan", value: r => r.id, render: r => <Link className="text-button" href={`/admin/hpp/${r.id}`}>{r.id}<small>{dateLabel(r.date)}</small></Link> },
      { label: "Rencana berbayar / FOC", value: r => r.costing ? `${r.costing.payingCount} / ${r.costing.focCount}` : "Belum diisi" },
      { label: "Total biaya", value: r => r.result ? money(r.result.total) : "—" },
      { label: "HPP / jamaah", value: r => r.result ? money(r.result.hpp) : "—" },
      { label: "Harga jual", value: r => r.result ? money(r.result.selling) : "—" },
      { label: "Margin", value: r => r.result ? percent(r.result.margin) : "—", render: r => <span className={r.result && r.result.profit < BigInt(0) ? "red-text" : "green-text"}>{r.result ? percent(r.result.margin) : "—"}</span> },
      { label: "Status", value: r => r.costing ? `${r.costing.status} · R${r.costing.revision}${r.result ? "" : " · Belum lengkap"}` : "Belum dibuat", render: r => <Badge>{r.costing?.status ?? "Belum dibuat"}</Badge> },
      { label: "Kelola", value: r => r.id, render: r => <Link className="admin-button" href={`/admin/hpp/${r.id}`}>{r.costing ? "Buka costing" : "Buat costing"}</Link> },
    ]} />
  </>;
}

function CostingEditor({ costing, departure, onRevision, versions }: { costing: CostingRecord; departure: Departure; onRevision: (id: string) => void; versions: ReactNode }) {
  const { state, transact, notify } = useDemo();
  const [plan, setPlan] = useState<CostPlan>(() => structuredClone(costing));
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState("Breakdown biaya");
  const [editing, setEditing] = useState<CostItem | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"final" | "template" | null>(null);
  const [grouped, setGrouped] = useState(true);
  const locked = costing.status === "Final";
  const { result, error } = calculate(plan);
  const product = state.packages.find(p => p.id === departure.packageId)!;
  function patch(update: Partial<CostPlan>) { setPlan(p => ({ ...p, ...update })); setDirty(true); }
  function save(final = false) {
    if (transact(s => saveCosting(s, costing.id, plan, final), `HPP ${departure.id} revisi ${costing.revision} ${final ? "difinalisasi" : "disimpan sebagai draft"}`, "HPP")) setDirty(false);
  }
  const rows = grouped ? [...plan.items].sort((a, b) => a.category.localeCompare(b.category, "id")) : plan.items;
  return <>
    <Link className="text-button" href="/admin/hpp">← Semua costing</Link>
    <PageHeader title={`HPP ${departure.id}`} description={`${product.name} · ${dateLabel(departure.date)} · Revisi ${costing.revision}`} actions={<><Badge>{costing.status}</Badge>{versions}</>} />
    <div className="admin-actions costing-actions">
      {!locked ? <><button className="admin-button primary" disabled={!result} onClick={() => save()}>Simpan draft</button><button className="admin-button" disabled={!result} onClick={() => setConfirm("final")}>Finalisasi costing</button></> : <button className="admin-button primary" disabled={latestCosting(state, departure.id)?.id !== costing.id} onClick={() => {
        let nextId = "";
        if (transact(s => { nextId = reviseCosting(s, costing.id).id; }, `Revisi baru HPP ${departure.id} dibuat`, "HPP")) onRevision(nextId);
      }}>Buat revisi baru</button>}
      <button className="admin-button" disabled={dirty || !result} onClick={() => setConfirm("template")}>Jadikan template paket</button>
      <Link className="text-button" href={`/admin/keberangkatan/${departure.id}`}>Lihat keberangkatan →</Link>
      <Link className="text-button" href={`/admin/paket/${product.id}`}>Lihat paket →</Link>
    </div>
    <p className="admin-notice">{locked ? `Versi final dikunci${costing.finalizedAt ? ` sejak ${dateLabel(costing.finalizedAt)}` : ""}. Buat revisi untuk mengubah biaya atau harga; versi ini tetap tersimpan.` : dirty ? "Ada perubahan yang belum disimpan. Simpan draft sebelum berpindah revisi, membuat template, atau meninggalkan halaman." : "Draft tersimpan dalam sesi demo. Refresh atau Reset demo akan mengembalikan contoh awal."} Costing tidak mengubah harga paket publik atau invoice.</p>
    <Tabs items={["Breakdown biaya", "Simulasi harga", "Ringkasan"]} value={tab} onChange={setTab} />
    {tab !== "Simulasi harga" && <Panel title="Dasar perhitungan" subtitle="Biaya peserta gratis tetap masuk, pembagi HPP hanya jamaah berbayar">
      <fieldset disabled={locked} className="costing-inputs">
        <label>Jamaah berbayar rencana<input aria-label="Jamaah berbayar rencana" type="number" min={1} max={10000} step={1} value={Number.isNaN(plan.payingCount) ? "" : plan.payingCount} onChange={e => patch({ payingCount: e.target.value === "" ? NaN : Number(e.target.value) })} /></label>
        <label>Peserta gratis / FOC<input aria-label="Peserta gratis / FOC" type="number" min={0} max={10000} step={1} value={Number.isNaN(plan.focCount) ? "" : plan.focCount} onChange={e => patch({ focCount: e.target.value === "" ? NaN : Number(e.target.value) })} /></label>
        <label>Harga jual / jamaah (IDR)<input aria-label="Harga jual / jamaah (IDR)" type="number" min="0.01" step="0.01" value={plan.sellingPrice} onChange={e => patch({ sellingPrice: e.target.value })} /></label>
        <label>Diskon / jamaah (IDR)<input aria-label="Diskon / jamaah (IDR)" type="number" min="0" step="0.01" value={plan.discountPerPerson} onChange={e => patch({ discountPerPerson: e.target.value })} /></label>
      </fieldset>
      {plan.payingCount + plan.focCount > departure.capacity && <p className="admin-notice warning">Rencana total peserta melebihi kapasitas keberangkatan ({departure.capacity}). Ini hanya simulasi; tinjau kebutuhan kursi, kamar, dan kendaraan.</p>}
    </Panel>}
    {tab === "Breakdown biaya" && <div className="section-gap">
      <DataTable title="komponen biaya" rows={rows} filters={<label className="costing-group"><input type="checkbox" checked={grouped} onChange={e => setGrouped(e.target.checked)} />Kelompokkan kategori</label>} actions={!locked && <button className="admin-button primary" onClick={() => setEditing({ id: uid("CI"), name: "", category: "Biaya lain-lain", type: "person", audience: "all", quantity: "1", unit: "orang", unitPrice: "", currency: "IDR", exchangeRate: "1", notes: "" })}><Plus size={15} />Tambah komponen</button>} columns={[
        { label: "Kategori", value: i => i.category }, { label: "Nama biaya", value: i => i.name, render: i => <><b>{i.name}</b><small className="costing-note">{i.notes}</small></> },
        { label: "Tipe / sasaran", value: i => `${typeLabels[i.type]}${i.type === "person" ? ` · ${audienceLabels[i.audience]}` : ""}` },
        { label: "Kuantitas", value: i => `${i.quantity} ${i.unit}` }, { label: "Harga satuan", value: i => `${i.currency} ${i.unitPrice}` },
        { label: "Kurs ke IDR", value: i => i.exchangeRate },
        { label: "Total IDR", value: i => result ? money(result.lines.find(l => l.id === i.id)!.total) : "Periksa dasar perhitungan" },
        { label: "Aksi", value: () => "", render: i => !locked ? <div className="admin-actions"><button className="icon-button" aria-label={`Edit ${i.name}`} onClick={() => setEditing(structuredClone(i))}><Pencil size={15} /></button><button className="icon-button" aria-label={`Hapus ${i.name}`} onClick={() => setRemoving(i.id)}><Trash2 size={15} /></button></div> : "Terkunci" },
      ]} />
      <p className="admin-notice section-gap">Per jamaah = kuantitas × harga × kurs × peserta sasaran. Per grup dan per unit = kuantitas × harga × kurs. Harga per jamaah dibulatkan ke 2 desimal IDR sebelum dikalikan peserta. Kuantitas hotel dapat diisi kamar × malam; unit tidak bertambah otomatis saat jumlah jamaah berubah.</p>
    </div>}
    {tab === "Simulasi harga" ? <Simulation costingId={costing.id} source={plan} capacity={departure.capacity} /> : <>
      {error && <p className="form-error section-gap" role="alert">{error}</p>}
      {result && <CostSummary plan={plan} />}
      {tab === "Ringkasan" && <div className="two-columns section-gap">
        <Panel title="Biaya aktual tercatat" subtitle="Sumber: Pengeluaran pada keberangkatan ini"><div className="panel-body stack"><strong>{money(state.expenses.filter(e => e.departureId === departure.id).reduce((sum, e) => sum + BigInt(e.amount) * BigInt(100), BigInt(0)))}</strong><p className="muted">Mencakup pengeluaran Menunggu dan Dibayar. Angka ini terpisah dari rencana HPP dan belum menyatakan seluruh biaya sudah tercatat.</p><Link className="text-button" href="/admin/pengeluaran">Buka Pengeluaran →</Link></div></Panel>
        <Panel title="Catatan costing"><div className="panel-body admin-form"><label>Asumsi dan catatan<textarea aria-label="Asumsi dan catatan" disabled={locked} value={plan.notes} onChange={e => patch({ notes: e.target.value })} rows={4} /></label><p className="muted">Riwayat simpan, finalisasi, template, dan revisi tercatat di Activity Log.</p></div></Panel>
      </div>}
    </>}
    {editing && <CostItemForm item={editing} onClose={() => setEditing(null)} onSave={item => { patch({ items: plan.items.some(i => i.id === item.id) ? plan.items.map(i => i.id === item.id ? item : i) : [...plan.items, item] }); setEditing(null); }} />}
    {removing && <Confirm title="Hapus komponen biaya?" text="Komponen dihapus dari draft lokal. Simpan draft untuk menyimpan perubahan dalam sesi demo." onClose={() => setRemoving(null)} onConfirm={() => patch({ items: plan.items.filter(i => i.id !== removing) })} />}
    {confirm && <Confirm title={confirm === "final" ? "Finalisasi costing?" : "Simpan sebagai template paket?"} text={confirm === "final" ? "Semua perubahan saat ini akan disimpan dan dikunci. Perubahan berikutnya harus melalui revisi; harga publik tetap." : "Komponen dan kurs dari versi tersimpan ini menggantikan template paket. Costing keberangkatan lain yang sudah dibuat tetap memakai salinannya sendiri."} onClose={() => setConfirm(null)} onConfirm={() => {
      if (confirm === "final") save(true);
      else if (dirty) notify("Simpan draft terlebih dahulu.", true);
      else transact(s => saveCostTemplate(s, costing.id), `Template biaya ${product.name} diperbarui dari revisi ${costing.revision}`, "HPP");
    }} />}
  </>;
}

function CostSummary({ plan }: { plan: CostPlan }) {
  const { result: r } = calculate(plan);
  if (!r) return null;
  return <div className="section-gap">
    <div className="admin-stats costing-stats">
      <Stat label="Total biaya keberangkatan" value={money(r.total)} detail={`${plan.payingCount} berbayar + ${plan.focCount} gratis`} />
      <Stat label="HPP / jamaah berbayar" value={money(r.hpp)} detail="Total biaya ÷ jumlah jamaah berbayar" />
      <Stat label="Harga jual / jamaah" value={money(r.selling)} detail={`Setelah diskon: ${money(r.netSelling)}`} />
      <Stat label="Estimasi revenue" value={money(r.revenue)} detail="Harga setelah diskon × jamaah berbayar" />
      <Stat label="Estimasi laba kotor" value={<span className={r.profit < BigInt(0) ? "red-text" : "green-text"}>{money(r.profit)}</span>} detail="Revenue − total biaya; bukan laba bersih" />
      <Stat label="Margin laba kotor" value={percent(r.margin)} detail={`Markup sebelum diskon: ${percent(r.markup)}`} />
    </div>
    <p className="admin-notice">Margin = laba kotor ÷ revenue. Markup = (harga jual sebelum diskon − HPP) ÷ HPP. Pembagi nol ditampilkan sebagai tidak terdefinisi. BEP: <b>{r.breakEven === null ? "tidak tercapai dengan asumsi biaya ini" : `${r.breakEven} jamaah berbayar`}</b>. BEP berlaku hanya jika harga, kurs, peserta gratis, jumlah kamar/bus, dan biaya tetap tidak berubah; pastikan kapasitas cukup.</p>
  </div>;
}

function CostItemForm({ item, onClose, onSave }: { item: CostItem; onClose: () => void; onSave: (item: CostItem) => void }) {
  const [value, setValue] = useState(item);
  const [error, setError] = useState("");
  const patch = (update: Partial<CostItem>) => setValue(v => ({ ...v, ...update }));
  return <Modal title={item.name ? "Edit komponen biaya" : "Tambah komponen biaya"} onClose={onClose} wide>
    <form className="admin-form" onSubmit={e => { e.preventDefault(); try { itemBase(value); onSave(value); } catch (error) { setError(error instanceof Error ? error.message : "Periksa komponen biaya."); } }}>
      <div className="form-grid">
        <label>Nama biaya<input required value={value.name} onChange={e => patch({ name: e.target.value })} /></label>
        <label>Kategori<input list="cost-categories" required value={value.category} onChange={e => patch({ category: e.target.value })} /><datalist id="cost-categories">{costCategories.map(c => <option key={c} value={c} />)}</datalist></label>
        <label>Tipe biaya<select value={value.type} onChange={e => patch({ type: e.target.value as CostItem["type"] })}>{Object.entries(typeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label>Dikenakan kepada<select disabled={value.type !== "person"} value={value.audience} onChange={e => patch({ audience: e.target.value as CostItem["audience"] })}>{Object.entries(audienceLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label>Kuantitas<input required type="number" min="0.001" step="0.001" value={value.quantity} onChange={e => patch({ quantity: e.target.value })} /></label>
        <label>Satuan<input required placeholder="tiket, kamar-malam, bus…" value={value.unit} onChange={e => patch({ unit: e.target.value })} /></label>
        <label>Harga satuan<input required type="number" min="0" step="0.01" value={value.unitPrice} onChange={e => patch({ unitPrice: e.target.value })} /></label>
        <label>Mata uang<select value={value.currency} onChange={e => patch({ currency: e.target.value as CostItem["currency"], exchangeRate: e.target.value === "IDR" ? "1" : "" })}>{["IDR", "SAR", "USD"].map(c => <option key={c}>{c}</option>)}</select></label>
        <label>Kurs IDR per 1 mata uang<input required type="number" min="0.000001" step="0.000001" readOnly={value.currency === "IDR"} value={value.exchangeRate} onChange={e => patch({ exchangeRate: e.target.value })} /></label>
      </div>
      <label>Keterangan<textarea value={value.notes} onChange={e => patch({ notes: e.target.value })} /></label>
      <p className="muted">Kategori dapat diketik bebas. Untuk per jamaah, kuantitas adalah kebutuhan setiap peserta sasaran, bukan jumlah peserta.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions"><button type="button" className="admin-button" onClick={onClose}>Batal</button><button className="admin-button primary">Terapkan komponen</button></div>
    </form>
  </Modal>;
}

function Simulation({ costingId, source, capacity }: { costingId: string; source: CostPlan; capacity: number }) {
  const { state, transact } = useDemo();
  const [plan, setPlan] = useState<CostPlan>(() => structuredClone(source));
  const [name, setName] = useState("Skenario alternatif");
  const { result, error } = calculate(plan);
  const saved = state.costScenarios.filter(s => s.costingId === costingId);
  const rows = result ? [20, 25, 30, 35, 40].map(n => ({ id: String(n), n, result: calculateCosting({ ...plan, payingCount: n }) })) : [];
  return <>
    <p className="admin-notice">Simulasi terpisah dari draft costing dan data jamaah aktual. Biaya unit, kurs, serta peserta gratis tetap mengikuti salinan saat simulasi dibuka. Tinjau jumlah kamar/bus bila rombongan berubah. Skenario tersimpan hanya selama sesi demo.</p>
    <Panel title="Uji jumlah jamaah dan harga" className="section-gap">
      <div className="costing-inputs">
        <label>Jamaah berbayar simulasi<input aria-label="Jamaah berbayar simulasi" type="number" min={1} max={10000} value={Number.isNaN(plan.payingCount) ? "" : plan.payingCount} onChange={e => setPlan({ ...plan, payingCount: e.target.value === "" ? NaN : Number(e.target.value) })} /></label>
        <label>Harga jual simulasi (IDR)<input aria-label="Harga jual simulasi (IDR)" type="number" min="0.01" step="0.01" value={plan.sellingPrice} onChange={e => setPlan({ ...plan, sellingPrice: e.target.value })} /></label>
        <label>Diskon simulasi / jamaah (IDR)<input aria-label="Diskon simulasi / jamaah (IDR)" type="number" min="0" step="0.01" value={plan.discountPerPerson} onChange={e => setPlan({ ...plan, discountPerPerson: e.target.value })} /></label>
        <label>Nama skenario<input aria-label="Nama skenario" value={name} onChange={e => setName(e.target.value)} /></label>
      </div>
      <div className="panel-body admin-actions"><button className="admin-button primary" disabled={!result || !name.trim()} onClick={() => transact(s => saveCostScenario(s, costingId, name, plan), `Skenario HPP ${name} disimpan sebagai draft`, "HPP")}>Simpan skenario draft</button><span className="muted">FOC: {plan.focCount} · Kapasitas keberangkatan: {capacity}</span></div>
    </Panel>
    {error && <p role="alert" className="form-error section-gap">{error}</p>}
    {result && <><CostSummary plan={plan} /><div className="section-gap"><DataTable title="simulasi HPP" rows={rows} pageSize={5} columns={[
      { label: "Jamaah berbayar", value: r => r.n, render: r => <>{r.n}{r.n + plan.focCount > capacity && <small className="red-text">Melebihi kapasitas + FOC</small>}</> },
      { label: "Total biaya", value: r => money(r.result.total) }, { label: "HPP / jamaah", value: r => money(r.result.hpp) },
      { label: "Harga jual", value: r => money(r.result.selling) }, { label: "Revenue", value: r => money(r.result.revenue) },
      { label: "Laba kotor", value: r => money(r.result.profit), render: r => <span className={r.result.profit < BigInt(0) ? "red-text" : "green-text"}>{money(r.result.profit)}</span> },
      { label: "Margin", value: r => percent(r.result.margin) }, { label: "BEP berbayar", value: r => r.result.breakEven?.toString() ?? "Tidak tercapai" },
    ]} /></div></>}
    <Panel title="Skenario draft tersimpan" className="section-gap"><div className="panel-body stack">{saved.length ? saved.map(s => <div className="flex-between" key={s.id}><div><b>{s.name}</b><p className="muted">{s.payingCount} berbayar · {s.focCount} FOC · margin {percent(calculateCosting(s).margin)}</p></div><button className="admin-button" onClick={() => { setPlan(structuredClone(s)); setName(s.name); }}>Muat skenario</button></div>) : <p className="muted">Belum ada skenario tersimpan untuk revisi ini.</p>}</div></Panel>
  </>;
}
