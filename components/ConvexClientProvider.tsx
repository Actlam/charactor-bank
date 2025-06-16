"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { useStoreUser } from "@/hooks/use-store-user";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function ConvexProviderWithAuth({ children }: { children: ReactNode }) {
  useStoreUser();
  return <>{children}</>;
}

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <ConvexProviderWithAuth>{children}</ConvexProviderWithAuth>
    </ConvexProviderWithClerk>
  );
}
