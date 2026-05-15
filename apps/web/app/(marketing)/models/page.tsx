"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MODELS } from "@/lib/constants";
import { fadeInUp, staggerContainer, cardHover } from "@/lib/motion";

export default function ModelsPage() {
  const [search, setSearch] = useState("");
  const filtered = MODELS.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-content mx-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="text-center mb-16 border-b border-outline-subtle pb-12"
      >
        <motion.h1 variants={fadeInUp} className="font-sans text-headline-xl mb-4">One gateway. Every model.</motion.h1>
        <motion.p variants={fadeInUp} className="font-sans text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8">
          Seamlessly route requests to the optimal AI model based on cost, latency, or capability. Unified API, zero friction.
        </motion.p>
        <motion.div variants={fadeInUp} className="max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            className="input-dark w-full pl-10"
            placeholder="Search models, providers, or capabilities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((model, i) => (
          <motion.div
            key={model.name}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={i}
          >
            <motion.div variants={cardHover} initial="rest" whileHover="hover">
              <Card className="card-panel-hover p-5 h-full group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-0 space-y-4 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-sans text-headline-md text-on-surface">{model.name}</h3>
                      <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">{model.provider}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="font-mono text-label-sm text-on-surface-variant">Operational</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-mono text-label-sm text-on-surface-variant mb-1">Context Window</p>
                      <p className="font-mono text-code-md text-on-surface bg-background-overlay px-2 py-1 rounded border border-outline-subtle inline-block">{model.contextWindow}</p>
                    </div>
                    <div>
                      <p className="font-mono text-label-sm text-on-surface-variant mb-1">Max Output</p>
                      <p className="font-mono text-code-md text-on-surface bg-background-overlay px-2 py-1 rounded border border-outline-subtle inline-block">{model.maxOutput}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {model.capabilities.map((cap) => (
                      <Badge key={cap} variant="default" className="text-xs">{cap}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
