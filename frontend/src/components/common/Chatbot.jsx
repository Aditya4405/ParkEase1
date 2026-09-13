import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { chatAPI, getUserId, getUserName, getUserRole } from "../../api/api";
import { FiX, FiSend, FiMic, FiMicOff, FiTrash2 } from "react-icons/fi";
import "./Chatbot.css";

// ─── Speech Recognition polyfill ─────────────────────────────────────────────
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// ─── Custom Smart Parking AI Icon ──────────────────────────────────────────────────
const AiParkingIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
    <circle cx="7" cy="17" r="2"/>
    <path d="M9 17h6"/>
    <circle cx="17" cy="17" r="2"/>
    <path d="M12 2v4" className="animate-pulse" />
    <path d="M16 4l-2.5 2.5" className="animate-[pulse_1.5s_ease-in-out_infinite]" />
    <path d="M8 4l2.5 2.5" className="animate-[pulse_2s_ease-in-out_infinite]" />
  </svg>
);

export default function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm **ParkEase Assistant**. How can I help you today?\n\nYou can ask me to search parking, check your bookings, view stats, and more!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef       = useRef(null);

  // ── Auto-scroll to bottom on new message ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Focus input when chat opens ──
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userId = getUserId();
    if (!userId) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Please login first to use the assistant." },
      ]);
      return;
    }

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const data = await chatAPI.sendMessage({
        message: text,
        userId: Number(userId),
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, action: data.action, data: data.data },
      ]);

      // ── Handle interceptor actions (Multi-step workflows) ──
      if (data.action === "initiate_booking" && data.data) {
        // AI has collected parking and slot. Redirect to the parking page and auto-open the modal!
        setTimeout(() => {
          setIsOpen(false);
          navigate(`/user/slots/${data.data.parkingId}`, {
            state: { autoOpenSlotId: data.data.slotId }
          });
        }, 2000);
      } else if (data.action === "create_parking") {
        setTimeout(() => {
          // If we are already on dashboard or owner slots, reload to show new parking
          if (window.location.pathname.includes("/owner/")) {
            window.location.reload();
          } else {
            navigate("/owner/slots");
            setIsOpen(false);
          }
        }, 2500);
      }

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Sorry, something went wrong. Please try again.\n\n_Error: " + (err.response?.data?.message || err.message) + "_",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, navigate]);

  // ── Handle Enter key ──
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Voice Input (Web Speech API) ────────────────────────────────────────────
  const toggleVoice = () => {
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + transcript);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend   = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  // ── Clear chat history ──
  const handleClear = async () => {
    const userId = getUserId();
    if (userId) {
      try { await chatAPI.clearHistory(userId); } catch {}
    }
    setMessages([
      {
        role: "assistant",
        content: "🗑️ Chat cleared! How can I help you?",
      },
    ]);
  };

  // ── Render a message with simple markdown-like bold support ──
  const renderContent = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/(\*\*.*?\*\*)/g).map((seg, j) =>
          seg.startsWith("**") && seg.endsWith("**") ? (
            <strong key={j}>{seg.slice(2, -2)}</strong>
          ) : (
            <span key={j}>{seg}</span>
          )
        )}
        {i < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const userName = getUserName() || "You";
  const userRole = getUserRole() || "USER";

  return (
    <>
      {/* ── Floating Chat Button ──────────────────────────────────────────── */}
      <button
        id="chatbot-toggle"
        className={`chatbot-fab ${isOpen ? "chatbot-fab--open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="ParkEase AI Assistant"
      >
        {isOpen ? <FiX size={32} /> : <AiParkingIcon />}
      </button>

      {/* ── Chat Window ───────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="chatbot-window" id="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header__info">
              <span className="chatbot-header__avatar">🤖</span>
              <div>
                <h3 className="chatbot-header__title">ParkEase Assistant</h3>
                <span className="chatbot-header__subtitle">
                  AI-Powered • {userRole}
                </span>
              </div>
            </div>
            <div className="chatbot-header__actions">
              <button
                className="chatbot-header__btn"
                onClick={handleClear}
                title="Clear chat"
              >
                <FiTrash2 size={16} />
              </button>
              <button
                className="chatbot-header__btn"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages" id="chatbot-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chatbot-msg chatbot-msg--${msg.role}`}
              >
                {msg.role === "assistant" && (
                  <span className="chatbot-msg__avatar">🤖</span>
                )}
                <div className="chatbot-msg__bubble">
                  {renderContent(msg.content)}
                </div>
                {msg.role === "user" && (
                  <span className="chatbot-msg__avatar chatbot-msg__avatar--user">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="chatbot-msg chatbot-msg--assistant">
                <span className="chatbot-msg__avatar">🤖</span>
                <div className="chatbot-msg__bubble chatbot-msg__typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <button
              className={`chatbot-voice-btn ${listening ? "chatbot-voice-btn--active" : ""}`}
              onClick={toggleVoice}
              title={listening ? "Stop listening" : "Voice input"}
            >
              {listening ? <FiMicOff size={18} /> : <FiMic size={18} />}
            </button>

            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder={listening ? "🎤 Listening..." : "Type a message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              id="chatbot-input"
            />

            <button
              className="chatbot-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              title="Send message"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
