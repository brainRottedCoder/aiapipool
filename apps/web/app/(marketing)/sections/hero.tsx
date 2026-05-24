"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const TYPING_PHRASES = [
  "Route to GPT-4o via OpenAI...",
  "Switch to Claude 3.5 Sonnet...",
  "Failover to Llama 3.1 on Groq...",
  "Stream tokens in real-time...",
  "Track credits per request...",
];

export function HeroSection() {
  const [typed, setTyped] = useState("");
  const phraseIdx = useRef(0);
  const charIdx = useRef(0);
  const deleting = useRef(false);

  useEffect(() => {
    const tick = () => {
      const phrase = TYPING_PHRASES[phraseIdx.current];
      if (!deleting.current) {
        charIdx.current++;
        setTyped(phrase.slice(0, charIdx.current));
        if (charIdx.current >= phrase.length) {
          deleting.current = true;
          return setTimeout(tick, 2000);
        }
      } else {
        charIdx.current--;
        setTyped(phrase.slice(0, charIdx.current));
        if (charIdx.current <= 0) {
          deleting.current = false;
          phraseIdx.current = (phraseIdx.current + 1) % TYPING_PHRASES.length;
        }
      }
      setTimeout(tick, deleting.current ? 30 : 70);
    };
    const t = setTimeout(tick, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-x-clip pt-36 md:pt-44 pb-28 md:pb-36">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="ambient-particles absolute inset-0" />
        <div className="volumetric-glow glow-center" />
        <div className="volumetric-glow glow-left" />
        <div className="volumetric-glow glow-right" />
        <div className="vignette-overlay" />
      </div>
      <div className="hero-glow" />
      <div className="hero-fade" />

      {/* Floating hands */}
      <img src="/left-hand.png" alt="Left AI Hand" className="hero-hand-left hidden md:block" />
      <img src="/right-hand.png" alt="Right AI Hand" className="hero-hand-right hidden md:block" />

      {/* Floating orbs */}
      <div className="hero-orbs">
        <div className="orb-1 absolute -left-[8%] top-[10%] w-[45vw] max-w-[600px] aspect-square rounded-full pointer-events-none z-10 opacity-40"
          style={{ background: "radial-gradient(circle, rgba(154,203,255,0.15), transparent 70%)", filter: "blur(60px)" }} />
        <div className="orb-2 absolute -right-[8%] bottom-[5%] w-[40vw] max-w-[500px] aspect-square rounded-full pointer-events-none z-10 opacity-30"
          style={{ background: "radial-gradient(circle, rgba(107,159,212,0.12), transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-20 text-center flex flex-col items-center">
        {/* Launching Soon badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(154,203,255,0.2)] text-[11px] tracking-[4px] uppercase mb-8"
          style={{ color: "rgba(154,203,255,0.75)", background: "rgba(154,203,255,0.06)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#9acbff]" style={{ animation: "sapi-pulse 2s ease-in-out infinite" }} />
          Launching Soon
        </div>

        {/* Headline */}
        <h1 className="font-display text-6xl md:text-8xl lg:text-[7rem] font-medium leading-[1] tracking-tight mb-8 text-white">
          SOFTIX. <br />
          <span className="italic font-light" style={{ color: "rgba(255,255,255,0.4)" }}>
            One API for all AI.
          </span>
        </h1>

        <p className="text-base md:text-lg max-w-lg mx-auto mb-10 font-light tracking-wide leading-relaxed"
          style={{ color: "rgba(255,255,255,0.35)" }}>
          Universal OpenAI-compatible gateway. Every model, every provider — plus a unified SQL layer
          for agent data access. Zero overhead.
        </p>

        {/* Chat/Terminal input */}
        <div className="w-full max-w-[580px] rounded-[20px] border border-[rgba(154,203,255,0.12)] bg-[rgba(154,203,255,0.03)] backdrop-blur-2xl px-5 py-1.5 flex items-center gap-3 transition-all hover:border-[rgba(154,203,255,0.25)] mb-4">
          <span className="text-[15px] flex-1 text-left py-3.5" style={{ color: "rgba(154,203,255,0.4)", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px" }}>
            {typed}<span className="cursor-blink" />
          </span>
          <Link href="/register"
            className="w-10 h-10 rounded-xl bg-[#9acbff] text-[#0a0a0b] flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {/* Social proof */}
        <p className="text-xs tracking-[3px] uppercase mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
          OpenAI compatible · Agent SQL layer · Pay as you go
        </p>
      </div>
    </section>
  );
}
