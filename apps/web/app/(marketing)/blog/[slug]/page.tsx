import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ContentPage, ContentSection } from "@/components/shared/content-page";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/constants";

const POSTS: Record<
  string,
  {
    title: string;
    date: string;
    category: string;
    readTime: string;
    sections: { title: string; paragraphs: string[] }[];
  }
> = {
  "introducing-sapi": {
    title: "Introducing SAPI: One API for Every AI Model",
    date: "May 1, 2025",
    category: "Product",
    readTime: "4 min read",
    sections: [
      {
        title: "The Problem",
        paragraphs: [
          "Every AI provider ships a different API. Different authentication schemes, different response formats, different rate limits, and different billing models. If you want GPT-4o for reasoning, Claude for long context, and Llama for cost-sensitive workloads, you end up maintaining three integrations, three billing relationships, and three failure modes.",
          "We built SAPI (Softix API) to collapse that complexity into a single OpenAI-compatible endpoint.",
        ],
      },
      {
        title: "One Endpoint, Every Model",
        paragraphs: [
          "SAPI exposes a standard POST /v1/chat/completions endpoint that works with any OpenAI SDK. Point your base_url to SAPI, pass your API key, and request any supported model by name — gpt-4o, claude-3.5-sonnet, llama-3.1-70b, gemini-1.5-pro, and more.",
          "Behind the scenes, our adapter layer normalizes requests and responses across providers. Your application code never changes when you switch models or when we add new providers.",
        ],
      },
      {
        title: "Built for Production",
        paragraphs: [
          "SAPI is not a proxy — it's an infrastructure gateway with intelligent key pooling, automatic failover, real-time credit tracking, and a full operational dashboard. Pay only for what you use with transparent per-token pricing and no subscriptions.",
          "Ready to try it? Create a free account and make your first request in under 60 seconds.",
        ],
      },
    ],
  },
  "intelligent-key-pooling": {
    title: "How Intelligent Key Pooling Keeps Your AI App Online",
    date: "May 15, 2025",
    category: "Engineering",
    readTime: "6 min read",
    sections: [
      {
        title: "The Challenge of Provider Keys",
        paragraphs: [
          "Upstream AI providers impose per-key credit caps, rate limits, and occasional outages. A single exhausted key can take down your entire application if you don't have rotation logic built in.",
          "SAPI's key pool manager continuously monitors the health and remaining credits of every upstream key in the pool.",
        ],
      },
      {
        title: "Automatic Rotation and Failover",
        paragraphs: [
          "When a key approaches its credit limit or receives a rate-limit response, SAPI automatically routes the next request to a healthy alternative key — often before your users notice any degradation.",
          "If an entire provider experiences an outage, model mappings allow transparent failover to equivalent models on alternate providers where configured.",
        ],
      },
      {
        title: "Real-Time Credit Tracking",
        paragraphs: [
          "Every request updates credit balances in real time. The admin dashboard shows per-key utilization, margin analytics, and activity logs so operators have full visibility into pool health.",
          "This operational transparency is what separates a gateway from a simple proxy.",
        ],
      },
    ],
  },
  "zero-content-logging": {
    title: "Why We Never Log Your Prompts",
    date: "June 2, 2025",
    category: "Security",
    readTime: "5 min read",
    sections: [
      {
        title: "Privacy as Architecture",
        paragraphs: [
          "At SAPI, we made a deliberate architectural decision: we never store, log, or retain the content of your prompts or model responses. This is not configurable — it is enforced at the infrastructure level.",
          "We retain only the metadata required for billing and operational monitoring: token counts, model name, latency, status codes, and request IDs.",
        ],
      },
      {
        title: "Encryption Standards",
        paragraphs: [
          "Provider API keys are encrypted at rest using AES-256-GCM. User API keys are stored as HMAC-SHA256 hashes — we never store raw keys after initial creation.",
          "All traffic is encrypted in transit with TLS 1.3. Our immutable audit ledger records administrative actions without capturing inference content.",
        ],
      },
      {
        title: "Your Data, Your Control",
        paragraphs: [
          "You can request deletion of your account and associated metadata at any time by contacting support@softix.in. We do not sell user data to third parties.",
          "Read our full Security page and Privacy Policy for complete details on our data handling practices.",
        ],
      },
    ],
  },
  "migrate-from-openai": {
    title: "Migrating from OpenAI to SAPI in 60 Seconds",
    date: "June 20, 2025",
    category: "Guides",
    readTime: "3 min read",
    sections: [
      {
        title: "Python",
        paragraphs: [
          "If you're using the OpenAI Python SDK, change two lines: set base_url to your SAPI endpoint and use your SAPI API key instead of your OpenAI key.",
          "from openai import OpenAI\nclient = OpenAI(base_url=\"https://your-sapi-host/v1\", api_key=\"sk-sapi-...\")",
        ],
      },
      {
        title: "Node.js",
        paragraphs: [
          "The OpenAI Node.js SDK supports the same pattern. Pass baseURL and apiKey in the constructor — no other code changes required.",
          "const openai = new OpenAI({ baseURL: 'https://your-sapi-host/v1', apiKey: process.env.SAPI_API_KEY });",
        ],
      },
      {
        title: "cURL",
        paragraphs: [
          "For direct HTTP calls, replace the OpenAI URL with your SAPI endpoint and swap the Authorization header to use your SAPI key.",
          "curl https://your-sapi-host/v1/chat/completions -H \"Authorization: Bearer sk-sapi-...\" -H \"Content-Type: application/json\" -d '{\"model\":\"gpt-4o\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}]}'",
          "See our Quickstart guide and SDK documentation for complete examples.",
        ],
      },
    ],
  },
};

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.sections[0]?.paragraphs[0],
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  return (
    <ContentPage title={post.title}>
      <div className="flex items-center gap-3 mb-6 not-prose">
        <Badge variant="secondary">{post.category}</Badge>
        <span className="font-mono text-label-sm text-on-surface-variant">{post.date}</span>
        <span className="font-mono text-label-sm text-on-surface-variant">{post.readTime}</span>
      </div>

      {post.sections.map((section) => (
        <ContentSection key={section.title} title={section.title}>
          {section.paragraphs.map((paragraph, i) =>
            paragraph.includes("\n") ? (
              <pre
                key={i}
                className="font-mono text-label-sm bg-surface-container-high rounded-lg p-4 overflow-x-auto whitespace-pre-wrap"
              >
                {paragraph}
              </pre>
            ) : (
              <p key={i}>{paragraph}</p>
            ),
          )}
        </ContentSection>
      ))}

      <div className="pt-4 not-prose">
        <Link
          href="/blog"
          className="inline-flex items-center font-sans text-body-md text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>
      </div>
    </ContentPage>
  );
}

export function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}
