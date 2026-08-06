/**
 * BlurBlob — decorative radial gradient circle used as a background accent.
 * Pass a `className` with position (absolute/fixed), size (h-*), color
 * (bg-emerald-500/20), and blur (blur-3xl) utilities.
 *
 * @param {{ className?: string }} props
 */
export function BlurBlob({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-full ${className}`}
    />
  );
}
