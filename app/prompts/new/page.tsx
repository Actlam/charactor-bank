"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/tag-input";
import { useTryCatch } from "@/hooks/use-error-handler";
import { BusinessLogicError } from "@/lib/errors";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";


export default function NewPromptPage() {
  const router = useRouter();
  const { tryAsync } = useTryCatch();
  
  const createPrompt = useMutation(api.prompts.createPrompt);
  const categories = useQuery(api.categories.getAllCategories);
  const seedCategories = useMutation(api.categories.seedCategories);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSeeding, setIsSeeding] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);

  // Seed categories if none exist
  useEffect(() => {
    console.log("Categories:", categories);
    if (categories && categories.length === 0 && !isSeeding) {
      console.log("Seeding categories...");
      setIsSeeding(true);
      seedCategories().finally(() => setIsSeeding(false));
    }
  }, [categories, seedCategories, isSeeding]);

  // バリデーション関数
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "タイトルは必須です";
    } else if (title.length < 3) {
      errors.title = "タイトルは3文字以上にしてください";
    } else if (title.length > 100) {
      errors.title = "タイトルは100文字以内にしてください";
    }

    if (!content.trim()) {
      errors.content = "プロンプト内容は必須です";
    } else if (content.length < 10) {
      errors.content = "プロンプト内容は10文字以上にしてください";
    } else if (content.length > 5000) {
      errors.content = "プロンプト内容は5000文字以内にしてください";
    }

    if (description && description.length > 500) {
      errors.description = "説明は500文字以内にしてください";
    }

    if (tags.length > 10) {
      errors.tags = "タグは10個以内にしてください";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // バリデーション
    if (!validateForm()) {
      toast.error("入力内容を確認してください");
      return;
    }

    setIsSubmitting(true);

    await tryAsync(
      async () => {
        // プロンプト作成
        const promptId = await createPrompt({
          title,
          description: description || undefined,
          content,
          categoryId: categoryId ? (categoryId as Id<"categories">) : undefined,
          tags,
          isPublic,
        });

        if (!promptId) {
          throw new BusinessLogicError("プロンプトの作成に失敗しました");
        }

        // 会話例の追加機能は今後実装予定

        return promptId;
      },
      {
        onSuccess: (promptId) => {
          toast.success("プロンプトを作成しました");
          router.push(`/prompts/${promptId}`);
        },
        onError: () => {
          setIsSubmitting(false);
          // エラーは useErrorHandler で自動的に処理される
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">新しいプロンプトを作成</h1>

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
            className={validationErrors.title ? "border-destructive" : ""}
          />
          <div className="mt-1 flex justify-between">
            <p className="text-sm text-muted-foreground">
              {title.length}/100
            </p>
            {validationErrors.title && (
              <p className="text-sm text-destructive">{validationErrors.title}</p>
            )}
          </div>
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
            className={validationErrors.description ? "border-destructive" : ""}
          />
          <div className="mt-1 flex justify-between">
            <p className="text-sm text-muted-foreground">
              {description.length}/500
            </p>
            {validationErrors.description && (
              <p className="text-sm text-destructive">{validationErrors.description}</p>
            )}
          </div>
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
            className={validationErrors.content ? "border-destructive" : ""}
          />
          {validationErrors.content && (
            <p className="mt-1 text-sm text-destructive">{validationErrors.content}</p>
          )}
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
          {validationErrors.tags && (
            <p className="mt-1 text-sm text-destructive">{validationErrors.tags}</p>
          )}
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

        {/* 会話例の入力機能は今後実装予定 */}

        {Object.keys(validationErrors).length > 0 && (
          <div className="rounded-md bg-destructive/10 p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                入力内容にエラーがあります
              </span>
            </div>
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
                作成中...
              </>
            ) : (
              "作成する"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
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