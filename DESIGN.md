# MediSaar — Design System & Frontend Blueprint
*Editorial healthcare. Clinical intelligence with empathy.*

> **The one-line product feel:** *Apple Health's calm + Notion's structure + Linear's craft + a New Yorker article's typography.*
> Never enterprise software. Never hospital ERP. Never sterile.

---

## 1 · Design Direction

### Core principle
**Editorial confidence, clinical calm.** Every screen should feel like a thoughtfully designed article, not a database admin panel. The product earns trust the same way the pitch deck does — through restraint, generous whitespace, and storytelling typography, not through density or chrome.

### Three design promises
1. **The patient is a person, not a row.** No screen reduces a patient to a table row without their name, face, and one piece of human context (age, last visit, condition) on the same line.
2. **The AI announces itself, gently.** Every AI-generated artifact (summary, emergency card, suggestion) is visually marked with the amber accent and a small "AI" tag — never blended invisibly with verified records. Trust comes from transparency.
3. **Density is earned.** Tables and dense data exist only where the doctor explicitly needs them (e.g. lab values over time). Default views breathe.

### What we are not
- Not a hospital ERP — no toolbars, no ribboned menus, no five-color status pills.
- Not a healthtech consumer app — no playful illustrations of organs, no gamification, no streaks.
- Not a chatbot interface — the AI lives inside artifacts (summary cards, timelines), not a chat window.

---

## 2 · Moodboard / Visual Language

### Reference distillation
- **HealthRate (Image 5)** → editorial typography, generous whitespace, asymmetric grids, a single confident accent color, big number-led metric cards
- **Mediso (Image 2)** → warm sidebar treatment, soft data viz, friendly card density, sage-green sidebar accent
- **Linear** → motion restraint, keyboard-first interactions, microcopy precision
- **Notion** → modular content blocks, generous padding, calm hover states
- **Apple Health** → human-readable health language, gentle reveals, calm color shifts for state

### Reference rejections (and why)
- VitalHealth / generic admin dashboards → too sterile, too "SaaS template," no editorial soul
- Bright multi-color healthcare apps (Image 4) → reads as consumer wellness, not clinical
- Glassmorphism / dark-mode-first healthcare dashboards → undermines trust, hides AI signals
- Purple-to-blue gradients → already a banned design pattern in your system; would also clash with sage

### Visual mood words
*Calm · Considered · Generous · Editorial · Earnest · Quietly intelligent · Warm without being soft*

---

## 3 · Design System (Tokens)

### 3.1 Color

A two-temperature system: **warm neutrals** carry the product, **sage** carries the brand, **amber** marks AI and urgency.

```css
:root {
  /* Surfaces — warm neutrals, never pure white */
  --bg-canvas:        #FBF7F0;  /* page background, warm cream */
  --bg-surface:       #FFFCF5;  /* elevated cards, near-white-cream */
  --bg-surface-sunk:  #F4EFE4;  /* sunken sections (e.g. timeline rail) */
  --bg-overlay:       rgba(19, 49, 46, 0.04);  /* hover wash */

  /* Sage — primary brand */
  --sage-50:   #EEF3EC;
  --sage-100:  #DCE8DC;
  --sage-200:  #B8D0B9;
  --sage-400:  #7A9B7E;
  --sage-600:  #4F7A55;   /* primary actions */
  --sage-800:  #2E5D3F;   /* headings, borders */
  --sage-900:  #1F3F2C;

  /* Ink — text */
  --ink-900:   #13312E;   /* primary text, never #000 */
  --ink-700:   #2F4944;
  --ink-500:   #5E726E;   /* secondary text */
  --ink-300:   #97A6A2;   /* tertiary, meta */

  /* Amber — AI-generated content + urgency.  Use sparingly. */
  --amber-50:   #FBF0DC;
  --amber-500:  #E0902C;  /* AI artifact accent */
  --amber-700:  #A86615;  /* emergency-card accent */

  /* Status (use only where state truly needs to be communicated) */
  --status-ok:     #3F8F5B;
  --status-warn:   #C7872A;
  --status-alert:  #C2453D;   /* emergencies, allergies, drug interactions */
  --status-info:   #4A7A8F;   /* never electric blue */
}
```

**Usage rules**
- **80% of pixels:** `--bg-canvas`, `--bg-surface`, `--ink-900`, `--ink-500`.
- **15% of pixels:** sage tones for hierarchy, borders, primary action.
- **5% of pixels:** amber accents — *only* on AI summary cards, emergency cards, and the live AI streaming indicator. If amber is everywhere, it means nothing.
- Never pure white (`#FFFFFF`), never pure black (`#000000`). Both feel clinical-cold.
- Status red is for genuine clinical alerts only — never for form validation. Use `--status-warn` (amber-leaning) for validation.

### 3.2 Typography

Two faces, three sizes per role. Editorial headlines + utilitarian body.

```css
:root {
  /* Type families */
  --font-serif:  "Fraunces", "Source Serif Pro", Georgia, serif;
  --font-sans:   "Inter", "SF Pro Text", system-ui, sans-serif;
  --font-mono:   "JetBrains Mono", ui-monospace, monospace;
}
```

| Role | Face | Size | Weight | Tracking | Where |
|---|---|---|---|---|---|
| Display | Fraunces | 56 / 72px | 600 | -0.02em | Landing hero, dashboard greeting |
| H1 | Fraunces | 36 / 44px | 600 | -0.015em | Section heads, patient name |
| H2 | Fraunces | 28 / 36px | 600 | -0.01em | Card titles, slide-style breaks |
| H3 | Inter | 18 / 24px | 600 | 0 | Sub-sections |
| Body L | Inter | 16 / 24px | 400 | 0 | Default reading |
| Body | Inter | 14 / 22px | 400 | 0 | Dense areas |
| Meta | Inter | 12 / 18px | 500 | 0.04em uppercase | Labels, eyebrow tags |
| Number | Fraunces | varies | 600 | -0.02em | Metric cards (60s, 32%, 84Cr) |

**Rationale**
- **Fraunces** (a contemporary humanist serif) is what gives the deck its New-Yorker-article feel. It must carry through into the product or the editorial soul dies at login. Use it for *display, headings, and large numbers only.*
- **Inter** for everything readable. Tight body, dense data, UI chrome.
- Numbers in serif (Fraunces) make impact metrics feel weighted and editorial, not enterprise.
- Meta labels are uppercase tracked — they're "tags," not headings. This is how HealthRate gets that editorial chrome.

**Hard rules**
- Body never below 14px (accessibility + a calm visual rhythm).
- Line-height generous: 1.5 for body, 1.2 for display.
- Never bold a serif heading further — the weight is already in the face. Use italic or color instead.

### 3.3 Grid & Spacing

Mobile-first, 8-point system.

```
Space scale:  4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128
Container max-width: 1280px (landing), 1440px (dashboard)
Gutter: 24px mobile, 32px tablet, 40px desktop
Section vertical rhythm: 96px (landing), 48px (dashboard)
```

**Editorial spacing rule:** every major section on the landing page must have at least 96px vertical breathing room above and below. Dashboards halve this to 48px but never go below.

### 3.4 Radius

```
--radius-xs:  6px    /* tags, inline pills */
--radius-sm:  10px   /* inputs, small buttons */
--radius-md:  14px   /* cards, modals */
--radius-lg:  20px   /* hero panels, large cards */
--radius-xl:  28px   /* feature blocks, illustration containers */
```

Radius is consistent: rounded but not pill-shaped. No `border-radius: 9999px` except on profile avatars and status dots. Pill buttons read as consumer-app; we want editorial-confident.

### 3.5 Elevation & Shadows

Two shadow tokens only. Restraint is the brand.

```css
--shadow-soft: 0 1px 2px rgba(19, 49, 46, 0.04),
               0 4px 12px rgba(19, 49, 46, 0.04);

--shadow-lift: 0 4px 8px rgba(19, 49, 46, 0.05),
               0 16px 32px rgba(19, 49, 46, 0.06);
```

- `--shadow-soft` for resting cards
- `--shadow-lift` for hover, modals, dropdowns
- No glow, no inner shadow, no colored shadow

### 3.6 Iconography

- **Library:** Lucide React (you're already using ShadCN — it bundles Lucide). Don't mix icon sets.
- **Stroke weight:** 1.5px standard, 2px for primary actions. Never filled icons except for play/pause-style toggles.
- **Size scale:** 16 / 20 / 24px. 16px inline with body, 20px in buttons, 24px in card headers.
- **Color:** inherits text color by default. Sage-600 for primary action icons. Amber-500 only for AI/emergency contexts.

### 3.7 Illustration Style

The deck's illustrations (Mr. Sharma, the doctor-with-tablet, the closing vision) define a specific style — **flat vector, warm palette, rounded shapes, hand-drawn humanity.** Use them for:
- Landing page hero, problem section, vision section
- Dashboard empty states ("No records uploaded yet")
- Onboarding flows

**Do not** use them inside dense product surfaces (lists, tables, the doctor's day-to-day). There, switch to clean Lucide icons.

**Rule:** every illustrated scene must have *at least one person of South Asian appearance* and must show no medical gore, no anxiety-inducing imagery. Calm humans, ordinary clothing, warm light.

### 3.8 Card Patterns

Four card archetypes. Everything else is a variation.

1. **Editorial card** — large, generous padding (32–48px), serif heading, soft shadow. Used for AI summary, hero metrics, important moments.
2. **Record card** — utilitarian, dense, 16–24px padding, Inter throughout. Used for prescriptions, reports, timeline events.
3. **Data card** — for metrics; large serif number, small uppercase label below.
4. **Emergency card** — sage border-left 4px, amber-50 background tint, deep forest text. Visually unique and unmistakable. Appears only when emergency mode is active.

---

## 4 · Landing Page Blueprint

The landing page is the deck made interactive. Same story, same beats, deeper. Scroll = pitch progression.

### Section 1 — Hero
**Layout:** 60/40 split. Left: editorial headline, sub, two CTAs. Right: the deck's "doctor + elderly patient with tablet" illustration.
**Content positioning:**
- Eyebrow tag: `MEDISAAR · CLINICAL INTELLIGENCE LAYER`
- Display headline (Fraunces 72px): *"Years of scattered records. One clinical truth. In 60 seconds."*
- Sub (Inter 18px): One sentence on what it does, plain language.
- Primary CTA: `Try the demo`. Secondary: `For hospitals`.
- Below the fold edge: a single statistic chip — *"32% of transferred patients receive a duplicate test."*
**Motion:** Headline fades up in 300ms on load, illustration slides in 80px from right 400ms after. Nothing else moves until scroll.
**Visual treatment:** Background `--bg-canvas`. Illustration sits on a `--sage-50` rounded rectangle (radius-xl) as if framed.

### Section 2 — Problem story (Mr. Sharma)
**Layout:** Full-width, 50/50. Left: long-form editorial prose. Right: the Mr. Sharma drowning-in-records illustration, slightly larger than text column.
**Component hierarchy:**
- H1 serif: *"Meet Mr. Sharma. 58, diabetic, four hospitals in six years."*
- Two short paragraphs of body-L text. Treat this like a magazine opening.
- Three small inline data callouts inside the prose (the "fragmented / unreadable / repeated" trio) — these are tiny editorial pull quotes with sage-left border, not boxed cards.
**Motion:** As section enters viewport, the three callouts fade in sequentially (200ms apart). The illustration has a subtle 4px parallax on scroll — *nothing more*.
**Visual treatment:** `--bg-surface-sunk` background to feel like a "story chapter" set apart.

### Section 3 — Why fragmented records matter
**Layout:** Centered headline, then a 2×2 grid of editorial cards (Patient Safety, Emergency Blind Spots, Financial Burden, National Opportunity Missed).
**Component hierarchy:** Each card uses serif H2 + body. No icons in these cards — too "feature grid." Stay editorial.
**Motion:** Cards stagger-fade-up on scroll (60ms apart, 200ms each).
**Visual treatment:** `--bg-canvas`. The National Opportunity card is visually distinct — sage-50 fill, includes the "84 crore ABHA" number in large serif.

### Section 4 — How MediSaar works
**Layout:** Single horizontal flow, 5 connected steps (Upload → OCR → Embed → RAG → Summarize). On desktop, a left-to-right ribbon. On mobile, vertical stack.
**Component hierarchy:** Each step is a circle (the deck's existing visual) + step number + short label + one-sentence description.
**Motion:** As the user scrolls, the connecting line draws itself across the steps (SVG stroke animation). Each circle scales from 0.95 → 1 as it crosses center viewport.
**Visual treatment:** Pull this directly from your deck — the 5-circle ribbon is already a strong visual. Just bring it onto canvas with breathing room.

### Section 5 — Product showcase
**Layout:** Tabbed product preview. Three tabs: *Doctor view · Patient view · Receptionist view.* Each shows a real product screenshot inside a soft device frame.
**Component hierarchy:** Tab strip at top (Inter Meta uppercase), then a single screenshot on a `--sage-50` ground.
**Motion:** Tab change cross-fades the screenshot (180ms). No flashy carousel.
**Visual treatment:** Screenshots are real, not mockups. If MVP isn't far enough along, use realistic Figma exports — but commit to making them look like the product, not slideware.

### Section 6 — Clinical intelligence features
**Layout:** Asymmetric editorial grid. One large feature (AI Summary) takes 2/3 width; three smaller features fill the remaining column (Timeline, Emergency Mode, Source Traceability).
**Component hierarchy:** Big card = editorial card with serif H2 + a live mini-demo (animated typing of a summary). Smaller cards = standard editorial cards.
**Motion:** The "live summary typing" animation runs once on viewport entry; can re-trigger on hover. Use a soft amber cursor blink to signal AI.
**Visual treatment:** This is where amber appears for the first time, intentionally, to mark the AI moment.

### Section 7 — AI workflow visualization
**Layout:** Full-width. The deck's RAG workflow diagram — but redrawn natively in SVG so it's interactive and matches the system perfectly.
**Component hierarchy:** Hover any stage → tooltip explains it in plain language. Click any stage → expands inline with technical detail (for technical readers).
**Motion:** Subtle "data flowing through pipes" animation — a small sage dot travels along the connecting paths every 4 seconds. Resists feeling busy because it's slow and single.
**Visual treatment:** Replace the multi-colored existing diagram with one that uses only sage tones + amber for the LLM/output stage.

### Section 8 — Technology overview
**Layout:** A clean editorial table. Two columns: layer name / technology.
**Component hierarchy:** No icons, no logos, no pills. Just type. This is where you signal *engineering seriousness* by treating tech as readable, not decorative.
**Motion:** None. This is a deliberately quiet section.
**Visual treatment:** Hairline sage borders between rows. The architecture diagram from your deck (recolored to sage) sits to the right.

### Section 9 — Impact metrics
**Layout:** Four metrics in a row, large serif numbers (60s / 32% / 84Cr / 16K+). On mobile, 2×2.
**Component hierarchy:** Number in Fraunces 72px, uppercase meta label below, one-line context underneath.
**Motion:** Numbers count up from zero when entering viewport (single 800ms ease-out, no bounce).
**Visual treatment:** Each metric sits inside a `--bg-surface` card with `--shadow-soft`.

### Section 10 — Future vision
**Layout:** 40/60 split, illustration left (the deck's closing vision illustration), text right.
**Component hierarchy:** H1 serif: *"From record-keeper to national health infrastructure."* Three stage cards stacked below (Record-Keeper → Clinical Co-Pilot → National Infrastructure).
**Motion:** Subtle stage-card stagger entry.
**Visual treatment:** Closing-deck-quote style — pull the *"India built the highway…"* quote into a large italic Fraunces blockquote with a sage-left border.

### Section 11 — Final CTA
**Layout:** Full-width, centered, generous vertical padding (160px both sides).
**Component hierarchy:** H1 serif headline (*"Ready to see what 60 seconds looks like?"*), two CTAs (Try the demo / Talk to us), and footer beneath.
**Motion:** None — the page ends quiet. Let the user breathe before they click.
**Visual treatment:** `--sage-50` background to signal "you've arrived at the end of the story."

---

## 5 · Dashboard Information Architecture

### 5.1 Global navigation pattern

**Decision:** Vertical sidebar (collapsible on mobile to a top bar). Justified because:
- Doctor and admin roles have deep navigation (8–10 items) — a top nav would crowd
- Sidebar matches Linear / Notion mental model — our north star
- A sidebar reads as "workspace," not "consumer app"

**Sidebar structure (Doctor role):**
```
─ Logo (MediSaar wordmark, Fraunces)
─ Global search (⌘K)
─────────────
TODAY
  ─ Dashboard
  ─ Today's patients
  ─ Pending reviews
PATIENTS
  ─ All patients
  ─ Recently seen
  ─ Starred
WORK
  ─ Drafts
  ─ My notes
─────────────
─ Profile / settings (bottom)
```

### 5.2 Per-role IA

**Doctor dashboard** (the hero role — design this first)
- *Today view* (default): today's patients, pending AI summaries, recent activity
- *Patient detail*: timeline (default tab) · AI summary · medications · diagnostics · documents · notes
- *Emergency card*: one-tap, prints/exports as a single page
- *Search*: ⌘K opens a global patient/record search overlay

**Patient dashboard**
- *My health* (default): personal timeline + active medications + next appointment
- *Records*: all uploaded documents, filterable by hospital + type
- *Summaries*: short, detailed, emergency — patient-friendly language
- *Share*: generate consent-based access links for any doctor or hospital
- *Insights*: gentle health trend cards (e.g. "Your HbA1c improved over the last 6 months")

**Receptionist dashboard**
- *Upload queue*: drag-and-drop zone + queue with OCR status indicators
- *Verify*: documents where OCR confidence is low and a human needs to confirm
- *Today's appointments*
- *Quick patient search* (no deep clinical access)

**Admin dashboard**
- *Overview*: institution-level metrics (uploads / week, time-to-summary, doctors active)
- *Users*: role management
- *Hospitals & departments*: org structure
- *System*: integrations, audit logs, ABDM connection status

### 5.3 Wireframe descriptions for key screens

**Doctor — Today view**
- Top: warm greeting line (*"Good morning, Dr. Mehta."*) in Fraunces 36px, with the date in meta tracking below
- Below: a single editorial card called *"Up next"* showing the next patient's name, age, condition, time of appointment, and a one-line AI snippet pulled from their existing summary
- Right column: a calm activity feed (last 5 patients seen, with thumbnail of their condition tag)
- No charts. No bed counts. No KPIs the doctor doesn't care about.

**Doctor — Patient detail (the heart of the product)**
- Top: patient name in Fraunces H1, age + blood group + one critical-allergy chip beside it
- Beneath: a horizontal tab strip (Timeline · Summary · Medications · Diagnostics · Documents · Notes), Linear-style underline tab
- *Default tab is Timeline* — a vertical scroll of events, grouped by year, each event a record card with: date, hospital, document type, one-line content, source-link icon
- Floating right rail (sticky): an always-visible *AI Summary card* in amber-marked editorial style, with a "Switch to Emergency Mode" toggle at the top
- Bottom right floating button: a quiet *"Ask about this patient"* RAG-search input (calm, not Clippy)

**Doctor — Emergency mode (one-tap from any patient page)**
- Fullscreen takeover. Background warms slightly amber-tinted.
- Single editorial card centered, ~600px wide, with patient name, age, photo
- Three sections in order: ALLERGIES (red bullets) · CURRENT MEDICATIONS · CHRONIC CONDITIONS
- "Print" and "Share" buttons. Nothing else on screen. This is a life-saving artifact and must read in 5 seconds.

**Patient — My health**
- Hero: *"Your health, in one place."* (Fraunces 44px)
- Below: an editorial-styled timeline of the patient's own life events — diagnoses, procedures, prescriptions — written in human language, not clinical jargon
- Right rail: active medications card, next appointment card, share-with-doctor button
- Bottom: gentle insights ("You haven't had a blood pressure reading in 8 months — would you like to add one?")

**Receptionist — Upload queue**
- Full-width drag-and-drop zone at top, with a *"Drop prescriptions, lab reports, discharge summaries"* prompt
- Below: queue list. Each row: file thumbnail, OCR confidence bar (sage if high, amber if needs review), extracted patient name (auto-matched or "Unmatched — assign"), and an action button
- Single primary CTA: *"Send to patient timeline"*

---

## 6 · Component Library (ShadCN extensions)

Build on ShadCN. Override its defaults to match the system. Here's the minimum set with overrides:

| Component | Base | MediSaar override |
|---|---|---|
| `Button` (primary) | ShadCN | Sage-600 bg, white text, radius-sm, no shadow, hover sage-800 |
| `Button` (secondary) | ShadCN | Transparent, sage-800 border 1px, sage-800 text |
| `Button` (ghost) | ShadCN | Just text + sage-50 hover |
| `Card` | ShadCN | bg-surface, shadow-soft, radius-md, p-6 |
| `EditorialCard` | New | bg-surface, shadow-soft, radius-lg, p-10, Fraunces title |
| `AISummaryCard` | New | bg-surface, amber-500 left-border 3px, "AI" tag top-right |
| `EmergencyCard` | New | bg-amber-50, amber-700 text, radius-lg |
| `RecordCard` | New | bg-surface, radius-sm, hover lift, inline icon for source |
| `Timeline` | New | Vertical rail (bg-surface-sunk), year groupings in Fraunces |
| `Tabs` | ShadCN | Linear-style underline, no pill background |
| `Input` / `Textarea` | ShadCN | bg-bg-canvas, sage-200 border, focus sage-600 ring (no glow) |
| `Tag` / `Badge` | ShadCN | Sage-50 fill, sage-800 text, uppercase 11px tracked |
| `Toast` | ShadCN | Bottom-right, bg-surface, shadow-lift, no color bar |
| `Dialog` | ShadCN | radius-lg, max-w-lg, overlay = ink-900 / 30% |
| `Avatar` | ShadCN | Circle, sage-100 fallback, Fraunces initials |
| `MetricNumber` | New | Fraunces, 56–72px, sage-800, with meta label below |
| `SourceLink` | New | Tiny pill that says "source" + hover-reveals the original document |

### "AI" tag treatment (used everywhere AI generated something)
```
[ AI · GENERATED 12:04 PM ]
```
Uppercase Inter 11px, amber-500 color, no background — sits at the top-right of any AI artifact. Always paired with a `SourceLink` below the content. This is the trust signal that defines the product.

---

## 7 · Motion System

**Philosophy:** motion is for *orientation*, never *delight*. Linear-grade restraint.

```
Duration tokens
  --motion-quick:   140ms   /* hover, focus */
  --motion-base:    220ms   /* tab change, card reveal */
  --motion-deep:    360ms   /* modal, route transition */

Easing tokens
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1)    /* default */
  --ease-in:     cubic-bezier(0.4, 0, 1, 1)
  --ease-spring: cubic-bezier(0.34, 1.2, 0.64, 1) /* USE SPARINGLY */
```

**Banned motion**
- Bounce / elastic easing on UI (per your global preferences)
- Parallax beyond 8px
- Auto-playing carousels
- "AI thinking" three-dot loaders that look like chatbots — instead use a calm amber line that shimmers once across the card

**Page transitions:** none on dashboard route changes. Instant. Linear-style.
**AI streaming animation:** as the summary types itself, an amber underline-cursor blinks. After completion, the cursor fades out over 400ms.
**Empty states:** illustration fades in once, no looping animation.

---

## 8 · Accessibility

- **Contrast:** all body text minimum 4.5:1 against background. Verify `--ink-500` on `--bg-canvas` (≈4.7:1 ✓).
- **Focus rings:** visible 2px sage-600 ring with 2px offset on every interactive element. Never `outline: none` without a replacement.
- **Type minimum:** 14px body, 12px for meta labels only (with sufficient weight).
- **Color is never the only signal:** emergency state pairs amber color + bold serif + explicit label *"Emergency"*. Status pills always have an icon + text, not just a color dot.
- **Keyboard:** ⌘K opens global search, Esc closes any modal or overlay, Tab order follows visual order on every screen. Doctor patient-detail page is fully navigable without a mouse.
- **Screen readers:** every AI-generated artifact has an `aria-label` that announces "AI-generated summary, last updated [time], based on [N] source records."
- **Motion preferences:** respect `prefers-reduced-motion` — disable typing animation, count-up, and all entrance animations. Keep only opacity changes.
- **Language:** support English first, Hindi second (your audience). All clinical terms have a tooltip with plain-language explanation in the patient dashboard.

---

## 9 · Frontend Architecture Recommendations

You're on Next.js 15 + TypeScript + Tailwind + ShadCN. Good choice — don't change it. Here's how to scale it for MediSaar's specific shape:

### 9.1 Folder structure
```
/app
  /(marketing)         ← landing page routes
    /page.tsx
    /sections/         ← one component per landing section
  /(app)               ← authenticated dashboard
    /doctor
    /patient
    /reception
    /admin
    /layout.tsx        ← sidebar + top nav shell
  /api                 ← Next.js route handlers (auth, uploads, AI proxy)

/components
  /ui                  ← ShadCN primitives, overridden
  /editorial           ← MediSaar's editorial primitives (EditorialCard, AISummaryCard, etc.)
  /clinical            ← Domain components (Timeline, EmergencyCard, MedicationTracker)
  /illustrations       ← SVG illustrations, one per file

/lib
  /design-tokens.ts    ← exports CSS variables as TS constants
  /ai                  ← AI service client (FastAPI calls)
  /db                  ← MongoDB/Mongoose helpers

/styles
  /globals.css         ← Tailwind base + CSS variables
  /typography.css      ← Fraunces & Inter setup
```

### 9.2 Tailwind config snippet
Extend Tailwind with your tokens so you can use `bg-sage-600`, `text-ink-900`, `font-serif`, etc. directly. Don't sprinkle hex codes through JSX — read from theme. This is the single biggest mistake teams make on design-system fidelity.

### 9.3 State management
- **Server state (records, summaries, patients):** React Query (TanStack Query). It already integrates well with FastAPI.
- **UI state (sidebar open, current tab, search overlay):** local React state. No Redux.
- **Auth + role:** Clerk's React hooks (or JWT context, per your deck stack). One auth provider, no duplication.

### 9.4 AI streaming
Use Server-Sent Events from FastAPI for the AI summary typing effect. Don't poll. The streaming experience *is* a product feature — when the doctor watches the summary write itself, the "trust by transparency" promise becomes visible.

### 9.5 Performance budget
- Landing page LCP under 2s on 3G simulated. Inter and Fraunces both preloaded (`<link rel="preload">`).
- Dashboard route change under 200ms (no full-page transitions).
- AI summary first-token under 1.5s after click — if longer, show the amber shimmer.
- Bundle ShadCN components on-demand via tree-shaking; don't import the whole library.

### 9.6 Mobile-first non-negotiables
- The doctor's patient-detail view *must* work on a phone — Indian doctors use phones in OPDs more than laptops.
- Emergency Mode card is mobile-first: fits one screen, prints to A6, shareable as PDF.
- Sidebar collapses to a top bar with ⌘K search prominent.

---

## 10 · Implementation Notes (the part most teams skip)

### 10.1 What to build first (priority order)
1. **Design tokens + Tailwind setup + Fraunces/Inter loaded.** Without this, every other piece will drift.
2. **The four editorial primitives:** `EditorialCard`, `AISummaryCard`, `EmergencyCard`, `RecordCard`. These four components carry 70% of the visual identity.
3. **The Doctor patient-detail page.** It's the hero screen and the most-demoed surface. Build it before the landing page.
4. **The Emergency Mode artifact.** It's the moment that wins the pitch. Build it polished.
5. **The landing page hero + Mr. Sharma section.** Enough to drive traffic. The rest of the landing page can ship in waves.

### 10.2 Hard rules to commit to in code review
- No hex colors in JSX. Tailwind tokens only.
- No raw px font sizes — always typography utility classes.
- Every AI artifact passes through `<AISummaryCard>` or equivalent. No exceptions.
- Every loading state, error state, and empty state is designed — never default browser/library states.
- Mobile breakpoint tested before merge for any patient-facing surface.

### 10.3 Things to deliberately not do (yet)
- Dark mode. Healthcare trust requires light. Revisit only after PMF.
- A chatbot interface. The AI lives inside artifacts, not a conversation pane.
- A patient mobile app. Web-first, responsive-first.
- Heavy charting libraries. If you need a chart, use Recharts and style it minimally; one chart per dashboard page max.

### 10.4 Cohesion test
At any point, take a screenshot of the dashboard and a slide from the deck and put them side by side. If a non-technical viewer can tell they're from the same product without seeing a logo, you're winning. If the dashboard looks like a template, stop and refactor.

---

## Closing thought

The hardest part of this project is not building it — it's *not letting the dashboard slip into generic admin-template territory* when feature pressure mounts in week three. The reason most healthcare products look the same is that nobody defends the editorial soul once engineering velocity becomes the priority.

The defenses are: **a strict design system, a small primitive component set, a tokens-only Tailwind setup, and one named owner (you) who reviews every PR for cohesion.** Everything in this document exists to make that defense cheap and automatic.

If MediSaar's product feels like a New Yorker article that happens to be a medical record, you've done it right.