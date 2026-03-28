import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, History, X, ChevronRight,
  Code2, BookOpen, Brain, BarChart3,
  MessageSquare, Trash2, Plus, Sparkles, Bot,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Aibot.css';
import logo from '../../Assets/images/StudyFlow-logo.png';

/* ─────────────────────────────────────────────────────────────
   MODE CONFIG
   modelName here is the DISPLAY label only — the actual model
   slug lives in the backend DISPLAY_NAMES registry.
───────────────────────────────────────────────────────────── */
const MODES = [
  { id: 'coding',       label: 'Coding',          modelName: 'Gemini 2.5 Pro',   Icon: Code2,     desc: 'Code, debug & build',  color: '#3b82f6', bg: '#1d4ed8' },
  { id: 'learning',     label: 'Learning',         modelName: 'Gemini 3 Flash',   Icon: BookOpen,  desc: 'Study & understand',   color: '#10b981', bg: '#065f46' },
  { id: 'problem',      label: 'Problem Solving',  modelName: 'GPT-OSS 120B',   Icon: Brain,     desc: 'Logic & reasoning',    color: '#f59e0b', bg: '#92400e' },
  { id: 'productivity', label: 'Productivity',     modelName: 'MiniMax M2.5',   Icon: BarChart3, desc: 'Writing & work tasks', color: '#ec4899', bg: '#9d174d' },
];

/* ─────────────────────────────────────────────────────────────
   LOCAL STORAGE HELPERS
───────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'studyflow_chat_sessions';

const loadSessions = () => {
  try   { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};

const saveSessions = (sessions) => {
  try   { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); }
  catch (e) { console.warn('[StudyFlow] Could not persist sessions:', e.message); }
};

const genId = () =>
  `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const getTitle = (msgs) => {
  const first = msgs.find((m) => m.type === 'user');
  if (!first) return 'New Chat';
  return first.content.slice(0, 42) + (first.content.length > 42 ? '…' : '');
};

const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

// Strip <think>...</think> blocks emitted by some reasoning models.
// Called ONCE when the bot reply arrives — never again during render.
const stripThink = (text) =>
  text ? text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim() : '';

const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
};

/* ─────────────────────────────────────────────────────────────
   AXIOS INSTANCE  ── single base URL + timeout for all requests
───────────────────────────────────────────────────────────── */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 90000, // OpenRouter free models can take up to 60 s
});

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
const Aibot = () => {
  const [messages,         setMessages]         = useState([]);
  const [inputMessage,     setInputMessage]     = useState('');
  const [isTyping,         setIsTyping]         = useState(false);
  const [showWelcome,      setShowWelcome]      = useState(true);
  const [transitioning,    setTransitioning]    = useState(false);
  const [userData,         setUserData]         = useState(null);
  const [currentMode,      setCurrentMode]      = useState(null);
  const [showModeModal,    setShowModeModal]    = useState(false);
  const [showHistory,      setShowHistory]      = useState(false);
  const [sessions,         setSessions]         = useState(loadSessions);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  /* ── Fetch user profile ── */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await api.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
      } catch (e) {
        console.warn('[StudyFlow] Profile fetch failed:', e.message);
      }
    };
    fetchUser();
    window.addEventListener('profileUpdated', fetchUser);
    return () => window.removeEventListener('profileUpdated', fetchUser);
  }, []);

  /* ── Auto-scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* ── Persist sessions on every message change ── */
  useEffect(() => {
    if (!messages.length) return;

    setSessions((prev) => {
      // Use existing session id or create a new one
      const sid = currentSessionId || genId();
      if (!currentSessionId) setCurrentSessionId(sid);

      const exists  = prev.find((s) => s.id === sid);
      const updated = exists
        ? prev.map((s) =>
            s.id === sid
              ? { ...s, messages, title: getTitle(messages), mode: currentMode?.id || null, updatedAt: Date.now() }
              : s
          )
        : [
            { id: sid, title: getTitle(messages), messages, mode: currentMode?.id || null, updatedAt: Date.now() },
            ...prev,
          ];

      saveSessions(updated);
      return updated;
    });
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Derived ── */
  const activeMode = MODES.find((m) => m.id === currentMode?.id);
  const firstName  = () => userData?.name?.split(' ')[0] || 'User';

  /* ─────────────────────────────────────────────────────────────
     PICK MODE
  ───────────────────────────────────────────────────────────── */
  const pickMode = useCallback((m) => {
    const isSwitch = currentMode && currentMode.id !== m.id;
    setCurrentMode(m);
    setShowModeModal(false);
    if (isSwitch) {
      toast.success(`Switched to ${m.label} — ${m.modelName}`, {
        hideProgressBar: false,
        closeOnClick:    true,
        pauseOnHover:    false,
        autoClose:       2500,
      });
    }
  }, [currentMode]);

  /* ─────────────────────────────────────────────────────────────
     SEND MESSAGE
     ─────────────────────────────────────────────────────────────
     FIX (critical): The old backend read req.body.message (a single
     string). The frontend must send req.body.messages (an array of
     { role, content } objects so the backend gets the full history
     and can pass it to each provider.
  ───────────────────────────────────────────────────────────── */
  const sendMessage = useCallback(async () => {
    const trimmed = inputMessage.trim();
    if (!trimmed || isTyping) return;

    /* 1. Optimistic UI: add user message immediately */
    const userMsg = {
      id:        Date.now(),
      type:      'user',
      content:   trimmed,
      timestamp: new Date().toISOString(),
    };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputMessage('');

    /* 2. Transition away from welcome screen */
    if (showWelcome) {
      setTransitioning(true);
      setTimeout(() => { setShowWelcome(false); setTransitioning(false); }, 350);
    }

    setIsTyping(true);

    /* 3. Build OpenAI-compatible messages array from full history.
          This is what every provider (Groq, Gemini via adapter,
          OpenRouter) receives on the backend. */
    const chatHistory = updatedHistory.map((m) => ({
      role:    m.type === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    /* 4. POST to /api/chat */
    try {
      const res = await api.post('/api/chat', {
        messages: chatHistory,          // ← array, never a single string
        mode:     currentMode?.id || null,
      });

      const { reply, modelName, fallback } = res.data;

      if (!reply) throw new Error('Server returned an empty reply.');

      /* 5. Store the cleaned reply (stripThink called ONCE here) */
      setMessages((prev) => [
        ...prev,
        {
          id:        Date.now() + 1,
          type:      'bot',
          content:   stripThink(reply),   // strip <think> tags once on receipt
          modelName: modelName || null,
          fallback:  fallback  || false,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (fallback) {
        toast.info(`Note: using fallback model — ${modelName}`, {
          hideProgressBar: true,
          autoClose:       3500,
        });
      }

    } catch (err) {
      /* Extract the most useful error string available */
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        err.message                 ||
        'Something went wrong. Please try again.';

      console.error('[StudyFlow] Chat error:', errMsg);

      setMessages((prev) => [
        ...prev,
        {
          id:        Date.now() + 2,
          type:      'bot',
          content:   `⚠️ ${errMsg}`,
          timestamp: new Date().toISOString(),
          isError:   true,
        },
      ]);

      toast.error('Message failed. See chat for details.', { autoClose: 3000 });

    } finally {
      setIsTyping(false);
    }
  }, [inputMessage, isTyping, messages, showWelcome, currentMode]);

  /* ─────────────────────────────────────────────────────────────
     KEYBOARD HANDLER
     FIX: onKeyPress is deprecated in React 17+ — use onKeyDown.
  ───────────────────────────────────────────────────────────── */
  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  /* ─────────────────────────────────────────────────────────────
     HISTORY ACTIONS
  ───────────────────────────────────────────────────────────── */
  const loadSession = useCallback((s) => {
    setMessages(s.messages);
    setCurrentSessionId(s.id);
    setCurrentMode(MODES.find((m) => m.id === s.mode) || null);
    setShowWelcome(false);
    setShowHistory(false);
  }, []);

  const deleteSession = useCallback((e, id) => {
    e.stopPropagation();
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSessions(updated);
      return updated;
    });
    if (currentSessionId === id) newChat();
  }, [currentSessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const newChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowWelcome(true);
    setCurrentMode(null);
    setShowHistory(false);
  }, []);

  /* ─────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────── */
  return (
    <div className="ab-root">

      {/* ══ TOP BAR ══ */}
      <div className="ab-topbar">
        <button className="ab-tb-btn" onClick={() => setShowHistory(true)}>
          <History size={14} />
          <span className="ab-tb-label">History</span>
        </button>

        <div className="ab-tb-mid">
          {activeMode ? (
            <span className="ab-mode-badge" style={{ '--mc': activeMode.color }}>
              <activeMode.Icon size={12} />
              {activeMode.label}
            </span>
          ) : (
            <span className="ab-mode-badge" style={{ '--mc': '#6366f1' }}>
              <Bot size={12} />
              General
            </span>
          )}
        </div>

        <button className="ab-tb-btn ab-tb-switch" onClick={() => setShowModeModal(true)}>
          <span className="ab-tb-label">Switch Mode</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* ══ BODY ══ */}
      <div className="ab-body">

        {/* Welcome */}
        {showWelcome && (
          <div className={`ab-welcome ${transitioning ? 'ab-welcome--out' : ''}`}>
            <div className="ab-orb" />
            <h2 className="ab-greet">{getGreeting()}, {firstName()}</h2>
            <p className="ab-sub">
              How Can I <span className="ab-accent">Assist You Today?</span>
            </p>
            <div className="ab-mode-pills">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  className="ab-pill"
                  style={{ '--mc': m.color }}
                  onClick={() => setCurrentMode(m)}
                >
                  <m.Icon size={14} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {!showWelcome && (
          <div className="ab-msgs">
            {messages.map((msg) => (
              <div key={msg.id} className={`ab-row ab-row--${msg.type}`}>
                <div className="ab-row-inner">

                  <div className="ab-avatar">
                    {msg.type === 'user'
                      ? <div className="ab-av-user">{firstName()[0].toUpperCase()}</div>
                      : <div className="ab-av-bot"><img src={logo} alt="StudyFlow AI" height={34} /></div>
                    }
                  </div>

                  <div className={`ab-bubble ab-bubble--${msg.type} ${msg.isError ? 'ab-bubble--error' : ''}`}>
                    {/*
                      FIX: stripThink() was called both in sendMessage() AND here
                      during render — causing a double pass over every bot reply.
                      stripThink() is now called ONCE in sendMessage() when the
                      message is stored. We simply render msg.content directly.
                    */}
                    <p className="ab-bubble-text">{msg.content}</p>

                    {msg.type === 'bot' && msg.modelName && (
                      <span className={`ab-model-tag ${msg.fallback ? 'ab-model-tag--fallback' : ''}`}>
                        {msg.fallback && '↩ '}{msg.modelName}
                      </span>
                    )}
                  </div>

                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="ab-row ab-row--bot">
                <div className="ab-row-inner">
                  <div className="ab-avatar">
                    <div className="ab-av-bot">
                      <img src={logo} alt="thinking" width={20} height={20} />
                    </div>
                  </div>
                  <div className="ab-bubble ab-bubble--bot ab-bubble--typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ══ INPUT BAR ══ */}
      <div className="ab-input-bar">
        <div
          className="ab-input-wrap"
          style={activeMode ? { '--fc': activeMode.color } : { '--fc': '#6366f1' }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={onKeyDown}        /* FIX: was onKeyPress (deprecated) */
            placeholder={
              currentMode
                ? `Ask anything in ${currentMode.label} mode…`
                : 'Ask anything…'
            }
            className="ab-input"
            disabled={isTyping}
            autoComplete="off"
            spellCheck="true"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="ab-send"
            style={activeMode ? { background: activeMode.color } : {}}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* ══ HISTORY SIDEBAR ══ */}
      {showHistory && (
        <div className="ab-overlay" onClick={() => setShowHistory(false)}>
          <aside className="ab-hist" onClick={(e) => e.stopPropagation()}>
            <div className="ab-hist-head">
              <span className="ab-hist-title">Chat History</span>
              <div className="ab-hist-actions">
                <button className="ab-btn-newchat" onClick={newChat}>
                  <Plus size={13} /> New Chat
                </button>
                <button className="ab-btn-close" onClick={() => setShowHistory(false)}>
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="ab-hist-list">
              {sessions.length === 0 ? (
                <div className="ab-hist-empty">
                  <MessageSquare size={24} />
                  <p>No chats yet</p>
                </div>
              ) : sessions.map((s) => {
                const mc = MODES.find((m) => m.id === s.mode);
                return (
                  <div
                    key={s.id}
                    className={`ab-hist-item ${s.id === currentSessionId ? 'ab-hist-item--active' : ''}`}
                    onClick={() => loadSession(s)}
                  >
                    <div className="ab-hist-icon" style={{ '--mc': mc?.color || '#6366f1' }}>
                      {mc ? <mc.Icon size={14} /> : <Bot size={14} />}
                    </div>
                    <div className="ab-hist-info">
                      <p className="ab-hist-name">{s.title}</p>
                      <span className="ab-hist-meta">
                        {mc?.label || 'General'} · {fmtDate(s.updatedAt)}
                      </span>
                    </div>
                    <button
                      className="ab-hist-del"
                      onClick={(e) => deleteSession(e, s.id)}
                      aria-label="Delete chat"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* ══ MODE MODAL ══ */}
      {showModeModal && (
        <div className="ab-overlay ab-overlay--bottom" onClick={() => setShowModeModal(false)}>
          <div className="ab-mode-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ab-mode-modal-head">
              <div>
                <h3>What's on your mind?</h3>
                <p>Pick a mode — the best AI model loads automatically</p>
              </div>
              <button className="ab-btn-close" onClick={() => setShowModeModal(false)}>
                <X size={15} />
              </button>
            </div>

            <div className="ab-mode-grid">
              {MODES.map((m) => {
                const active = currentMode?.id === m.id;
                return (
                  <button
                    key={m.id}
                    className={`ab-mode-card ${active ? 'ab-mode-card--active' : ''}`}
                    style={{ '--mc': m.color, '--mb': m.bg }}
                    onClick={() => pickMode(m)}
                  >
                    {active && <div className="ab-mode-card-dot" />}
                    <div className="ab-mode-card-icon"><m.Icon size={22} /></div>
                    <span className="ab-mode-card-label">{m.label}</span>
                    <span className="ab-mode-card-desc">{m.desc}</span>
                    <span className="ab-mode-card-model">{m.modelName}</span>
                  </button>
                );
              })}
            </div>

            <p className="ab-mode-note">
              <Sparkles size={12} />
              Switching modes keeps your full conversation context — only the AI model changes.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Aibot;