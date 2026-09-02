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
        .guillaume-page{
          min-height:100vh;
          background:var(--color-bg);
          display:grid;
          grid-template-rows:auto 1fr auto;
        }

        /* ── Page header ── */
        .g-page-header{
          padding:clamp(7rem,13vh,9rem) clamp(1.5rem,5vw,5rem) 2.25rem;
          border-bottom:1px solid var(--color-hairline);
          background:var(--color-bg);
        }
        .g-page-eyebrow{
          font-family:var(--font-sans);
          font-size:.6875rem;font-weight:500;letter-spacing:.24em;text-transform:uppercase;
          color:var(--color-accent);display:block;margin-bottom:.9rem;
        }
        .g-page-title{
          font-family:var(--font-display);
          font-size:clamp(2.4rem,5vw,3.75rem);font-weight:600;letter-spacing:-.03em;
          color:var(--color-text);line-height:1;margin-bottom:.75rem;
        }
        .g-page-sub{
          font-family:var(--font-sans);font-size:1.02rem;line-height:1.55;
          color:var(--color-text-2);max-width:560px;
        }

        /* ── Conversation area ── */
        .g-chat-area{
          max-width:860px;
          margin:0 auto;
          width:100%;
          padding:3rem 2rem;
          display:flex;
          flex-direction:column;
          gap:2rem;
        }

        /* ── Empty state ── */
        .g-empty{
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          min-height:320px;text-align:center;
        }
        .g-empty-dot{
          width:10px;height:10px;border-radius:50%;background:var(--color-accent);
          margin:0 auto 1.5rem;animation:gPulse 2.2s ease-in-out infinite;
          box-shadow:0 0 16px var(--color-accent);
        }
        @keyframes gPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.7)}}
        .g-empty-title{
          font-family:var(--font-display);font-size:1.85rem;font-weight:600;
          letter-spacing:-.02em;color:var(--color-text);margin-bottom:.6rem;
        }
        .g-empty-sub{font-family:var(--font-sans);font-size:.95rem;color:var(--color-text-3);margin-bottom:2.25rem;}
        .g-starter-pills{display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center;}
        .g-starter-pill{
          font-family:var(--font-sans);font-size:.78rem;font-weight:500;
          background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-pill);
          padding:.65rem 1.25rem;cursor:pointer;color:var(--color-text-2);
          transition:border-color var(--d-1),background var(--d-1),color var(--d-1);
        }
        .g-starter-pill:hover{border-color:var(--color-text);background:var(--color-text);color:var(--color-bg);}

        /* ── Messages ── */
        .g-msg{display:flex;gap:1.1rem;align-items:flex-start;}
        .g-msg-user{flex-direction:row-reverse;}

        .g-avatar{
          width:38px;height:38px;border-radius:50%;flex-shrink:0;
          background:var(--color-accent);display:flex;align-items:center;justify-content:center;
          font-family:var(--font-sans);font-size:.72rem;font-weight:600;color:var(--color-on-accent);
        }
        .g-avatar-user{background:color-mix(in srgb,var(--color-text) 10%,var(--color-surface));color:var(--color-text);border:1px solid var(--color-border);}

        .g-bubble{
          max-width:78%;
          font-family:var(--font-sans);font-size:1rem;line-height:1.7;color:var(--color-text);
          background:var(--color-surface);border:1px solid var(--color-hairline);border-radius:4px 18px 18px 18px;
          padding:1.1rem 1.35rem;box-shadow:var(--shadow-sm);
        }
        .g-bubble-user{
          background:var(--color-text);color:var(--color-bg);border-color:var(--color-text);
          border-radius:18px 4px 18px 18px;
          font-weight:450;line-height:1.6;
        }
        .g-bubble strong{font-weight:700;}
        .g-bubble em{color:var(--color-accent);}
        .g-bubble p{margin-bottom:.7em;}
        .g-bubble p:last-child{margin-bottom:0;}

        /* typing indicator */
        .g-typing{display:flex;gap:6px;align-items:center;padding:.5rem .35rem;}
        .g-typing span{
          width:7px;height:7px;border-radius:50%;background:var(--color-text-3);
          animation:gTyping 1.2s ease-in-out infinite;
        }
        .g-typing span:nth-child(2){animation-delay:.2s;}
        .g-typing span:nth-child(3){animation-delay:.4s;}
        @keyframes gTyping{0%,80%,100%{transform:scale(.8);opacity:.5}40%{transform:scale(1);opacity:1}}

        /* ── Input area ── */
        .g-input-area{
          border-top:1px solid var(--color-hairline);
          background:color-mix(in srgb,var(--color-bg) 88%,transparent);
          backdrop-filter:blur(12px);
          padding:1.5rem clamp(1.5rem,5vw,5rem) 2.5rem;
          position:sticky;bottom:0;
        }
        .g-input-inner{
          max-width:860px;margin:0 auto;
          display:flex;gap:1rem;align-items:flex-end;
        }
        .g-input{
          flex:1;
          background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);
          padding:1rem 1.25rem;resize:none;
          font-family:var(--font-sans);font-size:.95rem;color:var(--color-text);
          outline:none;transition:border-color var(--d-1);line-height:1.5;
          min-height:54px;max-height:160px;
        }
        .g-input:focus{border-color:var(--color-accent);}
        .g-input::placeholder{color:var(--color-text-3);}
        .g-send-btn{
          width:52px;height:52px;border-radius:50%;background:var(--color-text);
          border:none;cursor:pointer;color:var(--color-bg);
          display:flex;align-items:center;justify-content:center;
          transition:background var(--d-1) var(--ease-out),color var(--d-1),transform var(--d-1) var(--ease-out);flex-shrink:0;
        }
        .g-send-btn:hover{background:var(--color-accent);color:var(--color-on-accent);transform:translateX(2px);}
        .g-send-btn:disabled{opacity:.4;cursor:default;transform:none;}
        .g-error{
          font-family:var(--font-sans);font-size:.8rem;color:#e5674f;
          text-align:center;margin-top:.5rem;
        }

        @media(max-width:768px){
          .g-chat-area{padding:2rem 1.25rem;}
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
