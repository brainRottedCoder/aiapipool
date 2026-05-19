import Link from "next/link";

export default function ChangelogPage() {
  const entries = [
    { date: "May 2024", title: "Initial Launch", desc: "SAPI v1.0 — OpenAI-compatible chat completions, 6 providers, key pool management." },
    { date: "June 2024", title: "Streaming Support", desc: "Full SSE streaming with real-time credit tracking and mid-stream balance enforcement." },
    { date: "July 2024", title: "Dashboard Beta", desc: "User dashboard with usage analytics, billing, and API key management." },
  ];

  return (
    <main className="pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-narrow mx-auto min-h-screen">
      <h1 className="font-sans text-headline-xl mb-4">Changelog</h1>
      <p className="font-sans text-body-lg text-on-surface-variant mb-12">Product updates, new models, and feature announcements.</p>
      <div className="space-y-8">
        {entries.map((entry) => (
          <div key={entry.title} className="border-l-2 border-primary/30 pl-6 pb-8">
            <div className="font-mono text-label-sm text-primary mb-1">{entry.date}</div>
            <h2 className="font-sans text-headline-md text-on-surface mb-2">{entry.title}</h2>
            <p className="font-sans text-body-md text-on-surface-variant">{entry.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
