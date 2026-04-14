import Navbar from "@/components/Navigation";
import Footer from "@/components/shared/Footer";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col items-center">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}