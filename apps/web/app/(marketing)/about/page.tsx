import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe, Key, Shield, Zap } from "lucide-react";
import { ContentPage, ContentSection } from "@/components/shared/content-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${SITE.name} — the universal OpenAI-compatible AI API gateway built by Softix for developers and teams.`,
};

const VALUES = [
  {
    icon: Globe,
    title: "Universal Compatibility",
    description:
      "One OpenAI-compatible endpoint for GPT, Claude, Llama, Gemini, and more — no provider-specific SDKs required.",
  },
  {
    icon: Key,
    title: "Operational Reliability",
    description:
      "Intelligent key pooling, automatic failover, and real-time credit tracking keep your applications running without manual intervention.",
  },
  {
    icon: Zap,
    title: "Developer-First",
    description:
      "Drop-in replacement for existing OpenAI integrations. Change your base URL, keep your code. Start building in minutes.",
  },
  {
    icon: Shield,
    title: "Security by Design",
    description:
      "AES-256-GCM encryption, HMAC-SHA256 key hashing, zero message content logging, and immutable audit trails.",
  },
];

export default function AboutPage() {
  return (
    <ContentPage
      title={`About ${SITE.name}`}
      description={`${SITE.name} is a universal OpenAI-compatible AI API gateway built by ${SITE.legalEntity}. We help developers and teams access multiple AI providers through a single, reliable interface.`}
    >
      <ContentSection title="Our Mission">
        <p>
          AI inference should not require juggling multiple provider APIs, managing dozens of API keys,
          or building custom failover logic. {SITE.name} abstracts that complexity into a single,
          production-ready gateway so you can focus on building your product.
        </p>
        <p>
          Whether you are an indie developer prototyping with GPT-4o, a SaaS team routing traffic
          across providers for cost optimization, or a hackathon builder who needs reliable model
          access on a budget — {SITE.name} gives you one API, every model, and zero overhead.
        </p>
      </ContentSection>

      <ContentSection title="What We Build">
        <p>
          {SITE.name} is an infrastructure platform, not a model provider. We route your requests
          to upstream providers — OpenAI, Anthropic, Groq, Together AI, OpenRouter, Google Gemini, and
          others — through a managed key pool with automatic rotation, health monitoring, and
          OpenAI-compatible response normalization.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>OpenAI-compatible <code className="font-mono text-label-sm text-primary">/v1/chat/completions</code> endpoint</li>
          <li>SSE streaming with real-time token-level cost tracking</li>
          <li>Usage dashboard with analytics, billing, and API key management</li>
          <li>Pay-as-you-go pricing with no subscriptions or minimum commitments</li>
        </ul>
        <p className="mt-4">
          <strong>Launching soon:</strong> an agent data layer that lets AI workflows query GitHub, Linear,
          Datadog, Stripe, and other sources through a single SQL interface — with cross-source JOINs,
          MCP support, and fewer tool calls than stitching APIs together by hand.
        </p>
      </ContentSection>

      <ContentSection title="Our Values">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
          {VALUES.map((value) => (
            <Card key={value.title} className="card-panel">
              <CardContent className="p-5 space-y-2">
                <value.icon className="w-5 h-5 text-primary" />
                <h3 className="font-sans text-body-lg font-semibold text-on-surface">{value.title}</h3>
                <p className="font-sans text-body-md text-on-surface-variant">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Built by Softix">
        <p>
          {SITE.name} is developed and operated by {SITE.legalEntity}. Softix builds developer
          infrastructure tools designed for reliability, transparency, and operational clarity.
        </p>
        <p>
          Questions, partnerships, or enterprise inquiries? Reach us at{" "}
          <a
            href={`mailto:${SITE.contactEmail}`}
            className="text-primary hover:underline font-mono text-label-sm"
          >
            {SITE.contactEmail}
          </a>
          .
        </p>
      </ContentSection>

      <div className="pt-4 not-prose">
        <Button variant="primary" asChild>
          <Link href="/register">
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </ContentPage>
  );
}
