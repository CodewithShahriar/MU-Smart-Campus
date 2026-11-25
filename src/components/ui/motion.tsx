import { type HTMLAttributes, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Tracks cursor coordinates to render a subtle radial spotlight glow on hover.
 */
export function SpotlightCard({
  children,
  className,
  glowColor = "oklch(0.62 0.18 250 / 0.16)",
  ...props
}: HTMLAttributes<HTMLDivElement> & { glowColor?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1,
    });
    props.onMouseMove?.(e);
  };

  const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setPos((prev) => ({ ...prev, opacity: 0 }));
    props.onMouseLeave?.(e);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
        style={{
          opacity: pos.opacity,
          background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, ${glowColor}, transparent 60%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

/**
 * Smoothly animates numeric values using ease-out cubic interpolation.
 */
export function AnimatedNumber({
  value,
  duration = 700,
  suffix = "",
  prefix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = Number.isFinite(value) ? value : 0;
    if (start === end) {
      setDisplay(end);
      return;
    }

    let raf = 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        prevRef.current = end;
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/**
 * Animated loading skeleton for portal shells.
 */
export function PortalSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded-full bg-muted animate-pulse" />
        <div className="h-9 w-64 rounded-xl bg-muted animate-pulse" />
        <div className="h-4 w-80 rounded-lg bg-muted/70 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3"
          >
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            <div className="h-7 w-16 rounded-lg bg-muted animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-44 rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4"
          >
            <div className="size-11 rounded-xl bg-muted animate-pulse" />
            <div className="h-5 w-36 rounded bg-muted animate-pulse" />
            <div className="h-4 w-full rounded bg-muted/70 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Live pulsing badge indicator.
 */
export function LivePill({
  children,
  tone = "success",
  className,
}: {
  children: ReactNode;
  tone?: "success" | "primary" | "warning";
  className?: string;
}) {
  const dotMap = {
    success: "bg-success",
    primary: "bg-primary",
    warning: "bg-warning",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/75 px-3 py-1.5 text-xs font-medium backdrop-blur-md shadow-xs",
        className,
      )}
    >
      <span className="relative flex size-2">
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            dotMap[tone],
          )}
        />
        <span className={cn("relative inline-flex size-2 rounded-full", dotMap[tone])} />
      </span>
      {children}
    </div>
  );
}
