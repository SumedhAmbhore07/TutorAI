import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string | Date;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
}

const Tutor = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pdfContext, setPdfContext] = useState<string | null>(null);
  const [pdfSummary, setPdfSummary] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      const stored = localStorage.getItem(`tutorai_chats_${currentUser.uid}`);
      if (stored) {
        try {
          const parsedSessions = JSON.parse(stored) as ChatSession[];
          const fixedSessions = parsedSessions.map(s => {
            if (s.title === "New Chat") {
               const firstUserMsg = s.messages.find(m => m.type === 'user');
               if (firstUserMsg) {
                   const words = firstUserMsg.content.split(' ').slice(0, 5).join(' ');
                   return { ...s, title: words.length > 0 ? `${words}...` : "New Chat" };
               }
            }
            return s;
          });
          setSessions(fixedSessions);
          if (fixedSessions.length > 0) {
            setCurrentSessionId(fixedSessions[0].id);
            setMessages(fixedSessions[0].messages);
          } else {
            startNewChat();
          }
        } catch (e) {
          console.error("Failed to parse chat sessions", e);
          startNewChat();
        }
      } else {
        startNewChat();
      }
    } else {
      startNewChat();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentSessionId) {
      const updatedSessions = sessions.map(s => {
        if (s.id === currentSessionId) {
          let title = s.title;
          if (title === "New Chat") {
             const firstUserMsg = messages.find(m => m.type === 'user');
             if (firstUserMsg) {
                 const words = firstUserMsg.content.split(' ').slice(0, 5).join(' ');
                 title = words.length > 0 ? `${words}...` : "New Chat";
             }
          }
          return { ...s, messages, title, updatedAt: new Date().toISOString() };
        }
        return s;
      });
      // If session not found (new chat just started), add it
      if (!sessions.find(s => s.id === currentSessionId) && messages.length > 0) {
        let title = "New Chat";
        const firstUserMsg = messages.find(m => m.type === 'user');
        if (firstUserMsg) {
            const words = firstUserMsg.content.split(' ').slice(0, 5).join(' ');
            title = words.length > 0 ? `${words}...` : "New Chat";
        }
        updatedSessions.unshift({
          id: currentSessionId,
          title,
          updatedAt: new Date().toISOString(),
          messages
        });
      }
      setSessions(updatedSessions);
      localStorage.setItem(`tutorai_chats_${currentUser.uid}`, JSON.stringify(updatedSessions));
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Using Django backend
      const response = await fetch('/api/ask/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: inputMessage,
          pdfContext: pdfContext
        }),
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.answer || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.answer || 'I apologize, but I couldn\'t process your request at the moment.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/upload-pdf/', {
        method: 'POST',
        body: formData,
      });


      const data = await response.json();

      if (data.text) {
        setPdfContext(data.text);
        setPdfSummary(data.summary);
        setPdfFileName(data.filename);

        const uploadMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `I've processed your PDF "${data.filename}" (${data.pages} pages). Here's a summary:\n\n${data.summary}\n\nYou can now ask me questions about this document!`,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, uploadMessage]);
      } else if (data.error) {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('PDF Upload Error:', error);
      alert('Error uploading PDF. Please try again.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearPdfContext = () => {
    setPdfContext(null);
    setPdfSummary(null);
    setPdfFileName(null);
    const clearMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: 'PDF context has been cleared. You can upload a new document or ask general questions.',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, clearMessage]);
  };

  const startNewChat = () => {
    const newSessionId = Date.now().toString();
    setCurrentSessionId(newSessionId);
    setMessages([
      {
        id: 'welcome',
        type: 'ai',
        content: "Hello! I'm your AI tutor. Ask me anything about learning, and I'll help you understand it better!",
        timestamp: new Date().toISOString()
      }
    ]);
    setPdfContext(null);
    setPdfSummary(null);
    setPdfFileName(null);
  };

  const selectSession = (sessionId: string) => {
    if (sessionId === currentSessionId) return;
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setPdfContext(null);
      setPdfSummary(null);
      setPdfFileName(null);
    }
  };

  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    if (currentUser) {
      localStorage.setItem(`tutorai_chats_${currentUser.uid}`, JSON.stringify(updatedSessions));
    }
    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        setCurrentSessionId(updatedSessions[0].id);
        setMessages(updatedSessions[0].messages);
      } else {
        startNewChat();
      }
    }
  };

  return (
    <div className="tutor-page">
      {/* Header */}
      <div className="tutor-header">
        <h1>
          <i className="fas fa-comments"></i>
          AI Tutor
        </h1>
      </div>

      <div className="ai-chat-container">
        {/* Chat Sidebar */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <button className="new-chat-btn" onClick={startNewChat}>
              <i className="fas fa-plus"></i> New Chat
            </button>
          </div>
          <div className="chat-list" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sessions.map(session => (
              <div 
                key={session.id} 
                className={`chat-session-item ${currentSessionId === session.id ? 'active' : ''}`}
                onClick={() => selectSession(session.id)}
                style={{ 
                  padding: '10px', 
                  borderRadius: '8px', 
                  backgroundColor: currentSessionId === session.id ? 'var(--bg-light)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)'
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                  <i className="fas fa-comment-dots" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>
                  {session.title}
                </div>
                <button 
                  onClick={(e) => deleteSession(e, session.id)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
                  title="Delete chat"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Main */}
        <div className="chat-main">
          <h2 className="chat-title">
            <i className="fas fa-robot"></i>
            TutorAI Assistant
          </h2>

          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="avatar">
                  <i className={`fas ${message.type === 'user' ? 'fa-user' : 'fa-robot'}`}></i>
                </div>
                <div className="message-content">
                  <p>{message.content}</p>
                  <span className="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai">
                <div className="avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* PDF Upload */}
          <div className="pdf-upload-container">
            <input
              type="file"
              id="pdf-upload"
              accept=".pdf"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              className="pdf-upload-btn"
              title="Upload PDF for context"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <i className="fas fa-file-pdf"></i> Upload PDF
            </button>
            {pdfFileName && (
              <span className="pdf-status">
                <i className="fas fa-check-circle"></i> {pdfFileName}
                <button
                  onClick={clearPdfContext}
                  title="Clear PDF"
                >
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
          </div>

          {/* Chat Input */}
          <div className="chat-input-container">
            <input
              type="text"
              id="chat-input"
              placeholder="Ask TutorAI anything..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              ref={chatInputRef}
            />
            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutor;
