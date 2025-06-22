"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Copy, Check } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface PromptCardProps {
  prompt: {
    _id: string;
    title: string;
    description?: string;
    content: string;
    tags: string[];
    viewCount: number;
    likeCount: number;
    bookmarkCount: number;
    createdAt: number;
    examples?: {
      id: string;
      userMessage: string;
      characterResponse: string;
      scenario?: string;
      isHighlighted?: boolean;
    }[];
    author?: {
      username: string;
      displayName?: string;
      avatarUrl?: string;
    } | null;
    category?: {
      name: string;
      icon?: string;
      color?: string;
    } | null;
  };
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateContent = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="group relative card-pop p-4 animate-fade-in hover:shadow-lg transition-all duration-300">
      <Link href={`/prompts/${prompt._id}`} className="block">
        {/* Header */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <h3 className="text-lg font-semibold group-hover:text-primary line-clamp-2 flex-1">
            {prompt.title}
          </h3>
          {prompt.category && (
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {prompt.category.icon}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {prompt.description || truncateContent(prompt.content, 100)}
        </p>

        {/* Tags - 最大2個まで */}
        {prompt.tags.length > 0 && (
          <div className="mb-3 flex gap-1">
            {prompt.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
            {prompt.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 text-muted-foreground">
                +{prompt.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </Link>

      {/* Bottom Stats */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {prompt.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {prompt.viewCount}
          </span>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2 text-xs"
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}