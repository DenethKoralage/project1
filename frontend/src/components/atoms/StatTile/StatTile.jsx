/**
 * StatTile — a single stat card showing a value and label.
 *
 * @param {{
 *   value: React.ReactNode,
 *   label: string,
 *   variant?: 'dark'|'light'|'footer',
 *   valueClassName?: string,
 *   className?: string,
 * }} props
 *
 * Variants:
 *  'dark'   – white/10 glassmorphic tile on dark gradient cards  (portfolio hero cards)
 *  'light'  – white bordered card on light backgrounds           (home page stats)
 *  'footer' – coloured translucent tile inside Footer            (use className for bg color)
 */
export function StatTile({ value, label, variant = "dark", valueClassName = "", className = "" }) {
  const wrappers = {
    dark:   "rounded-2xl bg-white/10 p-4 backdrop-blur-md",
    light:  "rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm",
    footer: "rounded-2xl p-4",
  };

  const valueStyles = {
    dark:   "text-2xl font-black text-white",
    light:  "text-2xl font-bold text-slate-900 md:text-3xl",
    footer: "text-2xl font-bold text-white",
  };

  const labelStyles = {
    dark:   "mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-300",
    light:  "mt-1 text-xs font-medium uppercase tracking-widest text-slate-500",
    footer: "mt-1 text-xs uppercase tracking-[0.18em] text-slate-300",
  };

  return (
    <div className={`${wrappers[variant] ?? wrappers.dark} ${className}`}>
      <p className={`${valueStyles[variant] ?? valueStyles.dark} ${valueClassName}`}>
        {value}
      </p>
      <p className={labelStyles[variant] ?? labelStyles.dark}>{label}</p>
    </div>
  );
}
