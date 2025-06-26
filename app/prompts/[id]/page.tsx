"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "@/components/like-button";
import { BookmarkButton } from "@/components/bookmark-button";
import { ConversationExamplesDisplay } from "@/components/conversation-examples-display";
import { DeletePromptDialog } from "@/components/delete-prompt-dialog";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ValidationError } from "@/lib/errors";
import { ArrowLeft, Copy, Check, Eye, Edit, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const promptId = params.id as string;
  const [copied, setCopied] = useState(false);
  const { handleError } = useErrorHandler({
    showToast: true,
    context: { promptId },
  });
  
  const { user } = useCurrentUser();
  const prompt = useQuery(api.prompts.getPromptById, {
    promptId: promptId as any,
  });

  // プロンプトIDのバリデーション
  useEffect(() => {
    if (!promptId || typeof promptId !== 'string') {
      handleError(
        new ValidationError('無効なプロンプトIDです', 'promptId', promptId)
      );
      router.push('/');
    }
  }, [promptId, router, handleError]);

  const handleCopy = async () => {
    if (!prompt?.content) {
      toast.error('コピーする内容がありません');
      return;
    }

    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      toast.success('プロンプトをコピーしました');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      handleError(new Error('クリップボードへのコピーに失敗しました'));
    }
  };

  // Check if current user is the author
  const isAuthor = user && prompt?.author && user.clerkId === prompt.author.clerkId;

  const handleDeleteSuccess = () => {
    // 削除成功後はホームページに遷移
    router.push("/");
  };

  if (prompt === undefined) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (prompt === null) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">プロンプトが見つかりません</h1>
          <p className="mb-8 text-muted-foreground">
            このプロンプトは存在しないか、非公開に設定されています。
          </p>
          <Button onClick={() => router.push("/")}>
            ホームに戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        戻る
      </Button>

      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{prompt.title}</h1>
            {prompt.description && (
              <p className="text-lg text-muted-foreground">{prompt.description}</p>
            )}
          </div>
          
          {isAuthor && (
            <div className="flex gap-2">
              <Link href={`/prompts/${promptId}/edit`}>
                <Button size="sm" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </Button>
              </Link>
              <DeletePromptDialog
                promptId={promptId}
                promptTitle={prompt.title}
                onSuccess={handleDeleteSuccess}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>作成者: {prompt.author?.displayName || prompt.author?.username}</span>
          {prompt.category && (
            <span>
              カテゴリ: {prompt.category.icon} {prompt.category.name}
            </span>
          )}
          <span>
            作成日: {new Date(prompt.createdAt).toLocaleDateString("ja-JP")}
          </span>
        </div>

        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {prompt.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="rounded-lg border bg-muted/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">プロンプト内容</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  コピーしました
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  コピー
                </>
              )}
            </Button>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {prompt.content}
          </pre>
        </div>

        {prompt.examples && prompt.examples.length > 0 && (
          <ConversationExamplesDisplay
            examples={prompt.examples}
            showScenarios={true}
            className="mt-6"
          />
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{prompt.viewCount} 回閲覧</span>
          </div>
          <div className="flex items-center gap-2">
            <LikeButton 
              promptId={prompt._id as any}
              initialLikeCount={prompt.likeCount}
            />
            <BookmarkButton 
              promptId={prompt._id as any}
              initialBookmarkCount={prompt.bookmarkCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}