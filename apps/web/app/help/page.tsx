import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, MessageCircle, Bug, BookOpen } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Help Center</h1>
        <p className="font-sans text-body-md text-on-surface-variant">Find answers, get support, and debug issues.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Documentation", desc: "Full docs, quickstart, and API reference.", icon: BookOpen, href: "/docs" },
          { title: "Contact Support", desc: "Open a ticket with our support team.", icon: MessageCircle, href: "/help/contact" },
          { title: "Debug Logging", desc: "Enable opt-in content logging for troubleshooting.", icon: Bug, href: "/help/debug" },
          { title: "FAQ", desc: "Frequently asked questions about SAPI.", icon: HelpCircle, href: "#" },
        ].map((item) => (
          <Link key={item.title} href={item.href} className="card-panel-hover rounded-lg p-6 group transition-all">
            <div className="flex items-start gap-4">
              <item.icon className="w-6 h-6 text-primary mt-0.5" />
              <div>
                <h3 className="font-sans text-headline-md text-on-surface group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="font-sans text-body-md text-on-surface-variant mt-1">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
