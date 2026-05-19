"use client";

import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";

export function ArchitectureSection() {
  return (
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
          <rect x="30" y="125" width="100" height="100" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <text x="80" y="170" fill="#e5e2e3" fontFamily="Inter" fontSize="13" fontWeight="500" textAnchor="middle">Client App</text>
          <text x="80" y="190" fill="#c1c7d0" fontFamily="Inter" fontSize="11" textAnchor="middle">Your Code</text>
          <rect x="380" y="90" width="220" height="170" rx="12" fill="rgba(154,203,255,0.05)" stroke="#9acbff" strokeWidth="1.5" />
          <text x="490" y="155" fill="#9acbff" fontFamily="Inter" fontSize="20" fontWeight="700" textAnchor="middle">sapi.gateway</text>
          <text x="490" y="180" fill="rgba(154,203,255,0.6)" fontFamily="Inter" fontSize="11" textAnchor="middle">Auth → Rate Limit → Key Pool</text>
          <text x="490" y="198" fill="rgba(154,203,255,0.6)" fontFamily="Inter" fontSize="11" textAnchor="middle">Provider Map → Adapter → Stream</text>
          <text x="490" y="230" fill="rgba(154,203,255,0.4)" fontFamily="Inter" fontSize="10" textAnchor="middle">Redis · PostgreSQL · BullMQ</text>
          <rect x="800" y="30" width="110" height="50" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <text x="855" y="60" fill="#e5e2e3" fontFamily="Inter" fontSize="12" fontWeight="500" textAnchor="middle">OpenAI</text>
          <rect x="800" y="100" width="110" height="50" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <text x="855" y="130" fill="#e5e2e3" fontFamily="Inter" fontSize="12" fontWeight="500" textAnchor="middle">Anthropic</text>
          <rect x="800" y="170" width="110" height="50" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <text x="855" y="200" fill="#e5e2e3" fontFamily="Inter" fontSize="12" fontWeight="500" textAnchor="middle">Groq</text>
          <rect x="800" y="240" width="110" height="50" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <text x="855" y="270" fill="#e5e2e3" fontFamily="Inter" fontSize="12" fontWeight="500" textAnchor="middle">Together AI</text>
          <path d="M130 175 L380 175" fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M600 140 L800 55" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" />
          <path d="M600 175 L800 125" fill="none" stroke="url(#lineGrad)" strokeWidth="2" />
          <path d="M600 210 L800 195" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" />
          <path d="M600 240 L800 265" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>
      </motion.div>
    </section>
  );
}
