"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { PROVIDERS } from "@/lib/constants";
import { fadeInUp, staggerContainer, cardHover } from "@/lib/motion";

export function IntegrationsSection() {
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
  );
}
