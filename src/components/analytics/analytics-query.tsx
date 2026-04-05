"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { UIMessage } from "ai";
import { Card } from "@/components/ui/card";
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
    <Card className="flex flex-col overflow-hidden border border-white/[0.08] bg-white/[0.03] backdrop-blur-md" style={{ height: "400px" }}>
      {/* Header */}
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-sm font-medium">Ask about analytics</p>
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
    </Card>
  );
}
