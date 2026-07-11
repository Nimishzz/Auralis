import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Music, MessageCircle, Power, LogOut, Settings, User } from "lucide-react";

export default function StartMenu({ onOpenApp, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const onDocDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        // Ignore clicks on the start button itself — it toggles menu independently
        if (e.target.closest('[data-testid="start-button"]')) return;
        onClose();
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="start-menu"
      data-testid="start-menu"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="start-menu-header">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-[#b0d4ff] border-2 border-white flex items-center justify-center">
          <User size={20} color="#1c5fc4" />
        </div>
        <div>
          <div className="text-sm">PixelBunny_92</div>
          <div className="text-tiny opacity-90">RetroDesk User</div>
        </div>
      </div>
      <div className="start-menu-body">
        <div className="text-tiny font-bold text-[#7ba7d9] uppercase tracking-wider px-2 pb-1">Applications</div>
        <button className="start-menu-item w-full text-left" data-testid="start-open-mooddeck" onClick={() => onOpenApp("mooddeck")}>
          <Music size={18} color="#ff8833" />
          <div>
            <div>MoodDeck</div>
            <div className="text-tiny opacity-70">DJ-inspired music player</div>
          </div>
        </button>
        <button className="start-menu-item w-full text-left" data-testid="start-open-retromsg" onClick={() => onOpenApp("retromsg")}>
          <MessageCircle size={18} color="#4a90e2" />
          <div>
            <div>RetroMSG</div>
            <div className="text-tiny opacity-70">Messenger, remixed</div>
          </div>
        </button>

        <div className="border-t border-[#a4c2e8] my-2" />
        <div className="text-tiny font-bold text-[#7ba7d9] uppercase tracking-wider px-2 pb-1">System</div>
        <button className="start-menu-item w-full text-left" onClick={onClose} data-testid="start-settings">
          <Settings size={18} color="#4a90e2" /> Settings
        </button>
        <button className="start-menu-item w-full text-left" onClick={onClose} data-testid="start-logoff">
          <LogOut size={18} color="#4a90e2" /> Log Off
        </button>
      </div>
      <div className="start-menu-footer">
        <button className="start-menu-item" onClick={onClose} data-testid="start-shutdown">
          <Power size={16} color="#d63030" />
          <span className="text-[#d63030] font-semibold">Turn Off Computer</span>
        </button>
      </div>
    </motion.div>
  );
}
