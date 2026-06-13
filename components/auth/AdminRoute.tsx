"use client";

/**
 * AdminRoute — ProtectedRoute plus a role check.
 *
 * Unauthenticated users get the ProtectedRoute login redirect; authenticated
 * non-admins see an inline 403 message (no redirect, no blank page).
 */

import { ReactNode } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Card from "@/components/ui/Card";
import { useAppSelector } from "@/store/hooks";

function AdminGate({ children }: { children: ReactNode }) {
  const role = useAppSelector((s) => s.auth.user?.role);

  if (role !== "admin") {
    return (
      <div className="min-h-[50vh] bg-stone-50 flex items-center justify-center px-4">
        <Card className="text-center max-w-sm py-10">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-xl font-bold text-stone-900 mb-1">
            You don&apos;t have permission to view this page
          </h1>
          <p className="text-sm text-stone-500 mb-6">
            This area is restricted to administrators.
          </p>
          <Link
            href="/"
            className="font-semibold text-teal-700 hover:text-teal-800 transition-colors text-sm"
          >
            Back to home →
          </Link>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminGate>{children}</AdminGate>
    </ProtectedRoute>
  );
}
