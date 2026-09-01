"use client";

import { AuroraShaders } from "@/components/ui/aurora-shaders";
import { SectionHeader } from "./section-header";

export function FeaturesSection() {
  return (
    <section className="landing-section overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AuroraShaders speed={0.5} intensity={0.85} vibrancy={0.9} />
      </div>

      <div className="landing-container relative z-10">
        <SectionHeader
          eyebrow="The Engine Underneath"
          title={
            <>
              The same reliability engine,{" "}
              <span className="landing-title-italic">pointed at your data.</span>
            </>
          }
          description="Softix's inference gateway already normalizes every provider, rotates keys automatically, and tracks every token at scale. The agent data layer runs on that same battle-tested infrastructure — proven reliability, now applied to your APIs instead of your models."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 items-center justify-items-center">
          {["OPENAI", "ANTHROPIC", "GROQ", "TOGETHER", "GOOGLE", "OPENROUTER"].map((name) => (
            <div
              key={name}
              className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-white/25 hover:text-white/50 transition-colors duration-500"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CardsSection() {
  const cards = [
    {
      num: "01",
      variant: "soon" as const,
      title: <>Agent<br />Data Layer</>,
      desc: "Query GitHub, Linear, Datadog, and more through SQL. Cross-source JOINs, MCP-ready, fewer tool calls.",
      icon: (
        <>
          <path d="M4 7h16M4 12h10M4 17h14" strokeLinecap="round" />
          <path d="M18 12l2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ),
    },
    {
      num: "02",
      variant: "light" as const,
      title: <>Universal<br />Gateway</>,
      desc: "One endpoint for every AI model. OpenAI-compatible API that works with Cursor, LangChain, and any SDK.",
      icon: (
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      ),
    },
    {
      num: "03",
      variant: "dark" as const,
      title: <>Key Pool<br />Mastery</>,
      desc: "Managed key pool with automatic rotation, credit tracking, and circuit breaker failover. Zero downtime.",
      icon: (
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      ),
    },
  ];

  return (
    <section className="landing-section overflow-hidden">
      <div className="landing-grid-bg" aria-hidden />
      <div className="landing-container">
        <SectionHeader
          eyebrow="Capabilities"
          title={
            <>
              Build your <span className="landing-title-italic">agent infrastructure</span>
            </>
          }
          description="Three pillars — unified agent data access, inference routing, and key pool management."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.num} className="h-full">
              {card.variant === "light" ? (
                <div className="glow-card glow-card-blue bg-white rounded-[2rem] p-8 md:p-10 min-h-[380px] h-full flex flex-col justify-between shadow-2xl group transition-all duration-500">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-full bg-[rgba(154,203,255,0.1)] flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                      <svg className="w-6 h-6 text-[#0a0a0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {card.icon}
                      </svg>
                    </div>
                    <span className="text-black font-bold text-sm border border-black/20 px-3 py-1 rounded-full">{card.num}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-4xl md:text-5xl text-black mb-4 leading-none tracking-tighter">{card.title}</h3>
                    <p className="text-black/70 text-base md:text-lg font-medium leading-snug">{card.desc}</p>
                  </div>
                </div>
              ) : (
                <div className={`glow-card glow-card-dark bg-[#111] border rounded-[2rem] p-8 md:p-10 min-h-[380px] h-full flex flex-col justify-between shadow-2xl group transition-all duration-500 relative overflow-hidden ${
                  card.variant === "soon" ? "border-[rgba(154,203,255,0.15)] hover:border-[rgba(154,203,255,0.35)]" : "border-white/10 hover:border-[rgba(154,203,255,0.25)]"
                }`}>
                  {card.variant === "soon" && (
                    <span className="absolute top-5 right-5 landing-badge-soon">Soon</span>
                  )}
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <svg className={`w-6 h-6 ${card.variant === "soon" ? "text-[#9acbff]" : "text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {card.icon}
                      </svg>
                    </div>
                    <span className="text-white/50 font-bold text-sm border border-white/10 px-3 py-1 rounded-full">{card.num}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-4xl md:text-5xl text-white mb-4 leading-none tracking-tighter">{card.title}</h3>
                    <p className="text-base md:text-lg font-light leading-snug" style={{ color: "rgba(255,255,255,0.4)" }}>{card.desc}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
