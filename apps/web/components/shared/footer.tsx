"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Footer() {
  const pathname = usePathname() ?? "";
  const isLanding = pathname === "/";

  return (
    <footer
      className={cn(
        "border-t",
        isLanding
          ? "border-white/[0.05] bg-[#0a0a0b] text-white"
          : "border-outline-subtle bg-background",
      )}
    >
      <div className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className={cn("font-sans font-semibold text-body-md mb-4", isLanding ? "text-white" : "text-on-surface")}>Product</h4>
            <ul className="space-y-2">
              {[
                { label: "API Reference", href: "/docs/api-reference" },
                { label: "Pricing", href: "/pricing" },
                { label: "Models", href: "/models" },
                { label: "Status", href: "/status" },
                { label: "Changelog", href: "/changelog" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-body-md transition-colors",
                      isLanding ? "text-white/50 hover:text-white" : "text-on-surface-variant hover:text-on-surface",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className={cn("font-sans font-semibold text-body-md mb-4", isLanding ? "text-white" : "text-on-surface")}>Docs</h4>
            <ul className="space-y-2">
              {[
                { label: "Quickstart", href: "/docs/quickstart" },
                { label: "API Reference", href: "/docs/api-reference" },
                { label: "SDKs", href: "/docs/sdks" },
                { label: "Authentication", href: "/docs#authentication" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-body-md transition-colors",
                      isLanding ? "text-white/50 hover:text-white" : "text-on-surface-variant hover:text-on-surface",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className={cn("font-sans font-semibold text-body-md mb-4", isLanding ? "text-white" : "text-on-surface")}>Company</h4>
            <ul className="space-y-2">
              {[
                { label: "About", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Contact", href: "/help/contact" },
                { label: "Twitter", href: "https://x.com/softix_in",external: true },
              ].map((link) => (
                <li key={link.label}> 
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "text-body-md transition-colors",
                        isLanding ? "text-white/50 hover:text-white" : "text-on-surface-variant hover:text-on-surface",
                      )}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        "text-body-md transition-colors",
                        isLanding ? "text-white/50 hover:text-white" : "text-on-surface-variant hover:text-on-surface",
                      )}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className={cn("font-sans font-semibold text-body-md mb-4", isLanding ? "text-white" : "text-on-surface")}>Legal</h4>
            <ul className="space-y-2">
              {[
                { label: "Privacy Policy", href: "/legal/privacy" },
                { label: "Terms of Service", href: "/legal/terms" },
                { label: "Security", href: "/security" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-body-md transition-colors",
                      isLanding ? "text-white/50 hover:text-white" : "text-on-surface-variant hover:text-on-surface",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={cn("mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4", isLanding ? "border-white/[0.05]" : "border-outline-subtle")}>
          <p className={cn("text-body-md", isLanding ? "text-white/40" : "text-on-surface-variant")}>
            &copy; {new Date().getFullYear()} {SITE.name}. Built for developers.
          </p>
          <p className={cn("text-body-md font-mono text-label-sm", isLanding ? "text-white/40" : "text-on-surface-variant")}>
            Powered by Softix
          </p>
        </div>
      </div>
    </footer>
  );
}
