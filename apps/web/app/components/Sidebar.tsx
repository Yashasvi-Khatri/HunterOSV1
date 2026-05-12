"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Conversation, UserSettings } from "../lib/types";
import { AVAILABLE_MODELS } from "../lib/models";
import { HunterOSLogo } from "./HunterOSLogo";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  settings: UserSettings;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  settings,
  onSelect,
  onNew,
  onDelete,
  onOpenSettings,
}: SidebarProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const pathname = usePathname();

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 2000);
    }
  };

  const navLink = (
    href: string,
    label: string,
    emoji: string,
    accent?: boolean,
  ) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          accent
            ? "bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-600 hover:to-indigo-600 text-white border border-white/10"
            : isActive
              ? "bg-white/10 text-white border border-white/10"
              : "bg-white/5 hover:bg-white/8 text-gray-300 hover:text-white border border-white/5 hover:border-white/10"
        }`}
      >
        <span className="text-base leading-none">{emoji}</span>
        {label}
      </Link>
    );
  };

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-full bg-gray-950 border-r border-white/5">
      {/* Logo */}
      <div className="px-3 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 px-1 mb-3">
          <HunterOSLogo size={28} showText={true} />
        </div>

        {/* New chat */}
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors mb-2"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Chat
        </button>

        {/* Nav links */}
        <div className="flex flex-col gap-1.5">
          {navLink("/compare", "Compare Models", "⚡", true)}
          {navLink("/bounty", "Bounty Tools", "🎯")}
          {navLink("/benchmark", "Benchmark", "📊")}
          {navLink("/trust-score", "Trust Score", "🛡️")}
          {navLink("/pricing", "Pricing", "$")}
        </div>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {conversations.length > 0 && (
          <div className="text-gray-600 text-xs uppercase tracking-wider px-3 mb-2 font-medium">
            Recent
          </div>
        )}
        {conversations.length === 0 ? (
          <p className="text-gray-600 text-xs text-center mt-8 px-3 leading-relaxed">
            No conversations yet.
            <br />
            Start a new chat above.
          </p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                activeId === conv.id
                  ? "bg-white/8 text-white"
                  : "text-gray-500 hover:bg-white/4 hover:text-gray-200"
              }`}
            >
              <svg
                className="w-3 h-3 flex-shrink-0 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="flex-1 truncate text-xs">{conv.title}</span>
              <button
                onClick={(e) => handleDelete(e, conv.id)}
                className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all ${
                  deleteConfirm === conv.id
                    ? "text-red-400 opacity-100"
                    : "text-gray-600 hover:text-red-400"
                }`}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer — user */}
      <div className="p-2 border-t border-white/5">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-600/25 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
            {settings.name ? settings.name.charAt(0).toUpperCase() : "?"}
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-xs font-medium text-white truncate">
              {settings.name || "Set your name"}
            </p>
            <p className="text-[10px] text-gray-500 truncate">
              {AVAILABLE_MODELS.find((m) => m.id === settings.defaultModel)
                ?.name ?? "GPT-4o"}
            </p>
          </div>
          <svg
            className="w-3.5 h-3.5 flex-shrink-0 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}
