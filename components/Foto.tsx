import Image from "next/image";
import type { Foto as TipeFoto } from "@/content/photos";

export function Foto({
  foto,
  className = "",
  priority = false,
}: {
  foto: TipeFoto;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure>
      <Image
        src={foto.src}
        width={foto.width}
        height={foto.height}
        alt={foto.alt}
        priority={priority}
        sizes="(max-width: 768px) 100vw, 1200px"
        className={`rounded-card border border-hairline object-cover ${className}`}
      />
      <figcaption className="mt-2 text-xs text-muted">
        Foto:{" "}
        <a
          href={foto.sumberUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {foto.judul}
        </a>{" "}
        oleh {foto.pembuat},{" "}
        <a
          href={foto.lisensiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {foto.lisensi}
        </a>{" "}
        via Wikimedia Commons.
      </figcaption>
    </figure>
  );
}
