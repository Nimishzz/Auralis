import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, Sparkles } from "lucide-react";
import Platter from "./Platter";
import Knob from "./Knob";
import Companion from "./Companion";
import { MOODS, PLAYLISTS_BY_MOOD, DEFAULT_TRACK } from "../../data/mockData";

const fmt = (s) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

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

export default function MoodDeck() {
  // Playback
  const audioRef = useRef(null);
  const [track, setTrack] = useState(DEFAULT_TRACK);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);   // seconds
  const [duration, setDuration] = useState(track.duration || 0);
  const [volume, setVolume] = useState(0.75);
  const [bass, setBass] = useState(0.5);
  const [treble, setTreble] = useState(0.5);

  // Playlist context (when a mood playlist is loaded)
  const [activePlaylist, setActivePlaylist] = useState(null); // { moodId, ...playlist }
  const [trackIdx, setTrackIdx] = useState(0);

  // Mood + companion
  const [selectedMood, setSelectedMood] = useState(null);
  const [recommendation, setRecommendation] = useState(null); // { moodId, playlist }
  const [companion, setCompanion] = useState("female");

  const companionMessage = selectedMood
    ? MOOD_MESSAGES[selectedMood] || MOOD_MESSAGES.default
    : MOOD_MESSAGES.default;

  // Volume — direct on the <audio> element (Web Audio EQ intentionally skipped
  // because SoundHelix does not send CORS headers, which would block
  // createMediaElementSource. Bass/Treble knobs are cosmetic hardware controls
  // and can be wired to a real audio graph once a CORS-enabled source is in use).
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Progress ticking
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
  }, [track, trackIdx, activePlaylist]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch (e) {
        console.warn("play failed", e);
      }
    }
  };

  const handleNext = () => {
    if (!activePlaylist) return;
    const nextIdx = (trackIdx + 1) % activePlaylist.tracks.length;
    playTrack(activePlaylist, nextIdx, playing);
  };
  const handlePrev = () => {
    if (!activePlaylist) return;
    const prevIdx = (trackIdx - 1 + activePlaylist.tracks.length) % activePlaylist.tracks.length;
    playTrack(activePlaylist, prevIdx, playing);
  };

  const playTrack = (playlist, idx, autoplay = true) => {
    const t = playlist.tracks[idx];
    setActivePlaylist(playlist);
    setTrackIdx(idx);
    setTrack(t);
    setCurrent(0);
    // switch audio source
    const audio = audioRef.current;
    if (audio) {
      audio.src = t.audio;
      audio.load();
      if (autoplay) {
        setTimeout(() => {
          audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        }, 60);
      }
    }
  };

  const handleRecommend = () => {
    if (!selectedMood) return;
    const playlist = PLAYLISTS_BY_MOOD[selectedMood];
    setRecommendation({ moodId: selectedMood, playlist });
  };

  const handlePlayPlaylist = () => {
    if (!recommendation) return;
    playTrack(recommendation.playlist, 0, true);
  };

  const onSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const t = pct * (duration || 1);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrent(t);
  };

  const pct = duration ? (current / duration) * 100 : 0;

  const spinSpeed = useMemo(() => {
    // Bass boosts rotation slightly for feel
    return 4 - bass * 1.2;
  }, [bass]);

  return (
    <div className="mooddeck" data-testid="mooddeck-app">
      <audio ref={audioRef} src={track.audio} preload="metadata" />

      {/* Top strip */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-black bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="orange-text mono-label text-sm font-bold tracking-widest">MOODDECK</div>
          <div className="text-tiny text-[#666] mono-label">CDJ-2K // v1.0</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-tiny text-[#888] mono-label">POWER</span>
          <div className="led" />
          <span className="text-tiny text-[#888] mono-label ml-3">LINK</span>
          <div className={`led ${playing ? "green" : "dim"}`} />
          <span className="text-tiny text-[#888] mono-label ml-3">SYNC</span>
          <div className={`led ${playing ? "" : "dim"}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 p-4">
        {/* LEFT: player */}
        <div className="mooddeck-panel p-4 space-y-4">
          <div className="flex gap-4 items-start">
            <Platter cover={track.cover} playing={playing} spinSpeed={spinSpeed} />

            {/* Track info + knobs */}
            <div className="flex-1 space-y-4 min-w-0">
              <div className="mooddeck-panel p-3">
                <div className="mono-label text-tiny text-[#666]">NOW PLAYING</div>
                <div className="orange-text text-lg font-bold truncate" data-testid="track-title">{track.title}</div>
                <div className="text-sm text-[#ddd] truncate" data-testid="track-artist">{track.artist}</div>
                <div className="text-tiny text-[#888] truncate" data-testid="track-album">{track.album}</div>

                <div className="mt-3 space-y-1">
                  <div className="progress-track cursor-pointer" onClick={onSeek} data-testid="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-tiny mono-label text-[#888]">
                    <span data-testid="progress-current">{fmt(current)}</span>
                    <span data-testid="progress-duration">{fmt(duration || track.duration)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 items-end">
                <Knob label="BASS" value={bass} onChange={setBass} testId="knob-bass" />
                <Knob label="TREBLE" value={treble} onChange={setTreble} testId="knob-treble" />
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-2 w-full">
                    <Volume2 size={14} color="#ff8833" />
                    <input
                      type="range" min="0" max="1" step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="flex-1 accent-[#ff8833]"
                      data-testid="volume-slider"
                    />
                  </div>
                  <div className="mono-label text-tiny text-[#ff8833]">VOLUME</div>
                  <div className="mono-label text-tiny text-[#666]">{Math.round(volume * 100)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transport */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button className="transport-btn" onClick={handlePrev} data-testid="btn-prev" title="Previous">
              <SkipBack size={22} strokeWidth={2.4} />
            </button>
            <button className="transport-btn big" onClick={togglePlay} data-testid="btn-play" title={playing ? "Pause" : "Play"}>
              {playing ? <Pause size={26} strokeWidth={2.4} /> : <Play size={26} strokeWidth={2.4} />}
            </button>
            <button className="transport-btn" onClick={handleNext} data-testid="btn-next" title="Next">
              <SkipForward size={22} strokeWidth={2.4} />
            </button>
          </div>

          {activePlaylist && (
            <div className="mooddeck-panel p-2 flex items-center gap-3">
              <div className="mono-label text-tiny text-[#ff8833]">PLAYLIST</div>
              <div className="text-xs text-[#ddd] truncate">{activePlaylist.name}</div>
              <div className="ml-auto mono-label text-tiny text-[#888]">
                TRACK {trackIdx + 1}/{activePlaylist.tracks.length}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Companion + moods + recommendation */}
        <div className="space-y-4">
          <div className="mooddeck-panel p-4">
            <Companion
              variant={companion}
              onSwitch={setCompanion}
              message={companionMessage}
              playing={playing}
            />
          </div>

          <div className="mooddeck-panel p-3">
            <div className="mono-label text-tiny text-[#ff8833] mb-2">SELECT MOOD</div>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(m => (
                <button
                  key={m.id}
                  className={`mood-chip ${selectedMood === m.id ? "active" : ""}`}
                  onClick={() => setSelectedMood(m.id)}
                  data-testid={`mood-chip-${m.id}`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
            <button
              className="recommend-btn w-full mt-3"
              onClick={handleRecommend}
              disabled={!selectedMood}
              style={{ opacity: selectedMood ? 1 : 0.5, cursor: selectedMood ? "pointer" : "not-allowed" }}
              data-testid="btn-recommend"
            >
              <span className="inline-flex items-center gap-2 justify-center">
                <Sparkles size={14} />
                Recommend Playlist
              </span>
            </button>
          </div>

          <AnimatePresence>
            {recommendation && (
              <motion.div
                key={recommendation.moodId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="mooddeck-panel p-3"
                data-testid="recommendation-card"
              >
                <div className="flex gap-3">
                  <img
                    src={recommendation.playlist.cover}
                    alt="cover"
                    className="w-20 h-20 rounded-md border border-[#333] object-cover"
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
                    <div className="text-tiny text-[#888]">by {recommendation.playlist.artist} · {recommendation.playlist.tracks.length} tracks</div>
                  </div>
                </div>
                <button
                  className="play-playlist-btn mt-3"
                  onClick={handlePlayPlaylist}
                  data-testid="btn-play-playlist"
                >
                  <Play size={16} fill="currentColor" /> PLAY PLAYLIST
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
