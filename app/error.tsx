'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { handleError } from '@/lib/errors/handler';

/**
 * ページレベルのエラーバウンダリ
 * 各ルートセグメントでのエラーをキャッチ
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーハンドラーに送信
    handleError(error, {
      action: 'page-error',
      timestamp: new Date(),
    });
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-xl">エラーが発生しました</CardTitle>
          <CardDescription>
            ページの読み込み中に問題が発生しました
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              {error.message || '予期しないエラーが発生しました'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={reset}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              再試行
            </Button>

            <Button
              onClick={() => window.location.href = '/'}
              className="flex-1"
              variant="outline"
            >
              <Home className="mr-2 h-4 w-4" />
              ホームへ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}