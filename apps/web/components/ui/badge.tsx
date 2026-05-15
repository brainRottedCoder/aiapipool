import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-label-sm font-medium border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border-primary/20",
        secondary: "bg-surface-hover text-on-surface-variant border-outline-subtle",
        success: "bg-status-healthy/10 text-green-400 border-status-healthy/20",
        warning: "bg-status-degraded/10 text-yellow-400 border-status-degraded/20",
        destructive: "bg-status-down/10 text-red-400 border-status-down/20",
        outline: "bg-transparent text-on-surface-variant border-outline-subtle",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
