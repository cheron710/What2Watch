"use client";

import React, { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";

export default function GuillaumePage() {
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submitMessage = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="guillaume-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Sans:wght@300;400;500;600&family=Lora:wght@400;500&display=swap');

        .guillaume-page{
          min-height:100vh;
          background:#F0EBE0;
          display:grid;
          grid-template-rows:auto 1fr auto;
        }

        /* ── Page header ── */
        .g-page-header{
          padding:96px 56px 40px;
          border-bottom:1px solid rgba(15,14,11,.1);
          background:#F0EBE0;
        }
        .g-page-eyebrow{
          font-family:'IBM Plex Sans',sans-serif;
          font-size:10px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;
          color:#8a8780;display:block;margin-bottom:12px;
        }
        .g-page-title{
          font-family:'Crimson Text',serif;
          font-size:clamp(36px,5vw,60px);font-weight:600;letter-spacing:-1.5px;
          color:#0f0e0b;line-height:1;margin-bottom:12px;
        }
        .g-page-sub{
          font-family:'Lora',serif;font-size:16px;font-style:italic;
          color:#8a8780;max-width:560px;
        }

        /* ── Conversation area ── */
        .g-chat-area{
          max-width:860px;
          margin:0 auto;
          width:100%;
          padding:48px 32px;
          display:flex;
          flex-direction:column;
          gap:32px;
        }

        /* ── Empty state ── */
        .g-empty{
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          min-height:320px;text-align:center;
        }
        .g-empty-dot{
          width:10px;height:10px;border-radius:50%;background:#0f0e0b;
          margin:0 auto 24px;animation:gPulse 2s ease-in-out infinite;
        }
        @keyframes gPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.7)}}
        .g-empty-title{
          font-family:'Crimson Text',serif;font-size:28px;font-weight:600;
          letter-spacing:-0.5px;color:#0f0e0b;margin-bottom:10px;
        }
        .g-empty-sub{font-family:'Lora',serif;font-size:15px;font-style:italic;color:#8a8780;margin-bottom:36px;}
        .g-starter-pills{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}
        .g-starter-pill{
          font-family:'IBM Plex Sans',sans-serif;font-size:12px;font-weight:600;
          background:#fff;border:1px solid #e8e8e8;border-radius:100px;
          padding:10px 20px;cursor:pointer;color:#3a3830;transition:all .2s;
        }
        .g-starter-pill:hover{border-color:#0f0e0b;background:#0f0e0b;color:#fff;}

        /* ── Messages ── */
        .g-msg{display:flex;gap:18px;align-items:flex-start;}
        .g-msg-user{flex-direction:row-reverse;}

        .g-avatar{
          width:36px;height:36px;border-radius:50%;flex-shrink:0;
          background:#0f0e0b;display:flex;align-items:center;justify-content:center;
          font-family:'IBM Plex Sans',sans-serif;font-size:12px;font-weight:600;color:#fff;
        }
        .g-avatar-user{background:#e8e8e8;color:#0f0e0b;}

        .g-bubble{
          max-width:78%;
          font-family:'Lora',serif;font-size:16px;line-height:1.8;color:#0f0e0b;
          background:#fff;border:1px solid #e8e8e8;border-radius:2px 16px 16px 16px;
          padding:18px 22px;box-shadow:0 1px 3px rgba(0,0,0,.04);
        }
        .g-bubble-user{
          background:#0f0e0b;color:#fff;border-color:#0f0e0b;
          border-radius:16px 2px 16px 16px;
          font-family:'IBM Plex Sans',sans-serif;font-size:14px;font-weight:500;line-height:1.6;
        }
        .g-bubble strong{font-weight:700;}
        .g-bubble p{margin-bottom:.8em;}
        .g-bubble p:last-child{margin-bottom:0;}

        /* typing indicator */
        .g-typing{display:flex;gap:6px;align-items:center;padding:14px 22px;}
        .g-typing span{
          width:7px;height:7px;border-radius:50%;background:#d0d0d0;
          animation:gTyping 1.2s ease-in-out infinite;
        }
        .g-typing span:nth-child(2){animation-delay:.2s;}
        .g-typing span:nth-child(3){animation-delay:.4s;}
        @keyframes gTyping{0%,80%,100%{transform:scale(.8);opacity:.5}40%{transform:scale(1);opacity:1}}

        /* ── Input area ── */
        .g-input-area{
          border-top:1px solid rgba(15,14,11,.1);
          background:#F0EBE0;
          padding:24px 56px 40px;
        }
        .g-input-inner{
          max-width:860px;margin:0 auto;
          display:flex;gap:16px;align-items:flex-end;
        }
        .g-input{
          flex:1;
          background:#fff;border:1px solid #e8e8e8;border-radius:4px;
          padding:16px 20px;resize:none;
          font-family:'IBM Plex Sans',sans-serif;font-size:15px;color:#0f0e0b;
          outline:none;transition:border .2s;line-height:1.5;
          min-height:54px;max-height:160px;
        }
        .g-input:focus{border-color:#0f0e0b;}
        .g-input::placeholder{color:#8a8780;}
        .g-send-btn{
          width:52px;height:52px;border-radius:50%;background:#0f0e0b;
          border:none;cursor:pointer;color:#fff;
          display:flex;align-items:center;justify-content:center;
          transition:opacity .2s,transform .15s;flex-shrink:0;
        }
        .g-send-btn:hover{opacity:.85;transform:translateX(2px);}
        .g-send-btn:disabled{opacity:.4;cursor:default;transform:none;}
        .g-error{
          font-family:'IBM Plex Sans',sans-serif;font-size:12px;color:#cc0000;
          text-align:center;margin-top:8px;
        }

        @media(max-width:768px){
          .g-page-header,.g-input-area{padding-left:24px;padding-right:24px;}
          .g-chat-area{padding:32px 20px;}
          .g-bubble{max-width:90%;}
        }
      `}</style>

      {/* ── Page Header ── */}
      <header className="g-page-header">
        <span className="g-page-eyebrow">Your Film Concierge</span>
        <h1 className="g-page-title">Guillaume</h1>
        <p className="g-page-sub">
          Tell me your mood, your occasion, or simply what you feel like. I&apos;ll find the right film.
        </p>
      </header>

      {/* ── Chat Area ── */}
      <div className="g-chat-area">
        {messages.length === 0 && (
          <div className="g-empty">
            <div className="g-empty-dot" />
            <h2 className="g-empty-title">How can I help you tonight?</h2>
            <p className="g-empty-sub">Tell me your mood, or try one of these to get started.</p>
            <div className="g-starter-pills">
              {[
                "Something for a rainy Sunday",
                "A film that will make me cry",
                "Date night, not too serious",
                "Something I've never seen before",
                "Best film of the last 5 years",
              ].map((p) => (
                <button
                  key={p}
                  className="g-starter-pill"
                  onClick={() => sendMessage({ text: p })}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`g-msg${m.role === "user" ? " g-msg-user" : ""}`}>
            <div className={`g-avatar${m.role === "user" ? " g-avatar-user" : ""}`}>
              {m.role === "user" ? "You" : "G"}
            </div>
            <div className={`g-bubble${m.role === "user" ? " g-bubble-user" : ""}`}>
              {m.parts
                .filter((part) => part.type === "text")
                .flatMap((part) => part.text.split("\n"))
                .map((line, i) => (
                  <p key={i} dangerouslySetInnerHTML={{
                    __html: line
                      .replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.+?)\*/g, "<em>$1</em>"),
                  }} />
                ))}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="g-msg">
            <div className="g-avatar">G</div>
            <div className="g-bubble">
              <div className="g-typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="g-error">Something went wrong. Please try again.</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input Area ── */}
      <footer className="g-input-area">
        <form
          id="guillaume-form"
          className="g-input-inner"
          onSubmit={(e) => {
            e.preventDefault();
            submitMessage();
          }}
        >
          <textarea
            className="g-input"
            placeholder="Describe your mood, occasion, or the film you're looking for…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitMessage();
              }
            }}
          />
          <button className="g-send-btn" type="submit" disabled={isLoading || !input.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}
