import NavbarV4 from "@/app/components/home-v4/NavbarV4";
import HeroV4 from "@/app/components/home-v4/HeroV4";
import LogoBar from "@/app/components/home-v4/LogoBar";
import ProblemBand from "@/app/components/home-v4/ProblemBand";
import AgenticShowcase from "@/app/components/home-v4/AgenticShowcase";
import DatabaseSection from "@/app/components/home-v4/DatabaseSection";
import FeatureBento from "@/app/components/home-v4/FeatureBento";
import WorkflowTimeline from "@/app/components/home-v4/WorkflowTimeline";
import IntegrationsOrbit from "@/app/components/home-v4/IntegrationsOrbit";
import MetricsBanner from "@/app/components/home-v4/MetricsBanner";
import UseCaseCards from "@/app/components/home-v4/UseCaseCards";
import TestimonialV4 from "@/app/components/home-v4/TestimonialV4";
import PricingV4 from "@/app/components/home-v4/PricingV4";
import FAQV4 from "@/app/components/home-v4/FAQV4";
import FinalCTAV4 from "@/app/components/home-v4/FinalCTAV4";
import FooterV4 from "@/app/components/home-v4/FooterV4";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#F7F7F7] overflow-hidden">
      <NavbarV4 />
      <HeroV4 />
      <LogoBar />
      <ProblemBand />
      <AgenticShowcase />
      <DatabaseSection />
      <FeatureBento />
      <WorkflowTimeline />
      <IntegrationsOrbit />
      <MetricsBanner />
      <UseCaseCards />
      <TestimonialV4 />
      <PricingV4 />
      <FAQV4 />
      <FinalCTAV4 />
      <FooterV4 />
    </main>
  );
}
