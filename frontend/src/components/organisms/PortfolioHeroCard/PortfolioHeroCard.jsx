import { BlurBlob, Button } from "@/components/atoms";
import { HeroBadge, StatsRow } from "@/components/molecules";

/**
 * PortfolioHeroCard — the shared dark gradient hero card used by all four
 * portfolio sub-pages (Income, Expenses, Budget, My Blogs).
 *
 * Replaces 4 copies of identical markup (~60 lines each).
 *
 * @param {{
 *   title: string,
 *   description: string,
 *   backHref?: string,
 *   backLabel?: string,
 *   stats: Array<{ value: React.ReactNode, label: string, valueClassName?: string }>,
 *   actionLabel: string,
 *   onAction: () => void,
 *   actionIcon?: string,
 *   className?: string,
 * }} props
 *
 * @example
 * <PortfolioHeroCard
 *   title="Income"
 *   description="Track received income…"
 *   backHref="/portfolio"
 *   stats={[
 *     { value: 12, label: "Records" },
 *     { value: "$4,200", label: "Visible Total", valueClassName: "text-cyan-300" },
 *     { value: "Jul 3", label: "Last Entry", valueClassName: "text-amber-300" },
 *   ]}
 *   actionLabel="Add Income"
 *   actionIcon="➕"
 *   onAction={() => setIsFormOpen(true)}
 * />
 */
export function PortfolioHeroCard({
  title,
  description,
  backHref = "/portfolio",
  backLabel,
  stats = [],
  actionLabel,
  onAction,
  actionIcon = "➕",
  className = "",
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-8 text-white shadow-xl md:p-10 ${className}`}
    >
      {/* Decorative blobs */}
      <BlurBlob className="absolute -right-10 -top-10 h-48 w-48 bg-emerald-500/20 blur-3xl" />
      <BlurBlob className="absolute -left-10 -bottom-10 h-48 w-48 bg-teal-500/20 blur-3xl" />

      {/* Title row */}
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <HeroBadge href={backHref}>{backLabel ?? "← Portfolio"}</HeroBadge>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            {title}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-emerald-100/80">
            {description}
          </p>
        </div>

        {actionLabel && (
          <Button
            variant="hero"
            type="button"
            onClick={onAction}
            className="self-start md:self-center"
          >
            {actionIcon && <span>{actionIcon}</span>}
            {actionLabel}
          </Button>
        )}
      </div>

      {/* Stats row */}
      {stats.length > 0 && (
        <StatsRow stats={stats} variant="dark" />
      )}
    </section>
  );
}
