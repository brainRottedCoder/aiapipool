import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  Eye,
  FileKey,
  Lock,
  ScrollText,
  Server,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { ContentPage, ContentSection } from "@/components/shared/content-page";
import { Card, CardContent } from "@/components/ui/card";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Security",
  description: `${SITE.name} security practices — encryption, key management, zero content logging, and operational safeguards.`,
};

const SECURITY_FEATURES = [
  {
    icon: Lock,
    title: "AES-256-GCM Encryption",
    description:
      "All upstream provider API keys are encrypted at rest using AES-256-GCM with per-key initialization vectors. Keys are decrypted only in memory at request time.",
  },
  {
    icon: FileKey,
    title: "HMAC-SHA256 Key Hashing",
    description:
      "User API keys are never stored in plain text. We store HMAC-SHA256 hashes and verify incoming keys against these hashes without ever retaining the raw secret.",
  },
  {
    icon: Eye,
    title: "Zero Content Logging",
    description:
      "We never log, store, or retain prompt or response content. Only billing and operational metadata (token counts, model, latency, status) is persisted.",
  },
  {
    icon: ScrollText,
    title: "Immutable Audit Ledger",
    description:
      "Administrative actions — key creation, configuration changes, emergency controls — are recorded in an append-only audit ledger for accountability.",
  },
  {
    icon: Server,
    title: "TLS 1.3 in Transit",
    description:
      "All API traffic and dashboard sessions are encrypted in transit using TLS 1.3. We enforce HTTPS and reject unencrypted connections.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access Control",
    description:
      "Dashboard and admin surfaces enforce session-based authentication with role separation. Admin operations require elevated credentials.",
  },
  {
    icon: Activity,
    title: "Rate Limiting & Abuse Prevention",
    description:
      "Redis-backed sliding-window rate limiters protect against abuse. Per-key and per-user limits prevent runaway usage and credential stuffing.",
  },
  {
    icon: Shield,
    title: "Secure Key Lifecycle",
    description:
      "API keys are displayed once at creation. Provider keys support rotation without service interruption. Revoked keys are immediately invalidated.",
  },
];

export default function SecurityPage() {
  return (
    <ContentPage
      title="Security"
      description={`${SITE.name} is built with security as a foundational requirement, not an afterthought. This page outlines the technical and operational measures we use to protect your data and API access.`}
    >
      <ContentSection title="Security Overview">
        <p>
          As an AI API gateway, {SITE.name} sits between your application and upstream model providers.
          We are responsible for protecting your API credentials, routing requests securely, and ensuring
          that inference content passes through without being retained. Our security model is designed
          around the principle of least privilege and defense in depth.
        </p>
      </ContentSection>

      <ContentSection title="Technical Safeguards">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
          {SECURITY_FEATURES.map((feature) => (
            <Card key={feature.title} className="card-panel">
              <CardContent className="p-5 space-y-2">
                <feature.icon className="w-5 h-5 text-primary" />
                <h3 className="font-sans text-body-lg font-semibold text-on-surface">{feature.title}</h3>
                <p className="font-sans text-body-md text-on-surface-variant">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Authentication">
        <p>
          The public API uses Bearer token authentication with HMAC-hashed API keys. Dashboard access
          uses NextAuth session tokens with secure, HTTP-only cookies and cross-domain Bearer header
          support for API calls from the web application.
        </p>
        <p>
          Admin operations require a separate admin session with additional access controls. Emergency
          controls (global kill switches, provider disabling) are logged in the immutable audit ledger.
        </p>
      </ContentSection>

      <ContentSection title="Data Handling">
        <p>
          <strong>What we store:</strong> Account information, billing records, usage metadata (token
          counts, model name, timestamps, latency), API key hashes, and encrypted provider keys.
        </p>
        <p>
          <strong>What we never store:</strong> Prompt content, model response content, or any inference
          payload beyond what is required for real-time request forwarding.
        </p>
        <p>
          For complete details on data collection and your rights, see our{" "}
          <Link href="/legal/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </ContentSection>

      <ContentSection title="Infrastructure">
        <p>
          The Service runs on hardened cloud infrastructure with network isolation, encrypted database
          connections, and automated security patching. Database credentials and encryption keys are
          managed through environment-based secret injection — never committed to source control.
        </p>
      </ContentSection>

      <ContentSection title="Incident Response">
        <p>
          We maintain an incident response process for security events. In the event of a confirmed
          breach affecting user data, we will notify affected users within 72 hours via email and
          publish a summary on our{" "}
          <Link href="/status" className="text-primary hover:underline">
            Status page
          </Link>
          .
        </p>
        <p>
          To report a security vulnerability, email{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-primary hover:underline font-mono text-label-sm">
            {SITE.contactEmail}
          </a>{" "}
          with the subject line "Security Report". We appreciate responsible disclosure and will
          acknowledge reports within 48 hours.
        </p>
      </ContentSection>

      <ContentSection title="Compliance">
        <p>
          We design our practices to align with GDPR principles for data minimization, purpose
          limitation, and user rights. We do not process payment card data directly — Stripe handles
          PCI-compliant payment processing.
        </p>
      </ContentSection>

      <ContentSection title="Your Responsibilities">
        <p>
          Security is a shared responsibility. We recommend:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Store API keys in environment variables or secret managers — never in client-side code</li>
          <li>Rotate API keys periodically and immediately if exposure is suspected</li>
          <li>Monitor usage dashboards for anomalous activity</li>
          <li>Enable debug logging only temporarily for troubleshooting</li>
          <li>Keep your account email secure and enable strong passwords</li>
        </ul>
      </ContentSection>
    </ContentPage>
  );
}
