/**
 * Input — styled text/email/password/number/date input atom.
 *
 * @param {{
 *   variant?: 'portfolio'|'portfolio-danger'|'auth'|'blog',
 *   className?: string,
 *   [key: string]: any
 * }} props
 *
 * Variants (preserve exact classes from the codebase):
 *  'portfolio'        – stone palette, emerald focus  (income/budget forms)
 *  'portfolio-danger' – stone palette, rose focus     (expense form)
 *  'auth'             – 2xl radius, slate palette     (login/signup)
 *  'blog'             – xl radius, ring focus         (MyBlogs composer)
 */
export function Input({ variant = "portfolio", className = "", ...props }) {
  const variants = {
    portfolio:
      "w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none transition focus:border-emerald-500",
    "portfolio-danger":
      "w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none transition focus:border-rose-500",
    auth:
      "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500",
    blog:
      "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
  };

  return (
    <input
      className={`${variants[variant] ?? variants.portfolio} ${className}`}
      {...props}
    />
  );
}
