"use client";

import { useState, useEffect } from "react";

/**
 * RollingNumber — animated counter that counts from 0 up to `target`.
 * Uses requestAnimationFrame with an ease-out-quad easing function.
 *
 * @param {{ target: number, duration?: number }} props
 * @returns JSX (renders a React fragment with the formatted number)
 */
export default function RollingNumber({ target, duration = 2000 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrameId;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out-quad for smooth deceleration
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      setDisplayValue(Math.floor(target * easeOutQuad));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration]);

  return <>{displayValue.toLocaleString()}</>;
}
