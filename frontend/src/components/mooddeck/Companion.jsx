import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Simple SVG pixel-inspired companion characters.
// Two variants: female / male. Both breathe and blink; bob when music plays.

const bodyStyleF = {
  hair: "#ff9ecb",
  skin: "#ffd9b6",
  shirt: "#ff5c8a",
  accent: "#ffdd66"
};
const bodyStyleM = {
  hair: "#2b3a55",
  skin: "#ffd9b6",
  shirt: "#4a90e2",
  accent: "#a0e0ff"
};

function Character({ variant, blinking, playing }) {
  const s = variant === "female" ? bodyStyleF : bodyStyleM;

  return (
    <motion.div
      animate={playing ? { y: [0, -3, 0, 2, 0] } : { y: 0 }}
      transition={playing ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      style={{ transformOrigin: "50% 100%" }}
    >
      <motion.div
        animate={{ scaleY: [1, 1.04, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50% 100%" }}
      >
        <svg width="140" height="160" viewBox="0 0 140 160" style={{ imageRendering: "pixelated" }}>
          {/* shadow */}
          <ellipse cx="70" cy="152" rx="34" ry="5" fill="rgba(0,0,0,0.35)" />

          {/* body / shirt */}
          <rect x="42" y="90" width="56" height="55" rx="8" fill={s.shirt} stroke="#000" strokeWidth="2" />
          {/* accent stripe */}
          <rect x="42" y="108" width="56" height="6" fill={s.accent} />
          {/* neck */}
          <rect x="60" y="82" width="20" height="12" fill={s.skin} stroke="#000" strokeWidth="2" />

          {/* head */}
          <rect x="40" y="26" width="60" height="60" rx="10" fill={s.skin} stroke="#000" strokeWidth="2" />

          {/* hair */}
          {variant === "female" ? (
            <>
              <rect x="34" y="20" width="72" height="26" rx="10" fill={s.hair} stroke="#000" strokeWidth="2" />
              <rect x="32" y="38" width="12" height="34" fill={s.hair} stroke="#000" strokeWidth="2" />
              <rect x="96" y="38" width="12" height="34" fill={s.hair} stroke="#000" strokeWidth="2" />
              {/* bow */}
              <rect x="90" y="18" width="10" height="10" fill={s.accent} stroke="#000" strokeWidth="1.5" />
              <rect x="100" y="20" width="6" height="6" fill={s.accent} stroke="#000" strokeWidth="1.5" />
            </>
          ) : (
            <>
              <rect x="36" y="20" width="68" height="18" rx="6" fill={s.hair} stroke="#000" strokeWidth="2" />
              <rect x="36" y="34" width="14" height="14" fill={s.hair} stroke="#000" strokeWidth="2" />
              <rect x="90" y="34" width="14" height="14" fill={s.hair} stroke="#000" strokeWidth="2" />
            </>
          )}

          {/* headphones (both) */}
          <path d="M32 46 Q32 30 70 30 Q108 30 108 46" stroke="#111" strokeWidth="4" fill="none" />
          <rect x="26" y="44" width="12" height="18" rx="3" fill="#111" />
          <rect x="102" y="44" width="12" height="18" rx="3" fill="#111" />
          {playing && (
            <>
              <rect x="30" y="48" width="4" height="4" fill="#ff8833">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite" />
              </rect>
              <rect x="106" y="48" width="4" height="4" fill="#ff8833">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite" />
              </rect>
            </>
          )}

          {/* eyes */}
          {blinking ? (
            <>
              <rect x="52" y="58" width="10" height="2" fill="#111" />
              <rect x="78" y="58" width="10" height="2" fill="#111" />
            </>
          ) : (
            <>
              <rect x="52" y="54" width="10" height="10" fill="#fff" stroke="#111" strokeWidth="1.5" />
              <rect x="78" y="54" width="10" height="10" fill="#fff" stroke="#111" strokeWidth="1.5" />
              <rect x="56" y="58" width="4" height="4" fill="#111" />
              <rect x="82" y="58" width="4" height="4" fill="#111" />
            </>
          )}

          {/* blush */}
          <rect x="46" y="68" width="8" height="4" fill="#ffb6c1" opacity="0.8" />
          <rect x="86" y="68" width="8" height="4" fill="#ffb6c1" opacity="0.8" />

          {/* mouth */}
          {playing
            ? <rect x="62" y="72" width="16" height="6" rx="2" fill="#8b3a3a" stroke="#111" strokeWidth="1.5" />
            : <rect x="62" y="74" width="16" height="3" fill="#8b3a3a" stroke="#111" strokeWidth="1.5" />
          }
        </svg>
      </motion.div>
    </motion.div>
  );
}

export default function Companion({ variant = "female", onSwitch, message, playing }) {
  const [blinking, setBlinking] = useState(false);

  // Random blinking
  useEffect(() => {
    let t;
    const scheduleBlink = () => {
      const delay = 2200 + Math.random() * 3800;
      t = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => {
          setBlinking(false);
          scheduleBlink();
        }, 130);
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3" data-testid="mooddeck-companion">
      <div className="speech-bubble" data-testid="companion-speech-bubble">
        {message}
      </div>

      <Character variant={variant} blinking={blinking} playing={playing} />

      <div className="flex gap-1.5 bg-black/50 rounded-full p-1 border border-[#333]">
        <button
          onClick={() => onSwitch("female")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${variant === "female" ? "bg-gradient-to-b from-[#ff9944] to-[#d64500] text-white shadow-[0_0_10px_rgba(255,120,50,0.6)]" : "text-[#888]"}`}
          data-testid="companion-switch-female"
        >
          ♀ Nova
        </button>
        <button
          onClick={() => onSwitch("male")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${variant === "male" ? "bg-gradient-to-b from-[#ff9944] to-[#d64500] text-white shadow-[0_0_10px_rgba(255,120,50,0.6)]" : "text-[#888]"}`}
          data-testid="companion-switch-male"
        >
          ♂ Rex
        </button>
      </div>
    </div>
  );
}
