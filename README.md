# Online will-writing / digital estate planning

- **Concept:** A guided online flow that produces a legally valid Kenyan will, with optional advocate review, digital storage, and easy updates as life circumstances change.
- **Origin:** Farewill (UK) and Trust & Will (US) are large, VC-backed consumer will-writing platforms.
- **Evidence of demand:** Over 95% of Kenyans reportedly have no will or estate plan, per a Business Daily interview with an estate-planning author; a 2025 Strathmore University research project specifically studied introducing legally-recognized electronic wills in Kenya, comparing frameworks in England & Wales and Nevada — a sign the gap is recognized even in academic circles.
- **Kenya landscape:** Standard Chartered Bank partnered with a single law firm (Agimba & Associates) to offer an online estate-planning proposition to its own banking clients only; no dedicated, direct-to-consumer Kenyan will-writing startup was found.
- **Opportunity:** A consumer-facing product (not bank-gated) for the much larger population outside any one bank's client base, addressing both the "I don't know how to start" and "it's too expensive/awkward to see a lawyer" barriers cited as reasons Kenyans avoid this.
- **Target customers:** Middle-class professionals aged 30–55 with property or business assets, and diaspora Kenyans wanting to protect assets back home.
- **Revenue model:** One-time fee per will (tiered simple/complex), or a subscription that includes unlimited updates; a premium tier adds advocate review.
- **Difficulty:** Medium — legal-template accuracy is critical, and the validity of purely digital execution (versus print-sign-witness) is still an evolving question under the Law of Succession Act, so the product likely needs a qualified advocate involved and clear UX around physical signing/witnessing requirements.
- **Scalability:** Medium — succession law is country-specific, so expansion means re-localizing legal content, not just translation.
- **Risks:** Cultural reluctance to discuss death/inheritance; getting the legal template wrong has serious consequences; needs a credible legal partner from day one.
- **MVP:** A guided web form producing a Kenya-compliant simple will as a PDF, co-designed and reviewed with one practicing advocate, sold as a one-time paid product with no app required initially.

## Deep dive

Customers are middle-class professionals aged 30–55 with property or a business, and diaspora Kenyans with assets back home. Price a flat one-time fee per will (e.g., KSh 3,000–8,000 depending on complexity), with a premium advocate-review add-on. MVP: a guided web form that outputs a Kenya-compliant simple will as a PDF, built and vetted with one practicing advocate as a paid consultant. First steps: get the legal template right first — this is the one idea on the list where a technical MVP built before the legal content is solid would actively cause harm to users, so sequence it legal-content-first, app-second.

---

Source: `PROJECTS.md` (Online Business Models: Proven Abroad, Underdeveloped in Kenya).


---

## Stack & dev

Scaffolded as a Next.js 16 + Drizzle (Postgres) app, matching the stack used in `odpc-compliance-saas`. The schema in `src/db/schema.ts` is the current source of truth for the data model; UI, auth and payment integrations are not yet wired up.

```
npm install
# point .env at a Postgres instance, see .env.example
npm run db:generate   # drizzle-kit: emit SQL migrations from the schema
npm run db:migrate    # apply migrations from ./drizzle
npm run db:seed       # optional local seed data (currently a no-op)
npm run dev           # Next.js dev server on :3000
```

What is here:
- `src/db/schema.ts` — Drizzle Postgres schema specific to this domain
- `src/db/index.ts` — pooled `pg` + Drizzle client
- `drizzle.config.ts`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`
- `src/app/globals.css`, `.gitignore`, `.env.example`

What is still a stub:
- `src/app/layout.tsx` + `src/app/page.tsx` — scaffold against the installed Next version (see `node_modules/next/dist/docs/`); the `odpc-compliance-saas` siblings are a working reference.
- Auth (sessions, password reset, email verify) — copy and adapt the `lib/session.ts`, `lib/password.ts`, `lib/email-verification.ts` set from `odpc-compliance-saas`.
- Payments (M-Pesa Daraja / Paystack / card) — stack-specific, add per project.
- `scripts/seed.ts` — present but currently a no-op placeholder for local seed data.
