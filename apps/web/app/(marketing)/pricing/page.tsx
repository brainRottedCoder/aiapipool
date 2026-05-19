"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MODEL_PRICES } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export default function PricingPage() {
  const [tokensIn, setTokensIn] = useState(1000);
  const [tokensOut, setTokensOut] = useState(500);
  const [selectedModel, setSelectedModel] = useState(MODEL_PRICES[0]);

  const cost = ((tokensIn / 1_000_000) * selectedModel.inputPrice) + ((tokensOut / 1_000_000) * selectedModel.outputPrice);

  return (
    <main className="pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-content mx-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="text-center mb-16"
      >
        <motion.h1 variants={fadeInUp} className="font-sans text-headline-xl mb-4">Transparent pricing for infrastructure at scale.</motion.h1>
        <motion.p variants={fadeInUp} className="font-sans text-body-lg text-on-surface-variant max-w-2xl mx-auto">Usage-based billing designed for modern AI architectures. No minimums, no hidden fees.</motion.p>
      </motion.div>

      {/* Calculator */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="card-panel rounded-xl p-6 md:p-8 mb-12 max-w-3xl mx-auto"
      >
        <h2 className="font-sans text-headline-md mb-6">Cost Calculator</h2>
        <div className="space-y-4 mb-6">
          <div>
            <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Model</label>
            <select
              className="input-dark w-full"
              value={selectedModel.model}
              onChange={(e) => {
                const m = MODEL_PRICES.find((x) => x.model === e.target.value);
                if (m) setSelectedModel(m);
              }}
            >
              {MODEL_PRICES.map((m) => (
                <option key={m.model} value={m.model}>{m.model} — {m.provider}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-mono text-label-sm text-on-surface-variant block mb-2">
              Input Tokens: {tokensIn.toLocaleString()}
            </label>
            <input
              type="range"
              min="100"
              max="100000"
              step="100"
              value={tokensIn}
              onChange={(e) => setTokensIn(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="font-mono text-label-sm text-on-surface-variant block mb-2">
              Output Tokens: {tokensOut.toLocaleString()}
            </label>
            <input
              type="range"
              min="100"
              max="50000"
              step="100"
              value={tokensOut}
              onChange={(e) => setTokensOut(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
        <div className="bg-surface rounded-lg p-6 text-center border border-outline-subtle">
          <p className="font-mono text-label-sm text-on-surface-variant mb-2">Estimated Cost</p>
          <p className="font-sans text-display-lg text-on-surface">${cost.toFixed(4)}</p>
          <p className="font-mono text-code-md text-on-surface-variant mt-1">per request</p>
        </div>
      </motion.div>

      {/* Pricing Table */}
      <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
        {MODEL_PRICES.map((m, i) => (
          <motion.div
            key={m.model}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={i}
          >
            <Card className="card-panel-hover group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-sans text-headline-md text-on-surface">{m.model}</h3>
                      <Badge variant="default">{m.provider}</Badge>
                      <Badge variant="success">{m.status}</Badge>
                    </div>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {m.capabilities.map((cap) => (
                        <Badge key={cap} variant="outline" className="text-xs">{cap}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-center">
                      <p className="font-mono text-label-sm text-on-surface-variant">Input</p>
                      <p className="font-mono text-code-md text-on-surface">
                        ${m.inputPrice.toFixed(2)}
                        <span className="text-on-surface-variant text-xs"> /1M tokens</span>
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-mono text-label-sm text-on-surface-variant">Output</p>
                      <p className="font-mono text-code-md text-on-surface">
                        ${m.outputPrice.toFixed(2)}
                        <span className="text-on-surface-variant text-xs"> /1M tokens</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
