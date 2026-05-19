"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { scaleIn } from "@/lib/motion";
import Link from "next/link";

export function CTASection() {
  return (
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
  );
}
