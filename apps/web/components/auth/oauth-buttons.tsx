"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github, Chrome } from "lucide-react";

export function OAuthButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
      >
        <Github className="w-4 h-4 mr-2" />
        GitHub
      </Button>
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        <Chrome className="w-4 h-4 mr-2" />
        Google
      </Button>
    </div>
  );
}
