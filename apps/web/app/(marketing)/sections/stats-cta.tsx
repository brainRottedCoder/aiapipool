"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { SplineRobot } from "@/components/marketing/spline-robot";
import { SectionHeader } from "./section-header";

export function StatsSection() {
  return (
    <section className="landing-section--tight">
      <div className="landing-container">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-10 md:px-12 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {[
              { val: "12→1", label: "Tool Calls to One Query" },
              { val: "8+", label: "Connected Sources" },
              { val: "99.9%", label: "Uptime SLA" },
              { val: "<20ms", label: "Routing Overhead" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-4xl md:text-5xl font-bold mb-2 text-white">{s.val}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CodeSection() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 40, damping: 20, mass: 0.8 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20, mass: 0.8 });

  const rotateX = useTransform(springY, [-1, 1], [4, -4]);
  const rotateY = useTransform(springX, [-1, 1], [-6, 6]);
  const translateX = useTransform(springX, [-1, 1], [-16, 16]);
  const translateY = useTransform(springY, [-1, 1], [-16, 16]);

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
    <section className="landing-section overflow-hidden">
      <div className="landing-section-glow" aria-hidden />
      <div className="landing-container landing-container--wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div
            className="relative w-full h-[420px] md:h-[540px] rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden shadow-2xl order-2 lg:order-1"
            style={{ perspective: 1200 }}
          >
            <div className="absolute top-5 left-5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                <span className="text-black text-[10px] font-black">S</span>
              </div>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/80">SOFTIX</span>
            </div>

            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-[#9acbff] opacity-10 blur-[100px] rounded-full pointer-events-none z-10" />

            <motion.div
              style={{ rotateX, rotateY, x: translateX, y: translateY }}
              className="absolute inset-0 pointer-events-auto"
            >
              <div className="w-full h-full animate-robot-idle">
                <SplineRobot className="w-full h-full" />
              </div>
            </motion.div>

            <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#0a0a0b]/90 to-transparent z-10 pointer-events-none" />
          </div>

          <div className="order-1 lg:order-2">
            <SectionHeader
              align="left"
              eyebrow="Drop-in replacement"
              title={
                <>
                  The engine <span className="landing-title-stroke">underneath</span>
                  <br />
                  <span className="landing-title-stroke">it all.</span>
                </>
              }
              description="The same gateway that will power the agent data layer. Change one line of code to unlock every AI model — your existing OpenAI SDK, Cursor, LangChain, everything just works."
              className="mb-8 md:mb-10"
            />

            <div className="terminal-box shadow-[0_20px_60px_rgba(0,0,0,0.4)] mb-8">
              <div className="terminal-bar">
                <div className="terminal-dots"><span /><span /><span /></div>
                <span className="text-[10px] tracking-[3px] uppercase" style={{ color: "rgba(154,203,255,0.4)" }}>python</span>
                <span className="text-[10px]" style={{ color: "rgba(74,222,128,0.7)" }}>● ready</span>
              </div>
              <div className="terminal-body">
                <span style={{ color: "rgba(154,203,255,0.5)" }}>from</span> openai <span style={{ color: "rgba(154,203,255,0.5)" }}>import</span> OpenAI<br /><br />
                <span style={{ color: "rgba(255,255,255,0.3)" }}># Change the base URL</span><br />
                client = OpenAI(<br />
                {"  "}api_key=<span style={{ color: "rgba(74,222,128,0.8)" }}>&quot;sk_live_xxx&quot;</span>,<br />
                {"  "}base_url=<span style={{ color: "rgba(74,222,128,0.8)" }}>&quot;https://api.softix.in/v1&quot;</span><br />
                )<br />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/waitlist"
                className="inline-block px-8 py-3 rounded-full bg-[#9acbff] text-[#0a0a0b] font-bold text-sm tracking-wide hover:opacity-90 transition-opacity no-underline">
                Start Building →
              </Link>
              <Link href="/docs"
                className="inline-block px-8 py-3 rounded-full border border-white/20 text-white font-bold text-sm tracking-wide hover:bg-white/[0.05] transition-colors no-underline">
                Read Docs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="landing-section overflow-hidden pb-24 md:pb-32">
      <div className="landing-section-glow" aria-hidden />
      <div className="landing-container landing-container--narrow text-center relative z-10">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[rgba(154,203,255,0.1)] flex items-center justify-center border border-[rgba(154,203,255,0.15)]">
            <svg className="w-7 h-7 text-[#9acbff] opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <h2 className="landing-title italic mb-6">
          Stop stitching APIs.<br />Start querying.
        </h2>
        <p className="landing-desc mx-auto max-w-md mb-10">
          The gateway is live and already routing production traffic. The agent data layer is launching soon —
          join early access to query your stack in SQL before anyone else.
        </p>

        <Link href="/waitlist"
          className="inline-flex items-center justify-center px-10 md:px-12 py-4 md:py-5 bg-[#9acbff] text-[#0a0a0b] font-bold uppercase tracking-widest text-sm rounded-full hover:opacity-90 transition-opacity no-underline">
          Join Early Access
        </Link>
        <p className="text-xs mt-6 tracking-wide text-white/25">Launching soon · No credit card required</p>
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-60">
        <svg viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
          {Array.from({ length: 8 }).map((_, i) => {
            const y = 136 + i * 4;
            const amp = 2 + i * 2;
            const op = 0.05 + i * 0.025;
            const sw = 0.2 + i * 0.04;
            const dur = 10 + (i % 4);
            const del = -(i % 8);
            return (
              <path key={i}
                d={`M-20 ${y}C${120 - amp * 4} ${y - amp} ${280 + amp * 4} ${y + amp} 348 ${y}C${416 - amp * 4} ${y - amp} ${576 + amp * 4} ${y + amp} 716 ${y}`}
                stroke="#9acbff" strokeWidth={sw} strokeOpacity={op} pathLength="1"
                style={{ strokeDasharray: "0.3, 0.7", animation: `ctaFlow ${dur}s linear ${del}s infinite` }} />
            );
          })}
        </svg>
      </div>
    </section>
  );
}
