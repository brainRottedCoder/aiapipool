"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ChevronRight, Bell, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function breadcrumbs(path: string) {
  if (path === "/dashboard") return [{ label: "Dashboard", href: "/dashboard" }];
  const segments = path.split("/").filter(Boolean);
  return segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    return { label: seg.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), href };
  });
}

export function DashboardHeader() {
  const pathname = usePathname() ?? "/dashboard";
  const { data: session } = useSession();
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
        <button className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-hover transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-hover transition-colors">
              <Avatar className="w-7 h-7">
                <AvatarImage src={session?.user?.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {session?.user?.name?.charAt(0)?.toUpperCase() ??
                    session?.user?.email?.charAt(0)?.toUpperCase() ??
                    "U"}
                </AvatarFallback>
              </Avatar>
              <span className="font-sans text-body-md text-on-surface hidden sm:block">
                {session?.user?.name ?? session?.user?.email ?? "User"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={session?.user?.image ?? undefined} />
                <AvatarFallback>
                  {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-body-md font-medium text-on-surface">
                  {session?.user?.name ?? "User"}
                </span>
                <span className="text-label-sm text-on-surface-variant truncate max-w-[140px]">
                  {session?.user?.email}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
