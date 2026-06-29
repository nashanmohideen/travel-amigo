"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useVerifyEmailMutation, useResendVerificationMutation } from "@/features/auth/authApi";

type VerifyState = "verifying" | "success" | "error" | "no-token";

function ResendForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [resend, { isLoading }] = useResendVerificationMutation();
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleResend(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      await resend({ email }).unwrap();
      setSent(true);
      setMessage("Verification email sent — check your inbox.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (sent) {
    return (
      <p className="mt-4 text-sm text-teal-700 font-medium">{message}</p>
    );
  }

  return (
    <form onSubmit={handleResend} className="mt-4 flex flex-col gap-3">
      <Input
        label="Email address"
        id="resend-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" loading={isLoading} fullWidth>
        Resend verification email
      </Button>
      {message && <p className="text-sm text-red-600">{message}</p>}
    </form>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [verifyEmail] = useVerifyEmailMutation();
  const [state, setState] = useState<VerifyState>(token ? "verifying" : "no-token");
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
              <p className="text-sm text-stone-500 mb-4">
                Enter your email to receive a new verification link.
              </p>
              <div className="text-left">
                <ResendForm />
              </div>
              <Link
                href="/login"
                className="mt-4 inline-block font-semibold text-teal-700 hover:text-teal-800 transition-colors text-sm"
              >
                Back to login →
              </Link>
            </>
          )}

          {state === "no-token" && (
            <>
              <div className="text-4xl mb-3">📬</div>
              <h1 className="text-xl font-bold text-stone-900 mb-1">
                Verify your email
              </h1>
              <p className="text-sm text-stone-500 mb-4">
                Use the link in your verification email, or request a new one below.
              </p>
              <div className="text-left">
                <ResendForm />
              </div>
              <Link
                href="/login"
                className="mt-4 inline-block font-semibold text-teal-700 hover:text-teal-800 transition-colors text-sm"
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
