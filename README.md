# Fieldwork Product Catalogue

A small full stack product catalogue built for the AI-Native Engineer challenge. The React client talks only to the local Express API, including when it loads product images. The API reads products from Fake Store API through a replaceable `ProductSource` and sends enquiries through a replaceable `EmailGateway`.

## Run locally

Requirements: Docker Desktop, or Node.js 20+ with npm for the development workflow. No account or secret is required.

### Full container run

```sh
docker compose up --build
```

Open [http://localhost:3001](http://localhost:3001). The local sales inbox is [http://localhost:8025](http://localhost:8025). Stop the stack with `docker compose down`.

### Node development run

```sh
npm install
cp .env.example .env
docker compose up -d mailhog
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` to the Express server on port 3001. The API reads product data from Fake Store API, so the machine needs outbound access to `fakestoreapi.com`.

To check the focused tests and create a production client build:

```sh
npm test
npm run build
npm start
```

After building, `npm start` serves the client and API on port 3001. Override `PORT`, `PRODUCTS_API_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, and `SALES_EMAIL` in `.env` if needed. Keep `.env` private; `.env.example` contains only local defaults.

## Product flows

- Home shows the five highest rated products.
- Category pages show up to five favourites, then the remaining products.
- Search matches the title, description, or category, without case sensitivity.
- Product cards open a detail page.
- Product detail forms validate customer details and send a sales email; success is shown only after the email gateway accepts the message.

## API

| Method and path | Purpose |
|---|---|
| `GET /api/health` | Local process health |
| `GET /api/products/featured` | Five ranked products |
| `GET /api/categories` | Category names and URL slugs |
| `GET /api/categories/:slug/products` | Category favourites and remaining products |
| `GET /api/products?query=term` | Matching products and count |
| `GET /api/products/:id` | Product detail |
| `GET /api/image?url=<provider-image-url>` | Cached, host-allowlisted image proxy |
| `POST /api/enquiries` | Validate and email a sales enquiry |

Errors use `{ "error": { "code", "message" } }`. Input errors return `400`, unknown products or categories `404`, product-source errors `502`, and SMTP delivery errors `503`.

## Project structure

```text
client/src/                 React app, pages, reusable UI, styles
server/src/                 Express API and product/email adapters
decisions/                  Architecture decisions
reports/                    Gate evidence and implementation/QA records
```

See [DECISIONS.md](DECISIONS.md) for assumptions and scope cuts, and [AI_USAGE.md](AI_USAGE.md) for AI assistance and time-record status.

## Stack choice

The implementation uses a React/TypeScript client and Node.js/Express/TypeScript backend. This combination keeps the challenge within one typed TypeScript toolchain, has a small reviewable structure, and is supported across common local and AWS-compatible hosting environments. The backend owns product fetching, validation, email delivery, and the image proxy; the client owns presentation and routes.
