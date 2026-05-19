"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Fingerprint } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/motion";

const SECURITY_FEATURES = [
  {
    icon: Lock,
    title: "End-to-end encryption",
    description: "All API keys and tokens are encrypted at rest using AES-256. TLS 1.3 for all traffic.",
  },
  {
    icon: Shield,
    title: "Key isolation",
    description: "Each user gets isolated key pools. Provider keys are never exposed to end users.",
  },
  {
    icon: Eye,
    title: "Audit logging",
    description: "Every request is logged with full traceability. Query logs by user, model, or time range.",
  },
  {
    icon: Fingerprint,
    title: "RBAC & MFA",
    description: "Role-based access control for admin panels. Optional TOTP multi-factor authentication.",
  },
];

export function SecuritySection() {
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
          Enterprise-grade security.
        </motion.h2>
        <motion.p variants={fadeInUp} className="font-sans text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Built with security-first principles. Your data and keys are protected by industry-standard encryption and access controls.
        </motion.p>
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {SECURITY_FEATURES.map((feature) => {
          const Icon = feature.icon;
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
