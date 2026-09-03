import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { company } from "@/content/company";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${company.name} — ${company.tagline}`,
    template: `%s · ${company.name}`,
  },
  description:
    "Katalog paket Umroh & Haji Khusus dengan jarak hotel ke masjid yang ditampilkan dalam meter, bukan klaim samar. Situs demo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${instrument.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
