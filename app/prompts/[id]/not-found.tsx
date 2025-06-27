import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Home, Search } from "lucide-react";
import Link from "next/link";

/**
 * プロンプト詳細ページの404エラー画面
 */
export default function PromptNotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">プロンプトが見つかりません</CardTitle>
          <CardDescription>
            お探しのプロンプトは存在しないか、削除された可能性があります
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Link href="/explore">
              <Button className="w-full" variant="default">
                <Search className="mr-2 h-4 w-4" />
                他のプロンプトを探す
              </Button>
            </Link>
            
            <Link href="/">
              <Button className="w-full" variant="outline">
                <Home className="mr-2 h-4 w-4" />
                ホームに戻る
              </Button>
            </Link>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>URLが正しいか確認してください</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}