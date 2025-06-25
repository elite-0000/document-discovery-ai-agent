"use client";
import { useState, useRef } from "react";

export default function ChatAssistant() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages((msgs) => [...msgs, { role: "assistant", content: "Error getting answer." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 rounded-t">
        {messages.length === 0 && <div className="text-gray-400 text-center">Ask a question about your documents...</div>}
        {messages.map((msg, i) => (
          <div key={i} className={`p-2 rounded ${msg.role === "user" ? "bg-blue-100 text-right ml-auto max-w-[80%]" : "bg-gray-200 text-left mr-auto max-w-[80%]"}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-blue-400">Assistant is typing...</div>}
      </div>
      <div className="flex border-t p-2 bg-white">
        <input
          ref={inputRef}
          className="flex-1 border rounded px-3 py-2 mr-2"
          placeholder="Type your question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
          disabled={loading}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
} 