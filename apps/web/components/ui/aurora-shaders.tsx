"use client";

import type React from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import "./aurora-shaders.css";

export interface AuroraShadersProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number;
  intensity?: number;
  vibrancy?: number;
  frequency?: number;
  stretch?: number;
}

export const AuroraShaders = forwardRef<HTMLDivElement, AuroraShadersProps>(
  (
    {
      className,
      speed = 1.0,
      intensity = 1.0,
      vibrancy = 1.0,
      frequency = 1.0,
      stretch = 1.0,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn("aurora-root w-full h-full overflow-hidden", className)}
        style={
          {
            "--aurora-speed": `${28 / speed}s`,
            "--aurora-intensity": intensity,
            "--aurora-vibrancy": vibrancy,
            "--aurora-frequency": frequency,
            "--aurora-stretch": stretch,
            ...style,
          } as React.CSSProperties
        }
        aria-hidden
        {...props}
      >
        <div className="aurora-layer aurora-layer-1" />
        <div className="aurora-layer aurora-layer-2" />
        <div className="aurora-layer aurora-layer-3" />
        <div className="aurora-vignette" />
      </div>
    );
  },
);

AuroraShaders.displayName = "AuroraShaders";

export default AuroraShaders;
