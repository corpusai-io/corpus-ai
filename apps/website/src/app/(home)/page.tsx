import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import LogoBar from "@/components/home/LogoBar";
import ProblemBand from "@/components/home/ProblemBand";
import AgenticShowcase from "@/components/home/AgenticShowcase";
import DatabaseSection from "@/components/home/DatabaseSection";
import FeatureBento from "@/components/home/FeatureBento";
import WorkflowTimeline from "@/components/home/WorkflowTimeline";
import IntegrationsOrbit from "@/components/home/IntegrationsOrbit";
import MetricsBanner from "@/components/home/MetricsBanner";
import UseCaseCards from "@/components/home/UseCaseCards";
import Testimonials from "@/components/home/Testimonials";
import Pricing from "@/components/home/Pricing";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#F7F7F7] overflow-hidden">
      <Navbar />
      <Hero />
      <LogoBar />
      <ProblemBand />
      <AgenticShowcase />
      <DatabaseSection />
      <FeatureBento />
      <WorkflowTimeline />
      <IntegrationsOrbit />
      <MetricsBanner />
      <UseCaseCards />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
