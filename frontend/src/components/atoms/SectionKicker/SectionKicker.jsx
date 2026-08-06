/**
 * SectionKicker — the small all-caps label that sits above section headings.
 *
 * @param {{
 *   children: React.ReactNode,
 *   variant?: 'light'|'dark'|'emerald'|'sky',
 *   className?: string,
 *   as?: keyof JSX.IntrinsicElements
 * }} props
 *
 * Variants:
 *  'light'   – muted stone/slate on white cards        (portfolio tables)
 *  'dark'    – emerald-200 on dark cards               (footer, about dark aside)
 *  'emerald' – emerald-700 on light backgrounds        (login card, about sections)
 *  'sky'     – sky-700 on light backgrounds            (about "Our Story" / "How We Help")
 */
export function SectionKicker({ children, variant = "light", className = "", as: Tag = "p" }) {
  const variants = {
    light:   "text-xs font-semibold uppercase tracking-[0.18em] text-stone-400",
    dark:    "text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200",
    emerald: "text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700",
    sky:     "text-sm font-semibold uppercase tracking-[0.22em] text-sky-700",
  };

  return (
    <Tag className={`${variants[variant] ?? variants.light} ${className}`}>
      {children}
    </Tag>
  );
}
