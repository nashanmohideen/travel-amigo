"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import {
  registerStart,
  registerSuccess,
  registerFailure,
} from "@/features/auth/authSlice";
import { useRegisterMutation, useResendVerificationMutation } from "@/features/auth/authApi";
import {
  isApiQueryError,
  mapValidationErrors,
  type AuthFieldErrors,
} from "@/features/auth/authHelpers";

interface RegisterFieldErrors extends AuthFieldErrors {
  confirmPassword?: string;
}

/** 0–3 score driving the strength bar; mirrors the backend's 8-char minimum. */
function passwordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  return score;
}

const STRENGTH_LEVELS = [
  { label: "Too short", bar: "bg-red-400", text: "text-red-500", width: "w-1/4" },
  { label: "Okay", bar: "bg-amber-400", text: "text-amber-600", width: "w-2/4" },
  { label: "Good", bar: "bg-teal-500", text: "text-teal-700", width: "w-3/4" },
  { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-700", width: "w-full" },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const level = STRENGTH_LEVELS[passwordStrength(password)];
  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <div className="h-1.5 flex-1 rounded-full bg-stone-100 overflow-hidden">
        <div className={cn("h-1.5 rounded-full transition-all", level.bar, level.width)} />
      </div>
      <span className={cn("text-xs font-medium", level.text)}>{level.label}</span>
    </div>
  );
}

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBannerError(null);

    // Client-side checks before hitting the API
    const clientErrors: RegisterFieldErrors = {};
    if (password.length < 8) {
      clientErrors.password = "Password must be at least 8 characters";
    }
    if (confirmPassword !== password) {
      clientErrors.confirmPassword = "Passwords do not match";
    }
    setFieldErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    dispatch(registerStart());
    try {
      await register({ email, password }).unwrap();
      // Intentionally not logging in — the email is still unverified
      dispatch(registerSuccess());
      setRegistered(true);
    } catch (err) {
      const status = isApiQueryError(err) ? err.status : undefined;
      const data = isApiQueryError(err) ? err.data : undefined;

      if (status === 409) {
        setFieldErrors({ email: "An account with this email already exists" });
        dispatch(registerFailure("Email already in use"));
      } else if (status === 422 || data?.code === "VALIDATION_ERROR") {
        setFieldErrors(mapValidationErrors(data?.details));
        dispatch(registerFailure(data?.message ?? "Validation failed"));
      } else {
        const message = data?.message ?? "Something went wrong. Please try again.";
        setBannerError(message);
        dispatch(registerFailure(message));
      }
    }
  }

  async function handleResend() {
    if (resendCooldown) return;
    setResendMessage(null);
    setResendCooldown(true);
    setTimeout(() => setResendCooldown(false), 30000);
    try {
      await resendVerification({ email }).unwrap();
      setResendMessage("Sent! Check your inbox.");
    } catch {
      setResendMessage("Something went wrong. Please try again.");
      setResendCooldown(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-stone-900">Create your account</h1>
          <p className="text-sm text-stone-500 mt-1">
            Save trips to your account and access them anywhere.
          </p>
        </div>

        <Card>
          {registered ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📬</div>
              <p className="text-base font-semibold text-stone-800 mb-1">
                Check your email to verify your account.
              </p>
              <p className="text-sm text-stone-500 mb-4">
                We sent a verification link to <strong>{email}</strong>.
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resendCooldown}
                className="text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors disabled:opacity-50 mb-4"
              >
                {isResending ? "Sending…" : resendCooldown ? "Email sent" : "Resend verification email"}
              </button>
              {resendMessage && (
                <p className="text-xs text-stone-500 mb-4">{resendMessage}</p>
              )}
              <Link
                href="/login"
                className="block font-semibold text-teal-700 hover:text-teal-800 transition-colors text-sm"
              >
                Back to login →
              </Link>
            </div>
          ) : (
            <>
              {bannerError && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {bannerError}
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
                <div className="flex flex-col gap-1.5">
                  <Input
                    label="Password"
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={fieldErrors.password}
                    hint="At least 8 characters"
                    aria-invalid={fieldErrors.password ? true : undefined}
                  />
                  <PasswordStrength password={password} />
                </div>
                <Input
                  label="Confirm password"
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={fieldErrors.confirmPassword}
                  aria-invalid={fieldErrors.confirmPassword ? true : undefined}
                />
                <Button type="submit" loading={isLoading} fullWidth>
                  Create account
                </Button>
              </form>
            </>
          )}
        </Card>

        {!registered && (
          <p className="mt-4 text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-teal-700 hover:text-teal-800 transition-colors"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
