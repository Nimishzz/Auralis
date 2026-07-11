// Shared types for RetroDesk — the fake OS shell.

export type AppId = "music-mixer" | "messenger";

export interface ManagedWindow {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

// Extended runtime shape used by DesktopShell to track geometry.
export interface WindowInstance extends ManagedWindow {
  appId: AppId;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ThemeMode = "day" | "night";
