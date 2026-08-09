import { getSearchIndex } from "@/lib/queries/products";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { WhatsAppFab } from "@/components/shared/whatsapp-fab";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  // Built here so the header search reads the live catalogue rather than a
  // bundled copy of it.
  const searchIndex = await getSearchIndex();

  return (
    <div className="flex min-h-dvh flex-col">
      <AnnouncementBar />
      <Navbar searchIndex={searchIndex} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFab />
    </div>
  );
}
