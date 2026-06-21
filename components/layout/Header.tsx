"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/authSlice";
import { useLogoutMutation } from "@/features/auth/authApi";
import { clearAuthTokens } from "@/lib/api-client";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/plan", label: "Plan a Trip" },
];

const linkClass = (active: boolean) =>
  cn(
    "text-sm font-medium transition-colors duration-150 hover:text-teal-700",
    active ? "text-teal-700" : "text-stone-500",
  );

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { user, status } = useAppSelector((s) => s.auth);
  const [logoutRequest, { isLoading: isSigningOut }] = useLogoutMutation();

  async function handleSignOut() {
    try {
      await logoutRequest().unwrap();
    } catch {
      /* token may already be invalid — still sign out locally */
    }
    clearAuthTokens();
    dispatch(logout());
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-100/80 bg-white/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl transition-transform duration-300 group-hover:rotate-12">✈️</span>
          <span className="text-lg font-bold tracking-tight text-stone-900 group-hover:text-teal-700 transition-colors duration-150">
            Travel<span className="text-teal-700">Amigo</span>
          </span>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden sm:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(pathname === link.href)}
            >
              {link.label}
            </Link>
          ))}
          {status === "authenticated" && (
            <Link href="/trips" className={linkClass(pathname === "/trips")}>
              My trips
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              href="/admin/feedback"
              className={linkClass(pathname === "/admin/feedback")}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Auth state + CTA */}
        <div className="flex items-center gap-3">
          {status === "authenticated" && user ? (
            <>
              <span
                className="hidden sm:block max-w-[160px] truncate text-sm font-medium text-stone-500"
                title={user.email}
              >
                {user.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="text-sm font-medium text-stone-500 transition-colors hover:text-teal-700 disabled:opacity-50"
              >
                Sign out
              </button>
            </>
          ) : (
            status === "unauthenticated" && (
              <>
                <Link href="/login" className={linkClass(pathname === "/login")}>
                  Sign in
                </Link>
                <Link href="/register" className={linkClass(pathname === "/register")}>
                  Sign up
                </Link>
              </>
            )
          )}
          <Link href="/plan">
            <Button size="sm" variant="primary" className="shadow-sm">
              Plan My Trip
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
