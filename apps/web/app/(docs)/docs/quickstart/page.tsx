import { CodeTabs } from "@/components/code/code-tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Key, Terminal } from "lucide-react";

const quickstartExamples = [
  {
    label: "curl",
    language: "bash",
    code: `curl -X POST https://api.sapi.gateway/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello, world!"}]
  }'`,
  },
  {
    label: "Python",
    language: "python",
    code: `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.sapi.gateway/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello, world!"}]
)

print(response.choices[0].message.content)`,
  },
  {
    label: "Node.js",
    language: "javascript",
    code: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "https://api.sapi.gateway/v1",
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello, world!" }],
});

console.log(response.choices[0].message.content);`,
  },
];

export default function QuickstartPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Quickstart</h1>
        <p className="font-sans text-body-lg text-on-surface-variant">
          Get up and running with SAPI in under 5 minutes.
        </p>
      </div>

      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary font-mono text-label-sm font-bold">1</div>
          <div>
            <h2 className="font-sans text-headline-md text-on-surface mb-2">Create an account</h2>
            <p className="font-sans text-body-md text-on-surface-variant">
              Sign up at <Link href="/register" className="text-primary hover:underline">SAPI</Link> and verify your email.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary font-mono text-label-sm font-bold">2</div>
          <div>
            <h2 className="font-sans text-headline-md text-on-surface mb-2">Generate an API key</h2>
            <p className="font-sans text-body-md text-on-surface-variant">
              Go to <Link href="/dashboard/api-keys" className="text-primary hover:underline">API Keys</Link> in your dashboard and create a new key.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary font-mono text-label-sm font-bold">3</div>
          <div>
            <h2 className="font-sans text-headline-md text-on-surface mb-2">Make your first request</h2>
            <p className="font-sans text-body-md text-on-surface-variant mb-4">
              Change your OpenAI SDK base_url to point to SAPI. All other code stays the same.
            </p>
            <CodeTabs tabs={quickstartExamples} defaultTab="curl" />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/docs/api-reference">
          <Button variant="primary">
            API Reference
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/docs/sdks">
          <Button variant="secondary">SDKs</Button>
        </Link>
      </div>
    </div>
  );
}
