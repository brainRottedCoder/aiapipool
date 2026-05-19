"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Shield, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

function breadcrumbs(path: string) {
  if (path === "/admin") return [{ label: "Admin", href: "/admin" }];
  const segments = path.split("/").filter(Boolean);
  return segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    return { label: seg.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), href };
  });
}

export function AdminHeader() {
  const pathname = usePathname() ?? "/admin";
  const crumbs = breadcrumbs(pathname);

  return (
    <header className="h-16 border-b border-outline-subtle flex items-center justify-between px-8 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="w-4 h-4" />}
            <Link
              href={crumb.href}
              className="hover:text-on-surface transition-colors capitalize"
            >
              {crumb.label}
            </Link>
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded border border-outline-subtle bg-surface">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-label-sm text-on-surface-variant">Admin</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="p-2 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-400/10 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
