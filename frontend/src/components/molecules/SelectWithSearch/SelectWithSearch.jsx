"use client";

/**
 * SelectWithSearch — searchable dropdown list. Currently embedded inline in
 * signup/page.jsx; extracted here so it can be reused across any form.
 *
 * @param {{
 *   label: string,
 *   options: any[],
 *   value: string,
 *   onChange: (value: string) => void,
 *   placeholder?: string,
 *   searchPlaceholder?: string,
 *   getOptionLabel: (opt: any) => string,
 *   getOptionValue: (opt: any) => string,
 *   className?: string,
 *   required?: boolean,
 * }} props
 */

import { useState } from "react";

export function SelectWithSearch({
  label,
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  getOptionLabel,
  getOptionValue,
  className = "",
  required = false,
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter((opt) => {
    const term = search.toLowerCase();
    return (
      getOptionLabel(opt).toLowerCase().includes(term) ||
      getOptionValue(opt).toLowerCase().includes(term)
    );
  });

  const handleOptionClick = (opt) => {
    onChange(getOptionValue(opt));
    setIsOpen(false);
    setSearch("");
  };

  const selectedLabel = value
    ? (() => {
        const found = options.find((opt) => getOptionValue(opt) === value);
        return found ? getOptionLabel(found) : value;
      })()
    : null;

  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="ml-1 text-rose-500" aria-hidden="true">*</span>}
      </span>
      <div className="relative">
        {/* Trigger */}
        <div
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          tabIndex={0}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 focus-within:ring-2 focus-within:ring-emerald-500"
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={(e) => e.key === "Enter" && setIsOpen((prev) => !prev)}
        >
          <span className={selectedLabel ? "text-slate-900" : "text-slate-400"}>
            {selectedLabel ?? placeholder}
          </span>
          <svg
            className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            role="listbox"
            className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
          >
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full border-b border-slate-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            {filteredOptions.length === 0 ? (
              <p className="px-4 py-2 text-sm text-slate-500">No results found</p>
            ) : (
              filteredOptions.map((opt) => {
                const val = getOptionValue(opt);
                return (
                  <div
                    key={val}
                    role="option"
                    aria-selected={value === val}
                    className={`cursor-pointer px-4 py-2 text-sm transition hover:bg-slate-50 ${value === val ? "font-semibold text-emerald-700" : "text-slate-800"}`}
                    onClick={() => handleOptionClick(opt)}
                  >
                    {getOptionLabel(opt)}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </label>
  );
}
