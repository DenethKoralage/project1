/**
 * SpeedControl — playback speed selector pill (1x, 1.25x, 1.5x, 2x).
 *
 * @param {{
 *   speed: number,
 *   onChangeSpeed: (newSpeed: number) => void,
 *   speeds?: number[],
 *   className?: string,
 * }} props
 */
export function SpeedControl({
  speed = 1,
  onChangeSpeed,
  speeds = [0.8, 1, 1.25, 1.5, 2],
  className = "",
}) {
  const handleToggle = () => {
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    onChangeSpeed(speeds[nextIndex]);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title="Change playback speed"
      className={`rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 ${className}`}
    >
      {speed}x
    </button>
  );
}
