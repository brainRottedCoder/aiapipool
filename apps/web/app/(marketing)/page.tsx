"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Check, Copy, Globe, Key, Shield, Zap, Layers, Activity, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FEATURES, PROVIDERS } from "@/lib/constants";
import { fadeInUp, staggerContainer, cardHover, fadeIn, scaleIn } from "@/lib/motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Globe, Key, Shield, Zap, Layers, Activity,
};

export default function LandingPage() {
  const [curlCopied, setCurlCopied] = useState(false);

  const curlCmd = `curl -X POST https://api.sapi.gateway/v1/chat/completions \\
  -H "Authorization: Bearer $SAPI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}]}'`;

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-margin-mobile md:px-margin-desktop">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-content mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="default" className="mb-6 px-4 py-1.5 text-xs">
                AI INFRASTRUCTURE
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-sans text-display-lg md:text-[72px] md:leading-[80px] font-bold tracking-tighter mb-6 max-w-4xl mx-auto"
            >
              One API.{" "}
              <span className="text-gradient">Every model.</span>{" "}
              Zero overhead.
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="font-sans text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10"
            >
              The universal gateway for AI. Route requests globally, aggregate API keys,
              stream responses in real-time, and monitor everything with infrastructure-grade precision.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register">
                <Button variant="primary" size="lg">
                  Start building for free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="secondary" size="lg">
                  <Terminal className="w-4 h-4" />
                  Read Docs
                </Button>
              </Link>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="mt-12 max-w-2xl mx-auto"
            >
              <div className="bg-background-overlay border border-outline-subtle rounded-lg p-4 font-mono text-code-md text-on-surface-variant text-left overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-on-surface-variant text-label-sm">Quick start</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(curlCmd);
                      setCurlCopied(true);
                      setTimeout(() => setCurlCopied(false), 2000);
                    }}
                    className="text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {curlCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-all text-xs">{curlCmd}</pre>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Gateway Diagram */}
      <section className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop w-full pb-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="w-full h-[300px] md:h-[400px] glass-panel rounded-xl flex items-center justify-center relative overflow-hidden p-8"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1000 350"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(154,203,255,0.1)" />
                <stop offset="50%" stopColor="rgba(154,203,255,0.6)" />
                <stop offset="100%" stopColor="rgba(154,203,255,0.1)" />
              </linearGradient>
              <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(154,203,255,0.8)">
                  <animate attributeName="stop-color" values="rgba(154,203,255,0.8);rgba(154,203,255,0.2);rgba(154,203,255,0.8)" dur="2s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="rgba(154,203,255,0.1)" />
              </linearGradient>
            </defs>
            {/* Client Node */}
            <rect x="30" y="125" width="100" height="100" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text x="80" y="170" fill="#e5e2e3" fontFamily="Inter" fontSize="13" fontWeight="500" textAnchor="middle">Client App</text>
            <text x="80" y="190" fill="#c1c7d0" fontFamily="Inter" fontSize="11" textAnchor="middle">Your Code</text>
            {/* Gateway */}
            <rect x="380" y="90" width="220" height="170" rx="12" fill="rgba(154,203,255,0.05)" stroke="#9acbff" strokeWidth="1.5" />
            <text x="490" y="155" fill="#9acbff" fontFamily="Inter" fontSize="20" fontWeight="700" textAnchor="middle">sapi.gateway</text>
            <text x="490" y="180" fill="rgba(154,203,255,0.6)" fontFamily="Inter" fontSize="11" textAnchor="middle">Auth → Rate Limit → Key Pool</text>
            <text x="490" y="198" fill="rgba(154,203,255,0.6)" fontFamily="Inter" fontSize="11" textAnchor="middle">Provider Map → Adapter → Stream</text>
            <text x="490" y="230" fill="rgba(154,203,255,0.4)" fontFamily="Inter" fontSize="10" textAnchor="middle">Redis · PostgreSQL · BullMQ</text>
            {/* Provider Nodes */}
            <rect x="800" y="30" width="110" height="50" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text x="855" y="60" fill="#e5e2e3" fontFamily="Inter" fontSize="12" fontWeight="500" textAnchor="middle">OpenAI</text>
            <rect x="800" y="100" width="110" height="50" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text x="855" y="130" fill="#e5e2e3" fontFamily="Inter" fontSize="12" fontWeight="500" textAnchor="middle">Anthropic</text>
            <rect x="800" y="170" width="110" height="50" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text x="855" y="200" fill="#e5e2e3" fontFamily="Inter" fontSize="12" fontWeight="500" textAnchor="middle">Groq</text>
            <rect x="800" y="240" width="110" height="50" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text x="855" y="270" fill="#e5e2e3" fontFamily="Inter" fontSize="12" fontWeight="500" textAnchor="middle">Together AI</text>
            {/* Connecting Lines */}
            <path d="M130 175 L380 175" fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M600 140 L800 55" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" />
            <path d="M600 175 L800 125" fill="none" stroke="url(#lineGrad)" strokeWidth="2" />
            <path d="M600 210 L800 195" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" />
            <path d="M600 240 L800 265" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop pb-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="font-sans text-headline-xl mb-4">
            Built for infrastructure, designed for developers.
          </motion.h2>
          <motion.p variants={fadeInUp} className="font-sans text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            sapi.gateway is not a chatbot wrapper. It is production-grade AI infrastructure with every feature you need to route, scale, and monitor AI traffic.
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon] || Code2;
            return (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card className="card-panel-hover p-6 h-full transition-all duration-300 group">
                  <CardContent className="p-0 space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-sans text-body-lg font-semibold text-on-surface">{feature.title}</h3>
                    <p className="font-sans text-body-md text-on-surface-variant leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Code Example */}
      <section className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="font-sans text-headline-xl mb-4">
              Drop-in replacement for the OpenAI SDK.
            </motion.h2>
            <motion.p variants={fadeInUp} className="font-sans text-body-lg text-on-surface-variant mb-6">
              Change one line of code and unlock every model. Your existing OpenAI-compatible tools work immediately.
            </motion.p>
            <motion.ul variants={staggerContainer} className="space-y-3">
              {[
                "Same request/response format as OpenAI",
                "Streaming SSE support built-in",
                "Works with Cursor, VSCode extensions, LangChain",
                "Automatic failover across providers",
              ].map((item) => (
                <motion.li key={item} variants={fadeInUp} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary-bright mt-0.5 shrink-0" />
                  <span className="font-sans text-body-md text-on-surface-variant">{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <div className="card-panel rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-subtle/50 bg-surface/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/30" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
                  <div className="w-3 h-3 rounded-full bg-green-500/30" />
                </div>
                <span className="font-mono text-label-sm text-on-surface-variant ml-2">python</span>
              </div>
              <div className="p-4 font-mono text-code-md text-on-surface leading-relaxed">
                <span className="text-outline">from</span> openai <span className="text-outline">import</span> OpenAI<br /><br />
                <span className="text-on-surface-variant"># Change the base_url</span><br />
                client = OpenAI(<br />
                {"  "}api_key=<span className="text-green-400">&quot;sk_live_xxx&quot;</span>,<br />
                {"  "}base_url=<span className="text-green-400">&quot;https://api.sapi.gateway/v1&quot;</span><br />
                )<br /><br />
                response = client.chat.completions.create(<br />
                {"  "}model=<span className="text-green-400">&quot;gpt-4o&quot;</span>,<br />
                {"  "}messages=[{'{'}role: <span className="text-green-400">&quot;user&quot;</span>, content: <span className="text-green-400">&quot;Hello&quot;</span>{'}'}]<br />
                )
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Integrations */}
      <section className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop pb-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.h2 variants={fadeInUp} className="font-sans text-headline-xl mb-4">
            Every provider. One API.
          </motion.h2>
          <motion.p variants={fadeInUp} className="font-sans text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
            sapi.gateway aggregates and normalizes every major AI provider through a single OpenAI-compatible endpoint.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {PROVIDERS.map((provider) => (
              <motion.div
                key={provider.name}
                variants={cardHover}
                initial="rest"
                whileHover="hover"
                className="card-panel-hover rounded-lg p-5 flex flex-col items-center gap-3 group cursor-default"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="font-mono text-label-sm text-primary font-bold">
                    {provider.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="font-sans text-body-md font-medium text-on-surface">{provider.name}</span>
                <Badge variant="success" className="text-xs">OpenAI Compatible</Badge>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing CTA */}
      <section className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop pb-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.h2 variants={fadeInUp} className="font-sans text-headline-xl mb-4">
            Transparent pricing. Pay only for what you use.
          </motion.h2>
          <motion.p variants={fadeInUp} className="font-sans text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
            No subscriptions. No minimums. Just per-token pricing with competitive margins over upstream costs.
          </motion.p>
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { model: "GPT-4o", input: "$2.50", output: "$10.00" },
              { model: "Claude 3.5 Sonnet", input: "$3.00", output: "$15.00" },
              { model: "Llama 3.1 70B", input: "$0.90", output: "$0.90" },
            ].map((item) => (
              <Card key={item.model} className="card-panel-hover p-6 text-center">
                <CardContent className="p-0 space-y-4">
                  <h3 className="font-sans text-headline-md text-on-surface">{item.model}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-body-md">
                      <span className="text-on-surface-variant">Input</span>
                      <span className="font-mono text-on-surface">{item.input}<span className="text-on-surface-variant"> /1M tokens</span></span>
                    </div>
                    <div className="flex justify-between text-body-md">
                      <span className="text-on-surface-variant">Output</span>
                      <span className="font-mono text-on-surface">{item.output}<span className="text-on-surface-variant"> /1M tokens</span></span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
          <Link href="/pricing">
            <Button variant="secondary">
              View all models &amp; pricing
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop pb-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleIn}
          className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-12 md:p-16 text-center"
        >
          <h2 className="font-sans text-headline-xl mb-4 text-on-surface">
            Start building in 60 seconds.
          </h2>
          <p className="font-sans text-body-lg text-on-surface-variant max-w-xl mx-auto mb-8">
            Free to sign up. Pay only for what you use. No monthly fees, no credit card required to start.
          </p>
          <Link href="/register">
            <Button variant="primary" size="lg">
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="font-sans text-body-md text-on-surface-variant mt-4">No credit card required</p>
        </motion.div>
      </section>
    </main>
  );
}
