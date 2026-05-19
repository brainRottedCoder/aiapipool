"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { FEATURES, SITE } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { Globe, Key, Shield, Zap, Layers, Activity } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Globe, Key, Shield, Zap, Layers, Activity,
};

export function FeatureGrid() {
  return (
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
          {SITE.name} is not a chatbot wrapper. It is production-grade AI infrastructure with every feature you need to route, scale, and monitor AI traffic.
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
          const Icon = iconMap[feature.icon] || Activity;
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
  );
}
