import Image from "next/image";

/**
 * Hanya dua maskapai yang logonya tersedia dengan lisensi bebas di Wikimedia
 * Commons. Sisanya ditulis sebagai teks — menyalin logo berhak cipta dari situs
 * maskapai bukan pilihan. Logo di sini menandai rute, bukan kemitraan.
 */
const LOGO: Record<string, { src: string; width: number; height: number }> = {
  Emirates: { src: "/maskapai/emirates.svg", width: 120, height: 28 },
  "Turkish Airlines": { src: "/maskapai/turkish-airlines.svg", width: 120, height: 28 },
};

export function AirlineLogo({ airline }: { airline: string }) {
  const logo = LOGO[airline];
  if (!logo) return <span className="font-medium">{airline}</span>;
  return (
    <span className="flex items-center gap-2">
      <Image
        src={logo.src}
        width={logo.width}
        height={logo.height}
        alt=""
        aria-hidden
        className="h-5 w-auto opacity-70 grayscale"
      />
      <span className="font-medium">{airline}</span>
    </span>
  );
}
