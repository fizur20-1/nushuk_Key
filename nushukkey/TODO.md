# Nushuk Key Collector — TODO

- [x] **Shared key registry and duplicate prevention**
  - Visitors can submit a Nushuk key into a shared registry.
  - Submitted keys are normalized server-side and stored in the managed database.
  - The database enforces uniqueness atomically so duplicate keys are rejected reliably, including concurrent submissions.
  - Duplicate submissions return clear, non-destructive feedback explaining that the key is already in the collection.
  - Evidence: `drizzle/0001_sloppy_swordsman.sql` creates the unique `normalizedKey` constraint; `server/routers.ts` maps duplicate inserts to a `CONFLICT` response.

- [x] **Purpose-led landing hero**
  - The single-page landing experience immediately communicates that this is a communal Umrah Nushuk key registry.
  - The visual adapts the supplied calm sage editorial direction: pale sage wall, a hand rising from the bottom center, a luminous brass or rose-gold key as the hero object, soft olive-leaf shadows, and a thin clear-glass arc.
  - The left side includes brand, navigation, eyebrow, headline, explanatory copy, and a primary call to action.
  - The right side includes a live collection panel with the total registered key count, the key entry field, and the full copyable key list on the first page.
  - The “last added” and “duplicate guard” cards are removed so the key workflow is the primary action.
  - Evidence: responsive Preview captures at desktop and mobile viewports; `client/src/pages/Home.tsx` and `client/src/index.css` implement the composition.

- [x] **Submission flow and feedback**
  - The page includes an obvious key submission form with text input, client-side validation, submit state, and clear success, duplicate, and general error feedback.
  - Successful submission refreshes registry counts and recent activity without a full page reload.
  - Input controls are touch-friendly and keyboard accessible.
  - Evidence: `registry.add` tRPC mutation and the `#add-key` form in `Home.tsx`; `pnpm check` passes.

- [x] **Privacy-conscious recent activity**
  - The public recent registry view shows useful recent activity and count information.
  - Public list entries show the full submitted key because the community needs to copy and reuse it easily.
  - Each row includes an accessible copy button with a short copied confirmation state.
  - Evidence: `getNushukKeysPage` returns normalized keys, and `Home.tsx` uses `navigator.clipboard.writeText` for each row.
  - The list is paginated server-side at five keys per page, with total count and Previous/Next controls shown when more than one page exists.
  - Evidence: `getNushukKeysPage` uses database `limit`/`offset`, and the first-page panel renders `key-pagination` controls.

- [x] **Responsive and motion behavior**
  - Desktop, tablet, and portrait-phone layouts reorganize the copy, form/cards, and hero visual without overflow.
  - Navigation folds into a compact accessible menu on smaller widths.
  - Gentle entrance motion is included with a reduced-motion fallback that removes entrance and decorative transitions.
  - Evidence: desktop and portrait Preview captures; responsive CSS includes the 820px and 600px breakpoints plus `prefers-reduced-motion`.

- [x] **Website routing and delivery readiness**
  - `GET /manus-routes.json` returns the complete current page route set for `/` and `/404`.
  - The application continues to expose `GET /api/health` and serves the Vite/Express app on the configured port.
  - Evidence: health response returned `{\"status\":\"ok\"}`; route manifest returned the two declared routes; `pnpm build` passes.
