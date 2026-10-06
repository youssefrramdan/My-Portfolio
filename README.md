# Youssef Ramadan — Portfolio

A dynamic one-page portfolio (Backend Software Engineer). All content (text, images, numbers) is served by the API and managed from an Admin Dashboard. Nothing in the frontend is hardcoded, including the site-wide brand color (Settings > General).

Same codebase as the Muhamed portfolio, with its own MongoDB database (`/yousseframadan`) and its own Cloudinary root folder (`CLOUDINARY_FOLDER=yousseframadan`).

## Stack

- **Server:** Node.js, Express 5, MongoDB (Mongoose), express-validator, winston, Cloudinary (Zod for env validation)
- **Client:** React (Vite, JavaScript), Tailwind CSS v4 (`@tailwindcss/vite`), TanStack Query, React Router, React Hook Form + Zod, Framer Motion
- **Monorepo:** npm workspaces (`client`, `server`)

## Getting started

```bash
npm install
cp server/.env.example server/.env   # then fill in the values
npm run dev                          # server + client together
```

| Script               | What it does                                |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | Runs server and client in parallel          |
| `npm run dev:server` | Express API with `node --watch` (port 5050) |
| `npm run dev:client` | Vite dev server (port 5173), proxies `/api` |

Health check: `GET http://localhost:5050/api/health`

Seed (idempotent, safe to re-run): `npm run seed -w server` (all), `npm run seed -w server -- skills` (one: `settings`, `socials`, `hero`, `skills`, `projects`, `education`, `testimonials`, `contact`, `page`, `site`, `media`, `admin`), `-- --force` re-uploads images. `projects` only fills an empty database, so the real work items are never overwritten.

## Public API

| Endpoint            | Returns                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| `GET /api/settings` | `avatar`, `cv { url, name, bytes }`, `contactEmail`, `brandColor` (hex), `footer { copyright, backToTopLabel }`, `socials: [{ platform, url }]` (active only, in order, max 8) |
| `GET /api/hero`     | Published hero (role, title, intro, photo, `headline { lineBreak, imageSlots }`, skill tags, stats, `ctaPrimary` / `ctaSecondary`); edited from `/api/admin/identity` |
| `GET /api/skills`   | `{ section: { badge, title }, categories: [{ title, icon, items }] }`, active only, in order (max 4 active) |
| `GET /api/projects` | `{ section: { badge, title, description, scrollButtonLabel, cardCtaLabel }, projects: [{ slug, title, description, year, coverImage, cardLabel, tags: [{ label }] }] }`, published + featured only (`?scope=all`: every published project), in order; an empty `cardLabel` means use `cardCtaLabel` |
| `GET /api/projects/:slug` | One published project (same fields + `role`, `client`, `externalLink`, `linkLabel`, `gallery: [{ url, alt, layout: 'full' \| 'half' }]`) and the shared `pageButtons` (`[{ label, action, target }]`), `404` when missing or unpublished. Drafts are never exposed |
| `GET /api/education` | `{ section: { badge, title, certificatesTitle }, educations: [{ _id, label, degreeTitle, institution, subjects: [{ label }], graduationYear, graduationDescription, image }], certificates: [{ title, issuer, detail, date }] }`, active only, in order (subjects and certificates) |
| `GET /api/testimonials` | `{ section: { badge, title, ctaHeading, ctaDescription, ctaButtonLabel }, testimonials: [{ _id, name, role, message }] }`, approved only, by `order` then newest (`status` / `source` never exposed) |
| `GET /api/contact` | `{ section: { badge, title: { plain, highlight }, description, primaryCta, secondaryCta } }` |
| `POST /api/testimonials` | Body `{ name, role, message, website }` (`website` is the honeypot, must stay empty). Always saved as `pending` + `visitor` (any `status` / `source` / `order` in the body is ignored); not public until approved. Max lengths in `shared/testimonials.js`; `400` with `data: [{ field, message }]` on invalid input; own rate limit, 5 per 15 min per IP (`429`) |

Every CTA from the API has the shape `{ label, action: 'scroll' | 'email' | 'link', target }` (`scroll` = section id, `email` = address, `link` = URL). An empty `target` hides the button.

Write routes (PUT / POST / DELETE) exist in the controllers and are mounted once admin auth is in place. `POST /api/testimonials` is the one public write route.

## Structure

```
youssef-portfolio/
├── shared/           values the server and client must agree on (e.g. testimonial limits); client alias `@shared`
├── server/src/
│   ├── config/       env (Zod-validated), logger (winston), db, cloudinary
│   ├── modules/      one folder per site section (model, validator, controller, routes)
│   ├── middleware/   validate (express-validator), sanitize, rateLimit, requestTiming, notFound, errorHandler
│   ├── utils/        ApiError, asyncHandler, apiResponse, shared schemas/validators
│   ├── seed/
│   ├── routes.js, app.js, server.js
└── client/src/
    ├── app/          App, router, providers
    ├── features/     public site sections
    ├── admin/        dashboard (lazy-loaded on /admin)
    ├── components/   shared ui + layout
    ├── lib/          axios, queryClient, utils
    └── styles/       index.css, theme.css (design tokens from Figma)
```

## Design tokens

`client/src/styles/theme.css` is generated from the Figma variable collections (Colors, Fonts, Responsive). Responsive values follow the Figma modes: mobile is the base, overridden at `tablet` (768px) and `desktop` (1440px).

In development, visit `/tokens-preview` to compare tokens against Figma, and `/contact-preview?count=0..8` to check the Contact arc with any number of social icons (temporary, to be deleted).

See [PLAN.md](PLAN.md) for the roadmap.
