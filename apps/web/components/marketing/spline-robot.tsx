"use client";

import Spline from "@splinetool/react-spline";

export function SplineRobot({ className }: { className?: string }) {
  return (
    <Spline
      scene="https://prod.spline.design/KGltofj1M7QJtaaK/scene.splinecode"
      className={className}
    />
  );
}
