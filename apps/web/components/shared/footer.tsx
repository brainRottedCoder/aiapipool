import Link from "next/link";
import { SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-outline-subtle bg-background">
      <div className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-sans font-semibold text-body-md text-on-surface mb-4">Product</h4>
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
                    className="text-on-surface-variant text-body-md hover:text-on-surface transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-semibold text-body-md text-on-surface mb-4">Docs</h4>
            <ul className="space-y-2">
              {[
                { label: "Quickstart", href: "/docs/quickstart" },
                { label: "API Reference", href: "/docs/api-reference" },
                { label: "SDKs", href: "/docs/sdks" },
                { label: "Authentication", href: "/docs" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-on-surface-variant text-body-md hover:text-on-surface transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-semibold text-body-md text-on-surface mb-4">Company</h4>
            <ul className="space-y-2">
              {[
                { label: "About", href: "#" },
                { label: "Blog", href: "#" },
                { label: "Contact", href: "/help/contact" },
                { label: "Twitter", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-on-surface-variant text-body-md hover:text-on-surface transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-semibold text-body-md text-on-surface mb-4">Legal</h4>
            <ul className="space-y-2">
              {[
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Security", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-on-surface-variant text-body-md hover:text-on-surface transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-outline-subtle flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-on-surface-variant text-body-md">
            &copy; {new Date().getFullYear()} {SITE.name}. Built for developers.
          </p>
          <p className="text-on-surface-variant text-body-md font-mono text-label-sm">
            Powered by Softix
          </p>
        </div>
      </div>
    </footer>
  );
}
