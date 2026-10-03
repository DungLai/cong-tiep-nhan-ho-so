# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project context

DuHoc24 — "Cổng Tiếp Nhận Hồ Sơ Du Học" (study-abroad application intake portal). This is a teaching sample repo for a 6-week course. The current state is **Week 1: static UI only** — every page reads hardcoded mock data from `lib/mock-data.ts`; there is no API, database, or auth yet. The README contains the week-by-week roadmap (Gemini chatbot → Supabase → document extraction with Gemini → Make.com automation → Supabase magic-link auth + RLS). Keep changes scoped to the week being worked on; don't pre-build later-week features unless asked.

UI copy, comments, and mock data are in **Vietnamese** — keep new user-facing text in Vietnamese.

## Commands

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # production build (also the type check)
npm run lint    # eslint (flat config, eslint-config-next)
```

There is no test suite. No env vars are required to run in Week 1; `.env.example` lists the Supabase / site URL vars for later weeks.

## Stack notes

- **Next.js 16.3 (App Router) + React 19.2** — newer than most training data. Per AGENTS.md, check `node_modules/next/dist/docs/` before using Next APIs. Example already in use: the global `LayoutProps<"/">` type helper in `app/layout.tsx`.
- **Tailwind CSS v4** via `@tailwindcss/postcss`; there is no `tailwind.config` — theme tokens live in `app/globals.css` (CSS variables).
- **shadcn/ui, style `base-nova`, built on Base UI (`@base-ui/react`), not Radix.** Component APIs in `components/ui/` follow Base UI conventions. Add components with `npx shadcn add <name>`; a `@tailark-oss` registry is also configured in `components.json`.
- Animation: `motion`; icons: `lucide-react`; class merging: `cn()` in `lib/utils.ts`.
- Path alias `@/*` → repo root.
- Remote images allowed only from `images.unsplash.com` (`next.config.ts`).

## Architecture

- `app/page.tsx` — landing page composed from `components/landing/*` (hero, quote form, chat widget, highlights). The chat widget answers from a hardcoded `cannedAnswers` map (to be replaced by Gemini in Week 2).
- `app/portal/page.tsx` — student portal composed from `components/portal/*` (document upload, extracted info, school score matching), using `currentStudent` from mock data.
- `app/admin/*` — admin dashboard with a shared layout (`components/admin/sidebar.tsx` for desktop sidebar + mobile nav). `/admin` redirects to `/admin/requests`. Each page is a server component rendering a table of mock data with `AdminPageHeader`.
- `lib/mock-data.ts` is the single data source and also defines the domain types (`School`, `AdmissionRequest`, `StudentProfile`, `Conversation`, etc.) and status enums using Vietnamese snake_case values (`cho_duyet`/`da_duyet`/`tu_choi`, `chua_nop`/`dang_xu_ly`/`hop_le`/`can_nop_lai`). `components/status-badge.tsx` maps these to labels/colors. When wiring real data later, these types are the intended shape for the Supabase tables (`requests`, `schools`, `conversations`/`messages`, `student_profiles`).
- Pages are server components by default; only interactive pieces (quote form, chat widget, header, sidebar, some ui primitives) are `"use client"`.

## Quy tắc Git

- Luôn hỏi xác nhận trước khi push lên Github
- Không bao giờ commit file .env hoặc bất kỳ file chứa API key
