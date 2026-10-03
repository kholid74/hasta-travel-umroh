type Cell = string | number;
function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
// All fields are explicitly strings unless numeric: spreadsheet formulas cannot execute.
export function exportExcel(filename: string, headers: string[], rows: Cell[][]) {
  const escape = (v: Cell) => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const xml = [headers, ...rows].map(row => `<Row>${row.map(v => `<Cell><Data ss:Type="${typeof v === "number" ? "Number" : "String"}">${escape(v)}</Data></Cell>`).join("")}</Row>`).join("");
  download(`<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Hasta Travel"><Table>${xml}</Table></Worksheet></Workbook>`, `${filename}.xml`, "application/vnd.ms-excel");
}
export function downloadText(filename: string, content: string) { download(content, filename, "text/plain;charset=utf-8"); }

export function printTable(title: string, headers: string[], rows: Cell[][], notes: string[] = []) {
  const popup = window.open("", "_blank", "width=1000,height=750");
  if (!popup) return false;
  popup.opener = null;
  const doc = popup.document;
  doc.title = title;
  const style = doc.createElement("style");
  style.textContent = "body{font:12px Arial;color:#263c2b;padding:30px}h1{font-size:22px}table{border-collapse:collapse;width:100%;margin-top:24px}th,td{border-bottom:1px solid #ddd;padding:10px;text-align:left}th{background:#edf2e8}p{color:#64705e}@page{size:landscape;margin:15mm}";
  doc.head.append(style);
  const h = doc.createElement("h1"); h.textContent = `Hasta Travel — ${title}`; doc.body.append(h);
  for (const note of ["Data simulasi · Hasta Travel Workspace", ...notes]) { const p = doc.createElement("p"); p.textContent = note; doc.body.append(p); }
  const table = doc.createElement("table");
  [headers, ...rows].forEach((row, index) => { const tr = doc.createElement("tr"); row.forEach(value => { const cell = doc.createElement(index ? "td" : "th"); cell.textContent = String(value); tr.append(cell); }); table.append(tr); });
  doc.body.append(table);
  popup.focus(); popup.print();
  return true;
}
