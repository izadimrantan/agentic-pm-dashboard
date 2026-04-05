"use client";

import { Menu } from "lucide-react";

interface SidebarToggleProps {
  onToggle: () => void;
  className?: string;
}

export function SidebarToggle({ onToggle, className }: SidebarToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={className}
      aria-label="Toggle sidebar"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
