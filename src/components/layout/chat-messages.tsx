"use client";

import { useEffect, useRef } from "react";
import { UIMessage } from "ai";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.06]">
          <Bot className="h-5 w-5 text-primary/50" />
        </div>
        <p className="text-xs text-muted-foreground/50 text-center leading-relaxed">
          Ask anything about your project
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5">
      {messages.map((message) => {
        const isUser = message.role === "user";
        const textContent = message.parts
          .filter((p) => p.type === "text")
          .map((p) => (p as { type: "text"; text: string }).text)
          .join("");

        return (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              isUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                isUser
                  ? "bg-primary/[0.1] text-primary"
                  : "bg-white/[0.04] text-muted-foreground/60"
              )}
            >
              {isUser ? (
                <User className="h-3.5 w-3.5" />
              ) : (
                <Bot className="h-3.5 w-3.5" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                isUser
                  ? "bg-primary/[0.08] border border-primary/[0.1] text-foreground"
                  : "glass-card text-foreground"
              )}
            >
              {isUser ? (
                <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
                  {textContent}
                </p>
              ) : (
                <MarkdownRenderer content={textContent} />
              )}
            </div>
          </div>
        );
      })}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-muted-foreground/60">
            <Bot className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl glass-card px-4 py-3">
            <span
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
