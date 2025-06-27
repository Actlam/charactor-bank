"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeletePromptDialogProps {
  promptId: string;
  promptTitle: string;
  onSuccess: () => void;
  children?: React.ReactNode;
}

export function DeletePromptDialog({ 
  promptId, 
  promptTitle, 
  onSuccess,
  children 
}: DeletePromptDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deletePrompt = useMutation(api.prompts.deletePrompt);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      await deletePrompt({ promptId: promptId as Id<"prompts"> });
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("削除に失敗しました:", error);
      // エラーハンドリングはここで行う（今回は簡略化）
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            size="sm" 
            variant="outline" 
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            プロンプトを削除
          </DialogTitle>
          <DialogDescription>
            この操作は元に戻せません。本当に削除しますか？
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="font-medium text-sm">削除対象:</p>
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {promptTitle}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                削除中...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                削除する
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}