# AI usage

AI assistance was used to scaffold the React/TypeScript client, Express API, replaceable product and email adapters, styles, focused tests, and project documentation. The implementation used the existing project requirements as an initial brief, then the complete four-page PDF was extracted and compared directly against every acceptance criterion and submission requirement.

## Tools and model

- VS Code GitHub Copilot agent used for project planning, implementation review, PDF extraction, local validation, and documentation updates.
- MAI Code 2 Flash served as the coding model.
- Agent instructions: the repository-level `AGENTS.md` and project `AGENTS.md` supplied scope and governance constraints.

## Time record

Exact human-only stopwatch timing was not captured, so the following is a rough session estimate rather than a claimed stopwatch result:

- Planning and requirements/design review: 30 minutes
- Building and container setup: 90 minutes
- Testing and Docker/browser verification: 30 minutes
- Documentation and submission review: 25 minutes
- **Estimated total: approximately 175 minutes**

## Review notes

- No AI-generated customer data or secrets were added.
- The implementation was reviewed through 14 passing tests, a production build, npm audit, live Docker startup, browser routes, a successful API enquiry, and MailHog receipt.
- AI assistance does not replace the submitter's ownership of every line or the required independent live-review explanation.
