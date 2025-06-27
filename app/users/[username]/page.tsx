"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/components/prompt-card";
import { User, Calendar, FileText, Heart, Eye, Bookmark, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useUser();

  // ユーザー情報を取得
  const user = useQuery(api.users.getUserByUsername, { username });
  
  // ユーザーのプロンプト一覧を取得
  const prompts = useQuery(api.prompts.getUserPrompts, 
    user ? { userId: user._id } : "skip"
  );

  // ユーザー統計を取得
  const stats = useQuery(api.users.getUserStats,
    user ? { userId: user._id } : "skip"
  );

  // ローディング状態
  if (user === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-8"></div>
          <div className="grid gap-6">
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-48 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // ユーザーが見つからない場合
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">ユーザーが見つかりません</h1>
        <p className="text-muted-foreground mb-8">
          指定されたユーザー名のアカウントは存在しません。
        </p>
        <Link href="/">
          <Button>ホームに戻る</Button>
        </Link>
      </div>
    );
  }

  // 自分のプロフィールかどうか
  const isOwnProfile = currentUser?.username === username;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* プロフィールヘッダー */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* アバター */}
          <div className="flex-shrink-0">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.displayName || user.username}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
            )}
          </div>

          {/* ユーザー情報 */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold">
                {user.displayName || user.username}
              </h1>
              {isOwnProfile && (
                <Link href="/profile/edit">
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4 mr-1" />
                    編集
                  </Button>
                </Link>
              )}
            </div>
            
            <p className="text-muted-foreground mb-4">@{user.username}</p>
            
            {user.bio && (
              <p className="text-sm mb-4">{user.bio}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDistanceToNow(user.createdAt, { addSuffix: true, locale: ja })}に参加
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 統計情報 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.promptCount}</p>
            <p className="text-sm text-muted-foreground">投稿</p>
          </Card>
          
          <Card className="p-4 text-center">
            <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{stats.totalLikes}</p>
            <p className="text-sm text-muted-foreground">獲得いいね</p>
          </Card>
          
          <Card className="p-4 text-center">
            <Eye className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{stats.totalViews}</p>
            <p className="text-sm text-muted-foreground">総閲覧数</p>
          </Card>
          
          <Card className="p-4 text-center">
            <Bookmark className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{stats.totalBookmarks}</p>
            <p className="text-sm text-muted-foreground">保存数</p>
          </Card>
        </div>
      )}

      {/* プロンプト一覧 */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          投稿したプロンプト
          {prompts && ` (${prompts.length})`}
        </h2>

        {prompts && prompts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <PromptCard key={prompt._id} prompt={prompt} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              まだプロンプトを投稿していません
            </p>
            {isOwnProfile && (
              <Link href="/prompts/new">
                <Button>最初のプロンプトを作成</Button>
              </Link>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}