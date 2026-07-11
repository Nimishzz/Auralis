import React, { useEffect, useState, useCallback } from "react";
import Taskbar from "./Taskbar";
import StartMenu from "./StartMenu";
import DesktopIcon from "./DesktopIcon";
import Window from "./Window";
import MoodDeck from "./mooddeck/MoodDeck";
import RetroMSG from "./retromsg/RetroMSG";
import { Music, MessageCircle, Trash2, Monitor, FolderOpen, Info } from "lucide-react";

// Registry of all applications available on the desktop.
const APPS = {
  mooddeck: {
    id: "mooddeck",
    title: "MoodDeck",
    icon: Music,
    iconColor: "#ff8833",
    component: MoodDeck,
    defaultSize: { w: 900, h: 620 },
    defaultPos:  { x: 90, y: 60 }
  },
  retromsg: {
    id: "retromsg",
    title: "RetroMSG",
    icon: MessageCircle,
    iconColor: "#4a90e2",
    component: RetroMSG,
    defaultSize: { w: 860, h: 560 },
    defaultPos:  { x: 180, y: 110 }
  }
};

// Purely decorative desktop icons — clicking shows a "coming soon" style stub.
const DECORATIVE_ICONS = [
  { id: "mycomputer", label: "My Computer", icon: Monitor,    color: "#e8f0fc" },
  { id: "documents",  label: "My Documents", icon: FolderOpen, color: "#ffd674" },
  { id: "recycle",    label: "Recycle Bin",  icon: Trash2,    color: "#a0d4a0" },
  { id: "about",      label: "About RetroDesk", icon: Info,   color: "#c0aede" }
];

// Random bubbles for the wallpaper.
function useBubbles(count = 14) {
  const [bubbles] = useState(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: 40 + Math.random() * 180,
      left: Math.random() * 100,
      top:  Math.random() * 100,
      drift: 8 + Math.random() * 12,
      delay: -Math.random() * 20,
    }))
  );
  return bubbles;
}

export default function Desktop() {
  const [windows, setWindows] = useState([]);   // { id, appId, x, y, w, h, minimized, maximized, z }
  const [zTop, setZTop] = useState(10);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [startOpen, setStartOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [toast, setToast] = useState(null);
  const bubbles = useBubbles();

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const openApp = useCallback((appId) => {
    setStartOpen(false);
    const app = APPS[appId];
    if (!app) return;
    setWindows(prev => {
      const existing = prev.find(w => w.appId === appId);
      if (existing) {
        // focus + un-minimize
        const nextZ = zTop + 1;
        return prev.map(w => w.id === existing.id ? { ...w, minimized: false, z: nextZ } : w);
      }
      const id = `${appId}-${Date.now()}`;
      const nextZ = zTop + 1;
      return [
        ...prev,
        {
          id, appId,
          x: app.defaultPos.x, y: app.defaultPos.y,
          w: app.defaultSize.w, h: app.defaultSize.h,
          minimized: false, maximized: false,
          z: nextZ
        }
      ];
    });
    setZTop(z => z + 1);
  }, [zTop]);

  const focusWindow = useCallback((id) => {
    setZTop(z => {
      const nextZ = z + 1;
      setWindows(prev => prev.map(w => w.id === id ? { ...w, z: nextZ, minimized: false } : w));
      return nextZ;
    });
  }, []);

  const closeWindow  = (id) => setWindows(prev => prev.filter(w => w.id !== id));
  const minimize     = (id) => setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w));
  const toggleMax    = (id) => setWindows(prev => prev.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w));
  const moveWindow   = (id, x, y) => setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  const resizeWindow = (id, w, h) => setWindows(prev => prev.map(win => win.id === id ? { ...win, w, h } : win));

  const handleIconClick = (id, isApp) => {
    setSelectedIcon(id);
    if (!isApp) {
      setToast(`${DECORATIVE_ICONS.find(d => d.id === id)?.label || "Item"} — coming soon in RetroDesk 2.0 ✨`);
      setTimeout(() => setToast(null), 2200);
    }
  };
  const handleIconDbl = (id, isApp) => { if (isApp) openApp(id); };

  return (
    <div
      className="retrodesk-root"
      data-testid="retrodesk-root"
      onMouseDown={(e) => { if (e.target === e.currentTarget) { setSelectedIcon(null); setStartOpen(false); } }}
    >
      {/* Wallpaper */}
      <div className="wallpaper" data-testid="wallpaper">
        {bubbles.map(b => (
          <div
            key={b.id}
            className="bubble"
            style={{
              width: b.size, height: b.size,
              left: `${b.left}%`, top: `${b.top}%`,
              animation: `floaty ${b.drift}s ease-in-out ${b.delay}s infinite alternate`
            }}
          />
        ))}
        <div className="wallpaper-glow" />
        <style>{`
          @keyframes floaty {
            0%   { transform: translate(0,0) scale(1); }
            50%  { transform: translate(20px,-30px) scale(1.06); }
            100% { transform: translate(-15px,25px) scale(0.98); }
          }
        `}</style>
      </div>

      {/* Desktop icon grid */}
      <div
        className="absolute top-4 left-4 grid gap-2"
        style={{ gridTemplateColumns: "repeat(1, 92px)", zIndex: 5 }}
        data-testid="desktop-icon-grid"
      >
        {Object.values(APPS).map(app => (
          <DesktopIcon
            key={app.id}
            id={app.id}
            label={app.title}
            Icon={app.icon}
            color={app.iconColor}
            selected={selectedIcon === app.id}
            onClick={() => handleIconClick(app.id, true)}
            onDoubleClick={() => handleIconDbl(app.id, true)}
            testId={`desktop-icon-${app.id}`}
          />
        ))}
        {DECORATIVE_ICONS.map(d => (
          <DesktopIcon
            key={d.id}
            id={d.id}
            label={d.label}
            Icon={d.icon}
            color={d.color}
            selected={selectedIcon === d.id}
            onClick={() => handleIconClick(d.id, false)}
            onDoubleClick={() => handleIconClick(d.id, false)}
            testId={`desktop-icon-${d.id}`}
          />
        ))}
      </div>

      {/* Windows */}
      {windows.map(w => {
        const app = APPS[w.appId];
        if (!app) return null;
        const AppComp = app.component;
        return (
          <Window
            key={w.id}
            id={w.id}
            title={app.title}
            Icon={app.icon}
            iconColor={app.iconColor}
            x={w.x} y={w.y} w={w.w} h={w.h}
            z={w.z}
            minimized={w.minimized}
            maximized={w.maximized}
            active={zTop === w.z}
            onFocus={() => focusWindow(w.id)}
            onClose={() => closeWindow(w.id)}
            onMinimize={() => minimize(w.id)}
            onToggleMax={() => toggleMax(w.id)}
            onMove={(x, y) => moveWindow(w.id, x, y)}
            onResize={(nw, nh) => resizeWindow(w.id, nw, nh)}
          >
            <AppComp />
          </Window>
        );
      })}

      {/* Start menu */}
      {startOpen && (
        <StartMenu
          onOpenApp={openApp}
          onClose={() => setStartOpen(false)}
        />
      )}

      {/* Taskbar */}
      <Taskbar
        now={now}
        windows={windows}
        apps={APPS}
        onStartToggle={() => setStartOpen(o => !o)}
        startOpen={startOpen}
        onTaskClick={(id) => {
          const win = windows.find(w => w.id === id);
          if (!win) return;
          if (win.minimized) focusWindow(id);
          else if (zTop === win.z) minimize(id);
          else focusWindow(id);
        }}
      />

      {/* Toast for decorative icons */}
      {toast && (
        <div
          data-testid="desktop-toast"
          className="absolute bottom-14 left-1/2 -translate-x-1/2 aero-glass px-4 py-2 rounded-lg text-sm font-medium text-[#1a3c75]"
          style={{ zIndex: 300 }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
