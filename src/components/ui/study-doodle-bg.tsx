import { cn } from "@/lib/utils";

/**
 * Subtle, spacious study-themed hairline SVG doodle pattern for backgrounds.
 */
export function StudyDoodleBg({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden text-slate-800/[0.09] dark:text-slate-200/[0.07]",
        "[mask-image:radial-gradient(ellipse_at_center,black_65%,transparent_100%)]",
        className,
      )}
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="mu-study-doodles" width="420" height="420" patternUnits="userSpaceOnUse">
            {/* Open Book */}
            <g
              transform="translate(48 44) rotate(-10) scale(1.4)"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 5.5A3.5 3.5 0 0 1 5.5 2H11v15H5.5A3.5 3.5 0 0 0 2 20.5V5.5Z" />
              <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H11v15h5.5a3.5 3.5 0 0 1 3.5 3.5V5.5Z" />
            </g>

            {/* Graduation Cap */}
            <g
              transform="translate(268 58) rotate(8) scale(1.45)"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 4 2 9l10 5 10-5-10-5Z" />
              <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
              <path d="M22 9v5" />
            </g>

            {/* Calendar / Schedule */}
            <g
              transform="translate(88 250) rotate(-7) scale(1.35)"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="17" rx="2.5" />
              <path d="M8 2v4M16 2v4M3 9.5h18" />
              <path d="M8 14h2M13 14h3M8 17.5h4" />
            </g>

            {/* Lightbulb */}
            <g
              transform="translate(292 268) rotate(12) scale(1.4)"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18h6" />
              <path d="M10 21h4" />
              <path d="M12 2a6 6 0 0 0-4 10.5c.6.6 1 1.5 1 2.5h6c0-1 .4-1.9 1-2.5A6 6 0 0 0 12 2Z" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mu-study-doodles)" />
      </svg>
    </div>
  );
}
