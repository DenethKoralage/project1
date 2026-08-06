/**
 * StatusBanner — inline success / error message bar.
 * Renders `null` when `message` is empty.
 *
 * @param {{
 *   type: 'success'|'error'|'',
 *   message: string,
 *   variant?: 'portfolio'|'auth'|'blog',
 *   className?: string,
 * }} props
 *
 * Variants map to the three distinct visual styles found in the codebase:
 *  'portfolio' – `rounded-lg` on stone/white backgrounds  (income/expenses/budget forms)
 *  'auth'      – `rounded-2xl` on gradient auth cards     (login/signup pages)
 *  'blog'      – `rounded-2xl` with border in composer    (MyBlogs composer)
 */
export function StatusBanner({ type, message, variant = "portfolio", className = "" }) {
  if (!message) return null;

  const success = type === "success";

  const variantStyles = {
    portfolio: {
      base:    "rounded-lg px-4 py-3 text-sm font-medium",
      success: "bg-emerald-50 text-emerald-800",
      error:   "bg-rose-50 text-rose-800",
    },
    auth: {
      base:    "rounded-2xl px-4 py-3 text-sm",
      success: "bg-emerald-100 text-emerald-800",
      error:   "bg-rose-100 text-rose-800",
    },
    blog: {
      base:    "rounded-2xl border px-5 py-4 text-sm",
      success: "border-emerald-200 bg-emerald-50 text-emerald-700",
      error:   "border-red-200 bg-red-50 text-red-700",
    },
  };

  const style = variantStyles[variant] ?? variantStyles.portfolio;

  return (
    <p className={`${style.base} ${success ? style.success : style.error} ${className}`}>
      {message}
    </p>
  );
}
