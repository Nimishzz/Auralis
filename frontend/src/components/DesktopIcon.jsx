import React from "react";

export default function DesktopIcon({ id, label, Icon, color, selected, onClick, onDoubleClick, testId }) {
  return (
    <div
      className={`desktop-icon ${selected ? "selected" : ""}`}
      onMouseDown={(e) => { e.stopPropagation(); onClick && onClick(); }}
      onDoubleClick={onDoubleClick}
      data-testid={testId}
      role="button"
      tabIndex={0}
    >
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{
          background: `linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.1))`,
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 10px rgba(0,50,120,0.3)",
        }}
      >
        <Icon size={30} color={color} strokeWidth={2.2} />
      </div>
      <div className="label">{label}</div>
    </div>
  );
}
