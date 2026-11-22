# Gate 3 — Proposed task registry

| ID | Owner | Scope | Depends on | Validation / state |
|---|---|---|---|---|
| T1 | Lead / full-stack engineer | Contracts, setup, environment, scripts | User approval | Complete; `tsc --noEmit`, production build |
| T2 | Full-stack engineer | Product source, ranking/search, product/category routes, errors | T1 | Complete; server route tests |
| T3 | Full-stack engineer | Enquiry validation, SMTP gateway, MailHog, route | T1 | Complete; validation/gateway test |
| T4 | Full-stack engineer | API client, home/category/search/detail pages | T1 | Complete; UI tests and build |
| T5 | Full-stack engineer | Enquiry UI and thank-you state | T3 contract | Complete; build and acceptance review |
| T6 | Lead | Integration and loading/empty/error review | T2–T5 | Complete; production health + static page smoke checks |
| T7 | Independent QA | Acceptance and local-run verification | T6 | Complete; 14 tests/build/audit pass, Docker UI and MailHog receipt verified |
| T8 | PM + Lead | README, decisions, AI usage, actual time, submission review | T1 onward | Documentation complete; actual human time, Git identity, remote, commit, and PR remain external blockers |

## Staffing and dependency decision

One full-stack implementation owner was selected because the app had no existing code and the frontend/API contract, mail flow, and shared tests are tightly connected. Independent QA is separately assigned for Gate 6. No implementation tasks were parallelized.

## Time budget

| Work | Target |
|---|---:|
| Contracts/setup/decision record | 20 min |
| Backend plus focused tests | 45 min |
| Frontend plus focused tests | 45 min |
| Integration/manual critical path | 20 min |
| QA, README, review, time record | 25 min |
| Buffer | 15–25 min |

Target total: 170–180 minutes. Reduce visual polish and browser-level testing before reducing acceptance flows.
