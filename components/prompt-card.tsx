"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/like-button";
import { BookmarkButton } from "@/components/bookmark-button";
import { ConversationExamplesDisplay } from "@/components/conversation-examples-display";
import { Heart, Bookmark, Eye, Copy, Check, MessageCircle } from "lucide-react";
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
    <div className="group relative card-pop px-6 py-7 animate-fade-in">
        {/* Header area with title and badge */}
        <div className="flex justify-between items-start gap-3 mb-2">
          {/* Title */}
          <Link href={`/prompts/${prompt._id}`} className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold group-hover:text-primary line-clamp-2 cursor-pointer transition-smooth">
              {prompt.title}
            </h3>
          </Link>
          
          {/* Category Badge */}
          {prompt.category && (
            <div className="flex-shrink-0">
              <Badge variant="secondary" className="text-xs shadow-sm">
                {prompt.category.icon} {prompt.category.name}
              </Badge>
            </div>
          )}
        </div>

        {/* Author and Date */}
        <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
          {prompt.author && (
            <span>{prompt.author.displayName || prompt.author.username}</span>
          )}
          <span>
            {formatDistanceToNow(new Date(prompt.createdAt), {
              addSuffix: true,
              locale: ja,
            })}
          </span>
        </div>

        {/* Description or Content Preview */}
        <p className="mb-4 text-muted-foreground line-clamp-3">
          {prompt.description || truncateContent(prompt.content)}
        </p>

        {/* Tags */}
        {prompt.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {prompt.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {prompt.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{prompt.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Conversation Examples Preview */}
        {prompt.examples && prompt.examples.length > 0 && (
          <div className="mb-4">
            <ConversationExamplesDisplay
              examples={prompt.examples}
              maxDisplay={2}
              showScenarios={false}
              className=""
            />
            {prompt.examples.length > 2 && (
              <div className="mt-2 text-center">
                <Link href={`/prompts/${prompt._id}`}>
                  <Badge variant="outline" className="text-xs hover:bg-primary/10 cursor-pointer">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    他 {prompt.examples.length - 2} 個の会話例を見る
                  </Badge>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Stats and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {prompt.viewCount}
            </span>
            <LikeButton 
              promptId={prompt._id as any}
              initialLikeCount={prompt.likeCount}
              size="sm"
            />
            <BookmarkButton 
              promptId={prompt._id as any}
              initialBookmarkCount={prompt.bookmarkCount}
              size="sm"
            />
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-smooth bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold px-3 py-2 rounded-lg"
          >
            {copied ? (
              <>
                <Check className="mr-1 h-3 w-3" />
                コピー済み
              </>
            ) : (
              <>
                <Copy className="mr-1 h-3 w-3" />
                コピー
              </>
            )}
          </Button>
        </div>
    </div>
  );
}