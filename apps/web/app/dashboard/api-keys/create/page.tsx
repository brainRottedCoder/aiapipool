"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Copy, Check, ArrowLeft } from "lucide-react";

export default function CreateApiKeyPage() {
  const [name, setName] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    setNewKey("sk_live_" + Array(32).fill(0).map(() => Math.random().toString(36)[2]).join(""));
    setShowKey(true);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <Link href="/dashboard/api-keys" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="font-mono text-label-sm">Back to API Keys</span>
      </Link>
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Create API Key</h1>
        <p className="font-sans text-body-md text-on-surface-variant">Generate a new key for programmatic access to SAPI.</p>
      </div>
      <Card className="card-panel">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Key Name (Optional)</label>
            <Input
              placeholder="e.g., Production, Development"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Generate Key
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showKey} onOpenChange={setShowKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy your API key now. You won&apos;t be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-surface border border-outline-subtle rounded-lg p-4 flex items-center justify-between">
            <code className="font-mono text-code-md text-on-surface break-all">{newKey}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newKey);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-2 hover:bg-surface-hover rounded shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-on-surface-variant" />}
            </button>
          </div>
          <DialogFooter>
            <Link href="/dashboard/api-keys">
              <Button variant="primary">I&apos;ve saved my key</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
