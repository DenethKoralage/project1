/**
 * Textarea — styled multi-line text input atom.
 *
 * @param {{
 *   variant?: 'portfolio'|'portfolio-danger'|'blog',
 *   className?: string,
 *   [key: string]: any
 * }} props
 *
 * Variants (preserve exact classes from codebase):
 *  'portfolio'        – stone palette, emerald focus  (income/budget description)
 *  'portfolio-danger' – stone palette, rose focus     (expense description)
 *  'blog'             – xl radius, ring focus         (MyBlogs composer content field)
 */
export function Textarea({ variant = "portfolio", className = "", ...props }) {
  const variants = {
    portfolio:
      "w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none transition focus:border-emerald-500",
    "portfolio-danger":
      "w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none transition focus:border-rose-500",
    blog:
      "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
  };

  return (
    <textarea
      className={`${variants[variant] ?? variants.portfolio} ${className}`}
      {...props}
    />
  );
}
