import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { ThemeMode } from "../types";

interface AiMessage {
  from: "user" | "ai";
  text: string;
  time: string;
}

interface AiSidebarProps {
  theme: ThemeMode;
  onSendMessage?: (msg: string) => void;
}

const SEED_MESSAGES: AiMessage[] = [
  { from: "ai",   text: "Vista-AI Engine online. Ready for input, User.", time: "12:00 PM" },
  { from: "ai",   text: "Type a command below. Try: 'suggest a mood' or 'what's playing?'", time: "12:00 PM" },
];

const CANNED_REPLIES = [
  "Acknowledged. Cross-referencing music archive...",
  "Processing... suggestion loaded.",
  "Vista-AI recommends: try the 'Study' mood. Beats-per-minute: 82.",
  "Stack trace clear. No anomalies detected in current session.",
  "Recompiling knowledge graph... done.",
  "Signal strong. Neural nets purring.",
];

// Pixel-art blinking retro monitor
function PixelMonitor({ theme }: { theme: ThemeMode }) {
  const screenFill = theme === "night" ? "#00ff88" : "#7ba7d9";
  return (
    <svg width="28" height="24" viewBox="0 0 28 24" style={{ imageRendering: "pixelated" }}>
      <rect x="2" y="2" width="24" height="16" fill={theme === "night" ? "#333" : "#c8c8c8"} stroke="#000" strokeWidth="1.5" />
      <rect x="4" y="4" width="20" height="12" fill="#000" />
      {/* Blinking scanline pixels */}
      <rect x="6" y="6" width="3" height="2" fill={screenFill}>
        <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" />
      </rect>
      <rect x="11" y="6" width="2" height="2" fill={screenFill} opacity="0.6" />
      <rect x="15" y="6" width="4" height="2" fill={screenFill} opacity="0.8" />
      <rect x="6" y="10" width="6" height="2" fill={screenFill} opacity="0.5" />
      <rect x="14" y="10" width="8" height="2" fill={screenFill}>
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite" />
      </rect>
      <rect x="6" y="14" width="12" height="2" fill={screenFill} opacity="0.4" />
      {/* Stand */}
      <rect x="10" y="18" width="8" height="2" fill={theme === "night" ? "#666" : "#888"} stroke="#000" strokeWidth="1" />
      <rect x="7" y="20" width="14" height="2" fill={theme === "night" ? "#333" : "#c8c8c8"} stroke="#000" strokeWidth="1" />
    </svg>
  );
}

export default function AiSidebar({ theme, onSendMessage }: AiSidebarProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>(SEED_MESSAGES);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: AiMessage = { from: "user", text: value, time: now };
    setMessages(m => [...m, userMsg]);
    setText("");
    onSendMessage && onSendMessage(value);
    // Fake AI reply
    setTimeout(() => {
      const reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
      setMessages(m => [...m, {
        from: "ai", text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
    }, 900 + Math.random() * 600);
  };

  return (
    <motion.aside
      className={`ai-sidebar theme-${theme} ${open ? "open" : "closed"}`}
      data-testid="ai-sidebar"
      initial={false}
      animate={{ x: open ? 0 : "calc(100% - 26px)" }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Handle tab */}
      <button
        className="ai-sidebar-handle"
        onClick={() => setOpen(v => !v)}
        data-testid="ai-sidebar-handle"
        aria-label={open ? "Collapse AI panel" : "Expand AI panel"}
        aria-expanded={open}
      >
        {open ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        <span className="ai-handle-label">AI</span>
      </button>

      <div className="ai-sidebar-body">
        {/* Header */}
        <div className="ai-header" data-testid="ai-header">
          <PixelMonitor theme={theme} />
          <div className="ai-header-title">
            <div className="ai-header-name">Vista-AI Engine</div>
            <div className="ai-header-ver">v1.0</div>
          </div>
          <div className="ai-status-dot" />
        </div>

        {/* Scroll history */}
        <div className="ai-scroll" ref={scrollRef} data-testid="ai-scroll">
          {messages.map((m, i) => (
            <div key={i} className={`ai-line ai-line-${m.from}`} data-testid={`ai-line-${i}`}>
              <span className="ai-stamp">
                {m.from === "user" ? "*User:" : "**AI:*"}
              </span>{" "}
              <span className="ai-text">{m.text}</span>
              <span className="ai-time"> [{m.time}]</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="ai-input-area">
          <textarea
            className="ai-input"
            placeholder="Enter command..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            data-testid="ai-input"
            rows={3}
          />
          <button
            className="ai-send"
            onClick={submit}
            data-testid="ai-send"
          >
            Send Command
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
