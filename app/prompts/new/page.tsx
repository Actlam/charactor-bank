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
import { ConversationExamplesInput } from "@/components/conversation-examples-input";
import { Loader2 } from "lucide-react";

interface ConversationExample {
  id: string;
  userMessage: string;
  characterResponse: string;
  scenario?: string;
}

export default function NewPromptPage() {
  const router = useRouter();
  const createPrompt = useMutation(api.prompts.createPrompt);
  const addExample = useMutation(api.prompts.addExample);
  const categories = useQuery(api.categories.getAllCategories);
  const seedCategories = useMutation(api.categories.seedCategories);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [examples, setExamples] = useState<ConversationExample[]>([]);

  // Seed categories if none exist
  useEffect(() => {
    console.log("Categories:", categories);
    if (categories && categories.length === 0 && !isSeeding) {
      console.log("Seeding categories...");
      setIsSeeding(true);
      seedCategories().finally(() => setIsSeeding(false));
    }
  }, [categories, seedCategories, isSeeding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    console.log("Submitting prompt with data:", {
      title,
      description: description || undefined,
      content,
      categoryId: categoryId ? (categoryId as any) : undefined,
      tags,
      isPublic,
    });

    try {
      const promptId = await createPrompt({
        title,
        description: description || undefined,
        content,
        categoryId: categoryId ? (categoryId as any) : undefined,
        tags,
        isPublic,
      });

      console.log("Created prompt with ID:", promptId);

      // Add conversation examples if any
      if (examples.length > 0) {
        console.log("Adding conversation examples...");
        for (const example of examples) {
          await addExample({
            promptId,
            userMessage: example.userMessage,
            characterResponse: example.characterResponse,
            scenario: example.scenario,
          });
        }
        console.log(`Added ${examples.length} conversation examples`);
      }

      router.push(`/prompts/${promptId}`);
    } catch (err) {
      console.error("Error creating prompt:", err);
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setIsSubmitting(false);
    }
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

        <div>
          <ConversationExamplesInput
            value={examples}
            onChange={setExamples}
            maxExamples={5}
          />
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