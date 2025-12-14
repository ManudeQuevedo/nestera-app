"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Bot } from "lucide-react";

interface AskAISheetProps {
  trigger?: React.ReactNode;
}

export function AskAISheet({ trigger }: AskAISheetProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-10 px-3 text-muted-foreground bg-muted/50 border-none hover:bg-muted">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Ask Lumen about your finances...</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-lg">Lumen AI Assistant</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Your personal finance advisor
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Chat Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {/* Welcome Message */}
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-4 max-w-[85%]">
              <p className="text-sm">
                Hello! I'm Lumen, your AI financial assistant. I can help you
                understand your spending patterns, suggest ways to save, and
                answer questions about your finances.
              </p>
              <p className="text-sm mt-2 text-muted-foreground">
                Try asking me things like:
              </p>
              <ul className="text-sm mt-1 space-y-1 text-muted-foreground">
                <li>• "How much did I spend on dining last month?"</li>
                <li>• "What are my biggest expenses?"</li>
                <li>• "How can I save more money?"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Lumen anything..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && message.trim()) {
                  // TODO: Send message to AI
                  setMessage("");
                }
              }}
            />
            <Button
              size="icon"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Lumen uses AI to analyze your finances. Responses may not always be
            accurate.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
