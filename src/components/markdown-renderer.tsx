"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert prose-zinc max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-[13px] prose-p:leading-relaxed prose-p:text-foreground/80 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-[12px] prose-code:rounded-md prose-code:bg-white/[0.04] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-primary/80 prose-pre:bg-white/[0.03] prose-pre:border prose-pre:border-white/[0.04] prose-pre:rounded-xl prose-table:text-[13px] prose-th:border prose-th:border-white/[0.06] prose-th:px-3 prose-th:py-2 prose-th:text-muted-foreground/70 prose-td:border prose-td:border-white/[0.04] prose-td:px-3 prose-td:py-2 prose-li:text-[13px] prose-li:text-foreground/80 prose-hr:border-white/[0.04]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
