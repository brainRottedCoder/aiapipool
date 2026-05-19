"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { fadeInUp, staggerContainer, fadeIn } from "@/lib/motion";

export function CodeExampleSection() {
  return (
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
  );
}
