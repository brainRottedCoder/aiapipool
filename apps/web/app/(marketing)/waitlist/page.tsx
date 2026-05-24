"use client";

import "../landing.css";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { SITE } from "@/lib/constants";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    // TODO: wire to backend / email service
    await new Promise((r) => setTimeout(r, 900));
    setStatus("done");
  };

  return (
    <div className="landing-root min-h-screen flex flex-col text-white">
      <div className="landing-noise" />

      {/* Subtle bg glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(800px,90vw)] h-[500px] opacity-25"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(154,203,255,0.35) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Minimal nav */}
      <header className="relative z-20 flex items-center justify-between max-w-6xl mx-auto w-full px-6 pt-6 pb-4">
        <Link href="/" aria-label="Back to home">
          <Logo />
        </Link>
        <Link
          href="/"
          className="text-[13px] text-white/40 hover:text-white/70 transition-colors tracking-wide"
        >
          ← Back
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          {status === "done" ? (
            <SuccessState email={email} />
          ) : (
            <FormState
              email={email}
              message={message}
              setEmail={setEmail}
              setMessage={setMessage}
              onSubmit={handleSubmit}
              loading={status === "loading"}
            />
          )}
        </div>
      </main>

      {/* Footer line */}
      <footer className="relative z-20 text-center pb-8">
        <p className="text-[11px] tracking-[3px] uppercase text-white/20">
          {SITE.name} · {SITE.tagline}
        </p>
      </footer>
    </div>
  );
}

/* ── Form ── */
function FormState({
  email,
  message,
  setEmail,
  setMessage,
  onSubmit,
  loading,
}: {
  email: string;
  message: string;
  setEmail: (v: string) => void;
  setMessage: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}) {
  return (
    <>
      {/* Badge */}
      <div className="flex items-center gap-2 mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-[#9acbff]" style={{ animation: "sapi-pulse 2s ease-in-out infinite" }} />
        <span className="text-[11px] tracking-[4px] uppercase text-[rgba(154,203,255,0.6)]">
          Early Access
        </span>
      </div>

      <h1 className="font-display text-4xl md:text-5xl font-medium leading-[1.05] mb-4 text-white">
        Join the waitlist.
      </h1>
      <p className="text-base text-white/40 font-light leading-relaxed mb-10">
        Be the first to access the SOFTIX gateway — one API for every AI model,
        plus an agent data layer that&apos;s launching soon. We&apos;ll reach out as
        soon as your spot is ready.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-[11px] tracking-[3px] uppercase text-white/35 mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="waitlist-input"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-[11px] tracking-[3px] uppercase text-white/35 mb-2">
            What are you building? <span className="normal-case tracking-normal text-white/20">(optional)</span>
          </label>
          <textarea
            id="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us a bit about your use case — we read every response."
            className="waitlist-input resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="waitlist-btn w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
              Securing your spot…
            </span>
          ) : (
            "Request Early Access →"
          )}
        </button>
      </form>

      <p className="mt-6 text-[11px] text-white/25 tracking-wide text-center">
        No spam. No credit card. We&apos;ll only email you about your access.
      </p>
    </>
  );
}

/* ── Success ── */
function SuccessState({ email }: { email: string }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-full bg-[rgba(154,203,255,0.1)] border border-[rgba(154,203,255,0.2)] flex items-center justify-center mx-auto mb-8">
        <svg className="w-6 h-6 text-[#9acbff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="font-display text-4xl md:text-5xl font-medium mb-4 text-white">
        You&apos;re on the list.
      </h1>
      <p className="text-base text-white/40 font-light leading-relaxed mb-2">
        We&apos;ve noted{" "}
        <span className="font-mono text-[13px] text-[rgba(154,203,255,0.7)]">{email}</span>.
      </p>
      <p className="text-base text-white/35 font-light leading-relaxed mb-10">
        We&apos;ll reach out personally when your spot is ready. Until then, explore the docs.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/docs"
          className="inline-block px-7 py-3 rounded-full bg-[#9acbff] text-[#0a0a0b] font-bold text-sm tracking-wide hover:opacity-90 transition-opacity no-underline"
        >
          Browse Docs →
        </Link>
        <Link
          href="/"
          className="inline-block px-7 py-3 rounded-full border border-white/20 text-white font-bold text-sm tracking-wide hover:bg-white/[0.05] transition-colors no-underline"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
