"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Key,
  GitBranch,
  TrendingUp,
  ScrollText,
  HeartPulse,
  AlertTriangle,
  Activity,
  ChevronLeft,
  Shield,
} from "lucide-react";
import { ADMIN_SIDEBAR } from "@/lib/constants";
import { Logo, LogoSmall } from "@/components/shared/logo";
import { useState } from "react";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  Key,
  GitBranch,
  TrendingUp,
  ScrollText,
  HeartPulse,
  AlertTriangle,
  Activity,
  Shield,
};

export function AdminSidebar() {
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen border-r border-outline-subtle bg-background z-40 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("px-4 pt-4 pb-2", collapsed && "px-2")}>
        {collapsed ? (
          <div className="flex justify-center">
            <LogoSmall />
          </div>
        ) : (
          <div>
            <Logo />
            <div className="mt-4 px-3 py-2 rounded border border-outline-subtle bg-surface flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-mono text-label-sm text-on-surface">Admin Panel</span>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto flex flex-col gap-1 px-2 mt-4">
        {ADMIN_SIDEBAR.map((section) => (
          <div key={section.section} className="mb-4">
            {!collapsed && (
              <p className="px-3 mb-2 font-mono text-label-sm font-black uppercase tracking-widest text-primary/60">
                {section.section}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 font-mono text-label-sm",
                    isActive
                      ? "bg-primary/10 text-primary border-l-4 border-primary"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-hover border-l-4 border-transparent",
                    collapsed && "justify-center px-0"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-2 pb-4 pt-2 border-t border-outline-subtle">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-2 px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-hover rounded-lg transition-colors font-mono text-label-sm"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
