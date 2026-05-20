"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { SplineRobot } from "@/components/marketing/spline-robot";

export function StatsSection() {
  return (
    <section className="py-24 border-y border-white/[0.05]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { val: "6+", label: "Providers" },
            { val: "50+", label: "Models" },
            { val: "99.9%", label: "Uptime SLA" },
            { val: "<20ms", label: "Routing Overhead" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-5xl font-bold mb-2">{s.val}</p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
            </div>
          ))}
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
  const translateX = useTransform(springX, [-1, 1], [-20, 20]);
  const translateY = useTransform(springY, [-1, 1], [-20, 20]);

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
    <section className="py-24 relative overflow-hidden bg-[#0a0a0b]">
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Framed Robot */}
          <div className="relative w-full h-[540px] md:h-[640px] rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] overflow-hidden shadow-2xl"
            style={{ perspective: 1200 }}>
            <div className="absolute top-5 left-5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                <span className="text-black text-[10px] font-black">S</span>
              </div>
              <span className="text-[11px] font-bold tracking-[3px] uppercase text-white/80 font-sans">SAPI</span>
            </div>

            <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#9acbff] opacity-15 blur-[100px] rounded-full pointer-events-none z-10" />

            <motion.div
              style={{ rotateX, rotateY, x: translateX, y: translateY }}
              className="absolute top-0 left-0 w-full h-[calc(100%+60px)] pointer-events-auto"
            >
              <div className="w-full h-full animate-robot-idle" style={{ transformOrigin: "center center" }}>
                <SplineRobot className="w-full h-full" />
              </div>
            </motion.div>

            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0b]/80 to-transparent z-10 pointer-events-none" />
          </div>

          {/* Right: Text & Code Block */}
          <div className="pointer-events-auto flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(154,203,255,0.12)] text-[11px] tracking-[3px] uppercase mb-8"
              style={{ color: "rgba(154,203,255,0.5)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#9acbff]" style={{ animation: "sapi-pulse 2s ease-in-out infinite" }} />
              Drop-in replacement
            </div>
            <h2 className="text-[clamp(42px,5vw,72px)] font-black leading-[0.9] tracking-[-3px] mb-8">
              <span className="text-white">More</span><br />
              <span style={{ color: "transparent", WebkitTextStroke: "2px rgba(154,203,255,0.35)" }}>models.</span><br />
              <span style={{ color: "transparent", WebkitTextStroke: "2px rgba(154,203,255,0.35)" }}>FASTER.</span>
            </h2>
            <p className="text-[15px] leading-relaxed max-w-md mb-10" style={{ color: "rgba(255,255,255,0.45)" }}>
              Change one line of code to unlock every AI model. Your existing OpenAI SDK, Cursor, LangChain — everything just works.
            </p>

            <div className="terminal-box shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-[rgba(154,203,255,0.15)] bg-[rgba(10,10,11,0.8)] backdrop-blur-2xl mb-8">
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
                {"  "}base_url=<span style={{ color: "rgba(74,222,128,0.8)" }}>&quot;https://api.sapi.dev/v1&quot;</span><br />
                )<br />
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <Link href="/register"
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
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <div className="flex justify-center mb-10">
          <div className="w-14 h-14 rounded-full bg-[rgba(154,203,255,0.1)] flex items-center justify-center">
            <svg className="w-7 h-7 text-[#9acbff] opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <h2 className="font-display text-5xl md:text-8xl italic mb-12">
          Ship faster,<br />pay less.
        </h2>
        <Link href="/register"
          className="inline-flex items-center justify-center px-12 py-5 bg-[#9acbff] text-[#0a0a0b] font-bold uppercase tracking-widest text-sm rounded-full hover:opacity-90 transition-opacity no-underline">
          Start Building Free
        </Link>
        <p className="text-xs mt-6" style={{ color: "rgba(255,255,255,0.25)" }}>No credit card required</p>
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
          {Array.from({ length: 12 }).map((_, i) => {
            const y = 136 + i * 3.5;
            const amp = 2 + i * 2;
            const op = 0.06 + i * 0.03;
            const sw = 0.2 + i * 0.04;
            const dur = 9 + (i % 5);
            const del = -(i % 10);
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
