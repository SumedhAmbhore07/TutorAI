import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const Tutor = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'ai',
      content: "Hello! I'm your AI tutor. I can help you with:\n\n• Answering questions on any topic\n• Explaining complex concepts\n• Providing study guidance\n• Helping with problem-solving\n\nWhat would you like to learn today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pdfContext, setPdfContext] = useState<string | null>(null);
  const [pdfSummary, setPdfSummary] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
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
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
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
    const formData = new FormData();
    formData.append('pdf', file);

    try {
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
          timestamp: new Date()
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
      timestamp: new Date()
    };
    setMessages(prev => [...prev, clearMessage]);
  };

  const startNewChat = () => {
    setMessages([
      {
        id: 'welcome',
        type: 'ai',
        content: "Hello! I'm your AI tutor. Ask me anything about learning, and I'll help you understand it better!",
        timestamp: new Date()
      }
    ]);
    setPdfContext(null);
    setPdfSummary(null);
    setPdfFileName(null);
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
          <div className="chat-list">
            {/* Chat history would be populated here */}
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
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
