"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/user-button";
import { PlusCircle, Bookmark, Heart } from "lucide-react";

export function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <nav className="border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Character Bank
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/explore" className="text-sm hover:text-primary">
                探索
              </Link>
              <Link href="/categories" className="text-sm hover:text-primary">
                カテゴリ
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Link href="/likes">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/bookmarks">
                  <Button variant="ghost" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/prompts/new">
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    新規投稿
                  </Button>
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    ログイン
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">
                    新規登録
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}