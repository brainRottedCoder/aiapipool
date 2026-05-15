"use client";

import Link from "next/link";
import { Copy, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function QuickstartPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const curlCmd = `curl -X POST https://api.sapi.gateway/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello, world!"}]}'`;

  const pyCode = `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.sapi.gateway/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello, world!"}]
)

print(response.choices[0].message.content)`;

  const nodeCode = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "https://api.sapi.gateway/v1",
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello, world!" }],
});

console.log(response.choices[0].message.content);`;

  return (
    <div>
      <h1 className="font-sans text-headline-xl mb-2">Quickstart</h1>
      <p className="font-sans text-body-lg text-on-surface-variant mb-8">
        Get up and running with sapi.gateway in under 5 minutes.
      </p>

      {/* Step 1 */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="default" className="text-xs h-6 w-6 rounded-full flex items-center justify-center p-0">1</Badge>
          <h2 className="font-sans text-headline-md">Get your API key</h2>
        </div>
        <p className="font-sans text-body-md text-on-surface-variant mb-4">
          Sign up for a sapi.gateway account and create an API key from your dashboard.
          Your key will look like <code className="font-mono text-code-md bg-surface px-1.5 py-0.5 rounded border border-outline-subtle">sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</code>.
        </p>
        <Link href="/register">
          <Button variant="primary" size="sm">
            Create Account
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Step 2 */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="default" className="text-xs h-6 w-6 rounded-full flex items-center justify-center p-0">2</Badge>
          <h2 className="font-sans text-headline-md">Make your first request</h2>
        </div>
        <p className="font-sans text-body-md text-on-surface-variant mb-4">
          Use the OpenAI SDK or a direct HTTP request. sapi.gateway is fully OpenAI-compatible.
        </p>
        <Tabs defaultValue="curl">
          <TabsList>
            <TabsTrigger value="curl">curl</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="node">Node.js</TabsTrigger>
          </TabsList>
          <TabsContent value="curl">
            <div className="relative">
              <button
                onClick={() => copy(curlCmd, "curl")}
                className="absolute top-3 right-3 p-1.5 rounded bg-surface-hover hover:bg-surface-active text-on-surface-variant transition-colors"
              >
                {copied === "curl" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <pre className="card-panel p-4 rounded-lg font-mono text-code-md text-on-surface overflow-x-auto">
                <code>{curlCmd}</code>
              </pre>
            </div>
          </TabsContent>
          <TabsContent value="python">
            <div className="relative">
              <button
                onClick={() => copy(pyCode, "python")}
                className="absolute top-3 right-3 p-1.5 rounded bg-surface-hover hover:bg-surface-active text-on-surface-variant transition-colors"
              >
                {copied === "python" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <pre className="card-panel p-4 rounded-lg font-mono text-code-md text-on-surface overflow-x-auto">
                <code>{pyCode}</code>
              </pre>
            </div>
          </TabsContent>
          <TabsContent value="node">
            <div className="relative">
              <button
                onClick={() => copy(nodeCode, "node")}
                className="absolute top-3 right-3 p-1.5 rounded bg-surface-hover hover:bg-surface-active text-on-surface-variant transition-colors"
              >
                {copied === "node" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <pre className="card-panel p-4 rounded-lg font-mono text-code-md text-on-surface overflow-x-auto">
                <code>{nodeCode}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Step 3 */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="default" className="text-xs h-6 w-6 rounded-full flex items-center justify-center p-0">3</Badge>
          <h2 className="font-sans text-headline-md">Add credits</h2>
        </div>
        <p className="font-sans text-body-md text-on-surface-variant">
          sapi.gateway is pay-as-you-go. Add credits to your account from the billing page to start making requests.
          Minimum top-up is $5.00.
        </p>
      </div>

      <div className="flex gap-4 mt-12">
        <Link href="/dashboard">
          <Button variant="primary">
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/docs/api-reference">
          <Button variant="secondary">Explore API Reference</Button>
        </Link>
      </div>
    </div>
  );
}
