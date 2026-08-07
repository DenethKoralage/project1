/**
 * PlayPauseButton — atom for controlling audio playback state.
 *
 * @param {{
 *   isPlaying: boolean,
 *   isLoading?: boolean,
 *   onClick: () => void,
 *   className?: string,
 * }} props
 */
export function PlayPauseButton({ isPlaying, isLoading = false, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-label={isPlaying ? "Pause audio" : "Play audio"}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md transition hover:bg-emerald-700 hover:scale-105 active:scale-95 disabled:opacity-60 ${className}`}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : isPlaying ? (
        <span className="text-base leading-none">⏸</span>
      ) : (
        <span className="ml-0.5 text-base leading-none">▶</span>
      )}
    </button>
  );
}
