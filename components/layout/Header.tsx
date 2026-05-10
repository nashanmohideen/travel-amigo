"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/plan", label: "Plan a Trip" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">✈️</span>
          <span className="text-lg font-bold tracking-tight text-stone-900 group-hover:text-teal-700 transition-colors">
            Travel<span className="text-teal-700">Amigo</span>
          </span>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden sm:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-teal-700",
                pathname === link.href
                  ? "text-teal-700"
                  : "text-stone-500",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link href="/plan">
          <Button size="sm" variant="primary">
            Plan My Trip
          </Button>
        </Link>
      </div>
    </header>
  );
}
