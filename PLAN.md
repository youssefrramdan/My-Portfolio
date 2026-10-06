# Plan

## Phase 0: Setup

- [x] Pull Figma variables (Colors 29, Fonts 28, Responsive 16) and audit issues
- [x] npm workspaces monorepo (client, server) with dev scripts
- [x] Server foundation: Express 5, helmet, cors, rate limit, sanitize, morgan, cookie-parser
- [x] Zod-validated env (`config/env.js`), db, cloudinary config
- [x] ApiError, errorHandler, notFound, validate, asyncHandler, unified response format
- [x] Ported from Oxxila: winston logger, express-validator `validate`, error handler with dev/prod split, CORS allowlist, process-level error handlers
- [x] `GET /api/health`
- [x] Client foundation: Vite + React (JS), Tailwind v4 via `@tailwindcss/vite`, `@` alias
- [x] `theme.css` from real Figma variables (responsive modes), Montserrat via Fontsource
- [x] Router: `/` placeholder, lazy `/admin/*`, dev-only `/tokens-preview`
- [x] Cursor rules: project, design-system, dashboard-pattern
- [x] Verify: `npm install`, `dev:server` Zod error without `.env`, `/api/health` (in-process, no DB), `dev:client` + `/tokens-preview` at 390 / 768 / 1440
- [x] Verify `npm run dev:server` against Atlas (fill `MONGODB_URI` + Cloudinary in `server/.env`)

## Phase 1: UI primitives (built as sections need them)

- [x] Button (`components/ui/Button.jsx`)
- [x] Badge (`components/ui/Badge.jsx`)
- [ ] Card
- [x] SectionTitle (`components/ui/SectionTitle.jsx`)
- [x] Chip (`components/ui/Chip.jsx`)

## Phase 2: Hero (public, no admin yet)

- [x] Hero + Settings modules: model + express-validator + explicit controllers + `GET` routes
- [x] Idempotent seed with Cloudinary assets
- [x] Public section (navbar, headline, stats, skill tags, images) + entrance animations

## Phase 3: Tools & Methods (public, no admin yet)

- [x] Skills module: `SkillsSection` singleton + `SkillCategory` collection, max 4 active (validator), `GET /api/skills`
- [x] Idempotent seed (Figma chips, Hugeicons uploaded to `portfolio/skills`)
- [x] Public section: tilted cards by slot, hidden when no active categories, skeleton, 390 / 768 / 1440
- [x] Scroll reveal: lights slide in from the sides, badge / title / cards rise with stagger, reduced motion = fade only

## Phase 4: Selected Projects (public, no admin yet)

- [x] Projects module: `ProjectsSection` singleton + `Project` collection (slug from title, required fields validated, tags `{ label, order, isActive }`, `ctaLabel` / `ctaLink`, `caseStudy` placeholder), `GET /api/projects` + `GET /api/projects/:slug`
- [x] Idempotent seed by slug (4 temporary projects, covers from Figma uploaded to `portfolio/projects`)
- [x] Public section: card (CTA from data, external links in a new tab), skeleton, hidden when no active projects, 390 / 768 / 1440
- [x] Desktop: sticky stage, scroll unfolds the Figma stack into the Row (and re-stacks), header slides from left to center, toggle fades in
- [x] Row carousel (snap, hidden scrollbar, mouse drag, touch) and Row <-> Grid toggle with layout animation; reduced motion = Row + fade
- [x] Placeholder route `/projects/:slug` (title only)

## Phase 5: Education & Learning (public, no admin yet)

- [x] Education module: `EducationSection` + `Education` singletons (subjects `{ label, order, isActive }`), `Certificate` collection (free-text `date`, optional `detail`), required fields validated, `GET /api/education`
- [x] Idempotent seed (Figma copy; certificates matched by title + issuer)
- [x] Public section: degree card (glow exported from Figma as SVG), graduation card (`text-year` token), certificates card (row numbers from the order, dash for an empty detail), skeleton, 390 / 768 / 1440
- [x] Hidden parts: no certificates = no certificates card, no education data = no top cards, nothing = no section
- [x] Reveal once: heading rises, degree card from the left, graduation card from the right (rise only when stacked), certificates rise + rows stagger; reduced motion = fade only

## Phase 6: Backend core

Moved into the Phase 8 modules: auth (8.1), upload (8.2), and each module mounts its own write routes under `/api/admin/*` behind `requireAuth`.

## Phase 6b: Testimonial submission form

- [x] Testimonials module (minimal): `Testimonial` model (default `pending`), express-validator (required, trimmed, max lengths) + honeypot, `POST /api/testimonials` behind a strict limiter (honeypot hits get a fake success, nothing saved), `GET /api/testimonials` returns approved only (extended in Phase 8)
- [x] Limits and honeypot field name in one place: `shared/testimonials.js` (server imports it, client via the `@shared` alias)
- [x] UI primitives: `Modal` (portal, focus trap, Esc / backdrop close, focus return, scroll lock, page `inert`), `Input`, `Textarea`, `Field`; `Button` `shape="rect"` + `loading`
- [x] `TestimonialFormModal` (Figma 505:4936): react-hook-form + zod, inline errors, character counter, hidden honeypot, sending / success (auto-close) / error (429, 400, network) states, typed values kept on error
- [x] Fade + slight scale, backdrop fade with blur; reduced motion = fade only; 390 / 768 / 1440
- [x] Temporary trigger (`TestimonialCta`), replaced by the Testimonials section CTA in Phase 8
- [x] Errors appear only on Send; focusing or typing in a field clears its own error

## Phase 7: Public sections: Testimonials, Contact + Footer

- [x] Testimonials
  - [x] `TestimonialsSection` singleton (badge, title, CTA heading / description / button label); `Testimonial` gets `status` (`pending` / `approved` / `hidden`), `source` (`visitor` / `admin`), `order`
  - [x] `GET /api/testimonials` = `{ section, testimonials }` (approved only, by `order` then newest, no `status` / `source`); `POST` always saves `pending` + `visitor`, ignores client status / source / order, own limiter (5 per 15 min)
  - [x] Idempotent seed (Figma copy; upsert by name + role, `approved` + `admin`)
  - [x] Public section (Figma 184:20705): `Avatar`, `TestimonialCard`, `QuoteMark`, squiggle + side glows, skeleton, no approved testimonials = title + CTA only, 390 / 768 / 1440
  - [x] Seamless right-to-left marquee (copies fill the width for 1 to 6 items), pause on hover / focus, tilted strip from tablet up, edge fade; entrance: badge / title rise, cards stagger, CTA last; reduced motion = scrollable row + fade
- [x] Contact + Footer + CTA unification (briefed as "Phase 7")
  - [x] Shared CTA shape `{ label, action: scroll | email | link, target }` (`ctaSchema` + `ctaRules`: target checked against action, `https://` added to links); Hero `ctaPrimary` / `ctaSecondary` use it ("Get in touch" now scrolls to `#contact`)
  - [x] `ContactSection` singleton (badge, title plain / highlight, description, primary / secondary CTA), `GET /api/contact` = `{ section }`
  - [x] Settings: `contactEmail`, `SocialLink` collection (unique platform enum of 8, normalized URL, order, max 8 active), `GET /api/settings` adds `contactEmail` + `socials`; `whatsapp` and `footer.links` removed (edited from the admin Contact page since 8.4)
  - [x] Idempotent seeds `socials` + `contact` (placeholders, TODO real URLs / email)
  - [x] `CtaButton` + `ctaLink` (scroll = `#id` smooth, email = `mailto:`, link = new tab `noopener noreferrer`, missing CTA or empty target = hidden), used by Hero and Contact
  - [x] Public section (Figma 184:20913 / 403:12558): `SocialArc` (`getArcPositions` re-distributes 0..8 icons, left `ceil(n/2)`, 12° step), inline Figma brand icons (`socialPlatforms`), icon row + small arc below `xl`, skeleton, no socials = text + buttons, no section = hidden
  - [x] Animations: arc draws from both bottom ends with a glow dot, faint arcs fade in, icons pop in sync, texts rise, side lines extend; reduced motion = fade only
  - [x] Footer (Figma 184:20959 / 403:12603): links from `NAV_LINKS`, Back Up scrolls to top
  - [ ] TODO: delete the dev `/contact-preview` route (the admin setup check for contact email + 2 socials is in 8.1)

## Phase 8: Admin dashboard (module by module)

Design: Figma admin frames (Overview, Identity, Work, Contact, Page). Desktop-first; below 1024 the sidebar becomes a drawer. Admin APIs live under `/api/admin/*` behind `requireAuth`.

- [x] 8.1 Auth + Shell + Login + Overview + Publish + Coming Soon + Page layout
  - [x] Part 1: auth module (User, admin seed, login / logout / me, JWT httpOnly cookie, `requireAuth` / `optionalAuth`), `GET /api/admin/overview`, admin shell (sidebar, topbar), Login, Overview (read-only sections), admin ComingSoon placeholder for the other links
  - [x] Part 2: `SiteStatus` singleton, publish / unpublish, `requirePublishedOrAdmin` on public content routes, public Coming Soon page, Publish button + status card + ConfirmDialog
  - [x] Part 3: `PageLayout` singleton (section order + visibility), public Home renders from it (Navbar / Footer links filtered), Overview section stack with toggles + drag reorder
- [x] 8.2 Upload + Identity
  - [x] Media library basics: `Media` collection, `POST /api/admin/media` (magic-byte check, images 5 MB, PDF 10 MB as Cloudinary `raw`), `GET /api/admin/media?kind=&search=`, seed registers the existing hero / avatar images; Overview uses the real media count
  - [x] Identity draft / publish: `IdentityDraft` (hero + `settings.avatar` / `settings.cv`), `GET / PUT /api/admin/identity`, `POST /publish` (blocked by `publishProblems`), `POST /discard`; rules shared in `shared/identity.js`; Overview "Identity complete" uses the same checklist
  - [x] Hero headline from data: title words + image spots (max 2, 6 images each, alternating tilt) + line break anchored to `{ word, occurrence }`, orphaned anchors rejected by the API; 4th highlight slot; CTA actions `cv` + Gmail compose for `email` (Hero, Contact, Coming Soon)
  - [x] Admin Identity page (Figma 538:8099 / 546:12416): autosave bar + completion, Basic info, tabs (Labels & CTAs, Headline images, Display options), Visuals, Resume, live preview with Publish changes / Discard, confirm before dropping spots of removed words
  - [x] Shared admin components: `FormField`, `Switch`, `SortableList`, `Popover`, `MediaPickerDialog`; admin API rate limit separate from the public one
- [x] 8.3 Capabilities
  - [x] Server: `SkillCategory` draft copy per group (`status`, `draft`, `publishedAt`), `/api/admin/skills` (list, create, save draft, publish / unpublish / discard, delete, order, section heading); max 4 published groups (`MAX_PUBLISHED_GROUPS`, publishing a 5th returns 400), rules in `shared/capabilities.js`
  - [x] Admin (Figma 538:9668 / 538:9991): Main Details (eyebrow, title with highlight word chips, subtitle), group cards with drag order + "N/4 live", editor with title, optional icon, sortable items (soft limit 10), status / delete
- [x] 8.4 Contact
  - [x] Server: `GET / PUT /api/admin/contact` (email in Settings, socials list replaces the stored one in order, primary + optional secondary CTA), `PUT /section`; `hasCv` for the CV note; the old Settings social CRUD is removed
  - [x] Admin (Figma 544:11559): autosave straight to the site, email card, sortable social channels (one per platform, max 8), two `CtaEditor`s, setup checklist (email, 2 socials, primary button)
- [x] 8.5 Work (adds draft / published status per item)
  - [x] Server: `Project` draft copy per item (top-level = live, `draft` = working copy), slug fixed on first publish, `/api/admin/projects` (list, create, save draft, publish / unpublish / discard, delete, drag order, section heading), publish checks in `shared/work.js`
  - [x] Content landing page (Figma 538:8640), Work list (Main Details heading form, search, drag order), Work editor (Figma 538:9228): autosave, cover, tags, Behance-like gallery drag (full / half per image), live preview (project page / home card) + full draft preview tab, status, delete
  - [x] Public project page (Figma 549:18363): overlay over the blurred home when opened from a card, standalone page for direct links; action bar (Message / Download CV / external link)
- [x] 8.6 Credentials (merges Education + Certificates)
  - [x] Server: one `Credential` collection (`kind` education / certificate / award / publication, title, issuer, date, link, note, subjects) with the per-item draft; `npm run migrate` copied the old degree + certificates (old `educations` / `certificates` collections kept, unused); public `/api/education` keeps its shape (first published Education item = degree cards, the rest = list with verification links)
  - [x] Admin (Figma 544:10339 / 544:10639): Main Details + list title, search + kind filter (drag only when unfiltered), editor with Subjects for Education items
- [x] 8.7 Testimonials moderation
  - [x] Server: `status` pending / draft / published + `source` visitor / admin; visitor submissions are stored pending (content in the draft), approve = publish, reject = delete; admin-written ones start as drafts
  - [x] Admin (Figma 544:10947 / 544:11333): Main Details + invite block, cards with Visitor / Admin tag and Approve / Reject / Publish / Draft / Delete, editor with round avatar and "Approve & publish" for pending
- [x] 8.8 Page module extras (rename public section labels)
  - [x] `PageLayout` `navLabel` per section (empty = default, max 24), public `/api/page` adds `navLabels`; `GET /api/admin/page` = sections with public heading + `hasContent` and `problems` (empty visible sections, buttons scrolling to missing / hidden sections)
  - [x] Admin (Figma 546:16219): hero card, section stack with drag + up / down + visibility + navbar label, live page health (visible / warnings, Preview homepage in a new tab), publish validation with links to the module to fix
  - [x] Public: navbar / footer use the saved labels, section subtitles (Skills, Education, Testimonials), testimonial photos, credential verification links
- [x] 8.9 Settings + SEO + editing the coming-soon content and image
  - [x] Server: `GET /api/admin/settings` + `PUT /general | /seo | /coming-soon` (each returns the full state), `/api/admin/account` (profile name / title / avatar, email, password with current-password check, strict limiter, older sessions rejected via `passwordChangedAt`)
  - [x] Public SEO: `GET /api/seo?path=` (head tags + status, 404 for unknown projects), `sitemap.xml`, `robots.txt`; tags rendered by `shared/seo.js` and swapped per route by the client
  - [x] Admin: tabs General (site name / URL, profile photo shown in the sidebar, contact email, footer), SEO (counters, OG image, Search Console code, favicon, search + social previews, checklist), Coming soon (content, image, preview link), Account (email, password)
  - [x] Delivery: Vite plugin injects the head in dev; Vercel Routing Middleware (`client/middleware.js`) in production; `vercel.json` rewrites `/api`, `/sitemap.xml`, `/robots.txt` to Heroku; default favicons from the round logo; Lighthouse SEO / Accessibility / Best practices 100
- [x] 8.10 Media library (full page + delete; upload / list / picker done in 8.2)
  - [x] Folders in the picker: nested folders (3 levels), create / rename / move / delete (contents move up), move selected items, search inside a folder, upload into the open folder; Arabic file names fixed
  - [x] `/admin/media` (sidebar + Content tile): Images / PDFs, the picker's browser (`MediaBrowser`, shared with `MediaPickerDialog`) with multi-select, open / copy link, delete
  - [x] `DELETE /api/admin/media` (`ids`): 409 with `[{ id, name, usedIn }]` when a file is still used anywhere on the site (nothing deleted), else removed from Cloudinary + the library

## Phase 9: Later

- [x] Project details page (done in 8.5: overlay + standalone `/projects/:slug`)
- [x] Polish round
  - [x] Upload many images / files at once (media picker, gallery, headline images)
  - [x] Hero headline images swap instantly; seconds per image set in Identity (`headline.interval`)
  - [x] Project cards: 1-line title, 2-line summary, bigger row cards; description limit 1000
  - [x] All projects page `/projects` (`?scope=all`, SEO + sitemap) with an end tile and side arrow from the home row; project page is an opaque overlay over the page it was opened from
  - [x] Download CV opens the file and saves it to the device
  - [x] Hugeicons picker for hero skill tags and capability group icons (image upload still available)
  - [x] Testimonials: side fade removed
- [ ] Messages inbox

## Phase 10: Production

- [ ] Responsive pass
- [ ] Accessibility
- [x] SEO (8.9)
- [ ] Performance (hero bundle size, image sizes)
- [ ] Deploy: everything on Vercel (site + API function) + MongoDB Atlas
  - [x] Moved off Heroku: direct browser uploads to Cloudinary (signed), security rate limits in MongoDB, `client/api/index.js` function + `vercel.json` routes
  - [x] Cloudinary Settings > Security: allow PDF delivery (the CV link returns 200, shared account)
  - [ ] New Vercel project for this copy (root `client`), env vars `MONGODB_URI` (`/yousseframadan`), `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLOUDINARY_*`, `CLOUDINARY_FOLDER=yousseframadan`
  - [ ] After the first deploy: Settings > General > Site URL = the production domain, then submit `/sitemap.xml` in Search Console

## Youssef copy

- [x] Copied from the Muhamed portfolio: own database `/yousseframadan`, own Cloudinary root folder (`CLOUDINARY_FOLDER`)
- [x] Site-wide brand color in Settings > General (default `#35d0ba`, runtime CSS variables + no-flash cache)
- [x] Decor and cursor follow the brand color (`BrandTint`, `currentColor`, `--cursor-arrow`)
- [x] Several education items (card label + optional photo, e.g. the ITI diploma)
- [x] Seeded from Figma 616:13834; projects copied from the Muhamed database with their images re-uploaded to `yousseframadan/projects`
- [ ] Admin account: fill `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env`, then `npm run seed:admin -w server`
- [ ] Real contact email, LinkedIn and social URLs (placeholders in the seed)
