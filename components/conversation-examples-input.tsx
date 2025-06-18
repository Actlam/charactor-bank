"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, MessageCircle, Bot } from "lucide-react";

interface ConversationExample {
  id: string;
  userMessage: string;
  characterResponse: string;
  scenario?: string;
}

interface ConversationExamplesInputProps {
  value: ConversationExample[];
  onChange: (examples: ConversationExample[]) => void;
  maxExamples?: number;
}

export function ConversationExamplesInput({
  value,
  onChange,
  maxExamples = 5,
}: ConversationExamplesInputProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newExample, setNewExample] = useState<Omit<ConversationExample, "id">>({
    userMessage: "",
    characterResponse: "",
    scenario: "",
  });

  const handleAddExample = () => {
    if (!newExample.userMessage.trim() || !newExample.characterResponse.trim()) {
      return;
    }

    const example: ConversationExample = {
      id: crypto.randomUUID(),
      userMessage: newExample.userMessage.trim(),
      characterResponse: newExample.characterResponse.trim(),
      scenario: newExample.scenario?.trim() || undefined,
    };

    onChange([...value, example]);
    setNewExample({ userMessage: "", characterResponse: "", scenario: "" });
    setIsAddingNew(false);
  };

  const handleUpdateExample = (
    index: number,
    field: keyof Omit<ConversationExample, "id">,
    newValue: string
  ) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: newValue };
    onChange(updated);
  };

  const handleDeleteExample = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  const canAddMore = value.length < maxExamples;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          会話例 <span className="text-muted-foreground">({value.length}/{maxExamples})</span>
        </Label>
        {canAddMore && !isAddingNew && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingNew(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            例を追加
          </Button>
        )}
      </div>

      {value.length === 0 && !isAddingNew && (
        <div className="border-dashed border-2 rounded-lg p-8 text-center">
          <MessageCircle className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
          <p className="text-muted-foreground mb-4">
            まだ会話例がありません。<br />
            ユーザーがプロンプトの使い方をイメージしやすくなる会話例を追加しましょう。
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAddingNew(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            最初の例を追加
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {value.map((example, index) => (
          <div key={example.id} className="rounded-lg border bg-card">
            <div className="p-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">
                  会話例 {index + 1}
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteExample(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {example.scenario && (
                <Badge variant="secondary" className="w-fit text-xs">
                  {example.scenario}
                </Badge>
              )}
            </div>
            <div className="px-4 pb-4 space-y-4">
              <div>
                <Label htmlFor={`scenario-${index}`} className="text-sm">
                  場面説明（任意）
                </Label>
                <Input
                  id={`scenario-${index}`}
                  value={example.scenario || ""}
                  onChange={(e) => handleUpdateExample(index, "scenario", e.target.value)}
                  placeholder="例: 初回面談時"
                  maxLength={50}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {(example.scenario || "").length}/50
                </p>
              </div>

              <div>
                <Label htmlFor={`user-${index}`} className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  ユーザーの発言
                </Label>
                <Textarea
                  id={`user-${index}`}
                  value={example.userMessage}
                  onChange={(e) => handleUpdateExample(index, "userMessage", e.target.value)}
                  placeholder="例: 今日はどんな一日でしたか？"
                  maxLength={200}
                  rows={2}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {example.userMessage.length}/200
                </p>
              </div>

              <div>
                <Label htmlFor={`character-${index}`} className="text-sm flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  キャラクターの返答
                </Label>
                <Textarea
                  id={`character-${index}`}
                  value={example.characterResponse}
                  onChange={(e) => handleUpdateExample(index, "characterResponse", e.target.value)}
                  placeholder="例: お疲れ様でした！今日は..."
                  maxLength={500}
                  rows={3}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {example.characterResponse.length}/500
                </p>
              </div>
            </div>
          </div>
        ))}

        {isAddingNew && (
          <div className="rounded-lg border border-primary/50 bg-card">
            <div className="p-4 pb-2">
              <h4 className="text-sm font-medium">新しい会話例</h4>
            </div>
            <div className="px-4 pb-4 space-y-4">
              <div>
                <Label htmlFor="new-scenario" className="text-sm">
                  場面説明（任意）
                </Label>
                <Input
                  id="new-scenario"
                  value={newExample.scenario || ""}
                  onChange={(e) => setNewExample({ ...newExample, scenario: e.target.value })}
                  placeholder="例: 初回面談時"
                  maxLength={50}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {(newExample.scenario || "").length}/50
                </p>
              </div>

              <div>
                <Label htmlFor="new-user" className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  ユーザーの発言 *
                </Label>
                <Textarea
                  id="new-user"
                  value={newExample.userMessage}
                  onChange={(e) => setNewExample({ ...newExample, userMessage: e.target.value })}
                  placeholder="例: 今日はどんな一日でしたか？"
                  maxLength={200}
                  rows={2}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {newExample.userMessage.length}/200
                </p>
              </div>

              <div>
                <Label htmlFor="new-character" className="text-sm flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  キャラクターの返答 *
                </Label>
                <Textarea
                  id="new-character"
                  value={newExample.characterResponse}
                  onChange={(e) => setNewExample({ ...newExample, characterResponse: e.target.value })}
                  placeholder="例: お疲れ様でした！今日は..."
                  maxLength={500}
                  rows={3}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {newExample.characterResponse.length}/500
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={handleAddExample}
                  disabled={!newExample.userMessage.trim() || !newExample.characterResponse.trim()}
                  size="sm"
                >
                  追加
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewExample({ userMessage: "", characterResponse: "", scenario: "" });
                  }}
                  size="sm"
                >
                  キャンセル
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          💡 ヒント: 具体的で分かりやすい会話例があると、ユーザーがプロンプトを使いやすくなります。
        </p>
      )}
    </div>
  );
}