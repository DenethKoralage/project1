/**
 * Spinner — animated loading indicator.
 *
 * @param {{ size?: 'sm'|'md'|'lg', className?: string }} props
 */
export function Spinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-10 w-10 border-4",
    lg: "h-14 w-14 border-4",
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-emerald-600 border-t-transparent ${sizes[size] ?? sizes.md} ${className}`}
    />
  );
}
