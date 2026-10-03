"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowDownUp, ChevronLeft, ChevronRight, Download, Search, X, Inbox } from "lucide-react";
import { exportExcel } from "@/lib/admin/export";

export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <header className="admin-page-header"><div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="admin-actions">{actions}</div>}</header>;
}
export function Badge({ children }: { children: ReactNode }) {
  const text = String(children);
  const tone = /Lunas|Terverifikasi|Disetujui|Terbit|Siap|Dibayar|Selesai|Aktif|Won/.test(text) ? "green" : /Ditolak|Batal|Lost|Jatuh tempo|Belum ada/.test(text) ? "red" : /Menunggu|DP|Cicilan|Follow|Diproses|Persiapan|Diunggah|Hampir/.test(text) ? "amber" : "neutral";
  return <span className={`admin-badge ${tone}`}><span className="badge-dot" />{children}</span>;
}
export function Stat({ label, value, detail, icon }: { label: string; value: ReactNode; detail: ReactNode; icon?: ReactNode }) {
  return <div className="admin-stat"><div className="flex-between"><span>{label}</span>{icon}</div><strong>{value}</strong><small>{detail}</small></div>;
}
export function Panel({ title, subtitle, action, children, className = "" }: { title?: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`admin-panel ${className}`}>{title && <div className="panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>}{children}</section>;
}
export function Progress({ value, label }: { value: number; label?: string }) {
  return <div className="progress-wrap">{label && <div className="flex-between"><span>{label}</span><b>{value}%</b></div>}<div className="admin-progress" role="progressbar" aria-label={label || "Progres"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div></div>;
}
export function Tabs({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  return <div className="admin-tabs" aria-label="Pilihan tampilan">{items.map(i => <button key={i} aria-pressed={value === i} onClick={() => onChange(i)}>{i}</button>)}</div>;
}
export function Avatar({ name }: { name: string }) { return <span className="admin-avatar" aria-hidden>{name.split(" ").slice(0, 2).map(n => n[0]).join("")}</span>; }
export function Person({ name, sub, href }: { name: string; sub?: string; href?: string }) {
  const content = <><Avatar name={name} /><span><b>{name}</b>{sub && <small>{sub}</small>}</span></>;
  return href ? <Link className="admin-person" href={href}>{content}</Link> : <div className="admin-person">{content}</div>;
}
export function Empty({ title = "Tidak ada data yang cocok", text = "Coba kata pencarian lain atau ubah filter Anda." }: { title?: string; text?: string }) { return <div className="admin-empty"><Inbox size={32} /><h3>{title}</h3><p>{text}</p></div>; }
export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => { const d = ref.current!; d.showModal(); return () => d.close(); }, []);
  return <dialog ref={ref} className={`admin-modal ${wide ? "wide" : ""}`} aria-labelledby={id} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-heading"><h2 id={id}>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Tutup dialog"><X size={20} /></button></div><div className="modal-body">{children}</div></dialog>;
}
export function Confirm({ title, text, onConfirm, onClose }: { title: string; text: string; onConfirm: () => void; onClose: () => void }) { return <Modal title={title} onClose={onClose}><p>{text}</p><div className="modal-actions"><button className="admin-button" onClick={onClose}>Batal</button><button className="admin-button danger" onClick={() => { onConfirm(); onClose(); }}>Ya, lanjutkan</button></div></Modal>; }
export type Column<T> = { label: string; value: (row: T) => string | number; render?: (row: T) => ReactNode };
export function DataTable<T extends { id: string }>({ rows, columns, title = "data", filters, selection, onSelection, actions, pageSize = 8 }: { rows: T[]; columns: Column<T>[]; title?: string; filters?: ReactNode; selection?: string[]; onSelection?: (ids: string[]) => void; actions?: ReactNode | ((rows: T[]) => ReactNode); pageSize?: number }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ index: number; asc: boolean } | null>(null);
  const matching = rows.filter(r => columns.some(c => String(c.value(r)).toLocaleLowerCase("id").includes(query.toLocaleLowerCase("id"))));
  if (sort) matching.sort((a, b) => { const av = columns[sort.index].value(a), bv = columns[sort.index].value(b); return (typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "id")) * (sort.asc ? 1 : -1); });
  const pages = Math.max(1, Math.ceil(matching.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = matching.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selected = selection ?? [];
  return <div className="admin-table-card"><div className="table-toolbar"><label className="table-search"><Search size={17} /><input aria-label={`Cari ${title}`} placeholder={`Cari ${title}…`} value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} /></label>{filters}<div className="toolbar-spacer" />{typeof actions === "function" ? actions(matching.filter(r => !selected.length || selected.includes(r.id))) : actions}<button className="admin-button" onClick={() => exportExcel(title, columns.map(c => c.label), matching.filter(r => !selected.length || selected.includes(r.id)).map(r => columns.map(c => c.value(r))))}><Download size={15} />Ekspor Excel</button></div>
    {selected.length > 0 && <div className="selection-bar">{selected.length} dipilih <button className="text-button" onClick={() => onSelection?.([])}>Batalkan pilihan</button></div>}
    <div className="table-scroll"><table><thead><tr>{onSelection && <th><input aria-label="Pilih semua di halaman" type="checkbox" checked={visible.length > 0 && visible.every(r => selected.includes(r.id))} onChange={e => onSelection(e.target.checked ? [...new Set([...selected, ...visible.map(r => r.id)])] : selected.filter(id => !visible.some(r => r.id === id)))} /></th>}{columns.map((c, i) => <th key={c.label} aria-sort={sort?.index === i ? sort.asc ? "ascending" : "descending" : "none"}><button onClick={() => setSort({ index: i, asc: sort?.index === i ? !sort.asc : true })}>{c.label}<ArrowDownUp size={12} /></button></th>)}</tr></thead><tbody>{visible.map(row => <tr key={row.id}>{onSelection && <td><input aria-label={`Pilih ${row.id}`} type="checkbox" checked={selected.includes(row.id)} onChange={e => onSelection(e.target.checked ? [...selected, row.id] : selected.filter(id => id !== row.id))} /></td>}{columns.map(c => <td key={c.label}>{c.render ? c.render(row) : c.value(row)}</td>)}</tr>)}</tbody></table></div>
    {matching.length === 0 && <Empty />}<div className="table-footer"><span>{matching.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, matching.length)} dari {matching.length} data</span><div><button aria-label="Halaman sebelumnya" className="icon-button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={17} /></button><span>{currentPage} / {pages}</span><button aria-label="Halaman berikutnya" className="icon-button" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={17} /></button></div></div>
  </div>;
}
export function SelectFilter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) { return <select aria-label={label} value={value} onChange={e => onChange(e.target.value)}><option value="">{label}</option>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>; }
export function Fields({ data }: { data: Record<string, ReactNode> }) { return <dl className="admin-fields">{Object.entries(data).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v || "Belum diisi"}</dd></div>)}</dl>; }
