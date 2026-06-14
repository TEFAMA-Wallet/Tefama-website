import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pub">
      <PublicHeader />
      <main className="pub-main">{children}</main>
      <Footer />
    </div>
  );
}
