"use client";

import "./landing.css";
import { HeroSection } from "./sections/hero";
import { DashboardSection } from "./sections/dashboard";
import { FeaturesSection, CardsSection } from "./sections/features";
import { StatsSection, CodeSection, CtaSection } from "./sections/stats-cta";

export default function LandingPage() {
  return (
    <main className="landing-root flex flex-col bg-[#0a0a0b] text-white overflow-x-hidden">
      <div className="landing-noise" />
      <HeroSection />
      <DashboardSection />
      <CodeSection />
      <FeaturesSection />
      <CardsSection />
      <StatsSection />
      <CtaSection />
    </main>
  );
}
