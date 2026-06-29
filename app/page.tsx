import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { destinations } from "@/data/destinations";

// ── Destination image map ─────────────────────────────────────────────────────
const destinationImage: Record<string, string> = {
  ella: "/images/destinations/ella.png",
  kandy:
    "https://images.unsplash.com/photo-1665849050332-8d5d7e59afb6?fm=jpg&q=80&w=1200&auto=format&fit=crop",
  galle:
    "https://images.unsplash.com/photo-1704797390682-76479a29dc9a?fm=jpg&q=80&w=1200&auto=format&fit=crop",
  "nuwara-eliya":
    "https://images.unsplash.com/photo-1585171328560-947fbd92d6f0?fm=jpg&q=80&w=1200&auto=format&fit=crop",
  colombo:
    "https://images.unsplash.com/photo-1718210142145-91d159d05815?fm=jpg&q=80&w=1200&auto=format&fit=crop",
};

const FEATURED_DESTINATION_IDS = ["ella", "kandy", "galle", "nuwara-eliya", "colombo"];

// ── Benefit icons (SVG, not emoji) ────────────────────────────────────────────
const benefits = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor" opacity=".3"/>
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 14.24l-4.24-2.52-4.24 2.52.97-4.84-3.42-2.92 4.95-.47L12 4.22l1.75 4.79 4.95.47-3.42 2.92.95 4.84z" fill="currentColor"/>
      </svg>
    ),
    title: "Budget-aware plans",
    desc: "Choose budget, mid-range, or luxury. Every itinerary comes with per-person cost estimates in LKR and a full category breakdown.",
    accent: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
      </svg>
    ),
    title: "Local travel timing",
    desc: "Each place includes the best time to visit, practical travel tips, and seasonal notes — so you know when to set off and what to prepare for.",
    accent: "bg-sky-50 border-sky-100",
    iconBg: "bg-sky-100 text-sky-700",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
        <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" fill="currentColor"/>
      </svg>
    ),
    title: "Route-friendly order",
    desc: "Days are ordered by geography so you never backtrack unnecessarily between beaches, hill country, and cultural sites.",
    accent: "bg-violet-50 border-violet-100",
    iconBg: "bg-violet-100 text-violet-700",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill="currentColor"/>
      </svg>
    ),
    title: "Shareable trip plan",
    desc: "Copy a link and send your itinerary to travel companions instantly. No sign-up required on either end.",
    accent: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-100 text-amber-700",
  },
];

const steps = [
  {
    number: "01",
    title: "Enter your trip details",
    desc: "Pick your destination and how many people are joining. Takes 30 seconds.",
  },
  {
    number: "02",
    title: "Choose interests & budget",
    desc: "Beaches? Wildlife? Culture? Select what excites you and your preferred spending level.",
  },
  {
    number: "03",
    title: "Get your itinerary",
    desc: "Receive a full day-by-day plan with activities, transport, meals, and cost estimates.",
  },
  {
    number: "04",
    title: "Edit and share",
    desc: "Swap places, change pace, share with your group — or print it as a PDF.",
  },
];

export default function LandingPage() {
  const featuredDestinations = FEATURED_DESTINATION_IDS
    .map((id) => destinations.find((d) => d.id === id))
    .filter(Boolean) as typeof destinations;

  return (
    <div className="flex flex-col">

      {/* ═══════════════════════════════════════════════════════════════════
          1. HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-800 text-white">
        {/* Layered depth gradients */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 15% 85%, rgba(251,191,36,0.12) 0%, transparent 55%),
              radial-gradient(ellipse at 85% 15%, rgba(16,185,129,0.15) 0%, transparent 55%),
              radial-gradient(ellipse at 50% 110%, rgba(255,255,255,0.05) 0%, transparent 50%)
            `,
          }}
        />
        {/* Subtle dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-4 py-24 sm:py-36 lg:py-44">
          <div className="flex flex-col items-center text-center gap-7 max-w-3xl mx-auto">
            {/* Eyebrow */}
            {/* <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              🇱🇰 <span className="text-white/80">Free to use</span>
            </span> */}

            {/* Headline — serif font for warmth and travel feel */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
              Plan a realistic
              <br />
              <span className="italic text-amber-300">Sri Lanka trip</span>
              <br />
              <span className="font-sans text-4xl sm:text-5xl lg:text-6xl font-bold text-white/90">in minutes</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-xl">
              Get a day-by-day itinerary with estimated costs, routes, places,
              and local travel tips — tailored to your budget and interests.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
              <Link href="/plan">
                <Button
                  variant="secondary"
                  size="lg"
                  className="shadow-xl shadow-amber-900/30 hover:shadow-amber-900/40"
                >
                  Plan My Trip
                </Button>
              </Link>
              <Link href="/itinerary/demo">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white border-2 border-white/25 hover:bg-white/10 hover:border-white/40 hover:text-white"
                >
                  View Sample Itinerary →
                </Button>
              </Link>
            </div>

            {/* Trust line */}
            <p className="text-sm text-white/40 mt-1">
              3, 5, 7 or 10-day trips · Sigiriya to Mirissa and everywhere between
            </p>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 56"
            className="w-full h-14 text-stone-50"
            fill="currentColor"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M0,56 C240,0 480,28 720,14 C960,0 1200,28 1440,14 L1440,56 L0,56 Z" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          2. VALUE — 4 BENEFIT CARDS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-stone-50 px-4 pt-20 pb-24 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
              Why Travel Amigo
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
              Everything you need for
              <br className="hidden sm:block" /> a stress-free Sri Lanka trip
            </h2>
            <p className="mt-4 text-stone-500 max-w-lg mx-auto leading-relaxed">
              Travel Amigo does the heavy research so you can focus on the
              experience, not the spreadsheets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {benefits.map((b) => (
              <div
                key={b.title}
                className={`rounded-2xl border p-6 flex gap-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${b.accent}`}
              >
                <div
                  className={`shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${b.iconBg}`}
                >
                  {b.icon}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 mb-1.5 text-base">{b.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          3. HOW IT WORKS — 4 STEPS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white px-4 py-24 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
              How it works
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
              From blank page to full itinerary
            </h2>
            <p className="mt-4 text-stone-500">Four simple steps, under 60 seconds.</p>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connector line (desktop only) */}
            <div
              aria-hidden
              className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-teal-100 via-teal-300 to-teal-100 z-0"
            />

            {steps.map((step, i) => (
              <div
                key={step.number}
                className="relative z-10 flex flex-col items-center text-center gap-4"
              >
                {/* Circle */}
                <div className="relative h-20 w-20 flex flex-col items-center justify-center rounded-full border-2 border-teal-100 bg-white shadow-lg shadow-teal-100/60 ring-4 ring-white">
                  <span className="text-2xl font-bold font-display text-teal-700 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-[180px] mx-auto">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Inline CTA */}
          <div className="mt-14 text-center">
            <Link href="/plan">
              <Button variant="primary" size="lg" className="shadow-lg shadow-teal-900/20">
                Get started — it&apos;s free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          4. DESTINATIONS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-stone-50 px-4 py-24 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
              Destinations
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
              Highlights across Sri Lanka
            </h2>
            <p className="mt-4 text-stone-500 max-w-lg mx-auto leading-relaxed">
              Your itinerary can include any combination of coast, culture, hill country,
              and wildlife — we&apos;ll put them in the right order.
            </p>
          </div>

          {/* Destination cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredDestinations.map((dest, i) => {
              const imgSrc = destinationImage[dest.id] ?? null;
              const isFeature = i === 0;
              return (
                <div
                  key={dest.id}
                  className={`group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ${isFeature ? "lg:col-span-2" : ""}`}
                >
                  {/* Photo background */}
                  {imgSrc ? (
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
                      <Image
                        src={imgSrc}
                        alt={dest.name}
                        fill
                        sizes={isFeature ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
                        className="object-cover"
                        priority={i === 0}
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-700" />
                  )}
                  {/* Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Content */}
                  <div
                    className={`relative flex flex-col justify-end p-6 ${isFeature ? "min-h-72 sm:min-h-80" : "min-h-56"} text-white`}
                  >
                    {/* Top: emoji */}
                    <div className="absolute top-5 left-5 text-4xl drop-shadow-lg">
                      {dest.emoji}
                    </div>

                    {/* Bottom: info */}
                    <div className="mt-auto">
                      <h3 className={`font-display font-bold drop-shadow-sm ${isFeature ? "text-2xl" : "text-xl"}`}>
                        {dest.name}
                      </h3>
                      <p className="mt-1.5 text-sm opacity-85 leading-relaxed line-clamp-2">
                        {dest.description}
                      </p>
                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {dest.bestFor.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium capitalize"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-stone-500 mb-5">
              …and 20+ more destinations covered in your itinerary
            </p>
            <Link href="/plan">
              <Button variant="outline" size="md">
                Build a trip with these places
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          5. FINAL CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 px-4 py-24 sm:py-32 text-white text-center">
        {/* Background glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 50% 110%, rgba(251,191,36,0.12) 0%, transparent 60%),
              radial-gradient(ellipse at 20% 20%, rgba(16,185,129,0.1) 0%, transparent 50%)
            `,
          }}
        />

        <div className="relative mx-auto max-w-xl flex flex-col items-center gap-6">
          <span className="text-5xl">🇱🇰</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
            Your Sri Lanka trip
            <br />
            <span className="italic text-amber-300">starts here</span>
          </h2>
          <p className="text-white/65 text-base sm:text-lg max-w-sm leading-relaxed">
            Enter your dates, pick your budget, and get a personalised itinerary
            in under a minute. No sign-up. No credit card.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-1">
            <Link href="/plan">
              <Button
                variant="secondary"
                size="lg"
                className="shadow-xl shadow-amber-900/30 hover:shadow-amber-900/40"
              >
                Start Planning
              </Button>
            </Link>
            <Link href="/itinerary/demo">
              <Button
                variant="ghost"
                size="lg"
                className="text-white border-2 border-white/25 hover:bg-white/10 hover:border-white/40 hover:text-white"
              >
                View sample first
              </Button>
            </Link>
          </div>
          <p className="text-xs text-white/35 mt-1">
            Free forever during our prototype phase
          </p>
        </div>
      </section>
    </div>
  );
}
