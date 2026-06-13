"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import { useVerifyEmailMutation } from "@/features/auth/authApi";

type VerifyState = "verifying" | "success" | "error" | "no-token";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [verifyEmail] = useVerifyEmailMutation();
  const [state, setState] = useState<VerifyState>(token ? "verifying" : "no-token");
  // Run the verification exactly once (StrictMode re-invokes effects in dev)
  const startedRef = useRef(false);

  useEffect(() => {
    if (!token || startedRef.current) return;
    startedRef.current = true;
    verifyEmail({ token })
      .unwrap()
      .then(() => setState("success"))
      .catch(() => setState("error"));
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Card className="text-center py-10">
          {state === "verifying" && (
            <>
              <div className="text-4xl mb-3">✉️</div>
              <p className="text-stone-500">Verifying your email…</p>
            </>
          )}

          {state === "success" && (
            <>
              <div className="text-4xl mb-3">✅</div>
              <h1 className="text-xl font-bold text-stone-900 mb-1">
                Email verified.
              </h1>
              <p className="text-sm text-stone-500 mb-6">You can now sign in.</p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
              >
                Sign in →
              </Link>
            </>
          )}

          {state === "error" && (
            <>
              <div className="text-4xl mb-3">⚠️</div>
              <h1 className="text-xl font-bold text-stone-900 mb-1">
                This link has expired or is invalid.
              </h1>
              <p className="text-sm text-stone-500 mb-6">
                Sign in to request a new verification email.
              </p>
              <Link
                href="/login"
                className="font-semibold text-teal-700 hover:text-teal-800 transition-colors text-sm"
              >
                Back to login →
              </Link>
            </>
          )}

          {state === "no-token" && (
            <>
              <div className="text-4xl mb-3">🔍</div>
              <h1 className="text-xl font-bold text-stone-900 mb-1">
                No verification token found.
              </h1>
              <p className="text-sm text-stone-500 mb-6">
                Use the link from your verification email.
              </p>
              <Link
                href="/login"
                className="font-semibold text-teal-700 hover:text-teal-800 transition-colors text-sm"
              >
                Back to login →
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
