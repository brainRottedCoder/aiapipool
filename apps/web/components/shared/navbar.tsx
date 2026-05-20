"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname() ?? "";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/settings") || pathname.startsWith("/admin");
  const isLanding = pathname === "/";
  if (isDashboard) return null;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          isScrolled
            ? isLanding
              ? "bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/[0.06]"
              : "bg-background/80 backdrop-blur-xl border-b border-outline-subtle"
            : "bg-transparent"
        )}
      >
        <div className="flex justify-between items-center max-w-content mx-auto px-margin-mobile md:px-margin-desktop h-16">
          <div className="flex items-center gap-8">
            <Logo />
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.slice(0, 6).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "font-sans text-body-md transition-colors duration-200",
                    pathname === link.href
                      ? isLanding ? "text-[#9acbff] font-medium" : "text-primary font-medium"
                      : isLanding ? "text-white/60 hover:text-white" : "text-on-surface-variant hover:text-on-surface",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                "hidden md:flex font-sans text-body-md transition-colors",
                isLanding ? "text-white/60 hover:text-white" : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              Sign in
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" className="hidden md:flex">
                Get Started
              </Button>
            </Link>
            <button
              className="md:hidden p-2 text-on-surface-variant hover:text-on-surface"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-72 bg-background border-l border-outline-subtle p-6 pt-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "font-sans text-body-lg py-2 transition-colors",
                      pathname === link.href
                        ? "text-primary font-medium"
                        : "text-on-surface-variant hover:text-on-surface"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="border-outline-subtle my-2" />
                <Link href="/login">
                  <Button variant="secondary" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
