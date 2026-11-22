# Product Catalogue Proof of Concept

## Summary

Adds a full-stack React/TypeScript and Node/TypeScript product catalogue that satisfies the AI-Native Engineer challenge. The client uses the backend API for every product operation, including images. Product and email integrations use replaceable interfaces, and Docker Compose provides one-command local execution.

## Acceptance coverage

- Home shows five top-rated products.
- Category routes show ranked favourites and remaining products.
- Search matches title, description, and category case-insensitively.
- Product tiles open detail routes.
- Valid enquiries send through SMTP and show a thank-you state after successful delivery.

## Design decisions

- A modular monolith is used instead of premature microservices.
- Fake Store API is isolated behind `ProductSource`.
- Local MailHog validates email delivery; `EmailGateway` permits production mail replacement.
- Docker Compose is compatible with container hosting and keeps local setup to one command.
- No database, account system, checkout, deployment, or paid service is required by the MVP.

## Validation

- 14 Vitest/Testing Library/Supertest tests pass.
- TypeScript and Vite production build pass.
- npm audit reports zero vulnerabilities.
- Docker Compose builds and starts the app and MailHog.
- `/api/health` is healthy.
- Live API and browser enquiry flow succeed, and MailHog receives the `Mens Cotton Jacket` enquiry.

## Submission review

See `README.md`, `DECISIONS.md`, `AI_USAGE.md`, and `reports/` for setup, trade-offs, AI usage, and QA evidence.
