"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

interface SharedMessage {
  role: "user" | "assistant";
  content: string;
}

function SharedChat() {
  const params = useSearchParams();
  const [messages, setMessages] = useState<SharedMessage[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const c = params.get("c");
    if (!c) { setError(true); return; }
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(c)));
      setMessages(decoded);
    } catch {
      setError(true);
    }
  }, [params]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center flex-col gap-4">
        <p className="text-gray-400">Invalid or expired share link.</p>
        <Link href="/" className="text-indigo-400 hover:underline text-sm">
          Start a new chat →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-white">Shared Chat</h1>
        <Link
          href="/"
          className="text-sm text-indigo-400 hover:underline"
        >
          Start your own →
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-indigo-600/20 text-gray-100 ml-8"
                : "bg-white/5 text-gray-200 mr-8"
            }`}
          >
            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
              {m.role === "user" ? "You" : "Assistant"}
            </div>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500 text-sm">Loading shared chat...</p>
      </div>
    }>
      <SharedChat />
    </Suspense>
  );
}
