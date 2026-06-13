"use client";

import { useEffect, useState } from "react";
import type { GeneratedItinerary } from "@/types";
import { useCreateShareLinkMutation } from "@/features/share/shareApi";

interface ShareModalProps {
  itinerary: GeneratedItinerary;
  onClose: () => void;
}

export default function ShareModal({ itinerary, onClose }: ShareModalProps) {
  const [createShareLink] = useCreateShareLinkMutation();

  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(true);
  const [syncNote, setSyncNote] = useState<string | null>(null);

  // Create share link on mount (once per modal open).
  // Share links are server-side tokens (POST /api/v1/share) — the old
  // browser-local localStorage share has been removed.
  useEffect(() => {
    let isMounted = true;

    const createLink = async () => {
      setIsCreating(true);
      setSyncNote(null);

      try {
        const result = await createShareLink({ itinerary }).unwrap();

        if (isMounted) {
          setLink(result.url);
          setSyncNote(null);
        }
      } catch (err) {
        console.error("Failed to create share link via API:", err);

        if (isMounted) {
          setLink("");
          setSyncNote(
            "Could not create a share link — the server is unavailable. Please try again later."
          );
        }
      } finally {
        if (isMounted) {
          setIsCreating(false);
        }
      }
    };

    createLink();

    return () => {
      isMounted = false;
    };
  }, [itinerary, createShareLink]);

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* Fallback: select text */
    }
  }

  function handleWhatsApp() {
    if (!link) return;
    const text = encodeURIComponent(
      `Here's my Sri Lanka trip plan from Travel Amigo: ${link}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* ── Sheet ── */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-stone-100">
          <div>
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-0.5">
              Share itinerary
            </p>
            <h2 className="text-base font-bold text-stone-900">{itinerary.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
            aria-label="Close share modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-4">
          {/* Info notice */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
            <strong>Prototype mode.</strong> Creating shareable links for real-time collaboration.
            {syncNote && (
              <div className="mt-1.5 text-amber-700 italic">{syncNote}</div>
            )}
          </div>

          {/* Link display + copy */}
          <div>
            <p className="text-xs font-semibold text-stone-500 mb-1.5">Shareable link</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-xs text-stone-600 font-mono truncate select-all">
                {link || (isCreating ? "Creating link…" : "Error loading link")}
              </div>
              <button
                onClick={handleCopy}
                disabled={!link || isCreating}
                className="shrink-0 rounded-xl bg-teal-700 text-white text-xs font-semibold px-4 py-2.5 hover:bg-teal-800 active:bg-teal-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? "✓ Copied!" : "Copy link"}
              </button>
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <p className="text-xs font-semibold text-stone-500 mb-1.5">Share via</p>
            <button
              onClick={handleWhatsApp}
              disabled={!link || isCreating}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 text-green-700 font-semibold text-sm py-3 hover:bg-green-100 hover:border-green-300 active:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* WhatsApp SVG icon */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share on WhatsApp
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
