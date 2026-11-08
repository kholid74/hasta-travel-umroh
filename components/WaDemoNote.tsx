import { WA_DEMO_NOTE } from "@/lib/whatsapp";

/** Shown next to operator WhatsApp CTAs: on this showcase the destination is a demo number. */
export function WaDemoNote({ className = "" }: { className?: string }) {
  return <p className={`text-xs text-muted ${className}`}>{WA_DEMO_NOTE}</p>;
}
