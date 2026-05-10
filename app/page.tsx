import Link from "next/link";
import Button from "@/components/ui/Button";
import { destinations } from "@/data/destinations";

// ── Destination gradient map ────────────────────────────────────────────────
const destinationStyle: Record<string, { gradient: string; textColor: string }> = {
  ella: {
    gradient: "from-emerald-400 via-green-500 to-teal-600",
    textColor: "text-emerald-50",
  },
  kandy: {
    gradient: "from-violet-500 via-purple-600 to-indigo-700",
    textColor: "text-violet-50",
  },
  galle: {
    gradient: "from-amber-400 via-orange-500 to-rose-600",
    textColor: "text-amber-50",
  },
  "nuwara-eliya": {
    gradient: "from-sky-400 via-cyan-500 to-teal-600",
    textColor: "text-sky-50",
  },
  colombo: {
    gradient: "from-slate-600 via-stone-700 to-zinc-800",
    textColor: "text-slate-100",
  },
};

// ── Landing page destination IDs ─────────────────────────────────────────────
const FEATURED_DESTINATION_IDS = ["ella", "kandy", "galle", "nuwara-eliya", "colombo"];

// ── Benefit card data ─────────────────────────────────────────────────────────
const benefits = [
  {
    icon: "💰",
    title: "Budget-aware plans",
    desc: "Choose budget, mid-range, or luxury. Every itinerary comes with per-person cost estimates and a category breakdown.",
    accent: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: "🕐",
    title: "Local travel timing",
    desc: "Each place includes the best time to visit, practical travel tips, and seasonal notes — so you know when to set off and what to prepare for.",
    accent: "bg-sky-50 border-sky-100",
    iconBg: "bg-sky-100 text-sky-700",
  },
  {
    icon: "🗺️",
    title: "Route-friendly order",
    desc: "Days are ordered by geography so you never backtrack unnecessarily between beaches, hill country, and cultural sites.",
    accent: "bg-violet-50 border-violet-100",
    iconBg: "bg-violet-100 text-violet-700",
  },
  {
    icon: "🔗",
    title: "Shareable trip plan",
    desc: "Copy a link and send your itinerary to travel companions instantly. No sign-up required on either end.",
    accent: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-100 text-amber-700",
  },
];

// ── How-it-works steps ────────────────────────────────────────────────────────
const steps = [
  {
    number: "01",
    title: "Enter your trip details",
    desc: "Pick your travel dates and how many people are joining. That's all we need to start.",
    icon: "📅",
  },
  {
    number: "02",
    title: "Choose interests & budget",
    desc: "Beaches? Wildlife? Culture? Select what excites you and your preferred spending level.",
    icon: "🎯",
  },
  {
    number: "03",
    title: "Get your itinerary",
    desc: "Receive a full day-by-day plan with activities, transport, meals, and cost estimates.",
    icon: "✨",
  },
  {
    number: "04",
    title: "Edit and share your plan",
    desc: "Share the itinerary link with your group or keep it as a personal reference for the trip.",
    icon: "📤",
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
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-700 text-white">
        {/* Background texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 10% 90%, rgba(255,255,255,0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 90% 10%, rgba(255,255,255,0.06) 0%, transparent 50%)
            `,
          }}
        />
        {/* Faint grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-4 py-24 sm:py-32 lg:py-40">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            {/* Eyebrow */}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              🇱🇰 Free to use · No sign-up needed
            </span>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Plan a realistic Sri Lanka
              <br />
              <span className="text-amber-300">trip in minutes</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg sm:text-xl text-white/75 leading-relaxed max-w-xl">
              Get a day-by-day itinerary with estimated costs, routes, places,
              and local travel tips — tailored to your budget and interests.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <Link href="/plan">
                <Button
                  variant="secondary"
                  size="lg"
                  className="shadow-lg shadow-amber-500/20"
                >
                  Plan My Trip
                </Button>
              </Link>
              <Link href="/itinerary/demo">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white border-2 border-white/30 hover:bg-white/10 hover:text-white"
                >
                  View Sample Itinerary →
                </Button>
              </Link>
            </div>

            {/* Social proof micro-line */}
            <p className="text-sm text-white/50 mt-1">
              Itineraries for 3, 5, 7, or 10-day trips · Sigiriya to Mirissa and everywhere between
            </p>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 48"
            className="w-full h-12 text-stone-50"
            fill="currentColor"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          2. TRUST / VALUE — 4 BENEFIT CARDS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-stone-50 px-4 pt-16 pb-20 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
              Everything you need for a stress-free trip
            </h2>
            <p className="mt-3 text-stone-500 max-w-lg mx-auto">
              Travel Amigo does the heavy research so you can focus on the
              experience, not the spreadsheets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {benefits.map((b) => (
              <div
                key={b.title}
                className={`rounded-2xl border p-6 flex gap-5 ${b.accent}`}
              >
                <div
                  className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center text-xl font-bold ${b.iconBg}`}
                >
                  {b.icon}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 mb-1">{b.title}</h3>
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
      <section className="bg-white px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
              How it works
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-stone-900">
              From blank page to full itinerary
            </h2>
            <p className="mt-3 text-stone-500">Four simple steps, under 60 seconds.</p>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line (desktop only) */}
            <div
              aria-hidden
              className="hidden lg:block absolute top-9 left-[12.5%] right-[12.5%] h-px bg-stone-200 z-0"
            />

            {steps.map((step) => (
              <div
                key={step.number}
                className="relative z-10 flex flex-col items-center text-center gap-3"
              >
                {/* Circle */}
                <div className="h-18 w-18 flex flex-col items-center justify-center rounded-full border-2 border-teal-100 bg-white shadow-sm ring-4 ring-white">
                  <span className="text-2xl leading-none">{step.icon}</span>
                  <span className="text-[10px] font-bold text-teal-600 mt-0.5">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-[200px] mx-auto">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Inline CTA */}
          <div className="mt-12 text-center">
            <Link href="/plan">
              <Button variant="primary" size="lg">
                Get started — it&apos;s free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          4. SAMPLE DESTINATIONS — Ella, Kandy, Galle, Nuwara Eliya, Colombo
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-stone-50 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
              Destinations
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-stone-900">
              Highlights across Sri Lanka
            </h2>
            <p className="mt-3 text-stone-500 max-w-lg mx-auto">
              Your itinerary can include any combination of coast, culture, hill country,
              and wildlife — we&apos;ll put them in the right order.
            </p>
          </div>

          {/* Destination cards — 5 cards, 2-3 col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredDestinations.map((dest, i) => {
              const style = destinationStyle[dest.id] ?? {
                gradient: "from-teal-500 to-emerald-700",
                textColor: "text-white",
              };
              // First card spans 2 columns on lg
              const isFeature = i === 0;
              return (
                <div
                  key={dest.id}
                  className={`group relative overflow-hidden rounded-2xl ${isFeature ? "lg:col-span-2" : ""}`}
                >
                  {/* Gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${style.gradient} transition-transform duration-500 group-hover:scale-105`}
                  />
                  {/* Noise texture overlay */}
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                    }}
                  />

                  {/* Content */}
                  <div
                    className={`relative flex flex-col justify-end p-6 ${isFeature ? "min-h-64 sm:min-h-72" : "min-h-52"} ${style.textColor}`}
                  >
                    {/* Top: emoji */}
                    <div className="absolute top-5 left-5 text-4xl drop-shadow-md">
                      {dest.emoji}
                    </div>

                    {/* Bottom: info */}
                    <div className="mt-auto">
                      <h3 className="text-xl font-extrabold drop-shadow-sm">
                        {dest.name}
                      </h3>
                      <p className="mt-1 text-sm opacity-85 leading-relaxed line-clamp-2">
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

          <div className="mt-10 text-center">
            <p className="text-sm text-stone-500 mb-4">
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
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-800 to-emerald-800 px-4 py-20 sm:py-28 text-white text-center">
        {/* Background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.08) 0%, transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-xl flex flex-col items-center gap-5">
          <span className="text-4xl">🇱🇰</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
            Your Sri Lanka trip
            <br />
            starts here
          </h2>
          <p className="text-white/70 text-base sm:text-lg max-w-sm leading-relaxed">
            Enter your dates, pick your budget, and get a personalised itinerary
            in under a minute. No sign-up. No credit card.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link href="/plan">
              <Button
                variant="secondary"
                size="lg"
                className="shadow-lg shadow-amber-500/25"
              >
                Start Planning
              </Button>
            </Link>
            <Link href="/itinerary/demo">
              <Button
                variant="ghost"
                size="lg"
                className="text-white border-2 border-white/25 hover:bg-white/10 hover:text-white"
              >
                View sample first
              </Button>
            </Link>
          </div>
          <p className="text-xs text-white/40 mt-2">
            Free forever during our prototype phase
          </p>
        </div>
      </section>
    </div>
  );
}
