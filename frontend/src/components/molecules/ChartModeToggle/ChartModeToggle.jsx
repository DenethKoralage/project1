"use client";

/**
 * ChartModeToggle — day / month / annual tab buttons used in income and
 * expense chart sections. Props-driven, no direct store access.
 *
 * @param {{
 *   modes: string[],
 *   active: string,
 *   onChange: (mode: string) => void,
 *   className?: string,
 * }} props
 */
export function ChartModeToggle({ modes, active, onChange, className = "" }) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${
            active === mode
              ? "bg-slate-900 text-white"
              : "border border-stone-200 text-stone-600 hover:bg-stone-50"
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
