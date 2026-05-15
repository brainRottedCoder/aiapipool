import Link from "next/link";
import { ArrowRight, Copy, Check, Code2, Key, Shield, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocsPage() {
  return (
    <div className="prose-headings:text-on-surface prose-p:text-on-surface-variant">
      <h1 className="font-sans text-headline-xl mb-2">Documentation</h1>
      <p className="font-sans text-body-lg text-on-surface-variant mb-8">
        Everything you need to integrate SAPI into your application.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {[
          { title: "Quickstart", desc: "Get up and running in 5 minutes with a simple API call.", icon: Code2, href: "/docs/quickstart" },
          { title: "API Reference", desc: "Complete endpoint reference with request/response schemas.", icon: Copy, href: "/docs/api-reference" },
          { title: "Authentication", desc: "Learn about API key authentication and session management.", icon: Key, href: "/docs/quickstart" },
          { title: "SDKs & Tools", desc: "Python, Node.js, and cURL integration examples.", icon: Code2, href: "/docs/sdks" },
        ].map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="card-panel-hover rounded-lg p-6 group transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <card.icon className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-sans text-headline-md text-on-surface group-hover:text-primary transition-colors">{card.title}</h3>
                <p className="font-sans text-body-md text-on-surface-variant mt-1">{card.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="font-sans text-headline-lg mb-6">Architecture Overview</h2>
      <div className="card-panel rounded-xl p-6 mb-12">
        <div className="font-mono text-code-md text-on-surface-variant space-y-1">
          <p><span className="text-primary">Client</span> → Cloudflare → <span className="text-primary">SAPI</span></p>
          <p className="pl-8">│  Auth Middleware (HMAC API Key Validation)</p>
          <p className="pl-8">│  Rate Limiter (Redis Sliding Window)</p>
          <p className="pl-8">│  Balance Check (Redis Atomic Counter)</p>
          <p className="pl-8">│  Provider Mapper (Model → Provider Lookup)</p>
          <p className="pl-8">│  Key Pool Manager (Highest Credits Key)</p>
          <p className="pl-8">│  Provider Adapter (Request/Response Normalization)</p>
          <p className="pl-8">│  Stream Proxy (SSE + AbortController)</p>
          <p className="pl-8">└→ <span className="text-primary">AI Provider API</span> (OpenAI / Anthropic / Groq / ...)</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/docs/quickstart">
          <Button variant="primary">
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/docs/api-reference">
          <Button variant="secondary">API Reference</Button>
        </Link>
      </div>
    </div>
  );
}
