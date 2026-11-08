import type { Metadata } from "next";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Commitments } from "@/components/home/Commitments";
import { FaqPreview } from "@/components/home/FaqPreview";
import { FeaturedDepartures } from "@/components/home/FeaturedDepartures";
import { HajiIntro } from "@/components/home/HajiIntro";
import { HomeHero } from "@/components/home/HomeHero";
import { HotelDistances } from "@/components/home/HotelDistances";
import { JourneySteps } from "@/components/home/JourneySteps";
import { QuickFinder } from "@/components/home/QuickFinder";
import { TrustStrip } from "@/components/home/TrustStrip";
import { packages } from "@/content/packages";
import { businessToday } from "@/lib/departures";
import { toRow } from "@/lib/katalog";

export const metadata: Metadata = {
  description:
    "Katalog paket Umrah & Haji Khusus yang menuliskan jarak hotel ke masjid dalam meter, lengkap dengan tipe akses dan waktu jalan kaki jamaah lansia. Situs demo.",
};

// Halaman statis yang dibangun ulang paling lama tiap jam (ISR); tanggal juga dicek ulang di browser.
export const revalidate = 3600;

const UNGGULAN = ["umroh-ramah-lansia-12-hari", "umroh-hemat-9-hari", "umroh-premium-12-hari"];

/**
 * Homepage, "Sacred Journey — Warm Islamic Editorial" (PUBLIC-02A-R).
 * Rhythm: forest hero → sand strip → ivory (finder, packages) → sand (Haji Khusus) →
 * ivory (services, journey) → sand (hotels) → ivory (FAQ) → forest closing call and footer.
 */
export default function HomePage() {
  // Tanggal bisnis Jakarta — keberangkatan hari ini atau sebelumnya tidak ditawarkan.
  const hariIni = businessToday();
  const rows = packages.map((paket) => toRow(paket, hariIni));
  const unggulan = UNGGULAN.map((slug) => rows.find((r) => r.slug === slug)).filter((r) => r !== undefined);
  const jumlahPaket = rows.filter((r) => r.departures.length > 0).length;

  return (
    <main>
      <HomeHero />
      <TrustStrip />

      <div className="band-light pb-16 sm:pb-28">
        <QuickFinder rows={rows} serverToday={hariIni} />
        <FeaturedDepartures unggulan={unggulan} semua={rows} serverToday={hariIni} jumlahPaket={jumlahPaket} />
      </div>

      <HajiIntro />

      <div className="band-light pb-16 sm:pb-28">
        <Commitments />
        <JourneySteps />
      </div>

      <div className="band-sand border-y border-hairline pb-16 sm:pb-28">
        <HotelDistances rows={rows} />
      </div>

      <div className="band-light">
        <FaqPreview />
      </div>

      <ClosingCta />
    </main>
  );
}
