"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useAppDispatch } from "@/store/hooks";
import { loginStart, loginSuccess, loginFailure } from "@/features/auth/authSlice";
import { useLoginMutation, useVerifyEmailMutation } from "@/features/auth/authApi";
import {
  isApiQueryError,
  mapValidationErrors,
  toAuthUser,
  type AuthFieldErrors,
} from "@/features/auth/authHelpers";
import { setAuthTokens } from "@/lib/api-client";

/** Only allow same-origin relative redirect targets. */
function safeRedirect(target: string | null): string {
  if (target && target.startsWith("/") && !target.startsWith("//")) return target;
  return "/";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [login, { isLoading }] = useLoginMutation();
  const [resendVerification, { isLoading: isResending }] = useVerifyEmailMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setBannerError(null);
    setNeedsVerification(false);
    dispatch(loginStart());

    try {
      const result = await login({ email, password }).unwrap();
      setAuthTokens(result);
      dispatch(
        loginSuccess({ user: toAuthUser(result.user), token: result.accessToken })
      );
      router.replace(safeRedirect(searchParams.get("redirect")));
    } catch (err) {
      const status = isApiQueryError(err) ? err.status : undefined;
      const data = isApiQueryError(err) ? err.data : undefined;

      if (status === 401) {
        setFieldErrors({ password: "Invalid email or password" });
        dispatch(loginFailure("Invalid email or password"));
      } else if (status === 403) {
        setNeedsVerification(true);
        dispatch(loginFailure("Email not verified"));
      } else if (status === 422 || data?.code === "VALIDATION_ERROR") {
        const mapped = mapValidationErrors(data?.details);
        setFieldErrors(mapped);
        dispatch(loginFailure(data?.message ?? "Validation failed"));
      } else {
        const message = data?.message ?? "Something went wrong. Please try again.";
        setBannerError(message);
        dispatch(loginFailure(message));
      }
    }
  }

  async function handleResend() {
    setResendMessage(null);
    try {
      // Backend contract gap: /auth/verify-email expects { token } and has no
      // email-based resend yet — this degrades gracefully until one exists.
      await resendVerification({ token: "" }).unwrap();
      setResendMessage("Verification email sent — check your inbox.");
    } catch {
      setResendMessage(
        "Resend isn't available yet — please use the link in your original verification email."
      );
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-stone-900">Welcome back</h1>
          <p className="text-sm text-stone-500 mt-1">
            Sign in to save and manage your trips.
          </p>
        </div>

        <Card>
          {bannerError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {bannerError}
            </div>
          )}

          {needsVerification && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              Please verify your email.{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="underline font-semibold hover:text-amber-900 disabled:opacity-50"
              >
                Resend verification
              </button>
              {resendMessage && <p className="mt-1 text-xs">{resendMessage}</p>}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Email"
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              aria-invalid={fieldErrors.email ? true : undefined}
            />
            <Input
              label="Password"
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              aria-invalid={fieldErrors.password ? true : undefined}
            />
            <Button type="submit" loading={isLoading} fullWidth>
              Sign in
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-stone-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-teal-700 hover:text-teal-800 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
