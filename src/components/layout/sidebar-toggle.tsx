"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarToggleProps {
  onToggle: () => void;
  className?: string;
}

export function SidebarToggle({ onToggle, className }: SidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={className}
      aria-label="Toggle sidebar"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
