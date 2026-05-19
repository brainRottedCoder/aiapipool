"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import Link from "next/link";

const PRICING_ITEMS = [
  { model: "GPT-4o", input: "$2.50", output: "$10.00" },
  { model: "Claude 3.5 Sonnet", input: "$3.00", output: "$15.00" },
  { model: "Llama 3.1 70B", input: "$0.90", output: "$0.90" },
];

export function PricingTable() {
  return (
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
          {PRICING_ITEMS.map((item) => (
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
  );
}
