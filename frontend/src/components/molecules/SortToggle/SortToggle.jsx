"use client";

/**
 * SortToggle — two-option sort selector (Newest / Oldest).
 * Matches the toggle pattern in MyBlogs.
 *
 * @param {{
 *   value: 'newest'|'oldest',
 *   onChange: (value: string) => void,
 *   options?: Array<{ label: string, value: string }>,
 *   className?: string,
 * }} props
 */
export function SortToggle({
  value,
  onChange,
  options = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
  ],
  className = "",
}) {
  return (
    <div className={`flex overflow-hidden rounded-xl border border-slate-200 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 text-sm font-semibold transition ${
            value === opt.value
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
