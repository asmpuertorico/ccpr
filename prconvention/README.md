PR Convention — Next.js 14 (App Router) + TypeScript + Tailwind

Tech
- Next.js 14 App Router (/app)
- TypeScript, Tailwind, ESLint, Prettier
- i18n: locales at `/[locale]/` (en default, es)

Colors
- ink: #231f20
- sun: #f78f1e
- sky: #90d8f8
- ocean: #0e7bbd
- teal: #10a0c6
- white: #ffffff

Getting Started
1. Install deps: `npm install --legacy-peer-deps`
2. Set env:
   - create `.env.local` with `ADMIN_PASSWORD=your-strong-password`
3. Run dev: `npm run dev`
4. Open `http://localhost:3000`

Assets
- Place videos in `public/videos/hero/` as `hero.webm`, `hero.mp4`, and `poster.jpg`.
- Sponsor logos under `public/images/sponsors/`.
- Logos under `public/logos/`.
- Event placeholders under `public/images/ui/`.

Admin
- Route: `/[locale]/admin`
- Requires password; sets httpOnly cookie for 12h
- If `ADMIN_PASSWORD` missing, message shown on the form

API
- GET `/api/events` → list
- POST `/api/events` → create (admin cookie required)
- GET `/api/events/:id` → one
- PATCH `/api/events/:id` → update (admin cookie required)
- DELETE `/api/events/:id` → delete (admin cookie required)

Deploy
- Vercel: push to `main`. Set env var `ADMIN_PASSWORD`.
