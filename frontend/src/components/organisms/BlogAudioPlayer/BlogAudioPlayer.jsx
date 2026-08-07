"use client";

import { useState, useRef, useEffect } from "react";
import { AudioPlayerControls } from "@/components/molecules";
import { StatusBanner } from "@/components/atoms";

/**
 * BlogAudioPlayer — Organism that owns audio playback state, calls /api/tts
 * to fetch or trigger Piper TTS synthesis, and manages the HTML5 Audio node.
 *
 * @param {{
 *   blogId: string,
 *   title?: string,
 *   className?: string,
 * }} props
 */
export function BlogAudioPlayer({ blogId, title, className = "" }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isCached, setIsCached] = useState(null);

  const audioRef = useRef(null);

  // Initialize Audio element instance on mount
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Update playback speed rate on audio node
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Request audio synthesis from /api/tts Route Handler
  async function fetchAndPlayAudio() {
    if (!blogId) return;

    try {
      setIsLoading(true);
      setErrorMsg(null);

      console.log(`Requesting TTS synthesis for blogId: ${blogId}...`);

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to generate audio.");
      }

      setAudioUrl(data.audioUrl);
      setIsCached(data.cached);

      if (audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.playbackRate = speed;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setErrorMsg(err.message || "Could not generate speech for this post.");
    } finally {
      setIsLoading(false);
    }
  }

  function handlePlayPauseToggle() {

    console.log(`Play/Pause button clicked. Current state: isPlaying=${isPlaying}, isLoading=${isLoading}, audioUrl=${audioUrl}`);
    
    if (isLoading) return;

    if (!audioUrl) {
      // First click: fetch & generate audio
      fetchAndPlayAudio();
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => setErrorMsg(`Playback error: ${err.message}`));
    }
  }

  function handleSeek(newTime) {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }

  function handleChangeSpeed(newSpeed) {
    setSpeed(newSpeed);
  }

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-md md:p-6 ${className}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎧</span>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            Listen to Post
          </p>
        </div>

        {isCached !== null && (
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200 border border-emerald-400/30">
            {isCached ? "⚡ Instant Cache" : "🎙️ Generated with Piper TTS"}
          </span>
        )}
      </div>

      {title && (
        <p className="mb-4 text-sm text-slate-300 font-medium truncate">
          {isPlaying ? "Playing: " : "Audio version of: "}{title}
        </p>
      )}

      {errorMsg ? (
        <div className="space-y-3">
          <StatusBanner type="error" message={errorMsg} variant="blog" />
          <button
            type="button"
            onClick={fetchAndPlayAudio}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Retry Synthesis
          </button>
        </div>
      ) : (
        <AudioPlayerControls
          isPlaying={isPlaying}
          isLoading={isLoading}
          currentTime={currentTime}
          duration={duration}
          speed={speed}
          onPlayPauseToggle={handlePlayPauseToggle}
          onSeek={handleSeek}
          onChangeSpeed={handleChangeSpeed}
        />
      )}
    </section>
  );
}
