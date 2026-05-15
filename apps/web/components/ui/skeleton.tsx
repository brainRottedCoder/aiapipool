import { cn } from "@/lib/utils";
import * as React from "react";

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { shimmer?: boolean }
>(({ className, shimmer = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded bg-surface-hover animate-pulse",
      shimmer && "relative overflow-hidden",
      className
    )}
    {...props}
  />
));
Skeleton.displayName = "Skeleton";

function CardSkeleton() {
  return (
    <div className="bg-background-elevated border border-outline-subtle rounded-lg p-6 space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-[300px] w-full rounded-lg" />;
}

function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

export { CardSkeleton, ChartSkeleton, PageSkeleton, Skeleton, TableSkeleton };
