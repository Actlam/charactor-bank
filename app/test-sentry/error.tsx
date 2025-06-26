"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをSentryに送信
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-destructive">
          エラーが発生しました！
        </h2>
        <p className="text-muted-foreground mb-4">
          このエラーは自動的にSentryに報告されました。
        </p>
        <div className="bg-muted p-4 rounded mb-6">
          <p className="text-sm font-mono text-left break-all">
            {error.message}
          </p>
        </div>
        <Button onClick={reset} className="w-full">
          もう一度試す
        </Button>
      </div>
    </div>
  );
}