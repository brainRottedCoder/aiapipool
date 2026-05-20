"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { AuroraShaders } from "@/components/ui/aurora-shaders";

export function FeaturesSection() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(nx);
      mouseY.set(ny);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section className="py-32 relative overflow-hidden bg-black flex items-center min-h-[800px]">
      {/* WebGL Aurora Shaders Background */}
      <div className="absolute inset-0 z-0">
        <AuroraShaders speed={0.5} intensity={1.0} vibrancy={1.0} />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight mb-8" style={{ color: "rgba(255,255,255,0.9)" }}>
            We remove the friction from{" "}
            <span className="italic">every AI call.</span>
          </h2>
          <p className="text-xl md:text-2xl font-light leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.35)" }}>
            Infrastructure is precision. SAPI&apos;s gateway normalizes every provider, rotates keys automatically, and tracks every token so your code never breaks.
          </p>
        </div>

        {/* Provider logos */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-6 gap-8 items-center justify-items-center opacity-30 hover:opacity-60 transition-opacity duration-700">
          {["OPENAI", "ANTHROPIC", "GROQ", "TOGETHER", "GOOGLE", "OPENROUTER"].map((name) => (
            <div key={name} className="font-bold text-lg tracking-[0.2em]">{name}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CardsSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="mb-24 text-center">
          <h2 className="font-display text-5xl md:text-8xl leading-none">
            Build your <br />
            <span className="italic">AI infrastructure</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Card 1 — Light */}
          <div>
            <div className="glow-card glow-card-blue bg-white rounded-[3rem] p-10 md:p-14 aspect-[4/5] flex flex-col justify-between shadow-2xl group cursor-pointer transition-all duration-700">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-full bg-[rgba(154,203,255,0.1)] flex items-center justify-center group-hover:rotate-45 transition-transform duration-700">
                  <svg className="w-7 h-7 text-[#0a0a0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-black font-bold text-sm border border-black/20 px-4 py-1.5 rounded-full">01</span>
              </div>
              <div>
                <h3 className="font-display text-5xl md:text-6xl text-black mb-6 leading-none tracking-tighter">
                  Universal<br />Gateway
                </h3>
                <p className="text-black/70 text-lg md:text-xl font-medium leading-tight max-w-xs">
                  One endpoint for every AI model. OpenAI-compatible API that works with Cursor, LangChain, and any SDK.
                </p>
              </div>
              <div className="w-full h-px bg-black/10 mt-8" />
            </div>
          </div>

          {/* Card 2 — Dark */}
          <div className="md:mt-32">
            <div className="glow-card glow-card-dark bg-[#111] border border-white/10 rounded-[3rem] p-10 md:p-14 aspect-[4/5] flex flex-col justify-between shadow-2xl group cursor-pointer hover:border-[rgba(154,203,255,0.25)] transition-all duration-700">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-white/50 font-bold text-sm border border-white/10 px-4 py-1.5 rounded-full">02</span>
              </div>
              <div>
                <h3 className="font-display text-5xl md:text-6xl text-white mb-6 leading-none tracking-tighter">
                  Key Pool<br />Mastery
                </h3>
                <p className="text-lg md:text-xl font-light leading-tight max-w-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Managed key pool with automatic rotation, credit tracking, and circuit breaker failover. Zero downtime.
                </p>
              </div>
              <div className="w-full h-px bg-white/10 mt-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Dot grid bg */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)", backgroundSize: "80px 80px" }} />
    </section>
  );
}
