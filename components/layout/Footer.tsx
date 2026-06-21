"use client";

import Link from "next/link";
import { useAppSelector } from "@/store/hooks";

export default function Footer() {
  const isAdmin = useAppSelector((s) => s.auth.user?.role === "admin");

  return (
    <footer className="border-t border-stone-100 bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">✈️</span>
              <span className="font-bold text-stone-900">
                Travel<span className="text-teal-700">Amigo</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              AI-assisted Sri Lanka travel planning
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-stone-500">
            <Link href="/plan" className="hover:text-teal-700 transition-colors duration-150">
              Plan a Trip
            </Link>
            <Link href="/itinerary/demo" className="hover:text-teal-700 transition-colors duration-150">
              Sample itinerary
            </Link>
            {isAdmin && (
              <Link href="/feedback" className="hover:text-teal-700 transition-colors duration-150">
                Feedback
              </Link>
            )}
          </nav>

          {/* Disclaimer */}
          <p className="text-xs text-stone-400 text-center sm:text-right max-w-xs leading-relaxed">
            Prototype — prices and itineraries are illustrative only.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-300">
            © {new Date().getFullYear()} Travel Amigo · Built for Sri Lanka explorers
          </p>
        </div>
      </div>
    </footer>
  );
}
