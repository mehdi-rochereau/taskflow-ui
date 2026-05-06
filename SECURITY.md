> 🇫🇷 [Lire en français](SECURITY.fr.md)

# Security Policy

## Overview

This document describes the security measures implemented in the TaskFlow frontend
and outlines known limitations and planned improvements.

TaskFlow is a portfolio project demonstrating modern web application security practices
with Angular 21, Spring Boot 3.5, JWT authentication and HttpOnly cookies.

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅        |

---

## Security Measures

### Authentication & Session Management

- **HttpOnly Cookies** — JWT access token stored in an `HttpOnly` cookie named `jwt`
  (path `/api`, 15-minute expiry). Inaccessible to JavaScript, preventing XSS token theft.
- **Refresh Token Rotation** — Refresh tokens are single-use and stored in an `HttpOnly`
  cookie named `refreshToken` (path `/api/auth`, 7-day expiry). Each use revokes the
  previous token and issues a new one.
- **Silent Refresh** — Expired JWT tokens are automatically refreshed via the
  `AuthInterceptor` without interrupting the user experience.
- **Session Restoration** — On page reload, the `AuthGuard` attempts a silent refresh
  to restore the session from the refresh token cookie.
- **Secure Logout** — Logout calls `POST /api/auth/logout` which revokes all active
  refresh tokens server-side and clears both HttpOnly cookies.
- **No Sensitive Data in localStorage** — Only non-sensitive display data is stored
  client-side. All authentication tokens are managed via HttpOnly cookies.

### Transport Security

- **HTTPS enforced in production** — All communication uses TLS.
- **HSTS** — `Strict-Transport-Security` header with `includeSubDomains` and
  `max-age=31536000` enforced by the API server.
- **`withCredentials: true`** — Configured globally via `CredentialsInterceptor`
  to ensure cookies are sent with every cross-origin request.

### XSS Prevention

- **Angular template escaping** — All interpolated values (`{{ }}`) are automatically
  escaped by Angular's template engine.
- `bypassSecurityTrust` is **never used** in this codebase.
- No direct DOM manipulation via `innerHTML` or equivalent.
- **Content Security Policy** — `default-src 'self'; frame-ancestors 'none'` enforced
  by the API server, preventing injection of unauthorized scripts.

### CSRF Prevention

- **SameSite=Strict cookies** — All HttpOnly cookies use `SameSite=Strict`, preventing
  cross-site request forgery attacks.
- **Stateless API** — The API uses no session cookies, eliminating the primary CSRF
  attack vector.

### Access Control

- **Route Guards** — `AuthGuard` prevents access to protected routes without a valid
  session. Unauthenticated users are redirected to `/login`.
- **Server-side enforcement** — All authorization is enforced server-side via Spring
  Security regardless of client-side guards. See
  [taskflow-api/SECURITY.md](https://github.com/mehdi-rochereau/taskflow-api/blob/main/SECURITY.md).

### HTTP Security Headers

All security headers are enforced by the API server:

| Header | Value |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Content-Security-Policy` | `default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'` |
| `Referrer-Policy` | `no-referrer` |

### Rate Limiting

Rate limiting is enforced server-side. See
[taskflow-api/SECURITY.md](https://github.com/mehdi-rochereau/taskflow-api/blob/main/SECURITY.md)
for details.

### Token Cleanup
- **Scheduled purge** — Expired and revoked refresh tokens are automatically
  deleted daily at 2:00 AM via a scheduled job, preventing unbounded database growth.

### Error Handling

- HTTP `500` responses display a generic message — internal details are never exposed
  to the client.
- HTTP `429` responses display a user-friendly rate limit message.
- HTTP `401` responses trigger automatic session refresh or logout depending on context.

### CI/CD Security

The deployment pipeline integrates multiple security controls:

| Control | Tool | Details |
|---------|------|---------|
| Secret scanning | GitLeaks | Full git history scanned on every push |
| Dependency CVEs | npm audit | Blocks on moderate severity |
| Docker image scan | Trivy | Blocks deployment on CRITICAL CVEs |
| Least privilege | GITHUB_TOKEN | No PAT — scoped token with minimal permissions |
| Dedicated SSH key | Ed25519 | GitHub Actions-only key, separate from developer keys |
| Branch protection | GitHub Rulesets | CI must pass before any merge to main |
| Immutable deploys | Image digest | Trivy scans the exact pushed digest |
| Automatic rollback | Docker | Previous image restored if health check fails |

---

## Security Principles Applied

| Principle | Implementation |
|-----------|----------------|
| **Defense in Depth** | AuthGuard + AuthInterceptor + Spring Security + ownership checks |
| **Least Privilege** | Scoped cookies (`/api`, `/api/auth`), minimal localStorage usage |
| **Fail Secure** | Failed refresh → automatic logout and redirect to `/login` |
| **Separation of Concerns** | Auth logic centralized in `AuthService` and `AuthInterceptor` |
| **No Security by Obscurity** | Security relies on proven standards (JWT, HttpOnly, SameSite) |

---

## Known Limitations

### Cookie Visibility in Development

In development (`localhost`), the `Secure` flag is disabled on cookies
(`application.cookie.secure=false`). In production, this flag is enabled and cookies
are only transmitted over HTTPS.

### Rate Limiting on Page Reload

The `/api/auth/refresh` endpoint is subject to rate limiting (configurable server-side).
Frequent page reloads within a short period may trigger the rate limit and force
re-authentication. This is a known trade-off between security and user experience.
See [taskflow-api](https://github.com/mehdi-rochereau/taskflow-api) for configuration.

### No Content Security Policy on Angular

CSP headers are enforced by the API server, not by the Angular application itself.
When the frontend is served independently (e.g. via Nginx), CSP headers should be
added to the Nginx configuration.

---

## Planned Improvements

- [ ] Add CSP headers to Nginx configuration when deployed
- [ ] Implement account deletion endpoint (`DELETE /api/users/me`) for GDPR compliance
- [ ] Add `GET /api/auth/me` endpoint to eliminate any client-side session state
- [ ] Consider `HttpOnly` cookie-based CSRF token for additional CSRF protection
- [ ] OAuth2 Google + GitHub (planned)
- [ ] Trivy scan on HIGH severity (currently CRITICAL only)

---

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it
responsibly by contacting:

**Email:** mehdi.rochereau.dev@gmail.com

Please include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact

This is a portfolio project and is not intended for production use with real user data.
Response time may vary.

---

## Related

- [taskflow-api](https://github.com/mehdi-rochereau/taskflow-api) — Spring Boot REST API
- [taskflow-api/SECURITY.md](https://github.com/mehdi-rochereau/taskflow-api/blob/main/SECURITY.md) — API security policy
