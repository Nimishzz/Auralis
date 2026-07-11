import React from "react";
import { Volume2, Wifi, Sun, Moon } from "lucide-react";
import type { ThemeMode } from "../types";

interface AppLike {
  id: string;
  title: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}

interface TaskbarWindow {
  id: string;
  appId: string;
  isMinimized: boolean;
  zIndex: number;
}

interface TaskbarProps {
  now: Date;
  windows: TaskbarWindow[];
  apps: Record<string, AppLike>;
  startOpen: boolean;
  onStartToggle: () => void;
  onTaskClick: (id: string) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  activeTopId: string | null;
  height: number;
}

export default function Taskbar(props: TaskbarProps) {
  const { now, windows, apps, startOpen, onStartToggle, onTaskClick, theme, onThemeToggle, activeTopId, height } = props;

  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="taskbar" data-testid="taskbar" style={{ height }}>
      <div className="taskbar-highlight" />
      <button
        className="start-btn"
        onClick={onStartToggle}
        data-testid="start-button"
        aria-expanded={startOpen}
      >
        <span
          className="start-orb"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #fff 0%, #ffd674 40%, #ff8833 80%)",
          }}
        />
        <span className="start-text">start</span>
      </button>

      <div className="task-tabs">
        {windows.map((w) => {
          const app = apps[w.appId];
          if (!app) return null;
          const Icon = app.Icon;
          const pressed = !w.isMinimized && activeTopId === w.id;
          return (
            <button
              key={w.id}
              onClick={() => onTaskClick(w.id)}
              className={`taskbar-tab ${pressed ? "pressed" : "raised"}`}
              data-testid={`taskbar-tab-${w.appId}`}
              title={app.title}
            >
              <Icon size={14} color="#fff" />
              <span className="tab-label">{app.title}</span>
            </button>
          );
        })}
      </div>

      <div className="system-tray" data-testid="system-tray">
        <button
          className="tray-toggle"
          onClick={onThemeToggle}
          data-testid="theme-toggle"
          title={theme === "day" ? "Switch to Night" : "Switch to Day"}
          aria-label="AI Day/Night Mode"
        >
          <span className={`tray-toggle-track ${theme === "night" ? "night" : "day"}`}>
            <span className="tray-toggle-thumb">
              {theme === "day" ? <Sun size={11} color="#ff8833" /> : <Moon size={11} color="#a3c0ff" />}
            </span>
          </span>
          <span className="tray-toggle-label">
            AI {theme === "day" ? "Day" : "Night"}
          </span>
        </button>
        <div className="tray-sep" />
        <Wifi size={13} />
        <Volume2 size={13} />
        <div className="tray-clock" data-testid="taskbar-clock">{timeStr}</div>
      </div>
    </div>
  );
}
