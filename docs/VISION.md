# StudyKit Vision

A concise roadmap and target deployment model for StudyKit.

---

## Current State

- **Single-tenant:** One deployment serves one institution
- **Self-hosted:** Docker Compose, on-premise or private cloud
- **Target:** Universities and colleges that need full control over data and infrastructure

---

## Future Directions

### Multi-Tenant SaaS

In the future, StudyKit could support:

- **Subdomain-per-institution:** `mit.studykit.app`, `stanford.studykit.app`
- **Shared infrastructure** with tenant isolation
- **Managed hosting** for institutions that prefer not to run their own servers

This would require:

- Tenant isolation (database, storage, caches)
- Multi-domain routing and auth
- Billing / subscription management
- Separate staging and production environments

### Content and UX

- Additional content formats beyond Markdown, Video, SQL (e.g. code exercises for other languages)
- Richer progress and analytics for instructors
- Mobile-friendly student experience
- Offline-first for low-bandwidth settings

### Integrations

- LMS integration (Moodle, Canvas, etc.)
- SSO (SAML, OIDC) for institutional identity
- Calendar and scheduling
- Grade export to institutional systems

---

## Principles

1. **Self-host first:** Core design assumes institutions can run StudyKit themselves.
2. **Teacher-owned content:** Courses belong to instructors, not a central curriculum.
3. **Practice-oriented:** Emphasis on exercises and validation over passive consumption.
4. **Open and auditable:** Architecture and deployment should be understandable and modifiable.

---

*This document reflects current thinking and may change as the project evolves.*
