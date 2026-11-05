"use client";
import { useEffect, useState } from "react";
import { useDemo } from "./Store";
import { Modal } from "./ui";
import { documentTitles, financialDocument, renderFinancialPDF, type DocumentKind } from "@/lib/admin/financial-documents";

export default function FinancialDocuments({ bookingId, paymentId }: { bookingId: string; paymentId?: string }) {
  const { state } = useDemo();
  const [kind, setKind] = useState<DocumentKind | null>(null);
  const choices: DocumentKind[] = paymentId ? ["receipt"] : ["invoice", "statement"];
  let unavailable = "";
  try { financialDocument(state, bookingId, paymentId ? "receipt" : "invoice", paymentId); }
  catch (e) { unavailable = e instanceof Error ? e.message : "Dokumen belum tersedia."; }
  return <><div className="admin-actions">{choices.map(k => <button key={k} className="admin-button" disabled={!!unavailable} title={unavailable || undefined} onClick={() => setKind(k)}>Pratinjau {documentTitles[k]}</button>)}</div>{unavailable && <small className="muted">{unavailable}</small>}{kind && <PDFPreview key={`${kind}:${JSON.stringify(state)}`} kind={kind} bookingId={bookingId} paymentId={paymentId} onClose={() => setKind(null)} />}</>;
}
function PDFPreview({ kind, bookingId, paymentId, onClose }: { kind: DocumentKind; bookingId: string; paymentId?: string; onClose: () => void }) {
  const { state } = useDemo();
  const [result, setResult] = useState({ url: "", filename: "", error: "" });
  useEffect(() => {
    let active = true, url = "";
    (async () => {
      try {
        const model = financialDocument(state, bookingId, kind, paymentId);
        const bytes = await renderFinancialPDF(model);
        url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }));
        if (active) setResult({ url, filename: `${model.id}.pdf`, error: "" });
        else URL.revokeObjectURL(url);
      } catch (e) { if (active) setResult({ url: "", filename: "", error: `PDF tidak tersedia: ${e instanceof Error ? e.message : "Coba lagi."}` }); }
    })();
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [state, bookingId, paymentId, kind]);
  return <Modal title={`Pratinjau ${documentTitles[kind]}`} onClose={onClose} wide>{result.error ? <p role="alert" className="form-error">{result.error}</p> : result.url ? <><p className="admin-notice">Pratinjau menampilkan PDF yang sama dengan unduhan. Pada perangkat tanpa penampil PDF, gunakan unduhan.</p><a className="admin-button primary section-gap" href={result.url} download={result.filename}>Unduh {documentTitles[kind]} PDF</a><iframe title={`PDF ${documentTitles[kind]}`} src={result.url} style={{ width: "100%", height: "60vh", border: 0 }} /></> : <p role="status">Menyiapkan PDF…</p>}</Modal>;
}
