import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check } from 'lucide-react';

export default function Message({ message }) {
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch { setCopied(false); }
  }

  return (
    <article className={`message-row ${isAssistant ? 'assistant-row' : 'user-row'}`}>
      <div className={`avatar ${isAssistant ? 'assistant-avatar' : 'user-avatar'}`}>
        {isAssistant ? <Bot size={17} /> : <User size={16} />}
      </div>
      <div className="message-main">
        <div className="message-heading">
          <span>{isAssistant ? 'Orbit' : 'You'}</span>
          {isAssistant && <button className="icon-button copy-button" onClick={copyMessage} aria-label="Copy response" title="Copy response">{copied ? <Check size={14} /> : <Copy size={14} />}</button>}
        </div>
        <div className="message-content">
          {isAssistant ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown> : <p>{message.content}</p>}
        </div>
      </div>
    </article>
  );
}
