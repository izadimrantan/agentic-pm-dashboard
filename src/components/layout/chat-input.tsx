"use client";

import { useRef, KeyboardEvent } from "react";
import { SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  return (
    <div className="border-t border-white/[0.04] p-3">
      <div className="relative flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          disabled={disabled}
          className={cn(
            "min-h-[40px] max-h-[120px] resize-none pr-2 text-[13px]",
            "border-white/[0.04] bg-white/[0.02] focus-visible:border-primary/20 focus-visible:ring-primary/10 rounded-xl"
          )}
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          size="icon"
          variant="ghost"
          className="mb-0.5 shrink-0 text-muted-foreground/40 hover:text-primary disabled:opacity-20 rounded-lg"
          aria-label="Send message"
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
