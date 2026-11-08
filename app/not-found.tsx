import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NotFoundContent } from "@/components/NotFoundContent";

export const metadata: Metadata = { title: "Halaman tidak ditemukan" };

/**
 * 404 for URLs that match no route (PUBLIC-01). It renders inside the root layout only, so it
 * brings the public header and footer itself. `notFound()` inside public pages uses
 * app/(public)/not-found.tsx instead (that layout already has them); admin keeps its own.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <NotFoundContent />
      <Footer />
    </>
  );
}
