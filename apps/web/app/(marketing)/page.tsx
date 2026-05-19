import { HeroSection } from "@/components/marketing/hero-section";
import { ArchitectureSection } from "@/components/marketing/architecture-section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { CodeExampleSection } from "@/components/marketing/code-example-section";
import { IntegrationsSection } from "@/components/marketing/integrations-section";
import { PricingTable } from "@/components/marketing/pricing-table";
import { SecuritySection } from "@/components/marketing/security-section";
import { CTASection } from "@/components/marketing/cta-section";

export default function LandingPage() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <ArchitectureSection />
      <FeatureGrid />
      <CodeExampleSection />
      <IntegrationsSection />
      <PricingTable />
      <SecuritySection />
      <CTASection />
    </main>
  );
}
