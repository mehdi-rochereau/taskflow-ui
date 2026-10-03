import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { AuthService } from '../../core/services/auth.service';

/**
 * Public landing page displayed at the root route `/`.
 *
 * Presents the TaskFlow project to visitors — hero section, tech stack,
 * feature highlights, quick start guide and links to documentation.
 * Accessible without authentication.
 *
 * On initialization, attempts a silent token refresh to restore the session
 * from the `refreshToken` HttpOnly cookie if the user was previously authenticated.
 * If the refresh succeeds, the navbar switches from Sign in / Get started
 * to a "My Projects" button. If it fails, the page renders normally for guests.
 *
 * @see AuthService
 * @see FooterComponent
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatDividerModule, FooterComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  private readonly authService = inject(AuthService);

  /** Readonly Signal — true if the user has an active session. Drives the navbar CTA. */
  readonly isAuthenticated = this.authService.isAuthenticated;

  /**
   * Attempts a silent token refresh on page load to restore the session
   * from the `refreshToken` HttpOnly cookie.
   *
   * The error callback is what makes the attempt actually silent. A bare
   * subscribe() provides no error handler, so RxJS rethrows asynchronously,
   * the error reaches Angular's global handler and lands in the console. For a
   * visitor with no session the API answers 400 with "refresh token not
   * found", which is the expected outcome, not a fault: logging it in red
   * trains the reader to ignore console errors, and Lighthouse counts it in
   * its best-practices audit.
   *
   * The callback is deliberately empty rather than logging at a lower level:
   * there is nothing to report. A genuine failure of this call is
   * indistinguishable from the normal case here, and would surface on the next
   * authenticated request.
   */
  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.refresh().subscribe({
        error: () => {
          // Expected for a visitor with no session.
        },
      });
    }
  }

  /** Feature cards displayed in the features section. */
  readonly features = [
    {
      icon: 'lock',
      title: 'Secure Authentication',
      description:
        'JWT tokens in HttpOnly cookies with silent refresh, refresh token rotation and BCrypt password encoding.',
    },
    {
      icon: 'folder',
      title: 'Project Management',
      description:
        'Create and organize projects with real-time client-side search and task completion progress bar.',
    },
    {
      icon: 'task_alt',
      title: 'Task Tracking',
      description:
        'Manage tasks with status, priority and due date. Filters persist in URL query parameters.',
    },
    {
      icon: 'security',
      title: 'Production Security',
      description:
        'OWASP sanitization, Bucket4j rate limiting, Trivy image scanning, GitLeaks secret detection and UFW firewall.',
    },
    {
      icon: 'rocket_launch',
      title: 'CI/CD Pipeline',
      description:
        'GitHub Actions pipeline with secret scanning, dependency CVE checks, JaCoCo coverage, Docker build and automatic deployment.',
    },
    {
      icon: 'api',
      title: 'REST API',
      description:
        'Spring Boot 3.5 REST API with Springdoc OpenAPI, Swagger UI, Redoc, Flyway migrations and 95% test coverage.',
    },
  ];

  /**
   * Tech stack grouped by category — displayed as colored badges in the stack section.
   * Each entry contains a label and a brand color for the badge background.
   *
   * Every colour is a darkened variant of the official brand colour, chosen so
   * that white text reaches the 4.5:1 ratio WCAG AA requires under 18px. The
   * hue is preserved: the three channels are scaled by the same factor, which
   * moves the lightness without shifting the colour. Adding an entry means
   * checking its contrast, there is no longer any runtime safeguard.
   */
  readonly stack: Record<string, { label: string; color: string }[]> = {
    Frontend: [
      { label: 'Angular 21', color: '#DD0031' },
      { label: 'TypeScript', color: '#2E70BA' },
      { label: 'Angular Material 3', color: '#757575' },
      { label: 'Signals', color: '#DD0031' },
      { label: 'RxJS', color: '#B7178C' },
      { label: 'Redoc', color: '#C73578' },
    ],
    Backend: [
      { label: 'Spring Boot 3.5', color: '#4D7E2C' },
      { label: 'Java 21', color: '#A66100' },
      { label: 'JWT HttpOnly', color: '#000000' },
      { label: 'Flyway', color: '#CC0200' },
      { label: 'JUnit 5 / Mockito', color: '#1E804E' },
      { label: 'Swagger UI', color: '#477C18' },
      { label: 'Gradle', color: '#02303A' },
      { label: 'Codecov', color: '#D41B6C' },
    ],
    Security: [
      { label: 'OWASP Sanitizer', color: '#000099' },
      { label: 'Bucket4j', color: '#BC4F27' },
      { label: 'Trivy', color: '#1904DA' },
      { label: 'GitLeaks', color: '#CE3262' },
      { label: 'BCrypt', color: '#4A4A4A' },
      { label: 'OWASP Dep. Check', color: '#000099' },
    ],
    Infrastructure: [
      { label: 'Docker', color: '#1C75B9' },
      { label: 'Nginx', color: '#008131' },
      { label: 'GitHub Actions', color: '#1A6FD0' },
      { label: 'Hetzner VPS', color: '#D50C2D' },
      { label: "Let's Encrypt", color: '#003A70' },
      { label: 'ghcr.io', color: '#24292E' },
      { label: 'Docker Compose', color: '#1C75B9' },
      { label: 'UFW / Fail2ban', color: '#C3461B' },
    ],
  };

  /** Ordered list of stack category names for template iteration. */
  readonly stackCategories = Object.keys(this.stack);
}
