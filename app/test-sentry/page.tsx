"use client";

import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/nextjs";

export default function TestSentryPage() {
  const handleClientError = () => {
    throw new Error("テスト用クライアントサイドエラー！");
  };

  const handleAsyncError = async () => {
    try {
      throw new Error("テスト用非同期エラー！");
    } catch (error) {
      Sentry.captureException(error);
      alert("エラーがSentryに送信されました！");
    }
  };

  const handleUserContext = () => {
    // ユーザー情報をSentryに設定
    Sentry.setUser({
      id: "test-user-123",
      username: "テストユーザー",
      email: "test@example.com",
    });
    
    // カスタムコンテキストを追加
    Sentry.setContext("character", {
      type: "テスト",
      mood: "デバッグ中",
    });
    
    // エラーを投げる
    throw new Error("ユーザーコンテキスト付きエラー！");
  };

  const handleBreadcrumb = () => {
    // パンくずリストを追加
    Sentry.addBreadcrumb({
      category: "user-action",
      message: "テストボタンがクリックされました",
      level: "info",
    });
    
    setTimeout(() => {
      throw new Error("パンくずリスト付きエラー！");
    }, 1000);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Sentry動作確認ページ</h1>
      
      <div className="space-y-6 max-w-2xl">
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">エラーテスト</h2>
          <p className="text-muted-foreground mb-4">
            以下のボタンをクリックすると、意図的にエラーを発生させてSentryに送信します。
          </p>
          
          <div className="space-y-3">
            <div>
              <Button 
                onClick={handleClientError}
                variant="destructive"
                className="w-full"
              >
                クライアントサイドエラーを発生させる
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                通常のJavaScriptエラーを投げます
              </p>
            </div>
            
            <div>
              <Button 
                onClick={handleAsyncError}
                variant="destructive"
                className="w-full"
              >
                非同期エラーをキャプチャする
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                try-catchでエラーをキャッチしてSentryに送信します
              </p>
            </div>
            
            <div>
              <Button 
                onClick={handleUserContext}
                variant="destructive"
                className="w-full"
              >
                ユーザーコンテキスト付きエラー
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                ユーザー情報とカスタムコンテキストを含むエラー
              </p>
            </div>
            
            <div>
              <Button 
                onClick={handleBreadcrumb}
                variant="destructive"
                className="w-full"
              >
                パンくずリスト付きエラー（1秒後）
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                ユーザーの操作履歴を含むエラー
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm">
            💡 エラーが発生したら、Sentryダッシュボードで確認してください：
            <br />
            <a 
              href="https://sentry.io/organizations/honya/issues/?project=javascript-nextjs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Sentryダッシュボードを開く
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}