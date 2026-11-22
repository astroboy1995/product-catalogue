# ADR-001: Isolate product and email providers

- **Status:** Accepted for the local proof of concept
- **Date:** 2026-11-22
- **Context:** Challenge requirements expect the product source and email provider to be replaceable, with no credentials or paid-service dependency.
- **Decision:** Define `ProductSource` and `EmailGateway` interfaces. Implement Fake Store API and SMTP delivery to optional local MailHog.
- **Alternatives:** Call the product API from the browser; bind directly to a production mail vendor; simulate successful delivery without sending.
- **Consequences:** Browser traffic stays behind the local backend, provider swaps remain localized, and real SMTP acceptance can be demonstrated locally. Product browsing requires outbound network access; the email demo requires Docker.
- **Owner:** Project implementation
