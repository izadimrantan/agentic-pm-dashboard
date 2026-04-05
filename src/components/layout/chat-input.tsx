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
    <div className="border-t border-white/[0.06] p-3">
      <div className="relative flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything… (Enter to send)"
          disabled={disabled}
          className={cn(
            "min-h-[40px] max-h-[120px] resize-none pr-2 text-sm",
            "border-white/[0.06] bg-white/[0.04] focus-visible:border-white/[0.12]"
          )}
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          size="icon"
          variant="ghost"
          className="mb-0.5 shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
          aria-label="Send message"
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50">
        Shift+Enter for newline
      </p>
    </div>
  );
}
