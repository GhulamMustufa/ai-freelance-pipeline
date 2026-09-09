import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import TrustStrip from "@/components/landing/TrustStrip";
import ProblemSection from "@/components/landing/ProblemSection";
import DecisionFlowSection from "@/components/landing/DecisionFlowSection";
import DecisionBadges from "@/components/landing/DecisionBadges";
import FourPillarsSection from "@/components/landing/FourPillarsSection";
import UnknownSection from "@/components/landing/UnknownSection";
import DeterministicSection from "@/components/landing/DeterministicSection";
import ProposalSection from "@/components/landing/ProposalSection";
import ComparisonTable from "@/components/landing/ComparisonTable";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import WhoIsItForSection from "@/components/landing/WhoIsItForSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navigation */}
      <LandingNav />

      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Trust Strip */}
      <TrustStrip />

      {/* 3. Problem */}
      <ProblemSection />

      {/* 4. Core Differentiator — Decision vs Proposal */}
      <DecisionFlowSection />

      {/* 5. APPLY / MAYBE / SKIP */}
      <DecisionBadges />

      {/* 6. Four-Pillar Analysis */}
      <FourPillarsSection />

      {/* 7. UNKNOWN ≠ BAD */}
      <UnknownSection />

      {/* 8. Deterministic Protection */}
      <DeterministicSection />

      {/* 9. Grounded Proposals */}
      <ProposalSection />

      {/* 10. Why OmniBid — Comparison */}
      <ComparisonTable />

      {/* 11. Product Walkthrough */}
      <HowItWorksSection />

      {/* 12. Who It Is For */}
      <WhoIsItForSection />

      {/* 13. FAQ */}
      <FAQSection />

      {/* 14. Final CTA */}
      <FinalCTASection />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
