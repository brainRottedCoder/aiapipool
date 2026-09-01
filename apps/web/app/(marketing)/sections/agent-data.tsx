"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "./section-header";

const PAIN_POINTS = [
  "Too many tool calls per agent turn",
  "Repeated auth, pagination, and retry logic",
  "Poor cross-source reasoning",
  "High token traffic from sprawling JSON",
  "Brittle glue code in every prompt",
];

const CAPABILITIES = [
  "Query live APIs through SQL",
  "JOIN across sources in one statement",
  "Expose the same runtime over MCP",
  "Tabular rows — only the columns you need",
  "Credentials stay in your trust boundary",
];

export function AgentDataSection() {
  return (
    <section className="landing-section overflow-hidden">
      <div className="landing-grid-bg" aria-hidden />
      <div className="landing-section-glow" aria-hidden />

      <div className="landing-container">
        <SectionHeader
          eyebrow="The Product"
          badge="soon"
          title={
            <>
              One SQL interface for{" "}
              <span className="landing-title-italic">every data source.</span>
            </>
          }
          description="AI agents shouldn't call APIs one tool at a time. Query GitHub, Linear, Datadog, Stripe, and your files through a single read layer — fewer tool calls, cleaner results, cross-source reasoning without hand-stitched prompts."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="terminal-box shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
          >
            <div className="terminal-bar">
              <div className="terminal-dots"><span /><span /><span /></div>
              <span className="text-[10px] tracking-[3px] uppercase" style={{ color: "rgba(154,203,255,0.4)" }}>
                agent query
              </span>
              <span className="text-[10px]" style={{ color: "rgba(154,203,255,0.5)" }}>read-only</span>
            </div>
            <div className="terminal-body text-[12px] md:text-[13px]">
              <span style={{ color: "rgba(255,255,255,0.25)" }}>-- Cross-source join in one query</span>
              <br /><br />
              <span style={{ color: "rgba(154,203,255,0.55)" }}>SELECT</span>{" "}
              a.issue_id, a.url, p.state, p.title
              <br />
              <span style={{ color: "rgba(154,203,255,0.55)" }}>FROM</span> linear.attachments a
              <br />
              <span style={{ color: "rgba(154,203,255,0.55)" }}>JOIN</span> github.pulls p
              <br />
              {"  "}<span style={{ color: "rgba(154,203,255,0.55)" }}>ON</span> p.html_url = a.url
              <br />
              <span style={{ color: "rgba(154,203,255,0.55)" }}>WHERE</span> p.state ={" "}
              <span style={{ color: "rgba(74,222,128,0.85)" }}>&apos;open&apos;</span>
              <br />
              {"  "}<span style={{ color: "rgba(154,203,255,0.55)" }}>AND</span> a.project ={" "}
              <span style={{ color: "rgba(74,222,128,0.85)" }}>&apos;platform&apos;</span>
              <br /><br />
              <span style={{ color: "rgba(255,255,255,0.2)" }}>→ 12 rows · 340ms · 1 tool call</span>
            </div>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8"
            >
              <p className="landing-eyebrow mb-4">The problem</p>
              <ul className="space-y-3">
                {PAIN_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[15px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <span className="mt-2 w-1 h-1 rounded-full bg-white/25 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="rounded-2xl border border-[rgba(154,203,255,0.12)] bg-[rgba(154,203,255,0.03)] p-6 md:p-8"
            >
              <p className="landing-eyebrow mb-4" style={{ color: "rgba(154,203,255,0.55)" }}>The Softix approach</p>
              <ul className="space-y-3">
                {CAPABILITIES.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[15px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <span className="mt-2 w-1 h-1 rounded-full bg-[#9acbff] shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        <div className="mt-16 pt-12 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
          <div>
            <p className="landing-eyebrow mb-5">Connect your stack</p>
            <div className="flex flex-wrap gap-2">
              {["GitHub", "Linear", "Datadog", "Sentry", "Stripe", "Slack", "JSONL", "Parquet"].map((source) => (
                <span
                  key={source}
                  className="px-3 py-1.5 rounded-full border border-white/[0.08] text-[11px] tracking-[0.15em] uppercase font-mono text-white/45 bg-white/[0.02]"
                >
                  {source}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {[
              { val: "2×", label: "Lower agent cost" },
              { val: "42%", label: "Less latency" },
              { val: "1", label: "Query interface" },
            ].map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <p className="font-display text-3xl md:text-4xl font-bold text-white mb-1">{stat.val}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/30">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
