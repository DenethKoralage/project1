import { PlayPauseButton, AudioProgressBar, SpeedControl } from "@/components/atoms";

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * AudioPlayerControls — molecule composing play/pause, seek bar, time, and speed controls.
 * Props-driven, presentation only (no direct fetch or audio node creation).
 *
 * @param {{
 *   isPlaying: boolean,
 *   isLoading: boolean,
 *   currentTime: number,
 *   duration: number,
 *   speed: number,
 *   onPlayPauseToggle: () => void,
 *   onSeek: (time: number) => void,
 *   onChangeSpeed: (speed: number) => void,
 *   className?: string,
 * }} props
 */
export function AudioPlayerControls({
  isPlaying,
  isLoading,
  currentTime,
  duration,
  speed,
  onPlayPauseToggle,
  onSeek,
  onChangeSpeed,
  className = "",
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 md:gap-4 ${className}`}>
      <PlayPauseButton
        isPlaying={isPlaying}
        isLoading={isLoading}
        onClick={onPlayPauseToggle}
      />

      <div className="flex flex-1 items-center gap-3">
        <span className="w-10 text-right text-xs font-semibold text-slate-500">
          {formatTime(currentTime)}
        </span>

        <AudioProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
        />

        <span className="w-10 text-left text-xs font-semibold text-slate-500">
          {formatTime(duration)}
        </span>
      </div>

      <SpeedControl speed={speed} onChangeSpeed={onChangeSpeed} />
    </div>
  );
}
