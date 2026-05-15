import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
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
    default: "SAPI — One API. Every model. Zero overhead.",
    template: "%s — SAPI",
  },
  description:
    "Universal OpenAI-compatible gateway with intelligent key pooling, automatic failover, and real-time credit tracking. Pay only for what you use.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SAPI",
    title: "SAPI — One API. Every model. Zero overhead.",
    description:
      "Universal OpenAI-compatible gateway with intelligent key pooling and real-time credit tracking.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

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
          <Navbar />
          {children}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
