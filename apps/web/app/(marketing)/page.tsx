"use client";

import "./landing.css";
import { HeroSection } from "./sections/hero";
import { DashboardSection } from "./sections/dashboard";
import { AgentDataSection } from "./sections/agent-data";
import { FeaturesSection, CardsSection } from "./sections/features";
import { StatsSection, CodeSection, CtaSection } from "./sections/stats-cta";

export default function LandingPage() {
  return (
    <main className="landing-root flex flex-col text-white overflow-x-hidden">
      <div className="landing-noise" />
      <HeroSection />
      <div className="landing-divider" aria-hidden />
      <DashboardSection />
      <div className="landing-divider" aria-hidden />
      <FeaturesSection />
      <div className="landing-divider" aria-hidden />
      <CardsSection />
      <div className="landing-divider" aria-hidden />
      <CodeSection />
      <div className="landing-divider" aria-hidden />
      <AgentDataSection />
      <div className="landing-divider" aria-hidden />
      <StatsSection />
      <div className="landing-divider" aria-hidden />
      <CtaSection />
    </main>
  );
}
