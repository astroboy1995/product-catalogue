# Decisions and assumptions

## Product ranking

Use highest average rating first, then rating count, then ascending product ID for stable ties. “Top-rated” means the first five in that ordering. Category pages place all products in `topRated` when the category contains fewer than five; `additional` is empty in that case.

## Search

Trim the query and perform a case-insensitive substring search across title, description, and category. An empty query returns `400`; no matches return an empty list and count zero.

## Enquiries

Require a product ID, name (2–100 chars), valid email, and message (10–2,000 chars). The backend resolves the product title, then sends the request to the configured sales inbox. The UI shows its thank-you state only after delivery is accepted by SMTP.

## Adapters and local email

Fake Store API is accessed only by the server. `ProductSource` and `EmailGateway` interfaces isolate the vendor choices. MailHog supplies a local SMTP sink at port 1025 and inbox UI at port 8025. Production mail hosting and recipient settings are environment configuration, not committed secrets.

## Failure behaviour

Show retryable user-facing messages for upstream errors. Return `400` for invalid input, `404` for missing products/categories, `502` for product source failures, and `503` for SMTP failures.

## Scope cuts and future work

No database, accounts, caching, pagination, deployment, analytics, checkout, or advanced filters. Follow-up work could add a persistent catalogue, a production mail provider, server-side caching, pagination, and browser-level acceptance coverage.

## Challenge source status

The complete four-page challenge PDF was extracted and checked against the implementation. The solution covers the five acceptance flows, the stated technical constraints, and the submission files. The remaining submission action is external repository configuration and PR publication, not a missing application requirement.

## Container and deployment architecture

Docker Compose runs one application container and one MailHog container. The application remains a modular monolith: product and enquiry adapters are isolated modules, but are deployed together to avoid premature distributed-system complexity. The container layout keeps the UI, API, product source, and email provider replaceable and is compatible with AWS container hosting. Docker Compose is the local operational model, not an instruction to deploy.
