import { useState, useRef, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '/api';

const QUICK_ACTIONS = [
  'Optimize my SIP allocation',
  'Tax-saving strategies',
  'Analyze my risk profile',
  'Sovereign Growth Fund options',
  'Beat inflation with my income',
  'Emergency fund blueprint',
];

export default function ChatUI() {
  const [messages, setMessages] = useState([
    {
      role: 'mentor',
      content: 'Good day. I\'m your Private Wealth Mentor — your AI strategist for financial optimization.\n\nI have access to your current financial profile. Ask me anything about investments, savings strategies, tax planning, or how to accelerate your wealth goals.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const response = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          userId: 'default',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'mentor', content: data.data.message }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'mentor',
          content: 'I apologize — an issue occurred processing your request. Please try again.',
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'mentor',
        content: 'Unable to reach the advisory server. Please ensure the backend is running on port 5000.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Private Wealth Mentor</h2>
        <p>Your AI strategist is analyzing your financial profile for optimization opportunities</p>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="chat-container" style={{ padding: '24px 28px' }}>
          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="chat-quick-actions">
              {QUICK_ACTIONS.map((q, i) => (
                <button
                  key={i}
                  className="quick-action"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'mentor' ? '🧠' : '👤'}
                </div>
                <div
                  className="message-bubble"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              </div>
            ))}

            {loading && (
              <div className="message mentor">
                <div className="message-avatar">🧠</div>
                <div className="message-bubble typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="chat-input-bar">
            <input
              type="text"
              className="form-input"
              placeholder="Ask your wealth strategist..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              id="chat-input"
            />
            <button
              className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{ minWidth: 48, padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
            >
              {loading ? <span className="loading-spinner" /> : '→'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMessage(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
    .replace(/- /g, '• ');
}
