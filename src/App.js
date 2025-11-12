import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, remove, onValue, off, update } from 'firebase/database';

// ==================== FIREBASE CONFIGURATION ====================
const firebaseConfig = {
  apiKey: "AIzaSyCp-LfozVypM0zyzoeFJRMPHZV3FIANfFY",
  authDomain: "laser-scanner-fa514.firebaseapp.com",
  databaseURL: "https://laser-scanner-fa514-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "laser-scanner-fa514",
  storageBucket: "laser-scanner-fa514.firebasestorage.app",
  messagingSenderId: "476242080920",
  appId: "1:476242080920:web:2e7aa5c5a65c5bcccdcced",
  measurementId: "G-KPJFQZ37SJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const messagesRef = ref(database, 'radiatron/messages');

// ==================== MAIN APP COMPONENT ====================
function App() {
  const defaultMode = 'sender'; // Fixed to sender mode
  
  const [mode, setMode] = useState(defaultMode);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [receiverState, setReceiverState] = useState('intro');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [messageVisible, setMessageVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // ==================== FIREBASE LISTENERS ====================
  useEffect(() => {
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        messageList.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setMessages(messageList);
      } else {
        setMessages([]);
      }
    });

    return () => off(messagesRef);
  }, []);

  // ==================== RECEIVER ANIMATION SEQUENCE ====================
  useEffect(() => {
    if (mode === 'receiver') {
      setReceiverState('intro');
      setCurrentMessageIndex(0);
      setMessageVisible(false);

      const introTimer = setTimeout(() => {
        setReceiverState('rscope');
        
        const rscopeTimer = setTimeout(() => {
          if (messages.length > 0) {
            setReceiverState('messages');
            setCurrentMessageIndex(0);
            setMessageVisible(true);
          } else {
            setReceiverState('standby');
          }
        }, 3000);

        return () => clearTimeout(rscopeTimer);
      }, 10000);

      return () => clearTimeout(introTimer);
    }
  }, [mode, messages.length]);

  // ==================== MESSAGE PLAYBACK LOGIC ====================
  useEffect(() => {
    if (receiverState === 'messages' && messages.length > 0) {
      if (currentMessageIndex < messages.length) {
        setMessageVisible(true);
        
        const fadeOutTimer = setTimeout(() => {
          setMessageVisible(false);
          
          const nextMessageTimer = setTimeout(() => {
            if (currentMessageIndex + 1 < messages.length) {
              setCurrentMessageIndex(currentMessageIndex + 1);
              setMessageVisible(true);
            } else {
              setReceiverState('standby');
            }
          }, 1000);

          return () => clearTimeout(nextMessageTimer);
        }, 9000);

        return () => clearTimeout(fadeOutTimer);
      }
    }
  }, [receiverState, currentMessageIndex, messages.length]);

  // ==================== SENDER FUNCTIONS ====================
  const sendMessage = async () => {
    if (inputText.trim()) {
      const newMessage = {
        text: inputText,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      
      await push(messagesRef, newMessage);
      setInputText('');
    }
  };

  const deleteMessage = async (messageId) => {
    await remove(ref(database, `radiatron/messages/${messageId}`));
  };

  const startEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditingText(message.text || '');
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const saveEditMessage = async () => {
    if (!editingMessageId) return;
    const trimmed = editingText.trim();
    if (!trimmed) return; // do not save empty edits
    await update(ref(database, `radiatron/messages/${editingMessageId}`), {
      text: trimmed
    });
    setEditingMessageId(null);
    setEditingText('');
  };

  useEffect(() => {
    if (mode === 'sender') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, mode]);

  // ==================== STYLES ====================
  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
    }

    @keyframes neonGlow {
      0%, 100% {
        text-shadow: 
          0 0 10px #00ff00,
          0 0 20px #00ff00,
          0 0 30px #00ff00,
          0 0 40px #00ff00,
          0 0 50px #00ff00,
          0 0 60px #00ff00;
      }
      50% {
        text-shadow: 
          0 0 15px #00ff00,
          0 0 25px #00ff00,
          0 0 35px #00ff00,
          0 0 45px #00ff00,
          0 0 55px #00ff00,
          0 0 70px #00ff00;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-20px); }
    }

    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }

    .neon-text {
      color: #00ff00;
      font-family: 'Courier New', monospace;
      animation: neonGlow 2s ease-in-out infinite;
      letter-spacing: 2px;
    }

    .message-fade-in {
      animation: fadeIn 1s ease-out forwards;
    }

    .message-fade-out {
      animation: fadeOut 1s ease-out forwards;
    }

    .receiver-bg {
      background: radial-gradient(ellipse at center, #001100 0%, #000000 100%);
      position: relative;
      overflow: hidden;
    }

    .receiver-bg::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        transparent 0%,
        rgba(0, 255, 0, 0.02) 50%,
        transparent 100%
      );
      animation: scanline 8s linear infinite;
      pointer-events: none;
    }

    .whatsapp-bubble {
      background: #dcf8c6;
      border-radius: 7px;
      padding: 8px 12px;
      margin: 4px 0;
      max-width: 70%;
      word-wrap: break-word;
      position: relative;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .whatsapp-bubble::after {
      content: "";
      position: absolute;
      right: -10px;
      top: 10px;
      border: 10px solid transparent;
      border-left-color: #dcf8c6;
      border-right: 0;
      margin-top: -10px;
    }

    .mode-toggle {
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 14px;
      border: 2px solid #00ff00;
      transition: all 0.3s;
    }

    .mode-toggle:hover {
      background: rgba(0, 255, 0, 0.2);
    }

    /* ===== Mobile Sender Layout ===== */
    .sender-root {
      height: 100vh; /* fallback */
      height: 100dvh; /* accounts for mobile keyboard */
      display: flex;
      flex-direction: column;
    }

    .sender-header {
      /* base styles are inline; mobile tweaks via media query */
    }

    .messages-area { /* base styles inline; mobile tweaks below */ }

    .input-bar {
      position: sticky;
      bottom: 0;
      padding-bottom: calc(env(safe-area-inset-bottom) + 10px);
    }

    .bubble-text { font-size: 15px; line-height: 1.4; }
    .bubble-actions { gap: 10px; }
    .btn-action { padding: 6px 8px; border-radius: 4px; }
    .btn-edit { color: #1a73e8; }
    .btn-delete { color: #ff4444; }

    @media (max-width: 768px) {
      .whatsapp-bubble { max-width: 88%; padding: 10px 12px; }
      .bubble-text { font-size: 16px; }
    }
  `;

  // ==================== RENDER SENDER DASHBOARD ====================
  const renderSender = () => (
    <div className="sender-root" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(to bottom, #075e54 0%, #075e54 127px, #ece5dd 127px)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div className="sender-header" style={{
        background: '#075e54',
        color: 'white',
        padding: '20px',
        fontSize: '20px',
        fontWeight: '500',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        📱 RADIATRON Sender
      </div>

      <div className="messages-area" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        background: '#ece5dd'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {messages.map((message) => (
            <div key={message.id} style={{ 
              display: 'flex', 
              alignItems: 'flex-end', 
              marginBottom: '8px',
              maxWidth: '70%' 
            }}>
              <div className="whatsapp-bubble">
                {editingMessageId === message.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditMessage();
                        if (e.key === 'Escape') cancelEditMessage();
                      }}
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '14px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={cancelEditMessage}
                        style={{
                          background: 'none',
                          border: '1px solid #ddd',
                          color: '#667781',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEditMessage}
                        style={{
                          background: '#25d366',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bubble-text" style={{ marginBottom: '4px' }}>{message.text}</div>
                    <div className="bubble-actions" style={{ 
                      fontSize: '11px', 
                      color: '#667781',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span>{message.time}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => startEditMessage(message)}
                          className="btn-action btn-edit"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#1a73e8',
                            cursor: 'pointer',
                            fontSize: '11px',
                            padding: '2px 5px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="btn-action btn-delete"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ff4444',
                            cursor: 'pointer',
                            fontSize: '11px',
                            padding: '2px 5px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-bar" style={{
        padding: '10px',
        background: '#f0f0f0',
        display: 'flex',
        gap: '10px',
        borderTop: '1px solid #ddd'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message"
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '24px',
            border: '1px solid #ddd',
            fontSize: '16px',
            outline: 'none'
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            background: '#25d366',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = '#20bd5a'}
          onMouseOut={(e) => e.target.style.background = '#25d366'}
        >
          ➤
        </button>
      </div>
    </div>
  );

  // ==================== RENDER RECEIVER DASHBOARD ====================
  const renderReceiver = () => (
    <div className="receiver-bg" style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {receiverState === 'intro' && (
        <div className="neon-text message-fade-in" style={{
          fontSize: '48px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          RADIATRON X-9 DRS
        </div>
      )}

      {receiverState === 'rscope' && (
        <div className="neon-text message-fade-in" style={{
          fontSize: '56px',
          textAlign: 'center',
          lineHeight: '1.2'
        }}>
          <div>R-SCOPE</div>
          <div style={{ fontSize: '48px', marginTop: '10px' }}>X-9</div>
        </div>
      )}

      {receiverState === 'messages' && messages.length > 0 && (
        <div 
          className={`neon-text ${messageVisible ? 'message-fade-in' : 'message-fade-out'}`}
          style={{
            fontSize: '36px',
            textAlign: 'center',
            padding: '40px',
            maxWidth: '80%',
            border: '2px solid #00ff00',
            borderRadius: '10px',
            background: 'rgba(0, 255, 0, 0.05)'
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            📡 TRANSMISSION {currentMessageIndex + 1}/{messages.length}
          </div>
          <div style={{ fontSize: '28px', lineHeight: '1.5' }}>
            {messages[currentMessageIndex]?.text}
          </div>
          <div style={{ fontSize: '16px', marginTop: '20px', opacity: '0.7' }}>
            {messages[currentMessageIndex]?.time}
          </div>
        </div>
      )}

      {receiverState === 'standby' && (
        <div className="neon-text message-fade-in" style={{
          fontSize: '32px',
          textAlign: 'center',
          opacity: '0.8'
        }}>
          SYSTEM STANDBY — NO TRANSMISSIONS
        </div>
      )}

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.03) 2px,
            rgba(0, 255, 0, 0.03) 4px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.03) 2px,
            rgba(0, 255, 0, 0.03) 4px
          )
        `,
        pointerEvents: 'none'
      }} />
    </div>
  );

  // ==================== MAIN RENDER ====================
  return (
    <>
      <style>{styles}</style>
      
      {/* Sender Dashboard Only */}
      {renderSender()}
    </>
  );
}

export default App;
