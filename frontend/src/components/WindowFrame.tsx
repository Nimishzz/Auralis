import React, { useEffect, useRef, useState } from "react";
import { motion, PanInfo } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface WindowFrameProps {
  id: string;
  title: string;
  Icon: LucideIcon;
  iconColor: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMaximized: boolean;
  isActive: boolean;
  taskbarHeight: number;
  dragContainerRef: React.RefObject<HTMLDivElement | null>;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (w: number, h: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  children: React.ReactNode;
}

const MIN_WIDTH = 480;
const MIN_HEIGHT = 320;

export default function WindowFrame(props: WindowFrameProps) {
  const {
    id, title, Icon, iconColor,
    x, y, width, height, zIndex,
    isMaximized, isActive, taskbarHeight, dragContainerRef,
    onFocus, onClose, onMinimize, onToggleMaximize,
    onMove, onResize, onDragStart, onDragEnd,
    children,
  } = props;

  const [dragConstraints, setDragConstraints] =
    useState<{ left: number; top: number; right: number; bottom: number }>({
      left: 0, top: 0, right: 0, bottom: 0,
    });

  // Compute drag boundaries relative to the desktop container.
  useEffect(() => {
    const el = dragContainerRef.current;
    if (!el) return;
    const bounds = el.getBoundingClientRect();
    setDragConstraints({
      left: 0,
      top: 0,
      // Right/bottom are inclusive of the moving window's box, so subtract width/height.
      right: Math.max(0, bounds.width - width),
      bottom: Math.max(0, bounds.height - height - taskbarHeight),
    });
  }, [dragContainerRef, width, height, taskbarHeight]);

  // Resize handler (mouse-based, framer-motion drag would fight our layout).
  const resizingRef = useRef<null | { sx: number; sy: number; sw: number; sh: number }>(null);
  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMaximized) return;
    onFocus();
    resizingRef.current = { sx: e.clientX, sy: e.clientY, sw: width, sh: height };
    document.addEventListener("mousemove", onResizeMove);
    document.addEventListener("mouseup", onResizeEnd);
  };
  const onResizeMove = (e: MouseEvent) => {
    const r = resizingRef.current;
    if (!r) return;
    const nw = Math.max(MIN_WIDTH, r.sw + (e.clientX - r.sx));
    const nh = Math.max(MIN_HEIGHT, r.sh + (e.clientY - r.sy));
    onResize(nw, nh);
  };
  const onResizeEnd = () => {
    resizingRef.current = null;
    document.removeEventListener("mousemove", onResizeMove);
    document.removeEventListener("mouseup", onResizeEnd);
  };

  const style: React.CSSProperties = isMaximized
    ? { top: 0, left: 0, width: "100vw", height: `calc(100vh - ${taskbarHeight}px)`, zIndex }
    : { width, height, zIndex };

  return (
    <motion.div
      layout={false}
      initial={isMaximized ? { opacity: 0, scale: 0.95, x: 0, y: 0 } : { opacity: 0, scale: 0.9, x, y }}
      animate={isMaximized ? { opacity: 1, scale: 1, x: 0, y: 0 } : { opacity: 1, scale: 1, x, y }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      drag={!isMaximized}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={dragConstraints}
      onDragStart={onDragStart}
      onDrag={(_, info: PanInfo) => {
        // Note: framer keeps its own x/y — we don't fight it during drag.
      }}
      onDragEnd={(_, info: PanInfo) => {
        onDragEnd();
        const nx = Math.max(0, Math.min(dragConstraints.right, x + info.offset.x));
        const ny = Math.max(0, Math.min(dragConstraints.bottom, y + info.offset.y));
        onMove(nx, ny);
      }}
      className={`window-frame win-shadow ${isActive ? "is-active" : "is-inactive"} ${isMaximized ? "is-maximized" : ""}`}
      style={style}
      onMouseDown={onFocus}
      data-testid={`window-${id}`}
    >
      {/* Title bar */}
      <div
        className="win-titlebar"
        onDoubleClick={onToggleMaximize}
        data-testid={`window-titlebar-${id}`}
      >
        <Icon
          size={14}
          color="#fff"
          style={{ filter: `drop-shadow(0 0 4px ${iconColor})` }}
        />
        <span className="win-title-label">{title}</span>
        <div className="win-controls" data-nowin-drag onPointerDown={(e) => e.stopPropagation()}>
          <button
            className="win-btn minimize"
            onClick={onMinimize}
            data-testid={`window-min-${id}`}
            title="Minimize"
            aria-label="Minimize"
          >
            <span className="ctrl-glyph-minimize" />
          </button>
          <button
            className="win-btn maximize"
            onClick={onToggleMaximize}
            data-testid={`window-max-${id}`}
            title={isMaximized ? "Restore" : "Maximize"}
            aria-label="Maximize"
          >
            <span className="ctrl-glyph-maximize" />
          </button>
          <button
            className="win-btn close"
            onClick={onClose}
            data-testid={`window-close-${id}`}
            title="Close"
            aria-label="Close"
          >
            <span className="ctrl-glyph-close">✕</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="win-body" style={{ height: `calc(100% - 30px)` }}>
        {children}
        {!isMaximized && (
          <div
            className="win-resize-handle"
            onMouseDown={onResizeMouseDown}
            data-testid={`window-resize-${id}`}
          />
        )}
      </div>
    </motion.div>
  );
}
