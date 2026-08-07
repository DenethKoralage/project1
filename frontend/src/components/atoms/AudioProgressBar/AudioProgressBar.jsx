/**
 * AudioProgressBar — interactive seek bar for audio playback.
 *
 * @param {{
 *   currentTime: number,
 *   duration: number,
 *   onSeek: (time: number) => void,
 *   className?: string,
 * }} props
 */
export function AudioProgressBar({ currentTime = 0, duration = 0, onSeek, className = "" }) {
  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleChange = (e) => {
    const newTime = Number(e.target.value);
    if (onSeek) onSeek(newTime);
  };

  return (
    <div className={`relative flex flex-1 items-center ${className}`}>
      <input
        type="range"
        min={0}
        max={duration || 100}
        value={currentTime}
        step={0.1}
        onChange={handleChange}
        aria-label="Audio progress slider"
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600 focus:outline-none"
        style={{
          background: `linear-gradient(to right, #059669 ${percent}%, #e2e8f0 ${percent}%)`,
        }}
      />
    </div>
  );
}
