import Image from "next/image";
import Link from "next/link";
import { company } from "@/content/company";
import { DesktopNav, HeaderConsultButton, MobileMenu } from "@/components/SiteNav";

export function Header() {
  return (
    <header className="border-b border-hairline bg-surface">
      <div className="mx-auto flex w-full max-w-[1200px] items-center gap-x-6 px-4 py-3 sm:px-6 lg:gap-x-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image src="/logo-mark.png" alt="" aria-hidden width={173} height={263} className="h-10 w-auto" />
          <span className="font-display text-lg text-ink">{company.name}</span>
        </Link>
        <DesktopNav />
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/admin/login"
            title="Pilih peran tanpa akun. Akses demo, bukan login sungguhan."
            className="hidden min-h-11 items-center text-sm text-muted underline underline-offset-4 hover:text-primary xl:inline-flex"
          >
            Workspace demo
          </Link>
          <HeaderConsultButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
