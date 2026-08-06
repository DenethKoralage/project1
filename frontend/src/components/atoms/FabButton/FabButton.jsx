/**
 * FabButton — fixed-position floating action button (the "+" circle button).
 * Used in Income, Expenses, and Budget pages.
 *
 * @param {{
 *   onClick: () => void,
 *   label?: string,
 *   'aria-label'?: string,
 *   className?: string,
 * }} props
 */
export function FabButton({ onClick, label = "+", "aria-label": ariaLabel = "Open form", className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-3xl font-semibold leading-none text-white shadow-lg transition hover:scale-105 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${className}`}
    >
      {label}
    </button>
  );
}
