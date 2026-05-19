"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Check, Copy, ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { GradientText } from "@/components/shared/gradient-text";
import Link from "next/link";

export function HeroSection() {
  const [curlCopied, setCurlCopied] = useState(false);

  const curlCmd = `curl -X POST https://api.sapi.gateway/v1/chat/completions \\
  -H "Authorization: Bearer $SAPI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}]}'`;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-margin-mobile md:px-margin-desktop">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-content mx-auto text-center relative z-10">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
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
            <GradientText>Every model.</GradientText>{" "}
            Zero overhead.
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="font-sans text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10"
          >
            The universal gateway for AI. Route requests globally, aggregate API keys,
            stream responses in real-time, and monitor everything with infrastructure-grade precision.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
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
          <motion.div variants={fadeInUp} className="max-w-2xl mx-auto">
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
  );
}
