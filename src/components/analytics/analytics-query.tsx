"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { UIMessage } from "ai";
import { ChatMessages } from "@/components/layout/chat-messages";
import { ChatInput } from "@/components/layout/chat-input";

interface AnalyticsQueryProps {
  projectId: string;
  projectName: string;
}

export function AnalyticsQuery({ projectId, projectName }: AnalyticsQueryProps) {
  const [inputValue, setInputValue] = useState("");

  const introMessage = useMemo<UIMessage>(
    () => ({
      id: "analytics-intro",
      role: "assistant",
      content: `I can help you query analytics for **${projectName}**. Ask me about metrics, trends, or any data connected via MCP.`,
      parts: [
        {
          type: "text",
          text: `I can help you query analytics for **${projectName}**. Ask me about metrics, trends, or any data connected via MCP.`,
        },
      ],
    }),
    [projectName]
  );

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { projectId },
    }),
  });

  const allMessages = useMemo<UIMessage[]>(
    () => [introMessage, ...messages],
    [introMessage, messages]
  );

  const isLoading = status === "submitted" || status === "streaming";

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue("");
    sendMessage({ text });
  };

  return (
    <div
      className="flex flex-col overflow-hidden glass-card rounded-xl"
      style={{ height: "400px" }}
    >
      {/* Header */}
      <div className="border-b border-white/[0.04] px-5 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground/50">
          Ask about analytics
        </p>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatMessages messages={allMessages} isLoading={isLoading} />
      </div>

      {/* Input */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        disabled={isLoading}
      />
    </div>
  );
}
