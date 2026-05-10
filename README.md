# Travel Amigo Prototype

A happy-path prototype for a Sri Lanka trip planning tool. Not the full production platform.

---

## What this prototype demonstrates

- A multi-step trip planning form with destination, budget, interests, pace, and transport options
- Rule-based itinerary generation using mock Sri Lanka place data (no AI, no network calls)
- Inline itinerary editing: remove places, replace places, reorder, change pace, reset
- Budget breakdown with per-person and per-day estimates
- Share itinerary via a localStorage-backed link (same browser only in prototype)
- WhatsApp share button
- Public read-only shared itinerary view
- Print/PDF export using the browser print dialog
- Feedback form with localStorage persistence
- Prototype feedback dashboard to review collected responses
- Mock AI assistant panel (canned responses using current itinerary data only)

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript strict) |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`) |
| Font | Inter via `next/font/google` |
| State | React `useState` / `useCallback` patterns; no external state library |
| Persistence | `localStorage` only — no backend, no database |
| AI | None — all responses are rule-based canned text |

---

## How to run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

To build for production:

```bash
npm run build
npm start
```

---

## Main routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/plan` | Trip planning form |
| `/itinerary/demo` | Generated itinerary (editable, share, print) |
| `/shared/[id]` | Read-only shared itinerary view (same browser only) |
| `/feedback` | Prototype feedback dashboard |
| `/itinerary` | Redirects to `/itinerary/demo` |
| `/share/[id]` | Redirects to `/shared/demo` (legacy route) |

---

## What is mocked

- **Place data** — 50 hand-written places across 5 Sri Lanka destinations (Ella, Kandy, Galle, Nuwara Eliya, Colombo). Data is in `data/places.ts`.
- **Transport estimates** — Estimated travel times and costs between destinations in `data/transport.ts`.
- **Itinerary generation** — Rule-based algorithm in `lib/generateItinerary.ts`. Selects places by interest, pace, and travel style.
- **Budget estimates** — Derived from place costs, accommodation tiers, food averages, and transport legs. All approximate.
- **AI assistant** — The "Travel Amigo Assistant" panel generates canned responses from the current itinerary state only. No LLM, no API calls.
- **Shared links** — Links work in the same browser only, via `localStorage`. There is no backend share URL.

---

## What is not production-ready

- **No real AI** — The assistant uses rule-based logic only, not a live language model.
- **No backend** — All data lives in `localStorage`. Clearing browser storage removes all saved data.
- **No authentication** — Anyone can access all routes.
- **No real-time data** — Opening hours, prices, crowd levels, and transport availability are not live.
- **No booking** — No integration with accommodation or activity booking providers.
- **No payments** — No payment processing.
- **No maps** — The route overview card is a placeholder ("Coming soon").
- **Share links are browser-local** — `/shared/demo` only works in the same browser that created it.
- **Mock data covers 5 destinations only** — Ella, Kandy, Galle, Nuwara Eliya, Colombo.
- **All prices are estimates** — Confirm costs, entrance fees, and transport before travelling.

---

## localStorage keys used

| Key | Purpose |
|---|---|
| `ta_trip_input` | Trip form input (set by `/plan`, read by `/itinerary/demo`) |
| `ta_edited_itinerary` | User-edited itinerary (persists across page refreshes) |
| `ta_shared_itinerary_demo` | Most recently shared itinerary (read by `/shared/demo`) |
| `ta_feedback_submissions` | Feedback form submissions (read by `/feedback` dashboard) |

**Note:** "Start Over" on the itinerary page clears `ta_trip_input`, `ta_edited_itinerary`, and `ta_shared_itinerary_demo`. Feedback submissions are not deleted.

---

## Demo testing flow

| Step | Action |
|---|---|
| 1 | Open `/`. Click "Plan My Trip". |
| 2 | Fill the trip form (destination, duration, budget, interests). Submit. |
| 3 | Review the generated day-by-day itinerary at `/itinerary/demo`. |
| 4 | Edit: remove a place, replace a place, move it up or down. |
| 5 | Change pace (Relaxed / Balanced / Packed) from the Actions panel. |
| 6 | Reset edits using "Reset to generated plan". |
| 7 | Click "Share itinerary". Copy the link. |
| 8 | Open `/shared/demo` in the same browser. Confirm read-only view. |
| 9 | Click "Download / Print PDF". Use browser print dialog. |
| 10 | Scroll to the feedback form. Submit feedback. |
| 11 | Open `/feedback`. Review submitted feedback and copy JSON. |
| 12 | Expand "Travel Amigo Assistant". Try all 6 prompt buttons. |

---

## Known limitations

- The shared link (`/shared/demo`) only works in the same browser that created it. Opening it in a different browser or after clearing localStorage shows an empty state.
- The mock assistant computes responses from a snapshot of the itinerary at the time the prompt is clicked. Apply changes take effect immediately on the itinerary.
- Budget estimates are approximations. Do not use them for real financial decisions.
- Feedback submissions are stored in localStorage only. Clearing browser storage removes them.
- All travel tips, durations, and costs in this prototype are estimates.

---

## Next production steps

1. Replace localStorage with a real API and database for itinerary and share persistence
2. Add user authentication so itineraries persist across devices
3. Connect the assistant to a real LLM for dynamic trip advice
4. Expand place data to cover Sigiriya, Mirissa, Yala, Trincomalee, and more
5. Integrate live opening hours, ticket prices, and transport schedules
6. Add an interactive route map (Google Maps or Mapbox)
7. Add accommodation and activity booking integrations
8. Support multi-destination and multi-region itineraries
9. Add Progressive Web App support for offline access
10. Add Sinhala and Tamil language support

---

*This is a concept prototype built to validate the user journey and collect early feedback. All costs, opening hours, and place details are estimates and must be verified before travelling.*


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
