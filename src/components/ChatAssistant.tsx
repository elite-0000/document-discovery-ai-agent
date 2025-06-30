"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageCircle, Bot, User, Loader2, Maximize2 } from "lucide-react";

export default function ChatAssistant() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dialog state for detailed message view
  const [selectedMessage, setSelectedMessage] = useState<{ role: string; content: string } | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      setMessages((msgs) => [...msgs, { role: "assistant", content: "Error getting answer. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openMessageDialog = (message: { role: string; content: string }) => {
    setSelectedMessage(message);
    setShowMessageDialog(true);
  };

  return (
    <div className="flex flex-col h-[600px] space-y-4">
      {/* Chat Header */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI Assistant</h3>
        <Badge variant="secondary" className="ml-auto">
          {messages.length} messages
        </Badge>
      </div>

      {/* Messages Area */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-full bg-muted/20">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <Bot className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Ask a question about your documents</p>
                  <p className="text-sm text-muted-foreground">I'll help you find information from your uploaded files</p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 cursor-pointer transition-all hover:shadow-md group relative ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-background border shadow-sm hover:border-primary/20"
                    }`}
                    onClick={() => openMessageDialog(msg)}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <Maximize2 className="h-3 w-3 absolute top-2 right-2 opacity-0 group-hover:opacity-50 transition-opacity" />
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-background border shadow-sm rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Assistant is thinking...
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
          className="flex-1"
        />
        <Button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {selectedMessage?.role === "user" ? (
                <User className="h-5 w-5 text-primary" />
              ) : (
                <Bot className="h-5 w-5 text-muted-foreground" />
              )}
              <DialogTitle>
                {selectedMessage?.role === "user" ? "Your Message" : "AI Assistant Response"}
              </DialogTitle>
            </div>
            <DialogDescription>
              {selectedMessage?.role === "user"
                ? "Your question to the AI assistant"
                : "Detailed response from the AI assistant"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              value={selectedMessage?.content || ""}
              readOnly
              className="min-h-[200px] resize-none"
              placeholder="No content available"
            />
          </div>

          <DialogFooter>
            <Button onClick={() => setShowMessageDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}