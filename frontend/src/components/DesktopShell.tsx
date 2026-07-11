import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Music, MessageCircle } from "lucide-react";
import type { AppId, WindowInstance, ThemeMode } from "../types";
import Taskbar from "./Taskbar";
import StartMenu from "./StartMenu";
import DesktopIcon from "./DesktopIcon";
import WindowFrame from "./WindowFrame";
import MoodDeck from "./mooddeck/MoodDeck";
import RetroMessenger from "./retromsg/RetroMessenger";
import AiSidebar from "./AiSidebar";

// -----------------------------------------------------------------------------
// App registry — id → title, icon, default geometry, component
// -----------------------------------------------------------------------------
interface AppEntry {
  id: AppId;
  title: string;
  Icon: typeof Music;
  iconColor: string;
  Component: React.ComponentType;
  defaultWidth: number;
  defaultHeight: number;
  defaultX: number;
  defaultY: number;
}

const APPS: Record<AppId, AppEntry> = {
  "music-mixer": {
    id: "music-mixer",
    title: "MoodDeck",
    Icon: Music,
    iconColor: "#ff8833",
    Component: MoodDeck,
    defaultWidth: 1100,
    defaultHeight: 720,
    defaultX: 60,
    defaultY: 40,
  },
  messenger: {
    id: "messenger",
    title: "RetroMessenger",
    Icon: MessageCircle,
    iconColor: "#4a90e2",
    Component: RetroMessenger,
    defaultWidth: 900,
    defaultHeight: 600,
    defaultX: 180,
    defaultY: 110,
  },
};

const TASKBAR_HEIGHT = 40;

function clampWindowGeometry(w, viewportWidth, viewportHeight, taskbarHeight) {
  const width = Math.min(w.width, Math.max(320, viewportWidth - 4));
  const height = Math.min(w.height, Math.max(240, viewportHeight - taskbarHeight - 4));
  const maxX = Math.max(0, viewportWidth - width);
  const maxY = Math.max(0, viewportHeight - taskbarHeight - height);
  return { ...w, width, height, x: Math.min(Math.max(0, w.x), maxX), y: Math.min(Math.max(0, w.y), maxY) };
}

// Classic high-saturation landscape wallpaper — XP Bliss inspired (bright green hills for day).
const WALLPAPER_DAY =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80";
const WALLPAPER_NIGHT =
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80";

// -----------------------------------------------------------------------------
// DesktopShell — full-screen container that hosts wallpaper, icons, windows,
// taskbar and start menu. Manages window state + z-index stack.
// -----------------------------------------------------------------------------
export default function DesktopShell() {
  const [windows, setWindows] = useState<WindowInstance[]>(() =>
    (Object.values(APPS) as AppEntry[]).map((app, idx) => ({
      id: app.id,
      appId: app.id,
      title: app.title,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: idx + 1,
      x: app.defaultX,
      y: app.defaultY,
      width: app.defaultWidth,
      height: app.defaultHeight,
    })),
  );

  const [currentMaxZIndex, setCurrentMaxZIndex] = useState<number>(10);
  const [selectedIcon, setSelectedIcon] = useState<AppId | null>(null);
  const [startOpen, setStartOpen] = useState<boolean>(false);
  const [now, setNow] = useState<Date>(new Date());
  const [theme, setTheme] = useState<ThemeMode>("day");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const desktopRef = useRef<HTMLDivElement | null>(null);

  // Live clock
  useEffect(() => {
    const i = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(i);
  }, []);

  // -------------------------------------------------------------------------
  // Window operations
  // -------------------------------------------------------------------------
  const bringToFront = useCallback((id: string) => {
    setCurrentMaxZIndex((z) => {
      const nextZ = z + 1;
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w)),
      );
      return nextZ;
    });
  }, []);

  const openApp = useCallback(
    (appId: AppId) => {
      setStartOpen(false);
      setCurrentMaxZIndex((z) => {
        const nextZ = z + 1;
        setWindows((prev) =>
          prev.map((w) =>
            w.appId === appId
              ? clampWindowGeometry(
                  { ...w, isOpen: true, isMinimized: false, zIndex: nextZ },
                  window.innerWidth,
                  window.innerHeight,
                  TASKBAR_HEIGHT,
                )
              : w,
          ),
        );
        return nextZ;
      });
    },
    [],
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, isOpen: false, isMinimized: false, isMaximized: false } : w,
      ),
    );
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)),
    );
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const next = { ...w, isMaximized: !w.isMaximized };
        return next.isMaximized
          ? next
          : clampWindowGeometry(next, window.innerWidth, window.innerHeight, TASKBAR_HEIGHT);
      }),
    );
  }, []);

  useEffect(() => {
    const onResize = () => {
      setWindows((prev) =>
        prev.map((w) =>
          w.isOpen && !w.isMaximized
            ? clampWindowGeometry(w, window.innerWidth, window.innerHeight, TASKBAR_HEIGHT)
            : w,
        ),
      );
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  const resizeWindow = useCallback((id: string, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, width, height } : w)),
    );
  }, []);

  // Taskbar tab click: minimize if active, else focus+restore.
  const onTaskbarClick = useCallback(
    (id: string) => {
      const win = windows.find((w) => w.id === id);
      if (!win) return;
      if (win.isMinimized) bringToFront(id);
      else if (win.zIndex === currentMaxZIndex) minimizeWindow(id);
      else bringToFront(id);
    },
    [windows, currentMaxZIndex, bringToFront, minimizeWindow],
  );

  // Icon activation — spec says click OR double-click both open the app.
  const activateIcon = useCallback(
    (appId: AppId) => {
      setSelectedIcon(appId);
      openApp(appId);
    },
    [openApp],
  );

  const activeTopId = useMemo(() => {
    const open = windows.filter((w) => w.isOpen && !w.isMinimized);
    if (!open.length) return null;
    return open.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)).id;
  }, [windows]);

  // Desktop boundaries for drag constraint
  const desktopBounds = { left: 0, top: 0 }; // right/bottom computed by window itself

  return (
    <div
      ref={desktopRef}
      className={`retrodesk-root ${isDragging ? "is-dragging" : ""} theme-${theme}`}
      data-testid="retrodesk-root"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedIcon(null);
        }
      }}
    >
      {/* --- Wallpaper (full bleed) --- */}
      <div className="wallpaper-image" data-testid="wallpaper">
        <img
          src={theme === "day" ? WALLPAPER_DAY : WALLPAPER_NIGHT}
          alt="wallpaper"
          draggable={false}
        />
        <div className={`wallpaper-tint ${theme === "night" ? "night" : ""}`} />
      </div>

      {/* --- Desktop shortcut icons (left column) --- */}
      <div className="desktop-shortcut-grid" data-testid="desktop-icon-grid">
        {(Object.values(APPS) as AppEntry[]).map((app) => (
          <DesktopIcon
            key={app.id}
            id={app.id}
            label={
              app.id === "music-mixer" ? "MoodDeck Music" : "RetroMessenger"
            }
            Icon={app.Icon}
            color={app.iconColor}
            selected={selectedIcon === app.id}
            onClick={() => setSelectedIcon(app.id)}
            onDoubleClick={() => activateIcon(app.id)}
            testId={`desktop-icon-${app.id}`}
          />
        ))}
      </div>

      {/* --- Windows --- */}
      <AnimatePresence>
        {windows
          .filter((w) => w.isOpen && !w.isMinimized)
          .map((w) => {
            const app = APPS[w.appId];
            const AppComp = app.Component;
            return (
              <WindowFrame
                key={w.id}
                id={w.id}
                title={app.title}
                Icon={app.Icon}
                iconColor={app.iconColor}
                x={w.x}
                y={w.y}
                width={w.width}
                height={w.height}
                zIndex={w.zIndex}
                isMaximized={w.isMaximized}
                isActive={activeTopId === w.id}
                taskbarHeight={TASKBAR_HEIGHT}
                dragContainerRef={desktopRef}
                onFocus={() => bringToFront(w.id)}
                onClose={() => closeWindow(w.id)}
                onMinimize={() => minimizeWindow(w.id)}
                onToggleMaximize={() => toggleMaximize(w.id)}
                onMove={(x, y) => moveWindow(w.id, x, y)}
                onResize={(nw, nh) => resizeWindow(w.id, nw, nh)}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
              >
                <AppComp />
              </WindowFrame>
            );
          })}
      </AnimatePresence>

      {/* --- Start Menu --- */}
      {startOpen && (
        <StartMenu
          onOpenApp={(appIdString: string) => openApp(appIdString as AppId)}
          onClose={() => setStartOpen(false)}
        />
      )}

      {/* --- AI Sidebar (right-docked overlay, above windows) --- */}
      <AiSidebar theme={theme} />

      {/* --- Taskbar --- */}
      <Taskbar
        now={now}
        windows={windows.filter((w) => w.isOpen)}
        apps={APPS}
        startOpen={startOpen}
        onStartToggle={() => setStartOpen((o) => !o)}
        onTaskClick={onTaskbarClick}
        theme={theme}
        onThemeToggle={() => setTheme((t) => (t === "day" ? "night" : "day"))}
        activeTopId={activeTopId}
        height={TASKBAR_HEIGHT}
      />
    </div>
  );
}
