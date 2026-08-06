import { StatTile } from "@/components/atoms";

/**
 * StatsRow — a responsive 3-column grid of StatTile atoms.
 * Shared by all 4 portfolio hero cards and the main portfolio dashboard.
 *
 * @param {{
 *   stats: Array<{
 *     value: React.ReactNode,
 *     label: string,
 *     valueClassName?: string,
 *   }>,
 *   variant?: 'dark'|'light'|'footer',
 *   colSpanLast?: boolean,
 *   className?: string,
 * }} props
 *
 * `colSpanLast` — when true the third tile spans 2 cols on mobile (col-span-2 sm:col-span-1)
 * which matches the portfolio hero card pattern exactly.
 */
export function StatsRow({ stats = [], variant = "dark", colSpanLast = true, className = "" }) {
  return (
    <div
      className={`mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-3 ${className}`}
    >
      {stats.map((stat, index) => {
        const isLast = index === stats.length - 1;
        const tileClassName = isLast && colSpanLast ? "col-span-2 sm:col-span-1" : "";
        return (
          <StatTile
            key={stat.label}
            value={stat.value}
            label={stat.label}
            variant={variant}
            valueClassName={stat.valueClassName ?? ""}
            className={tileClassName}
          />
        );
      })}
    </div>
  );
}
