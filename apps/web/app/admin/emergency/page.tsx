"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, ShieldAlert, RefreshCw } from "lucide-react";

export default function AdminEmergencyPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Emergency Controls</h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          Critical operations. These actions impact live traffic and require confirmation.
        </p>
      </div>

      <Card className="card-panel border-red-500/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="font-sans text-headline-md">Drain Provider</h2>
          </div>
          <p className="font-sans text-body-md text-on-surface-variant">
            Move all traffic away from a specific provider. Sets all keys to ROTATING status.
          </p>
          <select className="input-dark w-full max-w-xs">
            <option>OpenAI</option>
            <option>Anthropic</option>
            <option>OpenRouter</option>
            <option>Together AI</option>
            <option>Groq</option>
            <option>Gemini</option>
          </select>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <ShieldAlert className="w-4 h-4" />
                Drain Provider
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Emergency Action</DialogTitle>
                <DialogDescription>
                  This will immediately stop all traffic to the selected provider. Affected requests will be routed to alternative keys. Are you sure?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="secondary">Cancel</Button>
                <Button variant="destructive">Confirm Drain</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card className="card-panel border-red-500/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            <h2 className="font-sans text-headline-md">Force Rotate All Keys</h2>
          </div>
          <p className="font-sans text-body-md text-on-surface-variant">
            Archive all provider keys for the selected provider and force rotation. This is a nuclear option.
          </p>
          <select className="input-dark w-full max-w-xs">
            <option>OpenAI</option>
            <option>Anthropic</option>
            <option>OpenRouter</option>
            <option>Together AI</option>
            <option>Groq</option>
            <option>Gemini</option>
          </select>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <RefreshCw className="w-4 h-4" />
                Force Rotate All Keys
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Force Rotation</DialogTitle>
                <DialogDescription>
                  This will archive ALL keys for the selected provider and log a CRITICAL event. Recovery requires provisioning new keys. Type &quot;CONFIRM&quot; to proceed.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="secondary">Cancel</Button>
                <Button variant="destructive">Confirm Force Rotate</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
