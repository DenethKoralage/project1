import Link from "next/link";

/**
 * HeroBadge — the "← Label" pill link that appears at the top-left of every
 * portfolio sub-page hero card, linking back to a parent route.
 *
 * @param {{
 *   href: string,
 *   children?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export function HeroBadge({ href, children = "← Portfolio", className = "" }) {
  return (
    <Link
      href={href}
      className={`inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200 transition hover:bg-emerald-500/30 ${className}`}
    >
      {children}
    </Link>
  );
}
