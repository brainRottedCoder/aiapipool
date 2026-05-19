"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateApiKey } from "@/hooks/use-api-keys";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { toast } from "sonner";
import { ArrowLeft, Copy, Check, Key, Shield } from "lucide-react";

export default function CreateApiKeyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [rawKey, setRawKey] = useState<string | null>(null);
  const createKey = useCreateApiKey();
  const { copied, copy } = useCopyToClipboard();

  const handleCreate = () => {
    createKey.mutate(name, {
      onSuccess: (data) => {
        setRawKey(data.raw_key);
        toast.success("API key created successfully");
      },
      onError: () => toast.error("Failed to create API key"),
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/api-keys">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-sans text-headline-xl mb-1">Create API Key</h1>
          <p className="font-sans text-body-md text-on-surface-variant">Generate a new key for programmatic access.</p>
        </div>
      </div>

      {!rawKey ? (
        <Card className="card-panel max-w-lg">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Key Name</Label>
              <Input
                id="name"
                placeholder="Production, Development, etc."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="font-sans text-body-md text-on-surface-variant">
                This helps you identify the key later. It does not affect functionality.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Link href="/dashboard/api-keys">
                <Button variant="secondary">Cancel</Button>
              </Link>
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={createKey.isPending || !name.trim()}
              >
                {createKey.isPending ? "Creating..." : "Create Key"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-panel border-primary/30 max-w-lg">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-sans text-headline-md text-on-surface">API Key Created</h3>
                <p className="font-sans text-body-md text-on-surface-variant">
                  Copy this key now. You won&apos;t be able to see it again.
                </p>
              </div>
            </div>
            <div className="bg-[#070708] border border-outline-subtle rounded-lg p-4 flex items-center justify-between gap-4">
              <code className="font-mono text-code-md text-on-surface break-all">{rawKey}</code>
              <button
                onClick={() => copy(rawKey)}
                className="p-2 hover:bg-surface-hover rounded transition-colors shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-on-surface-variant" />
                )}
              </button>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-400/5 border border-yellow-400/20">
              <Key className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <p className="font-sans text-body-md text-yellow-400/80">
                Store this key securely. It is only shown once. If you lose it, you will need to generate a new one.
              </p>
            </div>
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => router.push("/dashboard/api-keys")}>
                I&apos;ve Saved My Key
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
