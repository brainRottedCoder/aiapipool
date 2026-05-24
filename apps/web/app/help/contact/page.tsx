"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { SITE } from "@/lib/constants";

export default function ContactPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Ticket submitted. We'll respond within 24 hours.");
      setSubject(""); setMessage("");
    }, 1000);
  };

  return (
    <main className="pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-narrow mx-auto min-h-screen">
      <h1 className="font-sans text-headline-xl mb-4">Contact Support</h1>
      <p className="font-sans text-body-lg text-on-surface-variant mb-8">
        Submit a ticket and our team will get back to you within 24 hours.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="card-panel">
            <CardContent className="p-6 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue in detail..."
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? "Submitting..." : "Submit Ticket"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="card-panel">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-sans text-body-md font-medium text-on-surface">Email</p>
                  <p className="font-mono text-label-sm text-on-surface-variant">
                    <a href={`mailto:${SITE.contactEmail}`} className="hover:text-primary transition-colors">
                      {SITE.contactEmail}
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
