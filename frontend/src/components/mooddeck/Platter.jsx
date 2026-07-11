import React from "react";

export default function Platter({ cover, playing, spinSpeed = 4 }) {
  return (
    <div className="platter-wrap" data-testid="mooddeck-platter">
      <div
        className="platter"
        style={{
          animation: `spin ${spinSpeed}s linear infinite`,
          animationPlayState: playing ? "running" : "paused",
          transition: "animation-play-state 1.2s ease-out",
        }}
        data-testid="mooddeck-platter-disc"
      >
        <div className="platter-label">
          <img
            src={cover}
            alt="album"
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
      </div>
      {/* Tone arm — decorative */}
      <div
        style={{
          position: "absolute",
          top: 8, right: -6,
          width: 90, height: 12,
          background: "linear-gradient(180deg, #666, #222)",
          borderRadius: 6,
          transform: playing ? "rotate(15deg)" : "rotate(0deg)",
          transformOrigin: "right center",
          transition: "transform 0.5s ease-in-out",
          boxShadow: "0 3px 6px rgba(0,0,0,0.6)"
        }}
      >
        <div style={{ position: "absolute", left: -8, top: -3, width: 18, height: 18, background: "#ff8833", borderRadius: "50%", boxShadow: "0 0 10px #ff5500" }} />
      </div>
    </div>
  );
}
