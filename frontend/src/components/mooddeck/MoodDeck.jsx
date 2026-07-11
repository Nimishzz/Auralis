import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, animate as fmAnimate, PanInfo } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, Sparkles, Wifi, Bluetooth
} from "lucide-react";
import { MOODS, PLAYLISTS_BY_MOOD, DEFAULT_TRACK } from "../../data/mockData";

// -----------------------------------------------------------------------------
// Types (JSDoc — this file stays .jsx to avoid rippling TS through the tree).
// props: onPlay, onPause, onSeek, onVolumeChange, onMoodSelect
// -----------------------------------------------------------------------------

const MOOD_MESSAGES = {
  happy: "Sunshine time — turn it UP! ☀️",
  chill: "Deep breath. Vibes only. 🌊",
  study: "Time to focus. You got this 📚",
  rainy: "Cozy hoodie weather ☕",
  drive: "Let's put miles behind us 🛣️",
  latenight: "The city is ours tonight 🌙",
  romantic: "Slow down, my heart 💕",
  party: "LFG!! 🎉🎉🎉",
  workout: "One more rep. LET'S GO! 💪",
  default: "What's your mood today?"
};

const CHIBI_URL =
  "https://customer-assets.emergentagent.com/job_mood-desk-app/artifacts/xo81lou6_54a5b834-f6c5-4b59-9c39-952fc8290db9.jfif";

const fmt = (s) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

// -----------------------------------------------------------------------------
// Spinning platter with smooth deceleration
// -----------------------------------------------------------------------------
function Platter({ side, cover, isPlaying, label, onDrag, testId }) {
  const rotation = useMotionValue(0);
  const platterRef = useRef(null);

  useEffect(() => {
    let controls;
    if (isPlaying) {
      // Continuous rotation — very long duration + repeat=Infinity gives linear spin.
      controls = fmAnimate(rotation, rotation.get() + 3600, {
        duration: 40,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      });
    } else {
      // Decelerate to a stop over 800ms.
      const current = rotation.get();
      controls = fmAnimate(rotation, current + 55, {
        duration: 0.8,
        ease: [0.15, 0, 0.15, 1], // easeOut-ish
      });
    }
    return () => controls && controls.stop();
  }, [isPlaying, rotation]);

  return (
    <div className="platter-hardware" data-testid={testId}>
      <div className="platter-outer">
        {/* Ridged rim */}
        <div className="platter-rim" />
        <motion.div
          ref={platterRef}
          className="platter-inner"
          style={{ rotate: rotation }}
          drag={side === "left" ? "x" : "y"}
          dragConstraints={{ left: -60, right: 60, top: -60, bottom: 60 }}
          dragElastic={0.2}
          dragMomentum={false}
          onDrag={(_, info) => {
            if (side === "left") onDrag && onDrag(info.delta.x);
            else onDrag && onDrag(-info.delta.y);
          }}
          onDragEnd={() => {}}
        >
          <div className="platter-tracks" />
          <div className="platter-label-ring">
            {cover ? (
              <img src={cover} alt="album" draggable={false} />
            ) : (
              <div className="platter-nolabel" />
            )}
          </div>
        </motion.div>
        {/* Deck number */}
        <div className={`platter-deck-num ${side}`}>{side === "left" ? "1" : "2"}</div>
        {/* Cue indicator */}
        <div className={`platter-cue-arrow ${isPlaying ? "on" : ""}`} />
      </div>
      <div className="platter-hint">
        <span className="mono-label text-tiny">{label}</span>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Rotary knob (used for Bass/Mid/Treble)
// -----------------------------------------------------------------------------
function Knob({ label, value, onChange, disabled, testId }) {
  const rotating = useRef(null);
  const rot = -135 + value * 270;

  const onMouseDown = (e) => {
    if (disabled) return;
    rotating.current = { startY: e.clientY, startV: value };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };
  const onMove = (e) => {
    if (!rotating.current) return;
    const dy = rotating.current.startY - e.clientY;
    onChange(Math.max(0, Math.min(1, rotating.current.startV + dy / 200)));
  };
  const onUp = () => {
    rotating.current = null;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };

  return (
    <div className="flex flex-col items-center gap-1.5" data-testid={testId}>
      <div className="knob-hardware" onMouseDown={onMouseDown}
        style={{ transform: `rotate(${rot}deg)` }}
      >
        <div className="knob-indicator" />
      </div>
      <div className="mono-label text-tiny orange-text">{label}</div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Vertical channel fader
// -----------------------------------------------------------------------------
function Fader({ value, onChange, disabled, testId, label }) {
  const trackRef = useRef(null);
  const dragging = useRef(false);

  const onDown = (e) => {
    if (disabled) return;
    dragging.current = true;
    updateFromEvent(e);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };
  const updateFromEvent = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const v = 1 - Math.max(0, Math.min(1, y / rect.height));
    onChange(v);
  };
  const onMove = (e) => { if (dragging.current) updateFromEvent(e); };
  const onUp = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };

  const thumbTop = (1 - value) * 100;

  return (
    <div className="fader-column" data-testid={testId}>
      <div className="fader-track" ref={trackRef} onMouseDown={onDown}>
        <div className="fader-scale" />
        <div className="fader-thumb" style={{ top: `calc(${thumbTop}% - 12px)` }} />
      </div>
      <div className="mono-label text-tiny text-[#666]">{label}</div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MoodDeck — main component
// -----------------------------------------------------------------------------
export default function MoodDeck({
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onMoodSelect,
} = {}) {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasFrame = useRef(null);

  // ----- Playback state -----
  const [track, setTrack] = useState(DEFAULT_TRACK);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(track.duration || 0);
  const [volume, setVolume] = useState(0.75);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [trackIdx, setTrackIdx] = useState(0);

  // ----- Mix hardware state -----
  const [isAdvancedMixerActive, setIsAdvancedMixerActive] = useState(false);
  const [bass, setBass] = useState(0.5);
  const [mid, setMid] = useState(0.5);
  const [treble, setTreble] = useState(0.5);
  const [fader1, setFader1] = useState(0.8);
  const [fader2, setFader2] = useState(0.8);

  // ----- Companion state -----
  const [companion, setCompanion] = useState("male");
  const [showBubble, setShowBubble] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  const companionMessage = selectedMood
    ? MOOD_MESSAGES[selectedMood] || MOOD_MESSAGES.default
    : MOOD_MESSAGES.default;

  // ----- Audio hookup -----
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || track.duration || 0);
    const onEnd = () => handleNext();
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, trackIdx]);

  // Fake visualizer bars — no live analyser (CORS on SoundHelix would block it).
  // We just animate a pseudo-random waveform when playing to give the vibe.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const draw = () => {
      const w = canvas.width = canvas.clientWidth;
      const h = canvas.height = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const bars = 64;
      const gap = 2;
      const bw = (w - gap * (bars - 1)) / bars;
      const t = performance.now() / 400;
      for (let i = 0; i < bars; i++) {
        // pseudo-random moving amplitude, cover the range for playing case
        const seed = i * 0.7;
        const amp = isPlaying
          ? (Math.sin(t + seed) * 0.5 + Math.sin(t * 1.7 + seed * 0.3) * 0.5) * 0.5 + 0.55
          : 0.08 + Math.sin(seed) * 0.02;
        const bh = Math.max(1, amp * h * 0.9);
        const y = (h - bh) / 2;
        const grad = ctx.createLinearGradient(0, y, 0, y + bh);
        grad.addColorStop(0, "#ffb070");
        grad.addColorStop(0.5, "#ff5500");
        grad.addColorStop(1, "#ff2200");
        ctx.fillStyle = grad;
        ctx.shadowColor = "#ff5500";
        ctx.shadowBlur = isPlaying ? 8 : 0;
        ctx.fillRect(i * (bw + gap), y, bw, bh);
      }
      canvasFrame.current = requestAnimationFrame(draw);
    };
    canvasFrame.current = requestAnimationFrame(draw);
    return () => {
      if (canvasFrame.current) cancelAnimationFrame(canvasFrame.current);
    };
  }, [isPlaying]);

  // ----- Playback controls -----
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPause && onPause();
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        onPlay && onPlay();
      } catch (e) {
        console.warn("play failed", e);
      }
    }
  }, [isPlaying, onPlay, onPause]);

  const playTrack = useCallback((playlist, idx, autoplay = true) => {
    const t = playlist.tracks[idx];
    setActivePlaylist(playlist);
    setTrackIdx(idx);
    setTrack(t);
    setCurrent(0);
    const audio = audioRef.current;
    if (audio) {
      audio.src = t.audio;
      audio.load();
      if (autoplay) {
        setTimeout(() => {
          audio.play().then(() => {
            setIsPlaying(true);
            onPlay && onPlay();
          }).catch(() => setIsPlaying(false));
        }, 60);
      }
    }
  }, [onPlay]);

  const handleNext = useCallback(() => {
    if (!activePlaylist) return;
    const nextIdx = (trackIdx + 1) % activePlaylist.tracks.length;
    playTrack(activePlaylist, nextIdx, isPlaying);
  }, [activePlaylist, trackIdx, isPlaying, playTrack]);

  const handlePrev = useCallback(() => {
    if (!activePlaylist) return;
    const prevIdx = (trackIdx - 1 + activePlaylist.tracks.length) % activePlaylist.tracks.length;
    playTrack(activePlaylist, prevIdx, isPlaying);
  }, [activePlaylist, trackIdx, isPlaying, playTrack]);

  const seekByPct = (pct) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const t = pct * duration;
    audio.currentTime = t;
    setCurrent(t);
    onSeek && onSeek(pct);
  };

  const onProgressBarClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    seekByPct((e.clientX - r.left) / r.width);
  };

  // ----- Platter drag handlers -----
  const onLeftPlatterDrag = (dx) => {
    // Horizontal drag = scrub. dx in px → % of duration.
    if (!duration) return;
    const audio = audioRef.current;
    if (!audio) return;
    const step = dx / 200; // 200px = 1 full unit
    const newT = Math.max(0, Math.min(duration, audio.currentTime + step * 5));
    audio.currentTime = newT;
    setCurrent(newT);
    onSeek && onSeek(newT / duration);
  };
  const onRightPlatterDrag = (dyInverted) => {
    // Vertical drag (inverted so up = louder) = volume.
    const step = dyInverted / 500;
    const nv = Math.max(0, Math.min(1, volume + step));
    setVolume(nv);
    onVolumeChange && onVolumeChange(nv);
  };

  // ----- Mood / recommendation -----
  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId);
    onMoodSelect && onMoodSelect(moodId);
    // Immediately populate the recommendation card per new spec.
    setRecommendation({ moodId, playlist: PLAYLISTS_BY_MOOD[moodId] });
  };

  const handlePlayPlaylist = () => {
    if (!recommendation) return;
    playTrack(recommendation.playlist, 0, true);
  };

  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <div className="mooddeck" data-testid="mooddeck-app">
      <audio ref={audioRef} src={track.audio} preload="metadata" />

      {/* =============== TOP: HEADER (track info + visualizer + adv toggle) =============== */}
      <div className="mixer-header">
        {/* Left: Track segment display */}
        <div className="segment-display" data-testid="segment-display">
          <div className="segment-line">
            <span className="mono-label text-tiny text-[#7a3a00]">TRACK</span>
            <span className="segment-value" data-testid="track-title">{track.title}</span>
          </div>
          <div className="segment-line">
            <span className="mono-label text-tiny text-[#7a3a00]">ARTIST</span>
            <span className="segment-value dim" data-testid="track-artist">{track.artist}</span>
          </div>
          <div className="segment-line">
            <span className="mono-label text-tiny text-[#7a3a00]">ALBUM</span>
            <span className="segment-value dim" data-testid="track-album">{track.album}</span>
          </div>
          <div className="segment-time">
            <span data-testid="progress-current">{fmt(current)}</span>
            <span className="text-[#333]"> / </span>
            <span data-testid="progress-duration">{fmt(duration || track.duration)}</span>
          </div>
        </div>

        {/* Middle: Canvas visualizer */}
        <div className="visualizer-wrap">
          <canvas
            id="audio-visualizer"
            ref={canvasRef}
            className="w-full h-16 bg-black rounded border border-gray-800"
            data-testid="audio-visualizer"
          />
          <div className="progress-track mt-2 cursor-pointer" onClick={onProgressBarClick} data-testid="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1"><Wifi size={11} className="text-[#ff8833]" /><span className="mono-label text-tiny text-[#666]">LINK</span></div>
              <div className="flex items-center gap-1"><Bluetooth size={11} className="text-[#ff8833]" /><span className="mono-label text-tiny text-[#666]">BT</span></div>
              <div className="flex items-center gap-1"><div className={`led ${isPlaying ? "" : "dim"}`} /><span className="mono-label text-tiny text-[#666]">PWR</span></div>
            </div>
            <div className="mono-label text-tiny text-[#666]">32-BIT · 44.1kHz</div>
          </div>
        </div>

        {/* Right: Advanced Mixer toggle */}
        <div className="adv-toggle-wrap" data-testid="advanced-mixer-toggle-wrap">
          <div className="mono-label text-tiny text-[#888] mb-2 text-center">ENABLE<br/>ADVANCED<br/>MIXER</div>
          <button
            role="switch"
            aria-checked={isAdvancedMixerActive}
            data-testid="advanced-mixer-toggle"
            onClick={() => setIsAdvancedMixerActive(v => !v)}
            className={`hardware-toggle ${isAdvancedMixerActive ? "on" : "off"}`}
          >
            <div className="hardware-toggle-slot">
              <div className="hardware-toggle-thumb" />
            </div>
            <div className="mono-label text-tiny mt-1 text-center" style={{ color: isAdvancedMixerActive ? "#ff8833" : "#444" }}>
              {isAdvancedMixerActive ? "ON" : "OFF"}
            </div>
          </button>
        </div>
      </div>

      {/* =============== MIDDLE: DUAL DECK LAYOUT =============== */}
      <div className="mixer-body">
        {/* LEFT DECK */}
        <div className="deck-panel">
          <div className="deck-badge">DECK 1 · SCRUB</div>
          <Platter
            side="left"
            cover={track.cover}
            isPlaying={isPlaying}
            label="◀ DRAG TO SCRUB ▶"
            onDrag={onLeftPlatterDrag}
            testId="platter-left"
          />
          <div className="deck-transport">
            <button className="hw-btn" onClick={handlePrev} data-testid="btn-prev" title="Previous">
              <SkipBack size={18} strokeWidth={2.4} />
            </button>
            <button className="hw-btn hw-cue" data-testid="btn-cue" title="Cue">
              CUE
            </button>
            <button className={`hw-btn hw-play ${isPlaying ? "on" : ""}`} onClick={togglePlay} data-testid="btn-play" title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause size={20} strokeWidth={2.5} /> : <Play size={20} strokeWidth={2.5} />}
            </button>
          </div>
        </div>

        {/* CENTER MIX STATION */}
        <div className={`mix-center ${isAdvancedMixerActive ? "" : "opacity-40 pointer-events-none"}`} data-testid="mix-center">
          <div className="mono-label text-tiny orange-text mb-1 text-center">CFX · MIX STATION</div>
          <div className="knob-row">
            <Knob label="BASS" value={bass} onChange={setBass} disabled={!isAdvancedMixerActive} testId="knob-bass" />
            <Knob label="MID" value={mid} onChange={setMid} disabled={!isAdvancedMixerActive} testId="knob-mid" />
            <Knob label="TREBLE" value={treble} onChange={setTreble} disabled={!isAdvancedMixerActive} testId="knob-treble" />
          </div>
          <div className="fader-row">
            <Fader label="CH 1" value={fader1} onChange={setFader1} disabled={!isAdvancedMixerActive} testId="fader-1" />
            <Fader label="CH 2" value={fader2} onChange={setFader2} disabled={!isAdvancedMixerActive} testId="fader-2" />
          </div>
          <div className="crossfader">
            <div className="crossfader-track">
              <div className="crossfader-thumb" style={{ left: `${((fader1 - fader2) + 1) * 50}%` }} />
            </div>
            <div className="mono-label text-tiny text-[#666] text-center mt-1">CROSSFADER</div>
          </div>
        </div>

        {/* RIGHT DECK */}
        <div className="deck-panel">
          <div className="deck-badge">DECK 2 · VOLUME</div>
          <Platter
            side="right"
            cover={recommendation ? recommendation.playlist.cover : track.cover}
            isPlaying={isPlaying}
            label="▲ DRAG FOR VOL ▼"
            onDrag={onRightPlatterDrag}
            testId="platter-right"
          />
          <div className="deck-transport">
            <button className="hw-btn hw-cue" data-testid="btn-sync" title="Beat Sync">SYNC</button>
            <button className="hw-btn" data-testid="btn-loop" title="Loop">LOOP</button>
            <button className="hw-btn" onClick={handleNext} data-testid="btn-next" title="Next">
              <SkipForward size={18} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>

      {/* =============== BOTTOM: MOOD + COMPANION =============== */}
      <div className="mixer-footer">
        <div className="mood-panel">
          <div className="mono-label text-tiny orange-text mb-2">SELECT MOOD</div>
          <div className="mood-grid">
            {MOODS.map(m => (
              <button
                key={m.id}
                className={`mood-chip ${selectedMood === m.id ? "active" : ""}`}
                onClick={() => handleMoodSelect(m.id)}
                data-testid={`mood-chip-${m.id}`}
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {recommendation ? (
            <motion.div
              key={recommendation.moodId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="rec-card"
              data-testid="recommendation-card"
            >
              <img
                src={recommendation.playlist.cover}
                alt="cover"
                className="rec-cover"
                draggable={false}
              />
              <div className="flex-1 min-w-0">
                <div className="mono-label text-tiny text-[#888]">MOOD</div>
                <div className="text-sm text-[#ddd] mb-1">
                  {MOODS.find(m => m.id === recommendation.moodId)?.emoji}{" "}
                  {MOODS.find(m => m.id === recommendation.moodId)?.label}
                </div>
                <div className="mono-label text-tiny text-[#888]">PLAYLIST</div>
                <div className="orange-text text-sm font-bold truncate" data-testid="rec-playlist-name">
                  {recommendation.playlist.name}
                </div>
                <div className="text-tiny text-[#888]">
                  {recommendation.playlist.artist} · {recommendation.playlist.tracks.length} tracks
                </div>
                <button
                  className="play-playlist-btn mt-2"
                  onClick={handlePlayPlaylist}
                  data-testid="btn-play-playlist"
                >
                  <Play size={14} fill="currentColor" /> PLAY PLAYLIST
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" className="rec-empty" initial={{opacity:0}} animate={{opacity:1}}>
              <Sparkles size={20} className="text-[#ff8833] opacity-60" />
              <div className="mono-label text-tiny text-[#666] mt-1">
                Select a mood to reveal a recommendation
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Companion frame — absolutely-positioned within the footer bottom-right */}
        <div className="companion-anchor" data-testid="mooddeck-companion">
          <AnimatePresence>
            {showBubble && (
              <motion.div
                key="bubble"
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.18 }}
                className="companion-bubble"
                data-testid="companion-speech-bubble"
              >
                {companionMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={`chibi-wrap chibi-${companion}`}
            onClick={() => setShowBubble(v => !v)}
            data-testid="companion-character"
            role="button"
            tabIndex={0}
          >
            <img src={CHIBI_URL} alt="companion" draggable={false} />
          </div>

          <div className="gender-radio" role="radiogroup" aria-label="Companion gender">
            <label
              className={`retro-radio ${companion === "male" ? "checked" : ""}`}
              onClick={() => setCompanion("male")}
              data-testid="companion-switch-male"
            >
              <input
                type="radio"
                name="companion"
                checked={companion === "male"}
                readOnly
              />
              <span className="retro-radio-dot" />
              <span>Male</span>
            </label>
            <label
              className={`retro-radio ${companion === "female" ? "checked" : ""}`}
              onClick={() => setCompanion("female")}
              data-testid="companion-switch-female"
            >
              <input
                type="radio"
                name="companion"
                checked={companion === "female"}
                readOnly
              />
              <span className="retro-radio-dot" />
              <span>Female</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
