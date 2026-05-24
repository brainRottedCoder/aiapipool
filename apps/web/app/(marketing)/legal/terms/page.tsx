import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/shared/content-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${SITE.name} — the rules and conditions for using the Softix AI API gateway.`,
};

export default function TermsOfServicePage() {
  return (
    <ContentPage
      title="Terms of Service"
      description={`These Terms of Service ("Terms") govern your access to and use of ${SITE.name}, operated by ${SITE.legalEntity} ("Softix", "we", "us"). By using the Service, you agree to these Terms.`}
      lastUpdated="May 24, 2025"
    >
      <ContentSection title="1. Acceptance of Terms">
        <p>
          By creating an account, accessing the API, or using any part of the Service, you agree to be
          bound by these Terms and our{" "}
          <a href="/legal/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
          . If you do not agree, do not use the Service.
        </p>
      </ContentSection>

      <ContentSection title="2. Description of Service">
        <p>
          {SITE.name} is an OpenAI-compatible API gateway that routes inference requests to third-party
          AI model providers. Softix operates the gateway infrastructure, key pool management, billing,
          and dashboard — but does not train or host AI models directly.
        </p>
      </ContentSection>

      <ContentSection title="3. Account Registration">
        <p>
          You must provide accurate registration information and maintain the security of your account
          credentials. You are responsible for all activity under your account, including API key usage.
          Notify us immediately at{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-primary hover:underline">
            {SITE.contactEmail}
          </a>{" "}
          if you suspect unauthorized access.
        </p>
      </ContentSection>

      <ContentSection title="4. API Keys">
        <p>
          API keys are issued upon account creation. Keys are shown in full only once at creation — store
          them securely. You may not share API keys publicly, embed them in client-side code, or commit
          them to public repositories. Softix is not liable for unauthorized usage resulting from key
          exposure.
        </p>
      </ContentSection>

      <ContentSection title="5. Billing and Payments">
        <p>
          The Service operates on a pay-as-you-go model. You pre-load credits and usage is deducted in
          real time based on per-token pricing published on our{" "}
          <a href="/pricing" className="text-primary hover:underline">
            Pricing page
          </a>
          . Prices may change with reasonable notice. All fees are non-refundable except as required by
          law or at our sole discretion for billing errors.
        </p>
        <p>
          If your account balance reaches zero, API requests may be rejected until credits are added.
          You are responsible for monitoring your balance and usage.
        </p>
      </ContentSection>

      <ContentSection title="6. Acceptable Use">
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Violate any applicable law or regulation</li>
          <li>Generate illegal, harmful, abusive, or deceptive content</li>
          <li>Infringe intellectual property or privacy rights of others</li>
          <li>Attempt to bypass rate limits, security measures, or access controls</li>
          <li>Reverse engineer, scrape, or probe the Service infrastructure</li>
          <li>Resell access to the Service without written authorization from Softix</li>
          <li>Generate content that violates upstream provider acceptable use policies</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate accounts that violate these rules without refund.
        </p>
      </ContentSection>

      <ContentSection title="7. Service Availability">
        <p>
          We strive for high availability but do not guarantee uninterrupted service. Upstream provider
          outages, maintenance windows, and force majeure events may affect availability. See our{" "}
          <a href="/status" className="text-primary hover:underline">
            Status page
          </a>{" "}
          for current system health. We are not liable for downtime caused by third-party providers.
        </p>
      </ContentSection>

      <ContentSection title="8. Intellectual Property">
        <p>
          Softix retains all rights to the Service, including software, documentation, branding, and
          infrastructure. You retain ownership of your input data and generated outputs, subject to
          upstream provider terms. By using the Service, you grant Softix a limited license to process
          your requests solely to provide the Service.
        </p>
      </ContentSection>

      <ContentSection title="9. Disclaimer of Warranties">
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
          IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE
          DO NOT WARRANT THAT AI MODEL OUTPUTS WILL BE ACCURATE, COMPLETE, OR SUITABLE FOR ANY PURPOSE.
        </p>
      </ContentSection>

      <ContentSection title="10. Limitation of Liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, SOFTIX SHALL NOT BE LIABLE FOR ANY INDIRECT,
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR
          GOODWILL. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THESE TERMS OR THE SERVICE SHALL NOT
          EXCEED THE AMOUNT YOU PAID TO SOFTIX IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
        </p>
      </ContentSection>

      <ContentSection title="11. Indemnification">
        <p>
          You agree to indemnify and hold harmless Softix from any claims, damages, or expenses arising
          from your use of the Service, violation of these Terms, or infringement of third-party rights.
        </p>
      </ContentSection>

      <ContentSection title="12. Termination">
        <p>
          You may close your account at any time. We may suspend or terminate your access for violation
          of these Terms, non-payment, or at our discretion with notice. Upon termination, your right to
          use the Service ceases immediately. Provisions that by nature should survive termination
          (billing obligations, liability limits, indemnification) will survive.
        </p>
      </ContentSection>

      <ContentSection title="13. Governing Law">
        <p>
          These Terms are governed by the laws of India, without regard to conflict of law principles.
          Disputes shall be subject to the exclusive jurisdiction of courts in India, unless otherwise
          required by applicable consumer protection law.
        </p>
      </ContentSection>

      <ContentSection title="14. Changes to Terms">
        <p>
          We may modify these Terms at any time. Material changes will be notified via email or Service
          notice at least 14 days before taking effect. Continued use after the effective date constitutes
          acceptance.
        </p>
      </ContentSection>

      <ContentSection title="15. Contact">
        <p>
          Questions about these Terms? Contact us at{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-primary hover:underline font-mono text-label-sm">
            {SITE.contactEmail}
          </a>
          .
        </p>
      </ContentSection>
    </ContentPage>
  );
}
