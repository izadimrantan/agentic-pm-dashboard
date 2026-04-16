"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";

function extractProjectIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/\/projects\/([^/]+)/);
  return match?.[1];
}

export function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const pathname = usePathname();
  const projectId = extractProjectIdFromPath(pathname);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: projectId ? { projectId } : undefined,
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue("");
    sendMessage({ text });
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-2xl glass-card text-muted-foreground/70 hover:text-primary shadow-lg animate-glow-pulse transition-colors duration-200"
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      {/* Sheet panel */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton
          className="flex w-full flex-col gap-0 p-0 sm:max-w-[440px] bg-[oklch(0.08_0.005_260)] border-l border-white/[0.04]"
        >
          <SheetHeader className="border-b border-white/[0.04] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/[0.1]">
                <MessageCircle className="h-3.5 w-3.5 text-primary" />
              </div>
              <SheetTitle className="text-sm font-medium">
                AI Assistant
              </SheetTitle>
              {projectId && (
                <Badge variant="secondary" className="text-[10px] font-normal bg-white/[0.04] border-white/[0.06] text-muted-foreground">
                  Project
                </Badge>
              )}
            </div>
          </SheetHeader>

          {/* Messages */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <ChatMessages messages={messages} isLoading={isLoading} />
          </div>

          {/* Input */}
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            disabled={isLoading}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
