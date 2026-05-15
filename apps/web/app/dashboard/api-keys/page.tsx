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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Copy, Check, Trash2, Eye } from "lucide-react";

export default function ApiKeysPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const keys = [
    { id: "1", name: "Production", prefix: "sk_live_abcd", lastUsed: "2 min ago", status: "active", usage: "847 req" },
    { id: "2", name: "Development", prefix: "sk_live_efgh", lastUsed: "1 hour ago", status: "active", usage: "340 req" },
    { id: "3", name: "Cursor Integration", prefix: "sk_live_ijkl", lastUsed: "3 days ago", status: "active", usage: "60 req" },
  ];

  const createKey = () => {
    setNewKey("sk_live_" + Array(32).fill(0).map(() => Math.random().toString(36)[2]).join(""));
    setShowCreate(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">API Keys</h1>
          <p className="font-sans text-body-md text-on-surface-variant">Manage your API keys for programmatic access.</p>
        </div>
        <Button variant="primary" onClick={createKey}>
          <Plus className="w-4 h-4" />
          Create Key
        </Button>
      </div>

      {keys.map((key) => (
        <Card key={key.id} className="card-panel-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-sans text-headline-md text-on-surface">{key.name}</h3>
                  <Badge variant="success" className="text-xs">active</Badge>
                </div>
                <p className="font-mono text-code-md text-on-surface-variant">{key.prefix}...{key.prefix.slice(-4)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/api-keys/${key.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-6 mt-3 text-body-md text-on-surface-variant">
              <span>Last used: {key.lastUsed}</span>
              <span>{key.usage}</span>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
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
                if (newKey) {
                  navigator.clipboard.writeText(newKey);
                  setCopied("key");
                  setTimeout(() => setCopied(null), 2000);
                }
              }}
              className="p-2 hover:bg-surface-hover rounded transition-colors shrink-0"
            >
              {copied === "key" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-on-surface-variant" />}
            </button>
          </div>
          <DialogFooter>
            <Button variant="primary" onClick={() => setShowCreate(false)}>
              I&apos;ve saved my key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
