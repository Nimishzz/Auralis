import React, { useCallback, useRef } from "react";

// Simple rotary knob — value in [0..1], onChange returns new value.
export default function Knob({ label, value, onChange, size = 60, testId }) {
  const rotating = useRef(null);
  const knobRef = useRef(null);

  const startDeg = -135;
  const endDeg = 135;
  const rot = startDeg + value * (endDeg - startDeg);

  const onMouseDown = useCallback((e) => {
    rotating.current = { startY: e.clientY, startV: value };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    // eslint-disable-next-line
  }, [value]);

  const onMove = (e) => {
    if (!rotating.current) return;
    const dy = rotating.current.startY - e.clientY;
    const nv = Math.max(0, Math.min(1, rotating.current.startV + dy / 200));
    onChange(nv);
  };
  const onUp = () => {
    rotating.current = null;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };

  return (
    <div className="flex flex-col items-center gap-1.5" data-testid={testId}>
      <div
        ref={knobRef}
        className="knob"
        style={{ width: size, height: size, transform: `rotate(${rot}deg)` }}
        onMouseDown={onMouseDown}
      />
      <div className="mono-label text-tiny text-[#ff8833]">{label}</div>
      <div className="mono-label text-tiny text-[#666]">{Math.round(value * 100)}</div>
    </div>
  );
}
