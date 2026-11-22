# Gate 2 — Proposed architecture

## Stack

React + TypeScript + Vite + React Router; Node.js + TypeScript + Express; Zod validation; Vitest, React Testing Library, and Supertest. Fake Store API sits behind a `ProductSource` adapter. An `EmailGateway` hides the mail implementation; local MailHog via optional Docker Compose demonstrates sales delivery without credentials.

```text
React browser → project Express API → ProductSource → Fake Store API
                                   └→ EmailGateway → local MailHog
```

The browser calls only `/api/*`, including for product images; the backend proxies raster images from its configured provider host. Upstream product data is mapped to application-owned product shapes in the backend.

## Proposed structure

```text
product-catalogue/
├── client/src/{api,components,pages}
├── server/src/{modules/products,modules/enquiries,middleware}
├── docker-compose.yml
├── .env.example
├── README.md
├── DECISIONS.md
└── AI_USAGE.md
```

## Proposed API contracts

| Endpoint | Contract |
|---|---|
| `GET /api/products/featured` | Exactly five ranked product summaries. |
| `GET /api/categories` | Category labels/slugs. |
| `GET /api/categories/:slug/products` | `{ category, topRated, additional }`. |
| `GET /api/products?query=<term>` | Required trimmed query; product text matches with count metadata. |
| `GET /api/products/:id` | Full product or `404`. |
| `POST /api/enquiries` | `{ productId, name, email, message }`; returns `201` after gateway acceptance. |

All errors use `{ "error": { "code", "message" } }`. Proposed handling: `400` invalid input, `404` unknown resource, `502` product-source failure, `503` mail failure.

## Proposed UI

`/` home, `/categories/:slug`, `/search?query=`, and `/products/:id`. Shared components: product card/grid, search form, enquiry form, and loading/empty/error feedback states.

## Accepted implementation decisions

- Highest rating selects featured products; rating count breaks ties.
- Category `topRated` contains the five highest-ranked category products; others are `additional`.
- Search is case-insensitive across title, description, and category.
- Name, email, and message are required enquiry fields.
- MailHog is the local sales inbox; a production mail provider is deferred behind `EmailGateway`.

See `DECISIONS.md` and [ADR-001](decisions/ADR-001-adapters-and-local-email.md). The installed dependency set was audited after implementation; latest check found zero known vulnerabilities.

## Docker architecture

```text
Docker host
├── React build + Express API container → ProductSource → Fake Store API
│                                      └→ EmailGateway → MailHog container
└── MailHog SMTP and inbox container
```

The system is deliberately deployed as a modular monolith rather than separate microservices. Product and enquiry integrations remain isolated behind interfaces, so they can later be extracted independently when independent scaling or deployment becomes necessary.
