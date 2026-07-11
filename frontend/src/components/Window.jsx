import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

const TASKBAR_H = 42;
const MIN_W = 480;
const MIN_H = 320;

export default function Window({
  id, title, Icon, iconColor,
  x, y, w, h, z,
  active, minimized, maximized,
  onFocus, onClose, onMinimize, onToggleMax,
  onMove, onResize,
  children
}) {
  const dragOffset = useRef(null);
  const resizing = useRef(null);
  const winRef = useRef(null);

  // Dragging
  const onTitleMouseDown = (e) => {
    if (maximized) return;
    if (e.target.closest("[data-nowin-drag]")) return;
    onFocus();
    dragOffset.current = { dx: e.clientX - x, dy: e.clientY - y };
    document.addEventListener("mousemove", onDragMove);
    document.addEventListener("mouseup", onDragEnd);
  };
  const onDragMove = (e) => {
    if (!dragOffset.current) return;
    const nx = e.clientX - dragOffset.current.dx;
    const ny = Math.max(0, e.clientY - dragOffset.current.dy);
    onMove(nx, ny);
  };
  const onDragEnd = () => {
    dragOffset.current = null;
    document.removeEventListener("mousemove", onDragMove);
    document.removeEventListener("mouseup", onDragEnd);
  };

  // Resizing
  const onResizeMouseDown = (e) => {
    e.stopPropagation();
    if (maximized) return;
    onFocus();
    resizing.current = { startX: e.clientX, startY: e.clientY, startW: w, startH: h };
    document.addEventListener("mousemove", onResizeMove);
    document.addEventListener("mouseup", onResizeEnd);
  };
  const onResizeMove = (e) => {
    if (!resizing.current) return;
    const nw = Math.max(MIN_W, resizing.current.startW + (e.clientX - resizing.current.startX));
    const nh = Math.max(MIN_H, resizing.current.startH + (e.clientY - resizing.current.startY));
    onResize(nw, nh);
  };
  const onResizeEnd = () => {
    resizing.current = null;
    document.removeEventListener("mousemove", onResizeMove);
    document.removeEventListener("mouseup", onResizeEnd);
  };

  useEffect(() => () => {
    document.removeEventListener("mousemove", onDragMove);
    document.removeEventListener("mouseup", onDragEnd);
    document.removeEventListener("mousemove", onResizeMove);
    document.removeEventListener("mouseup", onResizeEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = maximized
    ? { top: 0, left: 0, width: "100vw", height: `calc(100vh - ${TASKBAR_H}px)`, zIndex: z }
    : { top: y, left: x, width: w, height: h, zIndex: z };

  if (minimized) return null;

  return (
    <motion.div
      ref={winRef}
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute win-shadow"
      style={style}
      onMouseDown={onFocus}
      data-testid={`window-${id}`}
    >
      <div className="rounded-t-lg overflow-hidden" style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
        <div
          className={`win-titlebar ${active ? "" : "inactive"}`}
          onMouseDown={onTitleMouseDown}
          onDoubleClick={onToggleMax}
          data-testid={`window-titlebar-${id}`}
        >
          <Icon size={14} color="#fff" style={{ filter: `drop-shadow(0 0 4px ${iconColor})` }} />
          <span className="truncate flex-1">{title}</span>
          <div className="flex items-center gap-1" data-nowin-drag>
            <button className="win-btn minimize" onClick={onMinimize} data-testid={`window-min-${id}`} title="Minimize">
              <span style={{ display: "inline-block", width: 8, height: 2, background: "#fff", boxShadow: "0 4px 0 #fff", marginTop: 6 }}/>
            </button>
            <button className="win-btn maximize" onClick={onToggleMax} data-testid={`window-max-${id}`} title={maximized ? "Restore" : "Maximize"}>
              <span style={{ display: "inline-block", width: 9, height: 9, border: "1.5px solid #fff", borderRadius: 1 }}/>
            </button>
            <button className="win-btn close" onClick={onClose} data-testid={`window-close-${id}`} title="Close">
              ✕
            </button>
          </div>
        </div>
      </div>
      <div className="win-body" style={{ height: `calc(100% - 30px)` }}>
        {children}
        {!maximized && (
          <div className="win-resize-handle" onMouseDown={onResizeMouseDown} data-testid={`window-resize-${id}`} />
        )}
      </div>
    </motion.div>
  );
}
