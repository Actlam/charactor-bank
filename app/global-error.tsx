'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';

/**
 * グローバルエラーバウンダリ
 * Next.js App Routerのルートレベルエラーをキャッチ
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをSentryに送信
    Sentry.captureException(error, {
      tags: {
        location: 'global-error-boundary',
      },
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <html lang="ja">
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">申し訳ございません</CardTitle>
              <CardDescription>
                予期しないエラーが発生しました
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  エラーコード: {error.digest || 'UNKNOWN'}
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">
                      エラー詳細（開発環境のみ）
                    </summary>
                    <pre className="mt-2 overflow-auto text-xs">
                      {error.stack || error.message}
                    </pre>
                  </details>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  onClick={reset}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  もう一度試す
                </Button>

                <Button
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="mr-2 h-4 w-4" />
                  ホームに戻る
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>問題が解決しない場合は、</p>
                <button
                  onClick={() => {
                    // エラーレポート機能（将来的に実装）
                    alert('サポートへの連絡機能は現在開発中です');
                  }}
                  className="text-primary underline hover:no-underline"
                >
                  <Bug className="mr-1 inline h-3 w-3" />
                  サポートにお問い合わせください
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
