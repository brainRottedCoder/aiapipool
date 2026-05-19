"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useState } from "react";

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    // In a real app, call API to update profile
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Profile updated");
    }, 500);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Profile</h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          Manage your public profile information.
        </p>
      </div>

      <Card className="card-panel">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={session?.user?.image ?? undefined} />
              <AvatarFallback className="text-lg">
                {session?.user?.name?.charAt(0)?.toUpperCase() ??
                  session?.user?.email?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-sans text-body-lg text-on-surface font-medium">
                {session?.user?.name ?? "User"}
              </p>
              <p className="font-sans text-body-md text-on-surface-variant">
                {session?.user?.email}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={session?.user?.email ?? ""} disabled />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
