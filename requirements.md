# Gate 1 — Requirements report

## Explicit acceptance criteria

1. Home displays five chosen top-rated products.
2. Selecting a category displays top-rated products and additional products in that category.
3. Submitting a search shows only products with matching text.
4. Selecting a product tile opens its detail page.
5. An enquiry from a product page captures contact details, sends an email to sales, and shows the customer a thank-you message.

## Technical and submission constraints

- Use a client and backend; React web and Node.js with TypeScript are preferred.
- Fake Store API is acceptable, but only the backend may call it.
- Product source, presentation, and email provider must be replaceable.
- Local setup must take under ten minutes. No committed secrets, paid services, or account setup.
- Include source, tests, README, documented decisions/assumptions/cuts/future work, AI usage notes, actual time split, and a feature-branch PR into `main`.

## Open decisions to record, not silently resolve

- Ranking and ties for “top rated.”
- Search fields and matching rules.
- Category section counts and overlap.
- Enquiry fields and validation.
- Email provider and sales inbox configuration.
- Empty, invalid, and upstream-failure behaviour.

## Priority

All five customer flows, local email demonstration, focused tests, README, decisions, and AI usage record are required. Authentication, database, caching, pagination, deployment, advanced filtering, and a design system are excluded from the planned PoC.
