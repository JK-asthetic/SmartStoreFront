import HeroSection from "@/components/sections/hero-section";
import FeaturesSection from "@/components/sections/features-section";
import CategoriesSection from "@/components/sections/categories-section";
import NewArrivalsSection from "@/components/sections/new-arrivals-section";
import TrendingSection from "@/components/sections/trending-section";
import SaleBannerSection from "@/components/sections/sale-banner-section";
import RecommendedSection from "@/components/sections/recommended-section";
import NewsletterSection from "@/components/sections/newsletter-section";

export default function Home() {
  return (
    <div className="pt-32 md:pt-36 pb-24 bg-background">
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <NewArrivalsSection />
      <TrendingSection />
      <SaleBannerSection />
      <RecommendedSection />
      <NewsletterSection />
    </div>
  );
}
