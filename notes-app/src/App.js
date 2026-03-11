import { useState, useRef } from "react";

const SAMPLE_NOTES = [
  { id: 1, title: "Welcome to Jot It!", content: "", color: "#f5a623", pinned: true, createdAt: new Date(Date.now() - 86400000 * 2) },
  { id: 2, title: "Project Ideas", content: "• Build a habit tracker\n• Learn Rust\n• Read 12 books this year\n• Morning journaling routine", color: "#7ed321", pinned: false, createdAt: new Date(Date.now() - 86400000) },
  { id: 3, title: "Shopping List", content: "Milk, eggs, bread, coffee beans, olive oil, pasta, fresh basil", color: "#4a90e2", pinned: false, createdAt: new Date(Date.now() - 3600000) },
];

const COLORS = ["#f5a623", "#7ed321", "#4a90e2", "#e84393", "#bd10e0", "#50e3c2", "#ff6b6b", "#c8c8c8"];

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotesApp() {
  const [notes, setNotes] = useState(SAMPLE_NOTES);
  const [activeId, setActiveId] = useState(1);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  const activeNote = notes.find(n => n.id === activeId);
  const filtered = notes
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.pinned - a.pinned || new Date(b.createdAt) - new Date(a.createdAt));

  const createNote = () => {
    const id = Date.now();
    const note = { id, title: "Untitled", content: "", color: COLORS[Math.floor(Math.random() * COLORS.length)], pinned: false, createdAt: new Date() };
    setNotes(prev => [...prev, note]);
    setActiveId(id);
    setTimeout(() => titleRef.current?.focus(), 100);
  };

  const updateNote = (field, value) => {
    setNotes(prev => prev.map(n => n.id === activeId ? { ...n, [field]: value, updatedAt: new Date() } : n));
  };

  const deleteNote = (id) => {
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (activeId === id) setActiveId(remaining[0]?.id || null);
  };

  const togglePin = (id) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const wordCount = activeNote ? activeNote.content.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f0f0f", color: "#e8e8e8", fontFamily: "'Georgia', 'Times New Roman', serif", overflow: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        textarea, input { font-family: inherit; background: none; border: none; outline: none; color: inherit; resize: none; }
        .note-item { transition: background 0.15s, transform 0.15s; cursor: pointer; }
        .note-item:hover { background: #1a1a1a !important; }
        .note-item.active { background: #1e1e1e !important; }
        .action-btn { transition: opacity 0.15s, color 0.15s; opacity: 0; cursor: pointer; background: none; border: none; color: #888; font-size: 14px; padding: 4px 6px; border-radius: 4px; }
        .action-btn:hover { color: #fff; background: #333; }
        .note-item:hover .action-btn { opacity: 1; }
        .note-item.active .action-btn { opacity: 1; }
        .color-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
        .color-picker-btn { width: 22px; height: 22px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: border-color 0.15s, transform 0.15s; }
        .color-picker-btn:hover { transform: scale(1.2); border-color: white; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        .fade-in { animation: fadeIn 0.2s ease forwards; }
        .toolbar-btn { background: none; border: none; color: #666; cursor: pointer; padding: 6px 8px; border-radius: 6px; font-size: 13px; transition: color 0.15s, background 0.15s; }
        .toolbar-btn:hover { color: #e8e8e8; background: #2a2a2a; }
        textarea::placeholder { color: #3a3a3a; }
      `}</style>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fade-in" style={{ width: 280, borderRight: "1px solid #1f1f1f", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #1a1a1a" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px", color: "#fff" }}>JotEm</span>
              <button onClick={createNote} style={{ background: "#fff", border: "none", color: "#000", width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 300, transition: "transform 0.15s" }} onMouseEnter={e => e.target.style.transform = "scale(1.08)"} onMouseLeave={e => e.target.style.transform = "none"}>+</button>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes…"
              style={{ width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#ccc" }}
            />
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#444", fontSize: 13 }}>No notes found</div>
            )}
            {filtered.map(note => (
              <div
                key={note.id}
                className={`note-item ${note.id === activeId ? "active" : ""}`}
                onClick={() => setActiveId(note.id)}
                style={{ padding: "10px 16px", borderBottom: "1px solid #151515", display: "flex", gap: 10, alignItems: "flex-start", position: "relative" }}
              >
                <div className="color-dot" style={{ background: note.color, marginTop: 6 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                    {note.pinned && <span style={{ fontSize: 10, color: "#666" }}>📌</span>}
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{note.title || "Untitled"}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>{note.content || "No content"}</div>
                  <div style={{ fontSize: 11, color: "#3a3a3a" }}>{timeAgo(note.createdAt)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button className="action-btn" onClick={e => { e.stopPropagation(); togglePin(note.id); }} title={note.pinned ? "Unpin" : "Pin"}>
                    {note.pinned ? "📌" : "📍"}
                  </button>
                  <button className="action-btn" onClick={e => { e.stopPropagation(); deleteNote(note.id); }} title="Delete" style={{ color: "#c0392b" }}>✕</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "12px 16px", borderTop: "1px solid #1a1a1a", fontSize: 12, color: "#333" }}>
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {activeNote ? (
          <>
            <div style={{ padding: "12px 24px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 8 }}>
              <button className="toolbar-btn" onClick={() => setSidebarOpen(p => !p)} title="Toggle sidebar" style={{ fontSize: 16 }}>
                {sidebarOpen ? "◀" : "▶"}
              </button>
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    className="color-picker-btn"
                    style={{ background: c, borderColor: activeNote.color === c ? "white" : "transparent" }}
                    onClick={() => updateNote("color", c)}
                  />
                ))}
              </div>
              <div style={{ width: 1, height: 20, background: "#2a2a2a", margin: "0 4px" }} />
              <button className="toolbar-btn" onClick={() => updateNote("pinned", !activeNote.pinned)}>
                {activeNote.pinned ? "📌" : "📍"}
              </button>
              <button className="toolbar-btn" style={{ color: "#c0392b" }} onClick={() => deleteNote(activeNote.id)}>🗑</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "40px 60px" }}>
              <div style={{ width: 40, height: 3, background: activeNote.color, borderRadius: 2, marginBottom: 24 }} />
              <input
                ref={titleRef}
                value={activeNote.title}
                onChange={e => updateNote("title", e.target.value)}
                placeholder="Untitled"
                style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-1px", color: "#fff", width: "100%", marginBottom: 8, lineHeight: 1.2 }}
              />
              <div style={{ fontSize: 12, color: "#3a3a3a", marginBottom: 32, display: "flex", gap: 16 }}>
                <span>{new Date(activeNote.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                <span>·</span>
                <span>{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
              </div>
              <textarea
                ref={contentRef}
                value={activeNote.content}
                onChange={e => updateNote("content", e.target.value)}
                placeholder="Start writing your thoughts here. Click the + button to create a new note."
                style={{ width: "100%", fontSize: 16, lineHeight: 1.8, color: "#c8c8c8", minHeight: "60vh", display: "block" }}
              />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "#333" }}>
            <div style={{ fontSize: 48 }}>📝</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>No note selected</div>
            <button onClick={createNote} style={{ background: "#fff", color: "#000", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600 }}>
              + New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}