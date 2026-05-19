"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient, ENDPOINTS } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertTriangle, RotateCcw, PowerOff } from "lucide-react";
import { toast } from "sonner";

export default function AdminEmergencyPage() {
  const [drainProvider, setDrainProvider] = useState("");

  const drainMutation = useMutation({
    mutationFn: (provider: string) =>
      apiClient.post(ENDPOINTS.admin.emergencyDrain, { provider }),
    onSuccess: () => toast.success(`Drained provider: ${drainProvider}`),
    onError: () => toast.error("Failed to drain provider"),
  });

  const rotateMutation = useMutation({
    mutationFn: (provider: string) =>
      apiClient.post(ENDPOINTS.admin.emergencyRotate, { provider }),
    onSuccess: () => toast.success("Rotated all keys"),
    onError: () => toast.error("Failed to rotate keys"),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Emergency Controls</h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          Nuclear options for critical situations. Use with caution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Drain Provider */}
        <Card className="card-panel border-yellow-500/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                <PowerOff className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-sans text-headline-md text-on-surface">Drain Provider</h3>
                <p className="font-sans text-body-md text-on-surface-variant">
                  Set all keys for a provider to ROTATING status.
                </p>
              </div>
            </div>
            <Input
              placeholder="Provider name (e.g., openai)"
              value={drainProvider}
              onChange={(e) => setDrainProvider(e.target.value)}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary" className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-400/10" disabled={!drainProvider.trim()}>
                  <PowerOff className="w-4 h-4 mr-2" />
                  Drain Provider
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Provider Drain</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will set ALL keys for <strong>{drainProvider}</strong> to ROTATING status. No new requests will be routed to this provider. Are you sure?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => drainMutation.mutate(drainProvider)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    Drain Provider
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Rotate All Keys */}
        <Card className="card-panel border-red-500/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-sans text-headline-md text-on-surface">Rotate All Keys</h3>
                <p className="font-sans text-body-md text-on-surface-variant">
                  Archive and replace all keys for a provider.
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary" className="w-full border-red-500/30 text-red-400 hover:bg-red-400/10">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Rotate All Keys
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Key Rotation</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will archive ALL existing provider keys and require new keys to be provisioned. This is a destructive operation. Are you absolutely sure?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => rotateMutation.mutate(drainProvider || "all")}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Rotate All Keys
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      <Card className="card-panel border-red-500/20">
        <CardContent className="p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
          <div>
            <h3 className="font-sans text-headline-md text-on-surface mb-2">Warning</h3>
            <p className="font-sans text-body-md text-on-surface-variant">
              Emergency controls are logged and audited. All actions taken on this page are recorded in the system ledger with an adjustment entry. Misuse may result in service disruption for all users.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
