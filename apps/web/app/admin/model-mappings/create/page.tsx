"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, GitBranch } from "lucide-react";

export default function CreateModelMappingPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <Link href="/admin/model-mappings" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="font-mono text-label-sm">Back to Model Mappings</span>
      </Link>
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Add Model Mapping</h1>
        <p className="font-sans text-body-md text-on-surface-variant">Map a model alias to a provider-specific model ID with pricing.</p>
      </div>
      <Card className="card-panel">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Model Alias</label>
              <Input placeholder="e.g., gpt-4o" />
            </div>
            <div>
              <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Provider</label>
              <select className="input-dark w-full">
                <option>OpenAI</option>
                <option>Anthropic</option>
                <option>Together AI</option>
                <option>Groq</option>
                <option>OpenRouter</option>
                <option>Google</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Provider Model ID</label>
              <Input placeholder="e.g., gpt-4o or meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo" />
            </div>
            <div>
              <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Input Price ($/1M tokens)</label>
              <Input type="number" step="0.01" placeholder="2.50" />
            </div>
            <div>
              <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Output Price ($/1M tokens)</label>
              <Input type="number" step="0.01" placeholder="10.00" />
            </div>
          </div>
          <Button variant="primary">
            <GitBranch className="w-4 h-4" />
            Add Mapping
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
