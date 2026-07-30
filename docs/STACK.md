# Production Stack

This file is the repository source of truth for infrastructure and lead delivery.

| Responsibility | Service |
| --- | --- |
| Hosting, serverless runtime, domains and deployments | Vercel |
| Database, authentication and persistent lead data | Supabase |
| Transactional and assessment email | Brevo |
| Lead and workflow automation | Zapier |

GitHub is used for source control and validation workflows only. Production
deployments are created by the Vercel Git integration when `main` changes.

Do not add a second hosting provider or a GitHub Pages deployment workflow.
Environment variables belong in Vercel, with secrets never committed to the
repository.

## Assessment Flow

1. Vercel serves the assessment and runs its API handlers.
2. Supabase stores the lead, attribution, result and delivery status.
3. Brevo sends the localized result email.
4. Zapier receives the canonical lead payload for follow-up automation.
