import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { ContentPage } from "@/components/shared/content-page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Blog",
  description: `Product updates, engineering insights, and guides from the ${SITE.name} team at Softix.`,
};

const POSTS = [
  {
    slug: "introducing-sapi",
    title: "Introducing SAPI: One API for Every AI Model",
    excerpt:
      "We built SAPI to solve a simple problem — developers shouldn't need six different SDKs and a spreadsheet of API keys to ship AI features. Here's how our OpenAI-compatible gateway works.",
    date: "May 1, 2025",
    category: "Product",
    readTime: "4 min read",
  },
  {
    slug: "intelligent-key-pooling",
    title: "How Intelligent Key Pooling Keeps Your AI App Online",
    excerpt:
      "When a provider key hits its credit limit or gets rate-limited, your users shouldn't notice. We walk through SAPI's automatic key rotation, health checks, and failover routing.",
    date: "May 15, 2025",
    category: "Engineering",
    readTime: "6 min read",
  },
  {
    slug: "zero-content-logging",
    title: "Why We Never Log Your Prompts",
    excerpt:
      "Privacy isn't a feature flag — it's an architectural decision. Learn about our zero message content logging policy, encryption standards, and what metadata we do retain for billing.",
    date: "June 2, 2025",
    category: "Security",
    readTime: "5 min read",
  },
  {
    slug: "migrate-from-openai",
    title: "Migrating from OpenAI to SAPI in 60 Seconds",
    excerpt:
      "Already using the OpenAI SDK? Change one environment variable. We cover Python, Node.js, and curl examples for a seamless migration with no code rewrites.",
    date: "June 20, 2025",
    category: "Guides",
    readTime: "3 min read",
  },
];

export default function BlogPage() {
  return (
    <ContentPage
      title="Blog"
      description={`Product updates, engineering deep-dives, and developer guides from the ${SITE.name} team.`}
      narrow={false}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {POSTS.map((post) => (
          <Card key={post.slug} className="card-panel-hover group">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary">{post.category}</Badge>
                <span className="font-mono text-label-sm text-on-surface-variant">{post.readTime}</span>
              </div>
              <h2 className="font-sans text-headline-md text-on-surface group-hover:text-primary transition-colors mb-2">
                {post.title}
              </h2>
              <p className="font-sans text-body-md text-on-surface-variant flex-1 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between pt-4 border-t border-outline-subtle">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Calendar className="w-4 h-4" />
                  <span className="font-mono text-label-sm">{post.date}</span>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center font-sans text-body-md text-primary hover:underline"
                >
                  Read more
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="font-sans text-body-md text-on-surface-variant mt-12 text-center">
        Want to stay updated? Follow us on{" "}
        <a
          href="https://x.com/softix_in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          X (Twitter)
        </a>{" "}
        or contact us at{" "}
        <a href={`mailto:${SITE.contactEmail}`} className="text-primary hover:underline font-mono text-label-sm">
          {SITE.contactEmail}
        </a>
        .
      </p>
    </ContentPage>
  );
}
