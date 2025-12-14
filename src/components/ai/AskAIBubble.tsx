"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Bot, X, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export function AskAIBubble() {
  const [open, setOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
      onError: (err) => {
        console.error("Chat error:", err);
      },
    });

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={chatRef}>
      {/* Chat Window */}
      <div
        className={cn(
          "absolute bottom-16 right-0 w-[380px] max-h-[520px] rounded-2xl overflow-hidden shadow-2xl",
          "bg-card border border-border/50",
          "backdrop-blur-xl transition-all duration-300 ease-out",
          "flex flex-col",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}>
        {/* Header */}
        <div className="p-4 border-b border-border/50 bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Steward</h3>
                <p className="text-xs text-primary-foreground/70">
                  Your Multi-Currency Coach
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <div
          className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[250px] max-h-[350px] bg-muted/10"
          ref={scrollRef}>
          {/* Welcome Message if no messages */}
          {messages.length === 0 && (
            <>
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="bg-muted rounded-xl rounded-tl-sm p-3 max-w-[85%] text-sm">
                  <p>
                    Hi! I'm <strong>Steward</strong>, your family's financial
                    coach. I handle MXN, USD & EUR separately - no currency
                    mixing! 💰
                  </p>
                </div>
              </div>

              {/* Suggested Prompts */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {[
                  "How much did I spend?",
                  "Debt status?",
                  "USD vs MXN spending?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      const fakeEvent = {
                        target: { value: prompt },
                      } as React.ChangeEvent<HTMLInputElement>;
                      handleInputChange(fakeEvent);
                    }}
                    className="text-xs px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors">
                    {prompt}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div key={message.id} className="flex gap-2">
              <div
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}>
                {message.role === "user" ? (
                  <User className="h-3 w-3" />
                ) : (
                  <Bot className="h-3 w-3" />
                )}
              </div>
              <div
                className={cn(
                  "rounded-xl p-3 max-w-[85%] text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tl-sm"
                    : "bg-muted rounded-tl-sm"
                )}>
                {message.role === "user" ? (
                  <p>{message.content}</p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-2 space-y-0.5">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-2 space-y-0.5">
                            {children}
                          </ol>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                      }}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading */}
          {isLoading && (
            <div className="flex gap-2">
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Bot className="h-3 w-3" />
              </div>
              <div className="bg-muted rounded-xl rounded-tl-sm p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Thinking...
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg">
              Something went wrong. Please try again.
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-border/50 bg-background">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask Steward anything..."
              className="flex-1 h-9 text-sm"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9"
              disabled={!input.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Floating Bubble Button */}
      <Button
        onClick={() => setOpen(!open)}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90",
          "transition-all duration-300 hover:scale-105"
        )}>
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </Button>
    </div>
  );
}
