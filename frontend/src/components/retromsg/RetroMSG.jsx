import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Smile, Sticker, Search, Mic, Image as ImageIcon, Plus } from "lucide-react";
import { CURRENT_USER, STORIES, CONTACTS, CONVERSATIONS } from "../../data/mockData";

const EMOJIS = ["😊","😂","😍","🥺","🔥","💕","✨","🎉","😎","🤔","👀","🌸","🌈","💯","🎵","☕","🌙","⭐"];

export default function RetroMSG() {
  const [activeId, setActiveId] = useState(CONTACTS[0].id);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [threads, setThreads] = useState(() => ({ ...CONVERSATIONS }));
  const [typing, setTyping] = useState({});      // { [contactId]: bool }
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [storyModal, setStoryModal] = useState(null);
  const messagesEndRef = useRef(null);

  const filtered = useMemo(
    () => CONTACTS.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const active = CONTACTS.find(c => c.id === activeId);
  const messages = threads[activeId] || [];

  const typingHere = typing[activeId];
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages.length, activeId, typingHere]);

  const sendMessage = (extra = null) => {
    const content = (extra || text).trim();
    if (!content && !extra) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const msg = { id: `m${Date.now()}`, from: "me", kind: "text", text: content, time };
    setThreads(prev => ({ ...prev, [activeId]: [...(prev[activeId] || []), msg] }));
    setText("");
    // Simulate reply
    setTyping(prev => ({ ...prev, [activeId]: true }));
    setTimeout(() => {
      setTyping(prev => ({ ...prev, [activeId]: false }));
      const replies = ["haha ✨", "for real 😭", "no way", "omg tell me more", "😌", "brb", "lolol"];
      const reply = { id: `r${Date.now()}`, from: activeId, kind: "text", text: replies[Math.floor(Math.random() * replies.length)], time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) };
      setThreads(prev => ({ ...prev, [activeId]: [...(prev[activeId] || []), reply] }));
    }, 1400 + Math.random() * 1200);
  };

  const sendPlaceholder = (kind) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const msg = { id: `m${Date.now()}`, from: "me", kind, text: kind === "image" ? "image" : "", duration: "0:08", time };
    setThreads(prev => ({ ...prev, [activeId]: [...(prev[activeId] || []), msg] }));
  };

  return (
    <div className="retromsg" data-testid="retromsg-app">
      {/* Sidebar */}
      <div className="rmsg-sidebar">
        <div className="rmsg-profile">
          <div className="rmsg-avatar" style={{ width: 44, height: 44 }}>
            <img src={CURRENT_USER.avatar} alt="me" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">{CURRENT_USER.name}</div>
            <div className="flex items-center gap-1.5 text-tiny opacity-90">
              <div className="rmsg-status" /> {CURRENT_USER.mood}
            </div>
          </div>
        </div>

        <div className="rmsg-search">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7ba7d9]" />
            <input
              type="text"
              placeholder="Search contacts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7"
              data-testid="rmsg-search"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1" data-testid="rmsg-contacts">
          {filtered.map(c => (
            <div
              key={c.id}
              className={`rmsg-contact ${activeId === c.id ? "active" : ""}`}
              onClick={() => setActiveId(c.id)}
              data-testid={`rmsg-contact-${c.id}`}
            >
              <div className="relative">
                <div className="rmsg-avatar"><img src={c.avatar} alt={c.name} /></div>
                {c.online && <div className="rmsg-status absolute -bottom-0.5 -right-0.5 border-2 border-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{c.name}</div>
                <div className={`text-tiny truncate ${activeId === c.id ? "opacity-90" : "opacity-70"}`}>{c.lastMsg}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat */}
      <div className="rmsg-main">
        {/* Stories */}
        <div className="rmsg-stories" data-testid="rmsg-stories">
          {STORIES.map(s => (
            <div key={s.id} className="rmsg-story" onClick={() => setStoryModal(s)} data-testid={`story-${s.id}`}>
              <div className={`rmsg-story-ring ${s.viewed ? "viewed" : ""}`}>
                <div className="rmsg-story-inner">
                  {s.isMe ? (
                    <div className="relative w-full h-full">
                      <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#4a90e2] border-2 border-white flex items-center justify-center">
                        <Plus size={10} color="#fff" strokeWidth={3} />
                      </div>
                    </div>
                  ) : (
                    <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
              <div className="text-tiny text-[#1a3c75] font-semibold truncate max-w-[60px]">{s.name}</div>
            </div>
          ))}
        </div>

        {/* Chat header */}
        <div className="rmsg-chat-header">
          <div className="rmsg-avatar" style={{ width: 32, height: 32 }}>
            <img src={active.avatar} alt={active.name} />
          </div>
          <div>
            <div className="text-sm">{active.name}</div>
            <div className="text-tiny opacity-90">{active.online ? "● Online" : "○ Offline"}</div>
          </div>
        </div>

        {/* Messages */}
        <div className="rmsg-messages" ref={messagesEndRef} data-testid="rmsg-messages">
          {messages.map(m => (
            <MessageBubble key={m.id} msg={m} />
          ))}
          {typing[activeId] && (
            <div className="rmsg-typing" data-testid="rmsg-typing">
              <span/><span/><span/>
            </div>
          )}
        </div>

        {/* Emoji picker */}
        <AnimatePresence>
          {emojiOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="px-3 py-2 border-t border-[#7ba7d9] bg-white/70 backdrop-blur"
              data-testid="rmsg-emoji-picker"
            >
              <div className="flex flex-wrap gap-1">
                {EMOJIS.map(e => (
                  <button key={e} className="text-lg hover:scale-125 transition-transform" onClick={() => { setText(t => t + e); }}>
                    {e}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="rmsg-input">
          <button className="rmsg-input-btn" onClick={() => sendPlaceholder("image")} title="Attach" data-testid="rmsg-attach">
            <Paperclip size={16} />
          </button>
          <button className="rmsg-input-btn" onClick={() => sendPlaceholder("voice")} title="Voice message" data-testid="rmsg-voice">
            <Mic size={16} />
          </button>
          <input
            type="text"
            className="rmsg-input-field"
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
            data-testid="rmsg-input"
          />
          <button className="rmsg-input-btn" onClick={() => setEmojiOpen(o => !o)} title="Emoji" data-testid="rmsg-emoji">
            <Smile size={16} />
          </button>
          <button className="rmsg-input-btn" onClick={() => sendPlaceholder("image")} title="Sticker" data-testid="rmsg-sticker">
            <Sticker size={16} />
          </button>
          <button className="rmsg-input-btn send" onClick={() => sendMessage()} title="Send" data-testid="rmsg-send">
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Story viewer */}
      <AnimatePresence>
        {storyModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setStoryModal(null)}
            data-testid="story-modal"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="w-72 h-96 rounded-2xl overflow-hidden border-4 border-white shadow-2xl relative"
              style={{ background: `linear-gradient(135deg, #ffb0d4, #4a90e2)` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/30">
                <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 4 }} className="h-full bg-white"
                  onAnimationComplete={() => setStoryModal(null)}
                />
              </div>
              <div className="absolute top-3 left-3 flex items-center gap-2 text-white text-sm font-bold">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                  <img src={storyModal.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                {storyModal.name}
              </div>
              <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold p-6 text-center">
                ✨ {storyModal.isMe ? "Tap + to add your first story" : `${storyModal.name}'s Y2K throwback`} ✨
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MessageBubble({ msg }) {
  const mine = msg.from === "me";
  if (msg.kind === "image") {
    return (
      <div className={`rmsg-bubble ${mine ? "mine" : "theirs"}`} data-testid={`msg-${msg.id}`} style={{ padding: 4 }}>
        <div className="rmsg-image-placeholder">
          <div className="flex flex-col items-center gap-1">
            <ImageIcon size={22} />
            <div className="text-tiny opacity-90">{msg.text || "Photo"}</div>
          </div>
        </div>
        <span className="time px-2 pb-1">{msg.time}</span>
      </div>
    );
  }
  if (msg.kind === "voice") {
    return (
      <div className={`rmsg-bubble ${mine ? "mine" : "theirs"}`} data-testid={`msg-${msg.id}`}>
        <div className="rmsg-voice">
          <Mic size={16} />
          <div className="rmsg-voice-wave">
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} style={{ height: `${6 + (i % 5) * 3}px` }} />
            ))}
          </div>
          <span className="text-tiny opacity-80">{msg.duration || "0:12"}</span>
        </div>
        <span className="time">{msg.time}</span>
      </div>
    );
  }
  return (
    <div className={`rmsg-bubble ${mine ? "mine" : "theirs"}`} data-testid={`msg-${msg.id}`}>
      {msg.text}
      <span className="time">{msg.time}</span>
    </div>
  );
}
