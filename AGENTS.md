# Repository Guidelines

## Project Structure & Module Organization

This repository is a TypeScript Next.js App Router application. Routes live under `app/`: `(public)` contains customer-facing pages, `(admin)` contains the protected dashboard, and `app/api/` contains route handlers. Reusable UI is split between `components/ui/` (shadcn/Radix primitives), `components/public/`, and `components/admin/`. Shared database, authentication, SMS, lottery, and formatting logic belongs in `lib/`. Static assets live in `public/`; database setup and incremental changes are documented in `supabase-schema.sql` and `migrations/`.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies from `package-lock.json`.
- `npm run dev` starts the local Next.js development server, normally at `http://localhost:3000`.
- `npm run build` creates a production build and catches TypeScript or rendering errors.
- `npm start` serves the completed production build.
- `npm run lint` runs the configured Next.js ESLint rules.

Use Node.js with npm and commit lockfile changes whenever dependencies change.

## Coding Style & Naming Conventions

TypeScript runs in strict mode. Follow the existing two-space indentation, semicolons, and double-quoted imports. Name React components and their files in `PascalCase` (`CountdownTimer.tsx`); use `camelCase` for functions and variables, and uppercase snake case for constants. Keep route files named according to Next.js conventions (`page.tsx`, `layout.tsx`, `route.ts`). Prefer the `@/` path alias and Tailwind utilities; use `cn()` from `lib/utils.ts` for conditional classes. Add `"use client"` only where browser state, effects, or event handlers require it.

## Testing Guidelines

No automated test framework or coverage threshold is currently configured. For every change, run `npm run lint` and `npm run build`, then manually exercise affected public, admin, and API flows. If adding tests, colocate them as `*.test.ts` or `*.test.tsx` and add the corresponding npm script and framework configuration in the same pull request.

## Commit & Pull Request Guidelines

Recent commits use short, imperative subjects such as `Fix admin ticket search wiping input`. Keep each commit focused and explain migrations or configuration changes in the body. Pull requests should summarize behavior changes, list validation performed, link relevant issues, and include screenshots for visible UI changes. Call out new environment variables or SQL migrations explicitly.

## Security & Configuration

Copy `.env.local.example` to `.env.local` for local setup. Never commit credentials, service-role keys, admin secrets, or real customer data. Keep privileged Supabase operations server-side and review authentication on every admin API mutation.
