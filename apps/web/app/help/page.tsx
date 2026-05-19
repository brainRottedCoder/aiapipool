"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";
import { useState } from "react";
import { HelpCircle, Mail, MessageSquare, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const [search, setSearch] = useState("");

  return (
    <main className="pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-content mx-auto min-h-screen">
      <h1 className="font-sans text-headline-xl mb-4">Help Center</h1>
      <p className="font-sans text-body-lg text-on-surface-variant mb-8 max-w-2xl">
        Find answers to common questions, contact support, or browse documentation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <Link href="/docs" className="card-panel-hover rounded-lg p-6 group transition-all">
          <div className="flex items-start gap-4">
            <BookOpen className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="font-sans text-headline-md text-on-surface group-hover:text-primary transition-colors">Documentation</h3>
              <p className="font-sans text-body-md text-on-surface-variant mt-1">API reference, quickstart, and SDK guides.</p>
            </div>
          </div>
        </Link>
        <Link href="/help/contact" className="card-panel-hover rounded-lg p-6 group transition-all">
          <div className="flex items-start gap-4">
            <MessageSquare className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="font-sans text-headline-md text-on-surface group-hover:text-primary transition-colors">Contact Support</h3>
              <p className="font-sans text-body-md text-on-surface-variant mt-1">Submit a ticket or email our team directly.</p>
            </div>
          </div>
        </Link>
        <Link href="/help/debug" className="card-panel-hover rounded-lg p-6 group transition-all">
          <div className="flex items-start gap-4">
            <HelpCircle className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="font-sans text-headline-md text-on-surface group-hover:text-primary transition-colors">Debug Logging</h3>
              <p className="font-sans text-body-md text-on-surface-variant mt-1">Enable detailed request logging for troubleshooting.</p>
            </div>
          </div>
        </Link>
      </div>

      <h2 className="font-sans text-headline-lg mb-6">Frequently Asked Questions</h2>
      <div className="space-y-4 max-w-3xl">
        {[
          { q: "How do I get started with SAPI?", a: "Create an account, add credits, and generate an API key. Then change your OpenAI SDK base_url to point to our gateway." },
          { q: "What providers are supported?", a: "We support OpenAI, Anthropic, Groq, Together AI, OpenRouter, and Google Gemini through a single unified API." },
          { q: "How does billing work?", a: "Pay-as-you-go with per-token pricing. You pre-load credits and we deduct usage in real-time." },
          { q: "Is my data secure?", a: "Yes. We use AES-256-GCM encryption for provider keys, HMAC-SHA256 for API key hashing, and never log message content." },
          { q: "Can I self-host SAPI?", a: "The backend is open-core. You can deploy it to Azure Container Apps with your own provider keys." },
        ].map((faq, i) => (
          <Card key={i} className="card-panel">
            <CardContent className="p-5">
              <h3 className="font-sans text-body-lg font-semibold text-on-surface mb-2">{faq.q}</h3>
              <p className="font-sans text-body-md text-on-surface-variant">{faq.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
