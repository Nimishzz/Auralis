import React, { useState } from "react";
import { MailPlus, Reply, Forward, Trash2 } from "lucide-react";
import { EMAILS, MAIL_FOLDERS } from "../../data/mockData";

const TOOLBAR = [
  { id: "new",     label: "New Message", Icon: MailPlus },
  { id: "reply",   label: "Reply",       Icon: Reply },
  { id: "forward", label: "Forward",     Icon: Forward },
  { id: "delete",  label: "Delete",      Icon: Trash2 },
];

export default function RetroMessenger() {
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [activeEmailId, setActiveEmailId] = useState(EMAILS[0].id);
  const activeEmail = EMAILS.find(e => e.id === activeEmailId);

  const unreadCount = EMAILS.filter(e => !e.read).length;

  return (
    <div className="retromessenger" data-testid="retromessenger-app">
      {/* ============= Toolbar ============= */}
      <div className="rm-toolbar" data-testid="rm-toolbar">
        {TOOLBAR.map(({ id, label, Icon }) => (
          <button
            key={id}
            className="rm-toolbar-btn"
            data-testid={`rm-toolbar-${id}`}
            title={label}
          >
            <div className="rm-toolbar-icon">
              <Icon size={16} strokeWidth={2} />
            </div>
            <span>{label}</span>
          </button>
        ))}
        <div className="rm-toolbar-spacer" />
        <div className="rm-toolbar-status">Connected to POP3: mail.retrodesk.net</div>
      </div>

      {/* ============= Body (2 columns) ============= */}
      <div className="rm-body">
        {/* Left: folder menu */}
        <aside className="rm-folders" data-testid="rm-folders">
          <div className="rm-folders-title">Folders</div>
          {MAIL_FOLDERS.map(f => (
            <button
              key={f.id}
              className={`rm-folder ${activeFolder === f.id ? "active" : ""}`}
              onClick={() => setActiveFolder(f.id)}
              data-testid={`rm-folder-${f.id}`}
            >
              <span className="rm-folder-icon">{f.icon}</span>
              <span className={f.id === "inbox" ? "font-bold" : ""}>{f.label}</span>
              {f.id === "inbox" && unreadCount > 0 && (
                <span className="rm-badge" data-testid="rm-unread-badge">({unreadCount})</span>
              )}
            </button>
          ))}
        </aside>

        {/* Right: grid + reading pane */}
        <div className="rm-right">
          {/* Grid table */}
          <div className="rm-grid-wrap">
            <table className="rm-grid" data-testid="rm-grid">
              <thead>
                <tr>
                  <th style={{ width: 28 }}>!</th>
                  <th style={{ width: 180 }}>From</th>
                  <th>Subject</th>
                  <th style={{ width: 140 }}>Date Received</th>
                </tr>
              </thead>
              <tbody>
                {EMAILS.map(e => {
                  const selected = e.id === activeEmailId;
                  return (
                    <tr
                      key={e.id}
                      className={`rm-row ${selected ? "bg-[#000080] text-white" : ""} ${e.read ? "" : "font-bold"}`}
                      onClick={() => setActiveEmailId(e.id)}
                      data-testid={`rm-row-${e.id}`}
                    >
                      <td className="text-center">
                        {e.priority === "high" ? (
                          <span className={selected ? "text-white" : "text-red-600"}>!</span>
                        ) : ""}
                      </td>
                      <td className="truncate">{e.from}</td>
                      <td className="truncate">{e.subject}</td>
                      <td>{e.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Reading pane */}
          <div className="rm-reading" data-testid="rm-reading">
            <div className="rm-reading-header">
              <div><span className="rm-lbl">From:</span> {activeEmail.from}</div>
              <div><span className="rm-lbl">Subject:</span> {activeEmail.subject}</div>
              <div><span className="rm-lbl">Date:</span> {activeEmail.dateFull || activeEmail.date}</div>
            </div>
            <div className="rm-reading-body" data-testid="rm-reading-body">
              {activeEmail.body}
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="rm-statusbar" data-testid="rm-statusbar">
        <span>{EMAILS.length} messages, {unreadCount} unread</span>
        <span>Last check: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </div>
  );
}
