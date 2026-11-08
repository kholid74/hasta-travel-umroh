import { NotFoundContent } from "@/components/NotFoundContent";

/** 404 for `notFound()` inside public pages (e.g. an unknown package slug). The (public) layout supplies header/footer. */
export default function PublicNotFound() {
  return <NotFoundContent />;
}
