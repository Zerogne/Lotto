# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint via next lint
```

No test suite is configured yet.

## Architecture

**Next.js 15 App Router** project with two route groups that share the root layout (`app/layout.tsx`) but have independent nested layouts:

- `app/(public)/` — customer-facing site. Layout wraps all pages with `PublicNav` (sticky top nav with "Хожигчид" link).
- `app/(admin)/` — staff dashboard. Layout wraps pages with `AdminNav`, which renders a sidebar on desktop and a fixed bottom tab bar on mobile.

### Data layer

All data lives in **`lib/mock-data.ts`** as in-memory arrays (`LOTTERIES`, `TICKETS`, `WINNERS`). There is no database or API. Helper functions (`getLotteryById`, `getActiveLotteries`, `formatMNT`, `formatDate`, `gen6DigitRandom`) are all imported directly. When a real backend is added, this is the only file that needs to change.

### Public user flow

1. `/` — landing page showing the first active lottery as a featured hero, remaining active lotteries as secondary cards.
2. `/lottery/[id]` — immediately redirects to `/lottery/[id]/purchase` (the actual purchase page is one level deeper but the URL shown to users is the shorter form).
3. `/lottery/[id]/purchase` — `TicketPurchaseClient` (Client Component) handles phone input, lottery/quantity selection, a QPay modal (QR placeholder), and a success modal that displays the generated ticket codes as digit bubbles.
4. `/winners` — static list of past winners.

Ticket codes are **generated client-side** via `gen6DigitRandom()` after the user clicks "Төлбөр хийлээ" — this is intentional demo behavior, not a bug.

### Admin flow

- `/admin` — dashboard with stats cards + recent tickets table.
- `/admin/lotteries` — table of all lotteries; `DrawButton` (Client Component) triggers a simulated draw.
- `/admin/lotteries/new` — `CreateLotteryForm` (Client Component) for adding a lottery (writes to in-memory state only).
- `/admin/tickets` — full tickets table.

### Component conventions

- `components/ui/` — shadcn/ui primitives (Button, Card, Badge, Dialog, Input, Label, Select). Do not modify these directly; regenerate via shadcn CLI if needed.
- `components/public/` — shared public components (`PublicNav`, `CountdownTimer`). `CountdownTimer` is a Client Component (`"use client"`) because it uses `setInterval`.
- `components/admin/AdminNav.tsx` — Client Component because it uses `usePathname` for active-link highlighting.
- All page files are Server Components unless they explicitly declare `"use client"`. Avoid adding event handlers (`onClick`, `onMouseEnter`, etc.) to Server Component JSX — extract a Client Component instead.

### Styling

Tailwind CSS v3 + shadcn/ui. The `cn()` utility (`lib/utils.ts`) merges class strings. Amber (`amber-500`) is the primary brand accent. Inline `style` props are used when Tailwind's arbitrary-value syntax would be unwieldy (e.g. complex gradients).
