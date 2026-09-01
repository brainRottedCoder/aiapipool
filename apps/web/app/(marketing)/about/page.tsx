import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe, Key, Shield, Zap } from "lucide-react";
import { ContentPage, ContentSection } from "@/components/shared/content-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${SITE.name} — the data access layer for AI agents, built by Softix for developers and teams.`,
};

const VALUES = [
  {
    icon: Globe,
    title: "One Query, Every Source",
    description:
      "GitHub, Linear, Datadog, Stripe, and your own files — queried through a single SQL interface with cross-source JOINs, exposed over MCP.",
  },
  {
    icon: Zap,
    title: "Fewer Tool Calls, Better Agents",
    description:
      "Agents shouldn't burn a dozen tool calls chasing one answer. One query replaces the tool-call chains that make agents slow and expensive to run.",
  },
  {
    icon: Key,
    title: "Built on Proven Infrastructure",
    description:
      "The data layer runs on the same gateway that already routes production AI traffic — intelligent key pooling, automatic failover, and real-time tracking.",
  },
  {
    icon: Shield,
    title: "Security by Design",
    description:
      "AES-256-GCM encryption, HMAC-SHA256 key hashing, zero content logging, and immutable audit trails. Credentials never leave your trust boundary.",
  },
];

export default function AboutPage() {
  return (
    <ContentPage
      title={`About ${SITE.name}`}
      description={`${SITE.name} is the data access layer for AI agents, built by ${SITE.legalEntity}. We help agents query the tools and data they depend on through a single, reliable SQL interface.`}
    >
      <ContentSection title="Our Mission">
        <p>
          AI agents spend more time calling APIs than reasoning about them — paginating, retrying,
          re-authenticating, and stitching JSON together across a dozen tools just to answer one
          question. {SITE.name} replaces that chain with a single query.
        </p>
        <p>
          Whether you are building an autonomous coding agent that needs to cross-reference GitHub
          and Linear, a support agent that joins Stripe billing data with Datadog incidents, or any
          workflow that talks to more than one API — {SITE.name} gives it one interface, one query,
          and fewer tool calls.
        </p>
      </ContentSection>

      <ContentSection title="What We Build">
        <p>
          <strong>Launching soon — the Agent Data Layer:</strong> a unified SQL interface that lets AI
          workflows query GitHub, Linear, Datadog, Stripe, and other sources with cross-source JOINs,
          native MCP support, and credentials that never leave your trust boundary.
        </p>
        <p>
          That product is built on infrastructure we already operate in production: a universal,
          OpenAI-compatible AI gateway that routes requests across OpenAI, Anthropic, Groq, Together AI,
          OpenRouter, Google Gemini, and others through a managed key pool with automatic rotation,
          health monitoring, and real-time cost tracking.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>One SQL interface across every connected data source</li>
          <li>MCP-native — plug straight into your existing agent runtime</li>
          <li>OpenAI-compatible <code className="font-mono text-label-sm text-primary">/v1/chat/completions</code> endpoint, already live</li>
          <li>SSE streaming with real-time token-level cost tracking</li>
          <li>Pay-as-you-go pricing with no subscriptions or minimum commitments</li>
        </ul>
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
