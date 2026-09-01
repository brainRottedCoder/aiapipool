"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SectionHeader } from "./section-header";

export function DashboardSection() {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.03, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.45], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);

  return (
    <section
      ref={containerRef}
      className="landing-section -mt-16 md:-mt-24 pt-0"
      style={{ perspective: "1000px" }}
    >
      <div className="landing-section-glow" aria-hidden />
      <div className="landing-container landing-container--narrow">
        <SectionHeader
          eyebrow="The Gateway"
          title={
            <>
              The infra proof<br />
              <span className="landing-title-stroke">behind the pitch.</span>
            </>
          }
          description="Millions of requests already route through this engine — automatic failover, key rotation, and token-level tracking in real-time. It's the same reliability layer the agent data product is built on."
        />

        <motion.div
          className="dash-card mx-auto"
          style={{
            rotateX,
            scale,
            opacity,
            y,
            transformPerspective: 800,
            transformOrigin: "bottom",
          }}
        >
          <div className="h-full w-full overflow-hidden rounded-2xl bg-[#18181b] p-4 flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] shrink-0">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
              <span className="text-[10px] tracking-[4px] uppercase" style={{ color: "rgba(154,203,255,0.4)" }}>
                SAPI Dashboard
              </span>
              <span className="text-[10px] font-semibold" style={{ color: "rgba(74,222,128,0.8)" }}>● Live</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/[0.06] shrink-0">
              {[
                { val: "142M", label: "Tokens Routed", delta: "+24%" },
                { val: "99.9%", label: "Uptime", delta: "SLA" },
                { val: "18ms", label: "Avg Latency", delta: "Groq" },
                { val: "$0.34", label: "Avg Cost/1K", delta: "↓12%" },
              ].map((m) => (
                <div key={m.label} className="px-5 py-4 border-r border-white/[0.05] last:border-r-0">
                  <div className="text-[22px] font-black tracking-tight leading-none mb-1">{m.val}</div>
                  <div className="text-[9px] uppercase tracking-[2px]" style={{ color: "rgba(255,255,255,0.3)" }}>{m.label}</div>
                  <div className="text-[9px] font-semibold mt-0.5" style={{ color: "rgba(154,203,255,0.7)" }}>{m.delta}</div>
                </div>
              ))}
            </div>

            <div className="overflow-hidden flex-1">
              <div className="grid grid-cols-5 text-[9px] uppercase tracking-[2px] border-b border-white/[0.05] px-5 py-2 max-md:hidden"
                style={{ color: "rgba(255,255,255,0.2)" }}>
                <span>Model</span><span>Provider</span><span>Tokens</span><span>Latency</span><span>Cost</span>
              </div>
              {[
                { model: "gpt-4o", provider: "OpenAI", tokens: "2,847", latency: "312ms", cost: "$0.028" },
                { model: "claude-3.5", provider: "Anthropic", tokens: "1,204", latency: "425ms", cost: "$0.018" },
                { model: "llama-3.1-70b", provider: "Together", tokens: "3,912", latency: "89ms", cost: "$0.004" },
                { model: "mixtral-8x7b", provider: "Groq", tokens: "856", latency: "18ms", cost: "$0.001" },
                { model: "gemini-1.5", provider: "Google", tokens: "5,120", latency: "280ms", cost: "$0.006" },
              ].map((r) => (
                <div key={r.model} className="grid grid-cols-2 md:grid-cols-5 text-[10px] px-5 py-2.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors gap-1 md:gap-0">
                  <span className="font-semibold md:col-span-1" style={{ color: "rgba(255,255,255,0.85)" }}>{r.model}</span>
                  <span className="md:col-span-1" style={{ color: "rgba(255,255,255,0.4)" }}>{r.provider}</span>
                  <span className="max-md:hidden" style={{ color: "rgba(255,255,255,0.35)" }}>{r.tokens}</span>
                  <span style={{ color: "rgba(154,203,255,0.6)" }}>{r.latency}</span>
                  <span className="font-bold text-white">{r.cost}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
