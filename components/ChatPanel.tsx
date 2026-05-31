"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  cardImage?: string;
  isGeneratingCard?: boolean;
}

interface ChatPanelProps {
  onCardGenerated?: (imageData: string) => void;
}

export default function ChatPanel({ onCardGenerated }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I am Hermes Trismegistus, the Thrice-Greatest. Seek ye wisdom in alchemy, herbalism, or astrology — or ask me to generate a wisdom card for thee.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function generateCard(msgIndex: number) {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === msgIndex ? { ...m, isGeneratingCard: true } : m
      )
    );

    try {
      const res = await fetch("/api/card", { method: "POST" });
      const data = await res.json();

      if (data.image) {
        setMessages((prev) =>
          prev.map((m, i) =>
            i === msgIndex ? { ...m, isGeneratingCard: false, cardImage: data.image } : m
          )
        );
        onCardGenerated?.(data.image);
      } else {
        setMessages((prev) =>
          prev.map((m, i) =>
            i === msgIndex
              ? { ...m, isGeneratingCard: false, content: m.content + "\n\n*(Card generation failed: " + (data.error ?? "unknown") + ")*" }
              : m
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex
            ? { ...m, isGeneratingCard: false, content: m.content + "\n\n*(Card generation failed)*" }
            : m
        )
      );
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, history }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        role: "assistant",
        content: data.reply ?? data.error ?? "The Oracle is silent.",
      };

      setMessages((prev) => {
        const next = [...prev, assistantMsg];
        const idx = next.length - 1;

        if (data.generateCard) {
          setTimeout(() => generateCard(idx), 100);
        }

        return next;
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "The Oracle is silent. A disruption in the aether." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-[#1f1520] border border-[#2a1f28] text-[#e8d5a8]"
                  : "bg-[#160f13] border border-[#c9a84c33] text-[#e8d5a8]"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="text-xs font-display text-gold mb-1 tracking-widest uppercase opacity-70">
                  Hermes
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-serif">
                {msg.content}
              </p>

              {/* Card image */}
              {msg.isGeneratingCard && (
                <div className="mt-3 flex items-center gap-2 text-gold text-xs font-display">
                  <span className="animate-spin">⚗</span>
                  <span>Composing the card...</span>
                </div>
              )}
              {msg.cardImage && (
                <div className="mt-3">
                  <img
                    src={msg.cardImage}
                    alt="Hermetic wisdom card"
                    className="rounded-lg border border-[#c9a84c44] max-w-full"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#160f13] border border-[#c9a84c33] rounded-lg p-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#2a1f28]">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask of alchemy, herbalism, or astrology... or request a wisdom card"
            rows={2}
            className="flex-1 bg-[#160f13] border border-[#2a1f28] focus:border-gold outline-none rounded-lg px-3 py-2 text-sm text-[#e8d5a8] placeholder-[#8a6a2a] font-serif resize-none transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-[#c9a84c] text-[#0a0608] font-display text-sm font-semibold rounded-lg disabled:opacity-40 hover:bg-[#d4b660] transition-colors self-end"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-[#8a6a2a] mt-1 font-serif italic">
          Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
