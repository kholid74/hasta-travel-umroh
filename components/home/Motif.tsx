import type { Foto } from "@/content/photos";

/**
 * Motif 3 of 3 (PUBLIC-02A-R): a thin gold rule with a small eight-point star in the middle.
 * Purely decorative; use it once per section at most, never between lines of body text.
 */
export function Ornamen({ className = "", align = "start" }: { className?: string; align?: "start" | "center" }) {
  return (
    <div aria-hidden className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""} ${className}`}>
      <span className="h-px w-10 bg-current opacity-60" />
      <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M8 1.5l1.9 4.6L14.5 8l-4.6 1.9L8 14.5l-1.9-4.6L1.5 8l4.6-1.9z" />
        <rect x="4.2" y="4.2" width="7.6" height="7.6" />
      </svg>
      <span className="h-px w-10 bg-current opacity-60" />
    </div>
  );
}

/** One attribution, e.g. "Ka'bah: Adli Wahid, CC BY-SA 4.0". Every photo on the page is credited. */
export function Kredit({ label, foto }: { label?: string; foto: Foto }) {
  return (
    <span>
      {label ? `${label}: ` : ""}
      <a href={foto.sumberUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
        {foto.pembuat}
      </a>
      ,{" "}
      <a href={foto.lisensiUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
        {foto.lisensi}
      </a>
    </span>
  );
}
