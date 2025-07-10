import React, { useState, useEffect, useRef } from 'react';
import './App.css';

/*
  Modern, minimal notes app UI for create, edit, delete, list, and search.
  Color scheme: 
    -- Accent:   #ffca28 (yellow)
    -- Primary:  #1976d2 (blue)
    -- Secondary:#424242 (charcoal)
  Layout:
    - TopBar: title, search box.
    - Sidebar: notes list, add note button.
    - Main: note view/edit.
    - Responsive (sidebar collapses on mobile).
*/

// Helper for basic unique IDs for new notes.
const genId = () => '_' + Math.random().toString(36).substr(2, 9);

// PUBLIC_INTERFACE
function App() {
  // Notes state: [{id, title, content, date}]
  const [notes, setNotes] = useState(() => {
    // Load from localStorage for demo persistence.
    const stored = window.localStorage.getItem('notes');
    return stored ? JSON.parse(stored) : [];
  });
  const [activeNoteId, setActiveNoteId] = useState(null); // which note is shown/being edited
  const [search, setSearch] = useState(''); // search query
  const [sidebarOpen, setSidebarOpen] = useState(true); // for mobile UX
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' }); // edit/create form
  const [theme, setTheme] = useState('light');
  const contentRef = useRef(null);

  // Save notes to localStorage for demo.
  useEffect(() => {
    window.localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // Apply light theme.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Populate form when selecting for editing/viewing
  useEffect(() => {
    if (activeNoteId) {
      const note = notes.find(n => n.id === activeNoteId);
      setForm(note ? { title: note.title, content: note.content } : { title: '', content: '' });
      setIsEditing(false);
    } else {
      setForm({ title: '', content: '' });
      setIsEditing(false);
    }
  }, [activeNoteId, notes]);

  // PUBLIC_INTERFACE
  const handleSearch = (e) => setSearch(e.target.value);

  // PUBLIC_INTERFACE
  const handleSelectNote = (id) => {
    setActiveNoteId(id);
    setIsEditing(false);
    if (window.innerWidth < 700) setSidebarOpen(false); // auto-collapse on mobile
  };

  // PUBLIC_INTERFACE
  const handleAddNote = () => {
    setActiveNoteId(null);
    setForm({ title: '', content: '' });
    setIsEditing(true);
    if (contentRef.current) contentRef.current.focus();
  };

  // PUBLIC_INTERFACE
  const handleEdit = () => setIsEditing(true);

  // PUBLIC_INTERFACE
  const handleDelete = (id) => {
    if (window.confirm('Delete this note?')) {
      setNotes(notes.filter(n => n.id !== id));
      if (activeNoteId === id) setActiveNoteId(null);
    }
  };

  // PUBLIC_INTERFACE
  const handleFormChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  // PUBLIC_INTERFACE
  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim() && !form.content.trim()) return; // don't save empty
    if (activeNoteId && notes.some(n => n.id === activeNoteId)) {
      setNotes(notes.map(n =>
        n.id === activeNoteId
          ? { ...n, title: form.title, content: form.content, date: new Date().toISOString() }
          : n
      ));
    } else {
      const id = genId();
      setNotes([
        ...notes,
        { id, title: form.title, content: form.content, date: new Date().toISOString() }
      ]);
      setActiveNoteId(id);
    }
    setIsEditing(false);
  };

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // PUBLIC_INTERFACE
  const filteredNotes = search
    ? notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
      )
    : notes;

  // Sort notes by most recent
  const sortedNotes = [...filteredNotes].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Minimize sidebar on small screens
  const sidebarStyle = {
    width: sidebarOpen ? 240 : 0,
    minWidth: sidebarOpen ? 180 : 0,
    background: '#f7f8fa',
    borderRight: '1px solid #e9ecef',
    transition: 'width 0.3s, min-width 0.3s',
    overflow: 'hidden',
    boxShadow: sidebarOpen ? '2px 0 8px #eee1' : 'none',
  };

  const COLORS = {
    accent: '#ffca28',
    primary: '#1976d2',
    secondary: '#424242',
  };

  return (
    <div style={{display: 'flex', height: '100vh', background: 'var(--bg-primary)'}}>

      {/* Sidebar */}
      <aside style={sidebarStyle} className="notes-sidebar">
        <div style={{display: 'flex', alignItems: 'center', padding: '20px 16px', borderBottom: '1px solid #e9ecef'}}>
          <span style={{
            fontWeight: 700, fontSize: 22, color: COLORS.primary, flex: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            Notes
          </span>
          <button
            aria-label="Collapse menu"
            style={{
              background: 'none', border: 0, cursor: 'pointer', fontSize: 22, color: COLORS.secondary, marginLeft: 4,
              display: window.innerWidth < 700 ? 'block' : 'none'
            }}
            onClick={() => setSidebarOpen(false)}
          >✖️</button>
        </div>
        <button
          style={{
            width: '90%',
            margin: '16px auto 8px auto',
            display: 'block',
            padding: '10px',
            fontSize: 15,
            background: COLORS.accent,
            color: '#222',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            boxShadow: '0 1px 8px #eee8',
            cursor: 'pointer',
            transition: 'box-shadow .2s',
          }}
          onClick={handleAddNote}
        >
          + New Note
        </button>
        <div style={{padding: '0 0 0 8px', overflowY: 'auto', flex: 1}}>
          {sortedNotes.length === 0 && (
            <div style={{margin: 30, color: '#bdbdbd', fontStyle: 'italic', fontSize: 14}}>
              No notes found.
            </div>
          )}
          {sortedNotes.map(note => (
            <div
              key={note.id}
              style={{
                cursor: 'pointer',
                padding: '12px 16px 10px 10px',
                margin: '2px 8px',
                borderRadius: 8,
                background: activeNoteId === note.id ? COLORS.primary : 'transparent',
                color: activeNoteId === note.id ? '#fff' : COLORS.secondary,
                fontWeight: activeNoteId === note.id ? 600 : 400,
                overflow: 'hidden',
                transition: 'background 0.2s, color 0.2s',
                display: 'flex', alignItems: 'center'
              }}
              onClick={() => handleSelectNote(note.id)}
              onDoubleClick={() => {
                setActiveNoteId(note.id);
                setIsEditing(true);
              }}
            >
              <span
                style={{
                  flex: 1,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  fontSize: 16
                }}
              >
                {note.title || <span style={{fontStyle: 'italic', opacity: 0.7}}>Untitled</span>}
              </span>
              <button
                aria-label="Delete note"
                style={{
                  background: 'none', border: 0, color: '#b71c1c', fontSize: 18, marginLeft: 8, cursor: 'pointer'
                }}
                onClick={e => {
                  e.stopPropagation(); handleDelete(note.id);
                }}
                title="Delete note"
              >🗑</button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main panel */}
      <div style={{
        flex: 1,
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100vh'
      }}>
        {/* Top bar */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          height: 60,
          padding: '0 24px',
          background: COLORS.primary,
          color: '#fff',
          borderBottom: '1px solid #1976d228',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {window.innerWidth < 700 && !sidebarOpen && (
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 26,
                  color: '#fff',
                  marginRight: 15,
                  cursor: 'pointer'
                }}
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
              >☰</button>
            )}
            <span style={{ fontWeight: 600, fontSize: 22, letterSpacing: 1 }}>Simple Notes</span>
          </div>
          <input
            type="search"
            placeholder="Search notes…"
            value={search}
            aria-label="Search notes"
            onChange={handleSearch}
            style={{
              width: 230,
              padding: '7px 14px',
              borderRadius: 7,
              outline: 'none',
              border: '1px solid #fff7',
              fontSize: 16,
              background: '#fff',
              color: COLORS.secondary,
              marginRight: 15
            }}
          />
          <button
            className="theme-toggle"
            style={{
              background: COLORS.accent,
              color: COLORS.secondary,
              fontWeight: 700,
              border: 0,
              borderRadius: 8,
              padding: '8px 18px',
              marginLeft: 6,
              transition: 'all .18s',
              cursor: 'pointer',
              fontSize: 16
            }}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            onClick={toggleTheme}
            title="Toggle light/dark mode"
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </nav>

        {/* Main note panel */}
        <main style={{
          flex: 1,
          padding: '0',
          overflowY: 'auto',
          background: 'var(--bg-secondary)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}>
          <section style={{
            width: '100%',
            maxWidth: 600,
            margin: '40px auto',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 3px 32px #0001, 0 1.5px 6px #c1c3dc18',
            padding: '32px 20px 26px 20px',
            minHeight: 320,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* No note selected & not adding? */}
            {(!activeNoteId && !isEditing) && (
              <div style={{ textAlign: 'center', color: '#999', marginTop: 50 }}>
                <span style={{fontSize: 38}}>📝</span>
                <h2 style={{margin: '24px 0 12px 0', color: COLORS.primary}}>Get started with Notes</h2>
                <p>You haven't selected or created a note <br/> yet.<br/><br/>
                  <button
                    onClick={handleAddNote}
                    style={{
                      background: COLORS.accent,
                      padding: '9px 36px',
                      borderRadius: 7,
                      fontWeight: 600,
                      border: 0,
                      color: COLORS.secondary,
                      cursor: 'pointer',
                      boxShadow: '0 0.5px 2px #eee8'
                    }}
                  >
                    + New Note
                  </button>
                </p>
              </div>
            )}

            {/* Editing/creating form */}
            {isEditing && (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input
                  name="title"
                  value={form.title}
                  placeholder="Note title"
                  onChange={handleFormChange}
                  style={{
                    fontSize: 21,
                    fontWeight: 600,
                    border: '1.3px solid #eee',
                    background: '#fcfcfe',
                    borderRadius: 7,
                    padding: '10px 12px',
                    color: COLORS.primary,
                  }}
                  autoFocus
                  required={false}
                />
                <textarea
                  name="content"
                  value={form.content}
                  placeholder="Start writing your note..."
                  onChange={handleFormChange}
                  ref={contentRef}
                  rows={9}
                  style={{
                    fontFamily: 'inherit',
                    fontSize: 17,
                    resize: 'vertical',
                    minHeight: 140,
                    padding: '13px 12px',
                    border: '1.2px solid #e0e0e0',
                    borderRadius: 9,
                    background: '#fcfcfe',
                  }}
                />
                <div style={{display: 'flex', gap: 10, marginTop: 8}}>
                  <button
                    type="submit"
                    style={{
                      background: COLORS.primary,
                      color: '#fff',
                      padding: '9px 26px',
                      border: 0,
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: 'pointer',
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    style={{
                      background: '#eee',
                      color: COLORS.secondary,
                      padding: '8px 18px',
                      border: 0,
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setIsEditing(false);
                      // If creating and unpopulated, deselect
                      if (!activeNoteId) setForm({ title: '', content: '' });
                    }}
                  >
                    Cancel
                  </button>
                  {activeNoteId && (
                    <button
                      type="button"
                      style={{
                        background: '#fff3e0',
                        color: '#b71c1c',
                        padding: '8px 18px',
                        border: '1.3px solid #ffc107',
                        borderRadius: 8,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleDelete(activeNoteId)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Viewing note */}
            {!isEditing && activeNoteId && (
              <div>
                <h2 style={{
                  fontWeight: 700,
                  color: COLORS.primary,
                  fontSize: 25,
                  margin: '0 0 8px 0',
                }}>
                  {form.title || <span style={{ fontStyle: 'italic', color: '#bbb' }}>Untitled</span>}
                </h2>
                <div style={{
                  color: COLORS.secondary,
                  fontSize: 15,
                  opacity: 0.68,
                  marginBottom: 18
                }}>
                  {new Date(notes.find(n => n.id === activeNoteId)?.date || Date.now()).toLocaleString()}
                </div>
                <pre style={{
                  fontSize: 17,
                  fontFamily: 'inherit',
                  background: '#fcfcfe',
                  color: COLORS.secondary,
                  padding: '17px 13px',
                  borderRadius: 7,
                  minHeight: 80
                }}>
                  {form.content || <span style={{ color: '#aaa', fontStyle: 'italic' }}>No content.</span>}
                </pre>
                <div style={{ marginTop: 15 }}>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      background: COLORS.primary,
                      color: '#fff',
                      padding: '7px 22px',
                      border: 0,
                      borderRadius: 7,
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}

          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
