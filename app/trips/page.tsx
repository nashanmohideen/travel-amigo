"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useListTripsQuery } from "@/features/itinerary/itineraryApi";

function TripsList() {
  const { data: trips = [], isLoading, error } = useListTripsQuery();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">✈️</div>
          <p className="text-stone-500">Loading your trips…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          Could not load your trips — please try again.
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center">
          <p className="text-base font-semibold text-stone-700 mb-1">
            You haven&apos;t saved any trips yet.
          </p>
          <p className="text-sm text-stone-400 mb-6">
            Plan a trip and hit &ldquo;Save trip&rdquo; to keep it in your account.
          </p>
          <Link
            href="/plan"
            className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
          >
            Plan a trip →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-3">
      {trips.map((trip) => {
        const input = trip.itinerarySnapshot?.tripInput;
        return (
          <Link key={trip.id} href={`/trips/${trip.id}`}>
            <Card hoverable className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-stone-900">{trip.title}</p>
                {input && (
                  <p className="text-xs text-stone-500 mt-0.5 capitalize">
                    {input.destination} · {input.duration}{" "}
                    {input.duration === 1 ? "night" : "nights"} · {input.travelers}{" "}
                    {input.travelers === 1 ? "traveller" : "travellers"}
                  </p>
                )}
              </div>
              <Badge variant="teal">Saved</Badge>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default function TripsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-stone-50">
        <div className="bg-white border-b border-stone-200">
          <div className="mx-auto max-w-4xl px-4 py-8">
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">
              Your account
            </p>
            <h1 className="text-2xl font-extrabold text-stone-900">My trips</h1>
          </div>
        </div>
        <TripsList />
      </div>
    </ProtectedRoute>
  );
}
