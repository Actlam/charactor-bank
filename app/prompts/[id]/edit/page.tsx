"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/tag-input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Loader2, ArrowLeft } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";


export default function EditPromptPage() {
  const params = useParams();
  const router = useRouter();
  const promptId = params.id as string;
  
  const { user } = useCurrentUser();
  const prompt = useQuery(api.prompts.getPromptById, {
    promptId: promptId as Id<"prompts">,
  });
  const updatePrompt = useMutation(api.prompts.updatePrompt);
  const categories = useQuery(api.categories.getAllCategories);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);

  // Load existing prompt data
  useEffect(() => {
    if (prompt && !isLoaded) {
      setTitle(prompt.title);
      setDescription(prompt.description || "");
      setContent(prompt.content);
      setCategoryId(prompt.categoryId || "");
      setTags(prompt.tags);
      setIsPublic(prompt.isPublic);
      
      // 会話例の機能は今後実装予定
      
      setIsLoaded(true);
    }
  }, [prompt, isLoaded]);

  // Loading state
  if (prompt === undefined) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Not found
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

  // Permission check
  if (!user || !prompt.author || user.clerkId !== prompt.author.clerkId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">編集権限がありません</h1>
          <p className="mb-8 text-muted-foreground">
            このプロンプトを編集する権限がありません。
          </p>
          <Button onClick={() => router.push(`/prompts/${promptId}`)}>
            プロンプト詳細に戻る
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await updatePrompt({
        promptId: promptId as Id<"prompts">,
        title,
        description: description || undefined,
        content,
        categoryId: categoryId ? (categoryId as Id<"categories">) : null,
        tags,
        isPublic,
      });

      router.push(`/prompts/${promptId}`);
    } catch (err) {
      console.error("Error updating prompt:", err);
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/prompts/${promptId}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        プロンプト詳細に戻る
      </Button>

      <h1 className="mb-8 text-3xl font-bold">プロンプトを編集</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">タイトル *</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 優しい秘書のアシスタント"
            maxLength={100}
            required
          />
          <p className="mt-1 text-sm text-muted-foreground">
            {title.length}/100
          </p>
        </div>

        <div>
          <Label htmlFor="description">説明</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="このプロンプトの簡単な説明を入力してください"
            rows={3}
            maxLength={500}
          />
          <p className="mt-1 text-sm text-muted-foreground">
            {description.length}/500
          </p>
        </div>

        <div>
          <Label htmlFor="content">プロンプト内容 *</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="AIに指示する内容を入力してください&#10;例: あなたは優しく丁寧な秘書です。..."
            rows={10}
            required
          />
        </div>

        <div>
          <Label htmlFor="category">カテゴリ</Label>
          <Select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">カテゴリを選択</option>
            {categories?.map((category) => (
              <option key={category._id} value={category._id}>
                {category.icon} {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="tags">タグ</Label>
          <TagInput
            value={tags}
            onChange={setTags}
            placeholder="タグを入力してEnterで追加（最大10個）"
            maxTags={10}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isPublic"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
          <Label htmlFor="isPublic">
            公開する（他のユーザーがこのプロンプトを見ることができます）
          </Label>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || !title || !content}
            className="flex-1 btn-pop"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                更新中...
              </>
            ) : (
              "更新する"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/prompts/${promptId}`)}
            disabled={isSubmitting}
            className="btn-secondary-pop"
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}