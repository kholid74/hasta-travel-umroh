"use client";
import { useState } from "react";
import { costTypeLabels, costAudienceLabels, type Costing } from "@/content/admin/costing";
import { productLabels } from "@/content/admin/types";
import { calculateCosting, costingMoney as money, costingPercent as percent } from "@/lib/admin/costing";
import { dateLabel } from "@/lib/admin/model";
import { useDemo } from "./Store";
import { Empty, Panel } from "./ui";

export default function CostingComparison({ versions }: { versions?: Costing[] }) {
  const { state } = useDemo();
  const candidates = versions ?? state.costings;
  const [leftId, setLeftId] = useState(candidates[0]?.id ?? "");
  const [rightId, setRightId] = useState(candidates.find(c => c.id !== candidates[0]?.id && c.productType !== candidates[0]?.productType)?.id ?? candidates[1]?.id ?? "");
  if (candidates.length < 2) return <Empty title="Belum ada dua versi untuk dibandingkan" text="Finalisasi versi saat ini, lalu buat dan simpan revisi baru. Versi sebelumnya tetap tersimpan." />;
  const left = candidates.find(c => c.id === leftId) ?? candidates[0], right = candidates.find(c => c.id === rightId) ?? candidates[1];
  let a: ReturnType<typeof calculateCosting>, b: ReturnType<typeof calculateCosting>;
  try { a = calculateCosting(left); b = calculateCosting(right); }
  catch { return <Panel title="Perbandingan versi"><VersionSelect side="A" value={left.id} versions={candidates} onChange={setLeftId} /><VersionSelect side="B" value={right.id} versions={candidates} onChange={setRightId} /><p className="form-error panel-body" role="alert">Salah satu draft belum lengkap. Lengkapi HPP atau pilih versi lain.</p></Panel>; }
  const rows = [
    ["Produk", productLabels[left.productType], productLabels[right.productType], "—"],
    ["Paket / tahun snapshot", `${left.packageName} · ${left.departureYear}`, `${right.packageName} · ${right.departureYear}`, "—"],
    ["Tanggal rencana snapshot", left.departureDate ? dateLabel(left.departureDate) : "Belum ditetapkan", right.departureDate ? dateLabel(right.departureDate) : "Belum ditetapkan", "—"],
    ["Tanggal asumsi kurs", dateLabel(left.assumptionDate), dateLabel(right.assumptionDate), "—"],
    ["Jamaah berbayar / FOC", `${left.payingCount} / ${left.focCount}`, `${right.payingCount} / ${right.focCount}`, "—"],
    ["Biaya variabel / berbayar", money(a.variable), money(b.variable), money(b.variable - a.variable)],
    ["Biaya tetap termasuk FOC", money(a.fixed), money(b.fixed), money(b.fixed - a.fixed)],
    ["Total biaya", money(a.total), money(b.total), money(b.total - a.total)],
    ["HPP / jamaah", money(a.hpp), money(b.hpp), money(b.hpp - a.hpp)],
    ["Harga jual setelah diskon", money(a.netSelling), money(b.netSelling), money(b.netSelling - a.netSelling)],
    ["Estimasi revenue", money(a.revenue), money(b.revenue), money(b.revenue - a.revenue)],
    ["Estimasi margin paket", money(a.profit), money(b.profit), money(b.profit - a.profit)],
    ["Margin persentase", percent(a.margin), percent(b.margin), "—"],
  ];
  return <Panel title="Perbandingan versi HPP" subtitle="Membandingkan data yang sudah disimpan; perubahan lokal yang belum disimpan tidak disertakan.">
    <div className="costing-inputs"><VersionSelect side="A" value={left.id} versions={candidates} onChange={setLeftId} /><VersionSelect side="B" value={right.id} versions={candidates} onChange={setRightId} /></div>
    <div className="table-scroll"><table><thead><tr><th>Asumsi / hasil IDR</th><th>Versi A</th><th>Versi B</th><th>Selisih B − A</th></tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}</tbody></table></div>
    <div className="two-columns panel-body">{[left, right].map((c, index) => <div key={index}><h3>Snapshot {index === 0 ? "A" : "B"} · R{c.revision} · {c.status}</h3><p className="muted">{c.notes || "Tanpa catatan tambahan"}</p><ul className="hajj-list">{c.items.map(i => <li key={i.id}>{i.name}: {i.quantity} × {i.currency} {i.unitPrice} · kurs IDR {i.exchangeRate} · {costTypeLabels[i.type]}{i.type === "person" ? ` / ${costAudienceLabels[i.audience]}` : ""}</li>)}</ul></div>)}</div>
    <p className="admin-notice">Hasil adalah estimasi skenario, bukan laba akuntansi final. Jumlah peserta, ruang lingkup layanan, komisi dan biaya tetap dapat berbeda antara Umrah dan Haji.</p>
  </Panel>;
}
function VersionSelect({ side, value, versions, onChange }: { side: string; value: string; versions: Costing[]; onChange: (id: string) => void }) {
  return <label className="costing-version">Versi {side}<select aria-label={`Versi ${side}`} value={value} onChange={e => onChange(e.target.value)}>{versions.map(c => <option key={c.id} value={c.id}>{productLabels[c.productType]} · {c.packageName} · R{c.revision} · {c.status}</option>)}</select></label>;
}
