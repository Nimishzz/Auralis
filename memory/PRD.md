# RetroDesk — Product Requirements Document

## Original Problem Statement
A React (CRA) + JS + Tailwind + Framer Motion web app called **RetroDesk** — a nostalgic Y2K / Windows XP / Frutiger Aero fake desktop OS (NOT a full OS sim) hosting two apps:
1. **MoodDeck** — a Pioneer-CDJ-inspired DJ music player with rotating vinyl platter, transport controls, bass/treble knobs, volume slider, LED indicators, animated pixel-art companion, mood chips, and playlist recommender.
2. **RetroMSG** — an MSN/AIM/Yahoo Messenger reimagined with modern Instagram-style stories row, chat bubbles, typing indicator, image/voice placeholders, emoji picker.

FRONTEND-ONLY. No backend, no auth, no databases. Mock JSON data structured so real Spotify / messaging APIs can drop-in later.

## Architecture (implemented 2026-02)
```
/app/frontend/src/
├── App.js
├── App.css                             # All Y2K / Frutiger Aero styling
├── index.css                           # Base + Y2K scrollbars + Google fonts
├── components/
│   ├── Desktop.jsx                     # OS shell, window state, wallpaper
│   ├── Taskbar.jsx                     # start btn + tabs + clock
│   ├── StartMenu.jsx                   # click-outside dismiss
│   ├── DesktopIcon.jsx
│   ├── Window.jsx                      # drag / resize / min / max / close
│   ├── mooddeck/
│   │   ├── MoodDeck.jsx
│   │   ├── Platter.jsx                 # spinning vinyl
│   │   ├── Knob.jsx                    # bass / treble rotary
│   │   └── Companion.jsx               # SVG pixel character
│   └── retromsg/
│       └── RetroMSG.jsx
└── data/mockData.js                    # MOODS, PLAYLISTS_BY_MOOD, CONTACTS, CONVERSATIONS, STORIES
```

Windows are managed via `useState` in `Desktop.jsx` with a z-index counter; framer-motion handles enter/exit animations; drag/resize use vanilla mouse handlers.

## User Personas
- **The nostalgia fan** — grew up on XP / MSN, wants Y2K vibes with modern feel.
- **The designer/dev** — appreciates skeuomorphic hardware detail and layered UI.
- **The casual user** — plays with the desktop, swaps companions, hunts through moods.

## Core Requirements (static)
- Full-screen Y2K wallpaper (Frutiger Aero bubbles).
- Bottom taskbar with Start, live clock, per-window tabs.
- Draggable + resizable windows with min/max/close.
- Two apps only + atmospheric non-functional icons.
- Framer Motion for window animations.
- Mock JSON data structured for future Spotify / messaging APIs.

## What's Been Implemented (2026-02)
- ✅ Desktop shell: wallpaper (animated floating bubbles), taskbar, Start button + Start Menu (click-outside dismiss), live clock, system tray icons.
- ✅ Draggable windows with resize handle, minimize / maximize / restore / close, active-window styling, z-index focus stack.
- ✅ 6 desktop icons: MoodDeck, RetroMSG, My Computer, My Documents, Recycle Bin, About RetroDesk (last four show a toast, not real windows).
- ✅ **MoodDeck**: rotating vinyl platter with album art, tone-arm animation, LEDs (Power/Link/Sync), transport (prev/play/next), progress bar (click to seek), volume slider (wired to `<audio>.volume`), bass/treble knobs (rotate visually + display values), Now Playing panel, 9 mood chips, "Recommend Playlist" button (disabled until mood selected), recommendation card with cover/name/artist/track count, PLAY PLAYLIST big-green button, real audio via SoundHelix demo MP3s.
- ✅ **MoodDeck Companion**: SVG pixel-art character with headphones (Nova / Rex switchable), CSS breathing, random blinking, head-bob when playing, speech bubble that changes per mood.
- ✅ **RetroMSG**: sidebar with user profile + search + 7 mock contacts (with online dots), Instagram-style stories row (8 stories incl "Your story"), story viewer modal that auto-dismisses, chat header with online status, message bubbles (mine blue-gradient / theirs white), timestamps, image + voice placeholder bubbles, typing indicator dots, emoji picker (18 emojis), send via Enter or button, simulated replies after 1-2s, contact search filter.

### Known trade-offs
- Bass/Treble knobs are cosmetic (Web Audio EQ intentionally not connected — SoundHelix has no CORS headers, which would break `createMediaElementSource`; swap in a CORS-enabled source and wire the graph in `MoodDeck.jsx` when needed).
- Companion + audio are demo-scale — 3 tracks per mood.

## Prioritized Backlog
### P1 (nice to have next)
- Real Spotify Web API integration path: swap `data/mockData.js#PLAYLISTS_BY_MOOD` for a `spotifyClient.getPlaylistByMood()` call — the data shape already matches (name/artist/cover/tracks[].{title,artist,album,duration}).
- Persist window positions + selected companion to `localStorage`.
- More companion emotes (dance / sleep / thumbs-up).

### P2
- Draggable desktop icons + grid snap.
- Right-click context menu on the desktop (rename / delete / properties).
- Playlist queue view inside MoodDeck.
- Voice message recording (WebAudio MediaRecorder → base64) in RetroMSG.
- Story creation (Your story → upload image → live progress ring).
- Extra desktop apps (Notepad, Paint, Minesweeper) — the `APPS` registry in `Desktop.jsx` already supports plug-and-play additions.
