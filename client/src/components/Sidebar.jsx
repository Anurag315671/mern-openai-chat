import { MessageSquare, Plus, PanelLeftClose, Trash2, Sparkles } from 'lucide-react';

export default function Sidebar({ conversations, activeId, onNewChat, onSelect, onDelete, onClose, mobileOpen }) {
  return (
    <>
      {mobileOpen && <button className="sidebar-scrim" onClick={onClose} aria-label="Close sidebar" />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <a className="brand" href="#top" onClick={(event) => event.preventDefault()}>
            <span className="brand-mark"><Sparkles size={17} /></span><span>orbit<span className="brand-dot">.</span></span>
          </a>
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="Close sidebar"><PanelLeftClose size={18} /></button>
        </div>
        <button className="new-chat-button" onClick={onNewChat}><Plus size={17} strokeWidth={2.2} /><span>New conversation</span><span className="new-chat-shortcut">⌘ K</span></button>
        <div className="history-label">YOUR CHATS</div>
        <div className="conversation-list">
          {conversations.length === 0 ? <div className="empty-history">Your conversations will show up here.</div> : conversations.map((conversation) => (
            <div className={`conversation-item ${activeId === conversation._id ? 'active' : ''}`} key={conversation._id}>
              <button className="conversation-select" onClick={() => onSelect(conversation._id)}>
                <MessageSquare size={15} /><span className="conversation-title">{conversation.title || 'New chat'}</span>
              </button>
              <button className="conversation-delete icon-button" onClick={() => onDelete(conversation._id)} aria-label={`Delete ${conversation.title || 'conversation'}`} title="Delete conversation"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="profile-avatar">G</div>
          <div className="profile-copy"><strong>Guest workspace</strong><span>Personal assistant</span></div>
          <span className="online-dot" title="Ready" />
        </div>
      </aside>
    </>
  );
}
