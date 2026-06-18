import HeroSection from "@/components/HeroSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import CategoryShowcase from "@/components/CategoryShowcase";
import BundleBanner from "@/components/BundleBanner";
import Testimonials from "@/components/Testimonials";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedProducts />
      <CategoryShowcase />
      <BundleBanner />
      <Testimonials />
    </main>
  );
}
