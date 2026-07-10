"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check, Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Props = {
  resource: { slug: string; title: string; description: string; content: string };
};

export function ResourceCard({ resource }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(resource.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([resource.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resource.slug}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="p-5">
      <p className="text-sm font-bold text-gray-900">{resource.title}</p>
      <p className="mt-1.5 text-sm text-gray-600">{resource.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setExpanded((v) => !v)}>
          {expanded ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {expanded ? "Ẩn nội dung" : "Xem"}
        </Button>
        <Button size="sm" variant="outline" onClick={handleCopy}>
          {copied ? <Check className="size-3.5 text-primary-600" /> : <Copy className="size-3.5" />}
          {copied ? "Đã sao chép" : "Sao chép"}
        </Button>
        <Button size="sm" variant="secondary" onClick={handleDownload}>
          <Download className="size-3.5" />
          Tải xuống
        </Button>
      </div>

      {expanded && (
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-xs leading-relaxed text-gray-700">
          {resource.content}
        </pre>
      )}
    </Card>
  );
}
