/**
 * ModalShell — full-viewport overlay with a centred card container.
 * Used by all Add-* form modals and the blog composer.
 *
 * @param {{
 *   children: React.ReactNode,
 *   onBackdropClick?: () => void,
 *   position?: 'center'|'bottom',
 *   maxWidth?: string,
 *   className?: string,
 * }} props
 *
 * Positions:
 *  'center' – flexbox items-center (most forms)
 *  'bottom' – flexbox items-end    (mobile-friendly sheet style)
 */
export function ModalShell({
  children,
  onBackdropClick,
  position = "center",
  maxWidth = "max-w-lg",
  className = "",
}) {
  const alignments = {
    center: "items-center",
    bottom: "items-end",
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center ${alignments[position] ?? "items-center"} bg-slate-950/40 p-4 backdrop-blur-sm`}
      onClick={onBackdropClick}
    >
      <div
        className={`w-full ${maxWidth} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
