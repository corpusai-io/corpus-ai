import dynamic from "next/dynamic";
import NavbarV4 from "@/app/components/home-v4/NavbarV4";
import HeroV4 from "@/app/components/home-v4/HeroV4";
import LogoBar from "@/app/components/home-v4/LogoBar";

// ─── Lazy-load below-fold sections for faster initial paint ─────────────────
const SectionPlaceholder = () => <div className="h-48 w-full" />;
const ProblemBand = dynamic(() => import("@/app/components/home-v4/ProblemBand"), { loading: SectionPlaceholder });
const AgenticShowcase = dynamic(() => import("@/app/components/home-v4/AgenticShowcase"), { loading: SectionPlaceholder });
const DatabaseSection = dynamic(() => import("@/app/components/home-v4/DatabaseSection"), { loading: SectionPlaceholder });
const FeatureBento = dynamic(() => import("@/app/components/home-v4/FeatureBento"), { loading: SectionPlaceholder });
const WorkflowTimeline = dynamic(() => import("@/app/components/home-v4/WorkflowTimeline"), { loading: SectionPlaceholder });
const IntegrationsOrbit = dynamic(() => import("@/app/components/home-v4/IntegrationsOrbit"), { loading: SectionPlaceholder });
const MetricsBanner = dynamic(() => import("@/app/components/home-v4/MetricsBanner"), { loading: SectionPlaceholder });
const UseCaseCards = dynamic(() => import("@/app/components/home-v4/UseCaseCards"), { loading: SectionPlaceholder });
const TestimonialV4 = dynamic(() => import("@/app/components/home-v4/TestimonialV4"), { loading: SectionPlaceholder });
const PricingV4 = dynamic(() => import("@/app/components/home-v4/PricingV4"), { loading: SectionPlaceholder });
const FAQV4 = dynamic(() => import("@/app/components/home-v4/FAQV4"), { loading: SectionPlaceholder });
const FinalCTAV4 = dynamic(() => import("@/app/components/home-v4/FinalCTAV4"), { loading: SectionPlaceholder });
const FooterV4 = dynamic(() => import("@/app/components/home-v4/FooterV4"), { loading: SectionPlaceholder });

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
