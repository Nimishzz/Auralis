# RetroDesk — Product Requirements Document

## Original Problem Statement
Nostalgic Y2K / Windows XP / Frutiger Aero fake desktop OS shell hosting two apps: **MoodDeck** (skeuomorphic dual-deck DJ controller inspired by Pioneer DDJ-FLX2) and **RetroMSG** (MSN/AIM messenger fused with Instagram stories). Frontend-only; mock JSON data shaped for future Spotify + messaging API drop-in.

## Architecture (2026-02)
```
/app/frontend/
├── tsconfig.json                          # TS enabled (allowJs, react-jsx, "@/*" alias)
├── craco.config.js                        # webpack resolve.extensions for .ts/.tsx
└── src/
    ├── App.js                             # renders <DesktopShell />
    ├── App.css                            # All Y2K / Frutiger / DJ hardware styling
    ├── index.css                          # base + Google fonts
    ├── types.ts                           # ManagedWindow, AppId, WindowInstance, ThemeMode
    ├── components/
    │   ├── DesktopShell.tsx               # OS shell, windows state, wallpaper day/night
    │   ├── WindowFrame.tsx                # framer-motion draggable, constraints, min/max/close
    │   ├── Taskbar.tsx                    # 40px, Start pill, task tabs, AI Day/Night toggle
    │   ├── StartMenu.jsx
    │   ├── DesktopIcon.jsx
    │   ├── mooddeck/
    │   │   └── MoodDeck.jsx               # dual-deck DJ controller (all subcomponents inline)
    │   └── retromsg/
    │       └── RetroMSG.jsx
    └── data/mockData.js                   # MOODS, PLAYLISTS_BY_MOOD, CONTACTS, STORIES, CONVERSATIONS
```

## What's Been Implemented
### Foundational shell (2026-02, iteration 2 — TypeScript refactor)
- `DesktopShell.tsx` owns `ManagedWindow[]` state + `currentMaxZIndex` counter.
- Full-bleed Unsplash landscape wallpaper with true day (turquoise-lake dolomite) vs night (starry mountain).
- Only 2 desktop shortcut icons: `MoodDeck Music` + `RetroMSG Messenger`.
- Taskbar: exactly **40px**, glossy Luna blue gradient with specular highlight line, green pill Start button, pressed/raised task tabs, recessed dark-blue system tray with **AI Day/Night** hardware toggle switch and real-time HH:MM clock.
- `WindowFrame.tsx` uses framer-motion `drag` with `dragConstraints={{left:0,top:0,right,bottom}}` computed from desktop bounds. `.is-dragging` root class drops `backdrop-filter` during drag. Three glossy square controls: minimize (–), maximize (□), close (red ✕).

### MoodDeck (2026-02, iteration 3 — DJ controller rebuild)
- **Header row**: recessed segment display for Track/Artist/Album/time in VT323 orange (with scanline overlay), full-width `<canvas id="audio-visualizer" className="w-full h-16 bg-black rounded border border-gray-800">` with animated frequency bars, ENABLE ADVANCED MIXER hardware slot toggle.
- **Dual-deck body** (3-column grid): Left deck (spinning platter — horizontal drag = scrub) | Center MIX STATION (Bass/Mid/Treble rotary knobs + CH1/CH2 vertical faders + crossfader; `opacity-40 pointer-events-none` when advanced mixer OFF) | Right deck (spinning platter — vertical drag = volume).
- Platter rotation uses `useMotionValue` + framer-motion `animate` — continuous linear when `isPlaying=true`, smooth 800ms `easeOut` decel when paused (never snaps).
- Real audio playback via SoundHelix MP3s (no Web Audio EQ — CORS-safe).
- Transport row per deck: prev / cue / play(green LED) on deck 1; sync / loop / next on deck 2.
- **Bottom footer**: mood chips grid (9 moods) | recommendation card (cover + playlist name + artist + track count + big green PLAY PLAYLIST button) | **companion anchor** (bottom-right).
- Companion: 140×140 chibi image (customer-provided dark-streetwear artwork), `bobAndBreathe` keyframe animation on inner wrapper (click target stays stable for automation), speech bubble "What's your mood today?" that updates per-mood, retro `<label>`-wrapped radio group (Male / Female) — female applies `filter: hue-rotate(300deg) saturate(1.6)`.

### RetroMSG (unchanged from iteration 1)
- Sidebar with profile + search + 7 contacts.
- Instagram-style stories row with auto-dismissing story modal.
- Chat with typing indicator, timestamps, image/voice placeholder bubbles, emoji picker, fake replies.

## Testing status
- **iteration_2 (this delivery)**: 17/17 requested scenarios pass. No console errors, no functional bugs. Two low-priority nits already fixed (day wallpaper swap + moved bobAndBreathe onto a non-clickable child element).

## Known trade-offs
- Bass/Mid/Treble knobs & faders drive React state only when Advanced Mixer is ON — they don't audibly change output (SoundHelix has no CORS headers so `createMediaElementSource` would break). Swap in a CORS-enabled audio source to wire real EQ.
- Female chibi variant is a CSS hue-rotate placeholder over the male reference asset. Replace with a dedicated female illustration when available.
- `Companion.jsx` and `Platter.jsx` in `components/mooddeck/` are unused dead code from iteration 1 (the new MoodDeck.jsx inlines its own Platter/Knob/Fader). Safe to delete on next pass.

## Prioritized Backlog
### P1
- Wire real Spotify Web API (`data/mockData.js#PLAYLISTS_BY_MOOD` matches Spotify shape 1:1).
- Persist window positions + companion choice + theme to `localStorage`.
- Extract Platter/Knob/Fader into standalone components inside `components/mooddeck/`.
### P2
- Real Web Audio EQ with a CORS-enabled audio source (Bass/Mid/Treble knobs → BiquadFilterNodes).
- Voice message recording (MediaRecorder) in RetroMSG.
- Story creation flow.
- Extra desktop apps (Notepad, Paint) via the `APPS` registry in `DesktopShell.tsx`.
