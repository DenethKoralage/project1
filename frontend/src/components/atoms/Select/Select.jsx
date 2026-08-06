/**
 * Select — styled native `<select>` atom.
 *
 * @param {{
 *   children: React.ReactNode,
 *   variant?: 'portfolio'|'portfolio-danger'|'auth',
 *   className?: string,
 *   [key: string]: any
 * }} props
 *
 * Variants (preserve exact classes from codebase):
 *  'portfolio'        – stone palette, emerald focus  (income source/category)
 *  'portfolio-danger' – stone palette, rose focus     (expense category)
 *  'auth'             – slate palette, rounded-lg     (signup country/currency)
 */
export function Select({ children, variant = "portfolio", className = "", ...props }) {
  const variants = {
    portfolio:
      "w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none transition focus:border-emerald-500",
    "portfolio-danger":
      "w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none transition focus:border-rose-500",
    auth:
      "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-emerald-500",
  };

  return (
    <select
      className={`${variants[variant] ?? variants.portfolio} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
