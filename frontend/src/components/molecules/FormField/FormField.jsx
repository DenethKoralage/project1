/**
 * FormField — label + input/select/textarea group with optional error message.
 * This molecule composes the label-wrapper pattern that appears 30+ times
 * across income, expense, budget, login, signup, and blog forms.
 *
 * @param {{
 *   label: string,
 *   error?: string,
 *   children: React.ReactNode,   ← the Input / Select / Textarea atom
 *   required?: boolean,
 *   className?: string,
 * }} props
 */
export function FormField({ label, error, children, required = false, className = "" }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-sm font-medium text-stone-700">
        {label}
        {required && <span className="ml-1 text-rose-500" aria-hidden="true">*</span>}
      </span>
      {children}
      {error && (
        <span className="block text-xs font-medium text-rose-600">{error}</span>
      )}
    </label>
  );
}
