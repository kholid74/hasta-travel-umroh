import { menitJalan } from "@/lib/format";

/** Motif penanda meter — inti produk ini digambar, bukan dijelaskan berparagraf. */
export function PenandaMeter() {
  const titik = [
    { m: 180, x: 16 },
    { m: 450, x: 46 },
    { m: 950, x: 84 },
  ];
  return (
    <svg
      viewBox="0 0 320 120"
      role="img"
      aria-label="Tiga hotel pada jarak 180, 450, dan 950 meter dari masjid, dengan perkiraan waktu jalan kaki 4, 9, dan 19 menit."
      className="w-full"
    >
      <line x1="8" y1="80" x2="312" y2="80" stroke="var(--color-hairline)" strokeWidth="2" />
      <rect x="2" y="52" width="11" height="28" fill="var(--color-muted)" />
      <text x="2" y="100" fontSize="10" fill="var(--color-muted)">
        Masjid
      </text>
      {titik.map(({ m, x }) => {
        const px = 8 + (x / 100) * 300;
        return (
          <g key={m}>
            <line x1={px} y1="68" x2={px} y2="80" stroke="var(--color-accent)" strokeWidth="2" />
            <circle cx={px} cy="64" r="4" fill="var(--color-accent)" />
            <text
              x={px}
              y="44"
              textAnchor="middle"
              fontSize="17"
              fill="var(--color-ink)"
              fontFamily="var(--font-display)"
            >
              {m} m
            </text>
            <text x={px} y="100" textAnchor="middle" fontSize="10" fill="var(--color-muted)">
              ±{menitJalan(m)} mnt
            </text>
          </g>
        );
      })}
    </svg>
  );
}
