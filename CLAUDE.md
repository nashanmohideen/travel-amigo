# Travel Amigo — Frontend Reference (CLAUDE.md)

A day-by-day Sri Lanka trip planner prototype. Rule-based itinerary generation, inline editing, budget breakdown, share-by-link, PDF print, and a feedback system — all without a real backend or authentication. Covers 5 destinations: Ella, Kandy, Galle, Nuwara Eliya, Colombo.

---

## Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.6 |
| Language | TypeScript (strict) | ^5 |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS v4 | ^4 |
| State Management | Redux Toolkit + RTK Query | ^2.11.2 |
| React-Redux binding | react-redux | ^9.2.0 |
| Font | Inter via `next/font/google` | — |
| Persistence | `localStorage` only (no DB yet) | — |
| Linting | ESLint 9 + eslint-config-next | ^9 |

> **Tailwind v4 breaking change**: Import is `@import "tailwindcss"` in `globals.css` — NOT `@tailwind base/components/utilities`. There is no `tailwind.config.js`; all theme tokens live in `@theme inline {}` blocks inside CSS files.

> **Next.js 16 note**: Read `node_modules/next/dist/docs/` before touching routing or config — APIs differ from Next.js 13–15. Always check deprecation notices.

---

## Project Structure

```
travel-amigo/
├── app/                        # Next.js App Router pages & API routes
│   ├── layout.tsx              # Root layout: Inter font, ReduxProvider, Header, Footer
│   ├── page.tsx                # Landing page (/)
│   ├── globals.css             # Tailwind v4 import + theme + print styles
│   ├── favicon.ico
│   ├── plan/
│   │   └── page.tsx            # Trip planning form (/plan)
│   ├── itinerary/
│   │   ├── page.tsx            # Redirects → /itinerary/demo
│   │   └── demo/               # Generated + editable itinerary (/itinerary/demo)
│   ├── itineraries/            # (reserved for future saved itinerary listing)
│   ├── share/
│   │   └── [id]/               # Redirects → /shared/demo (legacy route)
│   ├── shared/
│   │   └── [id]/               # Read-only shared itinerary view (/shared/[id])
│   ├── feedback/               # Prototype feedback dashboard (/feedback)
│   └── api/
│       ├── feedback/
│       │   └── route.ts        # POST /api/feedback, GET /api/feedback
│       ├── itineraries/
│       │   ├── route.ts        # POST /api/itineraries
│       │   └── [id]/           # GET /api/itineraries/:id (placeholder)
│       ├── itinerary/          # Future: POST /api/itinerary/generate
│       └── share/              # Future: share link endpoints
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Site header with nav links
│   │   └── Footer.tsx          # Site footer
│   ├── features/               # Page-level feature components
│   │   ├── TripForm.tsx                # Multi-step trip planning form
│   │   ├── GeneratedItineraryView.tsx  # Full itinerary display + edit UI
│   │   ├── GeneratedItineraryCard.tsx  # Single day card within the itinerary
│   │   ├── GeneratedBudgetSummary.tsx  # Budget breakdown panel
│   │   ├── SavedItineraryView.tsx      # Read-only itinerary (shared view)
│   │   ├── SharedItineraryView.tsx     # Shared link view wrapper
│   │   ├── ShareModal.tsx              # Share itinerary modal
│   │   ├── ReplacePlaceModal.tsx       # Replace a place modal
│   │   ├── MockAssistantPanel.tsx      # Canned AI assistant panel
│   │   ├── FeedbackForm.tsx            # User feedback form
│   │   └── FeedbackDashboard.tsx       # Prototype feedback analytics view
│   └── ui/                     # Generic reusable primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── SelectOption.tsx
│
├── features/                   # Redux slices + RTK Query endpoints
│   ├── trips/
│   │   └── tripDraftSlice.ts   # Active trip form draft (TripInput)
│   ├── itinerary/
│   │   ├── itinerarySlice.ts   # Active itinerary + all edit actions
│   │   └── itineraryApi.ts     # RTK Query: generateItinerary, saveItinerary, getItinerary
│   ├── ui/
│   │   └── uiSlice.ts          # App-wide UI flags: modals, toasts, loading
│   └── api/
│       ├── baseApi.ts          # RTK Query base API (fetchBaseQuery, tagTypes)
│       └── apiTypes.ts         # Shared API response types
│
├── hooks/
│   └── useEditableItinerary.ts # Primary controller hook for /itinerary/demo
│
├── lib/
│   ├── generateItinerary.ts    # Rule-based itinerary generation algorithm
│   ├── placeHelpers.ts         # Place filtering, ranking by interest
│   ├── mockAssistantActions.ts # Canned assistant response logic
│   ├── formatters.ts           # LKR currency + date formatters
│   ├── utils.ts                # General utility functions
│   ├── storageKeys.ts          # localStorage key constants (single source of truth)
│   ├── itinerary/
│   │   └── itineraryHelpers.ts # isValidItinerary type guard + helpers
│   ├── server/
│   │   ├── feedbackStore.ts    # In-memory feedback store (MVP; replace with DB)
│   │   ├── itineraryStore.ts   # In-memory itinerary store (MVP; replace with DB)
│   │   └── shareStore.ts       # In-memory share store (MVP; replace with DB)
│   └── validation/
│       ├── tripValidation.ts   # TripInput validation rules
│       └── feedbackValidation.ts # FeedbackSubmission validation rules
│
├── data/                       # Static mock data (bundled at build time)
│   ├── destinations.ts         # 5 Sri Lanka destinations
│   ├── places.ts               # ~50 hand-written places with costs, tips, coords
│   └── transport.ts            # Travel time + cost estimates between destinations
│
├── store/
│   ├── store.ts                # Redux store configuration
│   ├── hooks.ts                # Typed useAppDispatch + useAppSelector
│   └── provider.tsx            # <ReduxProvider> client component wrapper
│
├── types/
│   └── index.ts                # All shared TypeScript interfaces and types
│
├── public/                     # Static assets
├── next.config.ts              # Next.js config (minimal, no custom options yet)
├── tsconfig.json               # TypeScript config (strict, bundler resolution, @/* alias)
├── postcss.config.mjs          # PostCSS with @tailwindcss/postcss
├── eslint.config.mjs           # ESLint 9 flat config: next/core-web-vitals + typescript
└── package.json
```

---

## Routing

Uses the **Next.js App Router** (file-system routing in `app/`).

| Route | Page File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Landing page |
| `/plan` | `app/plan/page.tsx` | Trip planning form |
| `/itinerary/demo` | `app/itinerary/demo/page.tsx` | Editable generated itinerary |
| `/itinerary` | `app/itinerary/page.tsx` | Redirects → `/itinerary/demo` |
| `/shared/[id]` | `app/shared/[id]/page.tsx` | Read-only shared itinerary |
| `/share/[id]` | `app/share/[id]/page.tsx` | Redirects → `/shared/demo` (legacy) |
| `/feedback` | `app/feedback/page.tsx` | Prototype feedback dashboard |

All pages are **Server Components by default**. Client-side interactivity uses `"use client"` at the top of the file (or in dedicated child components).

### Path Alias

`@/*` maps to the project root. Use it for all internal imports:

```ts
import { useAppDispatch } from "@/store/hooks";
import type { TripInput } from "@/types";
```

---

## Component Architecture

### Three-Layer Component Model

```
components/layout/    ← Header, Footer (structural, always rendered)
components/features/  ← Page-level feature components (heavy, domain-specific)
components/ui/        ← Generic primitives (Button, Input, Card, Badge, SelectOption)
```

### Key Feature Components

| Component | Responsibility |
|---|---|
| `TripForm` | Multi-field trip form; writes `TripInput` to `localStorage` on submit |
| `GeneratedItineraryView` | Full itinerary display + editing shell; consumes `useEditableItinerary` |
| `GeneratedItineraryCard` | Single day card with place list, edit controls (remove/replace/reorder) |
| `GeneratedBudgetSummary` | Budget breakdown with accommodation/food/transport/activities/buffer |
| `ReplacePlaceModal` | Alternative place picker for swapping a place on a day |
| `ShareModal` | Writes itinerary to `localStorage`; displays the share URL |
| `SharedItineraryView` / `SavedItineraryView` | Read-only view consumed by `/shared/[id]` |
| `MockAssistantPanel` | Accordion panel with 6 canned prompt buttons |
| `FeedbackForm` | Feedback submission form |
| `FeedbackDashboard` | Reads and displays `LS_FEEDBACK_SUBMISSIONS` for prototype review |

### Design Patterns

- **Controller hook pattern**: `useEditableItinerary` is the single public interface for itinerary state. No page component directly dispatches editing actions — they call hook methods.
- **Server Components default**: pages are SC unless they need event handlers or hooks (`"use client"`).
- **Side-effect-free reducers**: Redux reducers never touch `localStorage`, `router`, or `window`. All side effects live in hooks/components.
- **Data in, actions out**: Redux reducers that need to compute new values call pure lib functions (e.g. `reassignTimeSlots`, `recalculateBudgetFromDays`) and receive the computed values as payload — not the other way around.

---

## State Management

### Redux Store (`store/store.ts`)

Four slices + RTK Query:

| Slice / Key | Purpose |
|---|---|
| `tripDraft` | Active trip form draft (`TripInput`). Mirrors `LS_TRIP_INPUT` during prototype phase. |
| `itinerary` | Active generated/edited itinerary (`GeneratedItinerary`). Source of truth for `/itinerary/demo`. |
| `ui` | App-wide UI flags: `shareModalOpen`, `assistantPanelOpen`, `toast`, `globalLoadingLabel`. |
| `baseApi` | RTK Query cache (currently empty endpoint stubs, ready for Phase 8 backend). |

**No `redux-persist`**: deliberately excluded to avoid SSR hydration mismatches. Persistence is handled manually by `useEditableItinerary`.

### Typed Hooks

Always import these — never the plain `react-redux` hooks:

```ts
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const dispatch = useAppDispatch();
const itinerary = useAppSelector((s) => s.itinerary.activeItinerary);
```

### localStorage (Persistence Layer)

All keys are defined in `lib/storageKeys.ts` — **never use inline string literals**:

| Constant | Key | Purpose |
|---|---|---|
| `LS_TRIP_INPUT` | `ta_trip_input` | TripForm output; read by `/itinerary/demo` on mount |
| `LS_EDITED_ITINERARY` | `ta_edited_itinerary` | User edits persisted across page refreshes |
| `LS_SHARED_ITINERARY_DEMO` | `ta_shared_itinerary_demo` | Written by ShareModal; read by `/shared/demo` |
| `LS_FEEDBACK_SUBMISSIONS` | `ta_feedback_submissions` | Feedback form submissions |

### `useEditableItinerary` Hook

The primary controller for `/itinerary/demo`. Responsibilities:

1. **Hydrates Redux on mount** — tries `LS_EDITED_ITINERARY` → `LS_TRIP_INPUT` → demo fallback.
2. **API-first with local fallback** — calls `useGenerateItineraryMutation` (RTK Query); on failure silently uses `lib/generateItinerary.ts`.
3. **Persists edits** — writes to `LS_EDITED_ITINERARY` after every Redux state change when `isEdited === true`.
4. **Exposes a stable API surface**: `removePlace`, `replacePlace`, `movePlaceUp`, `movePlaceDown`, `changePace`, `resetToGenerated`, `startOver`, `getAlternatives`, `clearLastAction`.

---

## API Integration

### Next.js Route Handlers (`app/api/`)

All handlers use `Response.json()` (no `NextResponse`).

| Route | Methods | Description |
|---|---|---|
| `/api/feedback` | `POST`, `GET` | Submit / retrieve feedback. In-memory store (MVP). |
| `/api/itineraries` | `POST` | Save an itinerary. In-memory store (MVP). |
| `/api/itineraries/[id]` | `GET` | Retrieve by ID (placeholder). |

Error response shape:
```ts
interface ApiError { message: string; code: string; details?: unknown; }
```

Success mutation shape:
```ts
interface ApiMutationResponse { ok: boolean; id?: string; message?: string; }
```

### RTK Query (`features/api/baseApi.ts`)

- **Base URL**: `NEXT_PUBLIC_API_BASE_URL` env var, fallback `"/api"`.
- **Credentials**: `"include"` (prepared for future cookie auth).
- **Tag types**: `Itinerary`, `Trip`, `Share`, `Feedback`, `Place`, `Destination`, `User`.

Endpoints are injected per feature:

```ts
// features/itinerary/itineraryApi.ts
export const { useGenerateItineraryMutation, useSaveItineraryMutation, useGetItineraryQuery } = itineraryApi;
```

> **Current status**: `generateItinerary` mutation is called in `useEditableItinerary` but the backend endpoint doesn't exist yet — all generation falls back to `lib/generateItinerary.ts`. `saveItinerary` and `getItinerary` are defined but not wired to UI.

### Server-side stores (`lib/server/`)

Temporary **in-memory** stores used by route handlers during the MVP phase:

| File | Purpose | Replace with |
|---|---|---|
| `feedbackStore.ts` | Stores `FeedbackSubmission[]` in-memory | Real DB (e.g. Postgres via Prisma) |
| `itineraryStore.ts` | Stores `GeneratedItinerary[]` in-memory | Real DB |
| `shareStore.ts` | Stores share tokens in-memory | Real DB + UUID share endpoint |

---

## Styling

### Tailwind CSS v4

**Import method** (in `app/globals.css`):
```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}
```

There is **no** `tailwind.config.js`. All custom design tokens are declared with `@theme` blocks. Use `theme()` function in CSS for token access (e.g. `theme(--color-teal-500)`).

### Brand Palette

Primary: `teal-*` scale. Text/backgrounds: `stone-*` scale. Status colours: `green-*` (success), `amber-*` (warning), `red-*` (error).

### Focus Ring

Defined globally in `globals.css`:
```css
:focus-visible {
  outline: 2px solid theme(--color-teal-500);
  outline-offset: 2px;
}
```

### Print Styles

`globals.css` contains a comprehensive `@media print` block. Key classes:
- `.no-print` — hides elements from print
- `.print-card` — removes shadows, keeps borders, prevents page-break inside
- `.print-hero` — flattens gradient to solid teal for ink saving
- `.print-avoid-break` — prevents day cards splitting across pages

### Font

```ts
// app/layout.tsx
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
```

Applied via `--font-sans` CSS variable (set in `@theme`).

---

## TypeScript

All types live in `types/index.ts`. Key interfaces:

| Type | Purpose |
|---|---|
| `TripInput` | Form output: destination, duration, travelers, budgetLKR, style, interests, transport, pace |
| `Place` | Point of interest with coords, cost, visit duration, gradient placeholder |
| `GeneratedItinerary` | Full itinerary: id, title, days, budget, budgetStatus, tips, warnings |
| `GeneratedItineraryDay` | One day: items[], transportNote, totalCostLkr |
| `ItineraryItem` | One place visit within a day |
| `GeneratedBudgetBreakdown` | accommodation/food/transport/activities/buffer/total/perPerson in LKR |
| `FeedbackSubmission` | Complete feedback record |

**Strict mode** is enabled (`"strict": true` in `tsconfig.json`). Target: `ES2017`. Module resolution: `bundler`.

---

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | No | `"/api"` | RTK Query base URL. Set to backend domain for production. |

Add to `.env.local` for local overrides:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

---

## Development Workflow

### Commands

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev
# → http://localhost:3000

# Run ESLint
npm run lint

# Type check (no emit)
npx tsc --noEmit

# Build for production
npm run build

# Start production server
npm start
```

### Demo Testing Flow

1. `/` → Click **Plan My Trip**
2. `/plan` → Fill form → Submit
3. `/itinerary/demo` → Review day-by-day itinerary
4. Edit: remove a place, replace a place, reorder
5. Change pace (Relaxed / Balanced / Packed) in Actions panel
6. Reset edits with **Reset to generated plan**
7. **Share itinerary** → copy link
8. Open `/shared/demo` in same browser → read-only view
9. **Download / Print PDF** → browser print dialog
10. Submit feedback form → open `/feedback` → review submissions
11. Expand **Travel Amigo Assistant** → test all 6 prompts

---

## Coding Standards & Conventions

### General

- **TypeScript strict** — no `any` unless unavoidable and clearly commented.
- **Named exports** for slices and utilities; **default exports** for React components and Next.js page files.
- **`"use client"` directive** at the top of any component using React hooks or browser APIs.
- **JSDoc comments** on all exported functions, hooks, slice actions, and API routes.
- **No inline string localStorage keys** — always import from `lib/storageKeys.ts`.

### Redux

- Use `useAppDispatch` / `useAppSelector` from `store/hooks` — never raw `useDispatch`/`useSelector`.
- Reducers must be pure; no `localStorage`, `window`, or async logic inside reducers.
- Use `current()` from RTK when reading Immer draft values in a reducer to pass to external functions.
- Use `createSlice` from `@reduxjs/toolkit`; never hand-write reducers with `switch`.

### Components

- Co-locate feature-specific types with the feature slice, not in `types/index.ts`.
- Shared domain types go in `types/index.ts`.
- `components/ui/` primitives must be reusable and stateless (or minimal local state only).
- Heavy page components belong in `components/features/`.

### API Routes

- Validate all request bodies before processing.
- Return structured `ApiError` objects on failure — never expose raw error messages or stack traces.
- Use HTTP status codes correctly: `201` for created, `400` for validation error, `500` for server error.
- All handlers have full JSDoc explaining request body, response shape, and status codes.

### Imports Order (enforced by ESLint)

1. Node built-ins
2. External packages (`next`, `react`, `@reduxjs/toolkit`, etc.)
3. Internal aliases (`@/features/...`, `@/lib/...`, `@/types`)
4. Relative imports

---

## Reusable Components & Utilities

### `components/ui/`

| Component | Props / Notes |
|---|---|
| `Button` | `variant` (primary/secondary/ghost/danger), `size`, `loading`, `disabled` |
| `Input` | Controlled input with label + error state |
| `Card` | Wrapper with consistent padding + shadow |
| `Badge` | Colour-coded label chip |
| `SelectOption` | Styled `<select>` wrapper |

### Key Library Functions (`lib/`)

| Function | File | Purpose |
|---|---|---|
| `generateItinerary(input)` | `generateItinerary.ts` | Main rule-based generation |
| `createDefaultTripInput()` | `generateItinerary.ts` | Ella demo fallback input |
| `placeToItineraryItem(place, travelers)` | `generateItinerary.ts` | Converts a Place to an ItineraryItem |
| `reassignTimeSlots(items)` | `generateItinerary.ts` | Recalculates start/end times after reorder |
| `recalculateBudgetFromDays(budget, days, input)` | `generateItinerary.ts` | Updates budget after place add/remove |
| `getBudgetStatus(budget, input)` | `generateItinerary.ts` | Returns `within_budget` / `tight_budget` / `over_budget` |
| `getPlacesByDestination(dest)` | `placeHelpers.ts` | Filters `data/places.ts` by destination |
| `rankPlaces(places, interests)` | `placeHelpers.ts` | Ranks alternatives by user interest match |
| `isValidItinerary(value)` | `itinerary/itineraryHelpers.ts` | Type guard for `GeneratedItinerary` |
| `formatLKR(amount)` | `formatters.ts` | Formats numbers as `Rs. 1,234` |

---

## Accessibility

- **Focus ring**: globally defined on `:focus-visible` with teal outline (2px, offset 2px).
- **Semantic HTML**: `<header>`, `<footer>`, `<main>`, `<nav>`, `<article>`, `<section>` used appropriately.
- **Single `<h1>` per page**: each route has one top-level heading.
- **ARIA**: interactive controls without visible text must have `aria-label`. Modal dialogs should use `role="dialog"` with `aria-modal="true"` and `aria-labelledby`.
- **Keyboard navigation**: all interactive elements (buttons, links, form fields) are reachable by Tab. Modals should trap focus.
- **Colour contrast**: teal palette on white/stone backgrounds — verify minimum 4.5:1 for body text, 3:1 for large text.
- **Print**: `nav`, `header`, `footer`, and `.no-print` elements are hidden in print output.

---

## Performance

- **Next.js font optimisation**: Inter loaded via `next/font/google` with `display: "swap"` — no layout shift.
- **Static data at build time**: `data/places.ts`, `data/destinations.ts`, `data/transport.ts` are TypeScript modules bundled at build time — no runtime fetch.
- **No redux-persist**: avoids the hydration mismatch overhead common with SSR + persistence.
- **`useCallback` on all hook methods** in `useEditableItinerary` — prevents unnecessary re-renders in child components.
- **Incremental TypeScript compilation**: `"incremental": true` in `tsconfig.json`.
- **Image placeholders**: places use Tailwind gradient `className` strings (`gradientPlaceholder` field on `Place`) instead of real images — zero image requests on the itinerary page.
- **Print CSS only loads on print**: `@media print` block in `globals.css`.

---

## Testing

> **No test suite exists yet.** This section documents the intended setup for when tests are added.

### Planned Setup

- **Unit tests**: Vitest or Jest for pure functions in `lib/` (especially `generateItinerary.ts`, `placeHelpers.ts`, validation).
- **Component tests**: React Testing Library for UI components.
- **E2E tests**: Playwright for the full demo flow (plan → itinerary → share → feedback).

### Priority Test Targets

1. `lib/generateItinerary.ts` — core algorithm, budget calculation, time slot assignment.
2. `lib/validation/tripValidation.ts` and `feedbackValidation.ts` — edge cases.
3. `features/itinerary/itinerarySlice.ts` — all reducer actions (remove, replace, move, reset).
4. `hooks/useEditableItinerary.ts` — hydration logic, API-with-fallback behaviour.
5. API route handlers (`app/api/`) — validation rejection, success responses.

### Recommended Command (when configured)

```bash
npm test              # unit + component tests
npm run test:e2e      # Playwright E2E
```

---

## Known Limitations & Prototype Boundaries

- **No real AI** — MockAssistantPanel uses canned logic; no LLM calls.
- **No real backend** — Server-side stores (`lib/server/`) are in-memory only; data is lost on server restart.
- **Share links are browser-local** — `/shared/demo` only works in the same browser that created the share.
- **5 destinations** — Ella, Kandy, Galle, Nuwara Eliya, Colombo only.
- **No authentication** — all routes are public.
- **No maps** — route overview is a "Coming soon" placeholder.
- **Prices are estimates** — not sourced from live data.
- **`redux-persist` intentionally absent** — will be revisited with server-side session storage.

---

## Roadmap (Next Production Steps)

1. Replace `lib/server/` in-memory stores with a real database (Prisma + Postgres recommended).
2. Add authentication (NextAuth.js / Auth.js).
3. Connect `useGenerateItineraryMutation` to a real backend generation endpoint or LLM.
4. Expand place data: Sigiriya, Mirissa, Yala, Trincomalee.
5. Add interactive map (Google Maps / Mapbox).
6. Real UUID-based share links (not localStorage).
7. Accommodation + activity booking integrations.
8. PWA support for offline access.
9. Sinhala and Tamil language support.
10. Add Vitest unit tests and Playwright E2E tests.
