"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Key } from "lucide-react";

export default function CreateProviderKeyPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <Link href="/admin/provider-keys" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="font-mono text-label-sm">Back to Provider Keys</span>
      </Link>
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Add Provider Key</h1>
        <p className="font-sans text-body-md text-on-surface-variant">Add a new upstream provider API key to the managed key pool. It will be encrypted at rest immediately.</p>
      </div>
      <Card className="card-panel">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Provider</label>
            <select className="input-dark w-full">
              <option>OpenRouter</option>
              <option>Together AI</option>
              <option>Groq</option>
              <option>OpenAI</option>
              <option>Anthropic</option>
              <option>Gemini</option>
            </select>
          </div>
          <div>
            <label className="font-mono text-label-sm text-on-surface-variant block mb-2">API Key</label>
            <Input type="password" placeholder="sk-or-..." />
          </div>
          <div>
            <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Initial Credits (USD)</label>
            <Input defaultValue="50.00" type="number" min="1" step="0.01" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" className="rounded accent-primary" id="emergency" />
            <label htmlFor="emergency" className="font-sans text-body-md text-on-surface-variant">Mark as emergency reserve key</label>
          </div>
          <Button variant="primary">
            <Key className="w-4 h-4" />
            Add Key to Pool
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
