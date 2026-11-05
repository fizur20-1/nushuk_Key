# Nushuk Key Collector — implementation plan

## Product scope

A public, single-page Umrah Nushuk key registry. A visitor enters a key, submits it, and receives clear feedback. Keys are stored in the managed MySQL database and rejected atomically when the same normalized key already exists. The first-page recent list shows the full submitted key with a one-tap copy action so other visitors can use it easily.

## Implementation approach

- **Frontend:** React + TypeScript in the existing Vite client, using the existing tRPC provider and lucide-react icons.
- **Backend:** Add a public `registry` tRPC router with `stats`, paginated `recent`, and `add` procedures. Normalize submitted keys server-side by trimming and uppercasing; validate length and allowed characters before insert. The paginated recent procedure returns five full normalized keys per page plus total counts/pages because the user explicitly wants them copyable on the public page.
- **Persistence:** Add a `nushukKeys` Drizzle table with an indexed unique normalized key, creation timestamp, and a short generated public reference. Handle duplicate insert errors as a distinct `CONFLICT` tRPC error so the UI can show a specific duplicate message.
- **Layout:** Keep the supplied prompt's calm sage editorial hero: left copy and action, central hand/key visual made from CSS/SVG (no external asset dependency), and a right-side live collection panel. The key replaces the smart ring as the visual focal point. The key input and full copyable list are inside this first-screen panel; the separate “last added” and “duplicate guard” cards are intentionally omitted.
- **Responsive behavior:** Desktop uses three zones; tablet compresses the zones; portrait stacks copy, form/cards, and hero visual. Navigation folds into an accessible menu on compact widths.
- **Motion:** Staggered entrance animation and subtle key shimmer/orbit, disabled under `prefers-reduced-motion`.
- **Routes:** The single-page app exposes `/` and `/404` in `public/manus-routes.json`.

## Design direction

### Alternatives considered

1. **Sunlit editorial sanctuary** — 0.07: a quiet, tactile registry that feels like a keepsake card.
2. **Pilgrim field notebook** — 0.06: utilitarian paper textures and stamped controls.
3. **Desert night archive** — 0.05: dark indigo with luminous amber data markers.

### Chosen movement: Sunlit editorial sanctuary

- **Core principles:** calm trust, tactile clarity, generous air, visible reciprocity.
- **Color philosophy:** pale sage is the shared ground; deep forest ink gives the utility layer authority; muted olive-gold marks the key and confirmed states without looking promotional.
- **Layout paradigm:** an asymmetrical editorial spread with a visual “key line” running from the hero object to the submission action, rather than a centered dashboard grid.
- **Signature elements:** a brass key floating inside a thin glass orbit, leaf-like shadow shapes on the sage wall, and frosted glass registry cards with hairline borders.
- **Interaction philosophy:** submitting a key should feel like placing a small trust token into a shared collection—short, direct, and reassuring. Duplicate feedback should explain that the registry already has it, not scold the visitor.
- **Animation:** slow, low-amplitude drift and a brief key glint; entrance elements settle upward in sequence; all non-essential motion stops for reduced-motion users.
- **Typography:** use a geometric system sans stack for utility and copy, with a light serif-like display fallback for the large headline to carry the editorial tone without requiring remote fonts.
- **Brand essence:** “A shared place to leave your Nushuk key, without repeats.” Personality: reverent, clear, communal.
- **Brand voice:** concise and warm. Example lines: “Leave one key. Keep the circle clear.” / “Already in the collection — thank you for checking.”
- **Wordmark & logo:** a six-petal dashed seal with a small key notch, paired with the “Nushuk Key” wordmark.
- **Signature brand color:** `#A58B45`, a warm olive brass used only for the key, highlights, and successful states.

## Project structure

- `client/src/pages/Home.tsx` — page composition, registry query/mutation wiring, responsive nav and form state.
- `client/src/index.css` — full visual system, hero scene, responsive rules, and motion.
- `drizzle/schema.ts` — `nushukKeys` table and inferred types.
- `server/db.ts` — key insert, stats, and recent masked records.
- `server/routers.ts` — public registry procedures and duplicate error mapping.
- `client/public/manus-routes.json` — route manifest for the single-page site.
- `plan.md` / `TODO.md` — design, implementation, and outcome tracking.

## Infrastructure and serving

Use the already-enabled managed server and managed database. The existing `pnpm dev` server serves the React app and tRPC endpoint on port 3000. The existing Dockerfile/health route remain the deployment contract. No authentication is required for public key submission; the registry's uniqueness guarantee is enforced in the database.
