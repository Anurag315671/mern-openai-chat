import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown, ArrowUp, AudioLines, Command, Menu, Sparkles,
  SquarePen, WandSparkles, Code2, Lightbulb, BookOpen, AlertCircle,
} from 'lucide-react';
import { api } from './lib/api.js';
import Sidebar from './components/Sidebar.jsx';
import Message from './components/Message.jsx';

const suggestions = [
  { icon: <Code2 size={17} />, title: 'Write some code', prompt: 'Help me write a clean, well-structured function for…' },
  { icon: <Lightbulb size={17} />, title: 'Get ideas', prompt: 'Give me a list of creative ideas for…' },
  { icon: <BookOpen size={17} />, title: 'Learn something', prompt: 'Explain a difficult concept in simple terms: …' },
  { icon: <WandSparkles size={17} />, title: 'Improve my writing', prompt: 'Help me improve this writing: …' },
];

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);
  const chatScrollRef = useRef(null);

  const refreshConversations = useCallback(async () => {
    const data = await api.listConversations();
    setConversations(data.conversations);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        const data = await api.listConversations();
        if (!cancelled) setConversations(data.conversations);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setBooting(false);
      }
    }
    initialize();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: loading ? 'smooth' : 'auto', block: 'end' });
  }, [messages, loading]);

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        startNewChat();
      }
      if (event.key === 'Escape') setSidebarOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  function handleScroll() {
    const element = chatScrollRef.current;
    if (!element) return;
    setShowScrollButton(element.scrollHeight - element.scrollTop - element.clientHeight > 300);
  }

  function startNewChat() {
    if (loading) return;
    setActiveId(null);
    setMessages([]);
    setDraft('');
    setError('');
    setSidebarOpen(false);
    textareaRef.current?.focus();
  }

  async function selectConversation(id) {
    if (loading) return;
    setError('');
    setSidebarOpen(false);
    try {
      const data = await api.getConversation(id);
      setActiveId(id);
      setMessages(data.conversation.messages || []);
    } catch (err) { setError(err.message); }
  }

  async function deleteConversation(id) {
    if (loading) return;
    if (!window.confirm('Delete this conversation? This cannot be undone.')) return;
    try {
      await api.deleteConversation(id);
      setConversations((current) => current.filter((item) => item._id !== id));
      if (activeId === id) { setActiveId(null); setMessages([]); }
    } catch (err) { setError(err.message); }
  }

  async function sendMessage(text = draft) {
    const content = text.trim();
    if (!content || loading) return;
    setError('');
    setDraft('');
    setLoading(true);
    const optimisticTimestamp = Date.now();
    setMessages((current) => [...current, { _id: `local-${optimisticTimestamp}`, role: 'user', content }]);

    try {
      let conversationId = activeId;
      if (!conversationId) {
        const created = await api.createConversation();
        conversationId = created.conversation._id;
        setActiveId(conversationId);
      }
      const result = await api.sendMessage(conversationId, content);
      setMessages(result.conversation.messages || []);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      await refreshConversations();
    } catch (err) {
      setMessages((current) => current.filter((message) => message._id !== `local-${optimisticTimestamp}`));
      setDraft(content);
      setError(err.message);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleSubmit(event) { event.preventDefault(); sendMessage(); }
  function handleTextareaKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSubmit(event); }
  }
  function handleDraftChange(event) {
    setDraft(event.target.value);
    const element = event.target;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 180)}px`;
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="app-shell" id="top">
      <Sidebar conversations={conversations} activeId={activeId} onNewChat={startNewChat} onSelect={selectConversation} onDelete={deleteConversation} onClose={() => setSidebarOpen(false)} mobileOpen={sidebarOpen} />
      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu size={19} /></button>
            <div className="model-picker"><span className="model-indicator" /><span>Orbit AI</span><span className="model-version">Assistant</span></div>
          </div>
          <div className="topbar-actions">
            <span className="secure-label"><span className="secure-dot" /> Connected</span>
            <button className="icon-button new-mobile" onClick={startNewChat} aria-label="New conversation"><SquarePen size={18} /></button>
          </div>
        </header>

        <section className={`chat-scroll ${isEmpty ? 'empty-state' : ''}`} ref={chatScrollRef} onScroll={handleScroll}>
          {booting ? (
            <div className="boot-state"><span className="loading-orb" /> Loading your workspace…</div>
          ) : isEmpty ? (
            <div className="welcome-wrap">
              <div className="welcome-orb"><Sparkles size={25} /></div>
              <div className="eyebrow"><span /> YOUR AI WORKSPACE</div>
              <h1>Where ideas<br /><span>take shape.</span></h1>
              <p className="welcome-description">A little curiosity goes a long way. Ask a question, explore an idea, or just start anywhere.</p>
              <div className="suggestion-grid">
                {suggestions.map((item) => (
                  <button className="suggestion-card" key={item.title} onClick={() => { setDraft(item.prompt); textareaRef.current?.focus(); }}>
                    <span className="suggestion-icon">{item.icon}</span><span className="suggestion-title">{item.title}</span><span className="suggestion-arrow"><ArrowUp size={14} /></span>
                  </button>
                ))}
              </div>
              <div className="welcome-footnote"><Command size={12} /> Built for the way you think.</div>
            </div>
          ) : (
            <div className="messages-wrap">
              {messages.map((message, index) => <Message key={message._id || `${message.role}-${index}`} message={message} />)}
              {loading && <div className="message-row assistant-row typing-row"><div className="avatar assistant-avatar"><Sparkles size={16} /></div><div className="typing-indicator"><span /><span /><span /></div></div>}
              <div ref={bottomRef} />
            </div>
          )}
        </section>

        {showScrollButton && !isEmpty && <button className="scroll-bottom" onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })} aria-label="Scroll to latest message"><ArrowDown size={16} /></button>}

        <div className="composer-zone">
          {error && <div className="error-banner"><AlertCircle size={15} /><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
          <form className="composer" onSubmit={handleSubmit}>
            <textarea ref={textareaRef} value={draft} onChange={handleDraftChange} onKeyDown={handleTextareaKeyDown} placeholder="Message Orbit…" rows={1} maxLength={12000} aria-label="Message Orbit" disabled={loading || booting} />
            <div className="composer-bottom">
              <div className="composer-hint"><span className="hint-dot" /> AI can make mistakes. Check important info.</div>
              <div className="composer-controls"><span className="char-count">{draft.length > 0 ? `${draft.length.toLocaleString()} / 12,000` : <AudioLines size={16} />}</span><button className="send-button" type="submit" disabled={!draft.trim() || loading || booting} aria-label="Send message">{loading ? <span className="send-spinner" /> : <ArrowUp size={18} strokeWidth={2.5} />}</button></div>
            </div>
          </form>
          <div className="footer-note">POWERED BY OPENAI <span>·</span> MADE TO EXPLORE</div>
        </div>
      </main>
    </div>
  );
}
