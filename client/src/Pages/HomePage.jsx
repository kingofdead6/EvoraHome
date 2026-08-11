import Hero from "../Components/Home/Hero";
import Categories from "../Components/Home/Categories";
import BestSellers from "../Components/Home/BestSellers";
import WhyUs from "../Components/Home/WhyUs";
import PromoBanner from "../Components/Home/CTA";
import ServicesSection from "../Components/Home/Services";

export default function HomePage() {
  return (
    <main style={{ position: "relative", zIndex: 2 }}>
      <Hero />
      <Categories />
      <BestSellers />
      <ServicesSection />
      <WhyUs />
      <PromoBanner />
    </main>
  );
}
