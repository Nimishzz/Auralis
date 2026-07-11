import React from "react";
import { Volume2, Wifi } from "lucide-react";

export default function Taskbar({ now, windows, apps, onStartToggle, startOpen, onTaskClick }) {
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <div className="taskbar" data-testid="taskbar">
      <button
        className="start-btn"
        onClick={onStartToggle}
        data-testid="start-button"
        aria-expanded={startOpen}
      >
        <span className="inline-block w-4 h-4 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 30%, #fff 0%, #ffd674 40%, #ff8833 80%)",
            boxShadow: "inset 0 -2px 3px rgba(0,0,0,0.3), 0 0 6px rgba(255,255,255,0.6)"
          }} />
        start
      </button>

      <div className="flex items-center gap-1 flex-1 overflow-hidden">
        {windows.map(w => {
          const app = apps[w.appId];
          if (!app) return null;
          const Icon = app.icon;
          return (
            <button
              key={w.id}
              onClick={() => onTaskClick(w.id)}
              className={`taskbar-tab ${!w.minimized ? "active" : ""}`}
              data-testid={`taskbar-tab-${w.appId}`}
              title={app.title}
            >
              <Icon size={14} color="#fff" />
              <span className="truncate">{app.title}</span>
            </button>
          );
        })}
      </div>

      <div className="system-tray" data-testid="system-tray">
        <Wifi size={14} />
        <Volume2 size={14} />
        <div className="flex flex-col items-end leading-tight">
          <span data-testid="taskbar-clock">{timeStr}</span>
          <span className="text-tiny opacity-90">{dateStr}</span>
        </div>
      </div>
    </div>
  );
}
