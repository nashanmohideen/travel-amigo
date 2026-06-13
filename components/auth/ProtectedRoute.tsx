"use client";

/**
 * ProtectedRoute — client-side auth gate.
 *
 * Renders children only for an authenticated session. While the silent
 * refresh is in flight ('idle' / 'loading') it shows the app's standard
 * loading block; once the session is known to be absent it redirects to
 * /login?redirect=[current path].
 */

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAppSelector((s) => s.auth.status);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  if (status !== "authenticated") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">✈️</div>
          <p className="text-stone-500">Loading…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
