"use client";
import { useEffect, useState } from "react";
import { renderFinancialPDF } from "@/lib/admin/financial-pdf";
import { handoverDocument } from "@/lib/admin/inventory";
import { useDemo } from "./Store";
import { Modal } from "./ui";

export default function HandoverReceipt({ id }: { id: string }) {
  const { state, resetVersion } = useDemo();
  const [open, setOpen] = useState(false);
  return <><button className="admin-button" onClick={() => setOpen(true)}>Bukti PDF</button>{open && <Preview key={`${id}:${resetVersion}`} id={id} onClose={() => setOpen(false)} />}{!state.handovers.some(h => h.id === id) && <small>Data telah direset.</small>}</>;
}
function Preview({ id, onClose }: { id: string; onClose: () => void }) {
  const { state } = useDemo();
  const [result, setResult] = useState({ url: "", name: "", error: "" });
  useEffect(() => {
    let active = true, url = "";
    (async () => {
      try {
        const model = handoverDocument(state, id), bytes = await renderFinancialPDF(model);
        url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }));
        if (active) setResult({ url, name: `${model.id}.pdf`, error: "" }); else URL.revokeObjectURL(url);
      } catch (e) { if (active) setResult({ url: "", name: "", error: e instanceof Error ? e.message : "PDF tidak dapat dibuat." }); }
    })();
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [state, id]);
  return <Modal title="Bukti serah terima perlengkapan" onClose={onClose} wide>{result.error ? <p role="alert" className="form-error">{result.error}</p> : result.url ? <><p className="admin-notice">DEMO · Barang sesuai catatan penyerahan yang diposting. Pada perangkat tanpa penampil PDF, gunakan unduhan.</p><a className="admin-button primary section-gap" href={result.url} download={result.name}>Unduh bukti serah terima PDF</a><iframe title="PDF serah terima" src={result.url} style={{ width: "100%", height: "60vh", border: 0 }} /></> : <p role="status">Menyiapkan bukti PDF…</p>}</Modal>;
}
