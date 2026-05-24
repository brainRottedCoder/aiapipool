import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/shared/content-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${SITE.name} — how Softix collects, uses, and protects your data.`,
};

export default function PrivacyPolicyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      description={`This Privacy Policy describes how ${SITE.legalEntity} ("Softix", "we", "us") collects, uses, and protects information when you use ${SITE.name} ("the Service").`}
      lastUpdated="May 24, 2025"
    >
      <ContentSection title="1. Information We Collect">
        <p>
          <strong>Account Information:</strong> When you register, we collect your name, email address,
          and authentication credentials. Passwords are hashed using industry-standard algorithms and
          are never stored in plain text.
        </p>
        <p>
          <strong>Usage Metadata:</strong> We collect request metadata required to operate the Service,
          including token counts, model names, timestamps, latency, status codes, and API key identifiers.
          We do <strong>not</strong> log, store, or retain the content of your prompts or model responses.
        </p>
        <p>
          <strong>Payment Information:</strong> Payment processing is handled by Stripe. We do not store
          full credit card numbers on our servers. We retain billing records, transaction history, and
          invoice metadata for accounting and dispute resolution.
        </p>
        <p>
          <strong>Technical Data:</strong> We automatically collect IP addresses, browser type, device
          information, and log data for security monitoring, abuse prevention, and service reliability.
        </p>
      </ContentSection>

      <ContentSection title="2. How We Use Your Information">
        <p>We use collected information to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Provide, operate, and maintain the Service</li>
          <li>Process billing and manage your account balance</li>
          <li>Monitor system health, detect abuse, and enforce rate limits</li>
          <li>Send transactional emails (account verification, billing receipts, security alerts)</li>
          <li>Improve the Service through aggregated, anonymized analytics</li>
          <li>Comply with legal obligations</li>
        </ul>
      </ContentSection>

      <ContentSection title="3. Data Sharing">
        <p>
          We do not sell your personal information. We share data only with:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Upstream AI Providers:</strong> Your inference requests are forwarded to third-party
            AI providers (OpenAI, Anthropic, etc.) as necessary to fulfill API calls. These providers
            operate under their own privacy policies.
          </li>
          <li>
            <strong>Payment Processors:</strong> Stripe processes payment transactions on our behalf.
          </li>
          <li>
            <strong>Infrastructure Providers:</strong> Cloud hosting and database services that process
            data under strict data processing agreements.
          </li>
          <li>
            <strong>Legal Requirements:</strong> When required by law, court order, or to protect our
            rights and the safety of users.
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="4. Data Retention">
        <p>
          Account data is retained for the duration of your account plus a reasonable period thereafter
          for legal and accounting purposes. Usage metadata is retained for billing reconciliation and
          operational analytics. You may request account deletion by contacting{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-primary hover:underline">
            {SITE.contactEmail}
          </a>
          .
        </p>
      </ContentSection>

      <ContentSection title="5. Cookies and Tracking">
        <p>
          We use essential cookies for authentication and session management. We do not use third-party
          advertising cookies. Analytics, if enabled, use aggregated data that cannot identify individual
          users.
        </p>
      </ContentSection>

      <ContentSection title="6. Security">
        <p>
          We implement AES-256-GCM encryption for provider keys at rest, HMAC-SHA256 hashing for API keys,
          TLS 1.3 for data in transit, and role-based access controls. See our{" "}
          <a href="/security" className="text-primary hover:underline">
            Security page
          </a>{" "}
          for full details.
        </p>
      </ContentSection>

      <ContentSection title="7. Your Rights">
        <p>
          Depending on your jurisdiction, you may have the right to access, correct, delete, or export
          your personal data, and to object to or restrict certain processing. To exercise these rights,
          contact us at{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-primary hover:underline">
            {SITE.contactEmail}
          </a>
          . We will respond within 30 days.
        </p>
      </ContentSection>

      <ContentSection title="8. International Transfers">
        <p>
          Your data may be processed in countries other than your country of residence. We ensure
          appropriate safeguards are in place for international data transfers in compliance with
          applicable law.
        </p>
      </ContentSection>

      <ContentSection title="9. Children's Privacy">
        <p>
          The Service is not intended for users under 16 years of age. We do not knowingly collect
          personal information from children. If you believe a child has provided us data, contact us
          immediately.
        </p>
      </ContentSection>

      <ContentSection title="10. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes will be communicated via
          email or a notice on the Service. Continued use after changes constitutes acceptance of the
          updated policy.
        </p>
      </ContentSection>

      <ContentSection title="11. Contact Us">
        <p>
          For privacy-related inquiries, contact {SITE.legalEntity} at{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-primary hover:underline font-mono text-label-sm">
            {SITE.contactEmail}
          </a>
          .
        </p>
      </ContentSection>
    </ContentPage>
  );
}
