"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <Link href="/help" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="font-mono text-label-sm">Back to Help</span>
      </Link>
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Contact Support</h1>
        <p className="font-sans text-body-md text-on-surface-variant">Open a support ticket and we&apos;ll get back to you within 24 hours.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Subject</label>
          <Input placeholder="Describe your issue" />
        </div>
        <div>
          <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Message</label>
          <textarea
            className="input-dark w-full h-32 resize-none"
            placeholder="Provide details about your issue..."
          />
        </div>
        <Button variant="primary">
          <Send className="w-4 h-4" />
          Submit Ticket
        </Button>
      </div>
    </div>
  );
}
