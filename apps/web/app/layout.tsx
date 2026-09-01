import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { SessionProvider } from "@/providers/session-provider";
import { Toaster } from "@/providers/toast-provider";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SOFTIX — One query for every agent.",
    template: "%s — SOFTIX",
  },
  description:
    "The data access layer for AI agents. Query GitHub, Linear, Datadog, Stripe, and your files through a single SQL interface over MCP — built on a battle-tested multi-provider AI gateway.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SOFTIX",
    title: "SOFTIX — One query for every agent.",
    description:
      "Query GitHub, Linear, Datadog, Stripe, and your files through a single SQL interface over MCP.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-background text-on-surface antialiased`}
        style={
          {
            "--font-inter": inter.style.fontFamily,
            "--font-mono": jetbrainsMono.style.fontFamily,
          } as React.CSSProperties
        }
      >
        <QueryProvider>
          <SessionProvider>
            <Navbar />
            {children}
            <Footer />
            <Toaster />
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
