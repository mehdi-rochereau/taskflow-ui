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
   * Errors are silently ignored — the page renders normally for unauthenticated visitors.
   */
  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.refresh().subscribe();
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
        'Spring Boot 3.5 REST API with Springdoc OpenAPI, Swagger UI, Redoc, Flyway migrations and 80%+ test coverage.',
    },
  ];

  /**
   * Tech stack grouped by category — displayed as colored badges in the stack section.
   * Each entry contains a label and a brand color for the badge background.
   */
  readonly stack: Record<string, { label: string; color: string }[]> = {
    Frontend: [
      { label: 'Angular 19', color: '#DD0031' },
      { label: 'TypeScript', color: '#3178C6' },
      { label: 'Angular Material 3', color: '#757575' },
      { label: 'Signals', color: '#DD0031' },
      { label: 'RxJS', color: '#B7178C' },
      { label: 'Redoc', color: '#E83E8C' },
    ],
    Backend: [
      { label: 'Spring Boot 3.5', color: '#6DB33F' },
      { label: 'Java 21', color: '#ED8B00' },
      { label: 'JWT HttpOnly', color: '#000000' },
      { label: 'Flyway', color: '#CC0200' },
      { label: 'JUnit 5 / Mockito', color: '#25A162' },
      { label: 'Swagger UI', color: '#85EA2D' },
      { label: 'Gradle', color: '#02303A' },
      { label: 'Codecov', color: '#F01F7A' },
    ],
    Security: [
      { label: 'OWASP Sanitizer', color: '#000099' },
      { label: 'Bucket4j', color: '#FF6B35' },
      { label: 'Trivy', color: '#1904DA' },
      { label: 'GitLeaks', color: '#CE3262' },
      { label: 'BCrypt', color: '#4A4A4A' },
      { label: 'OWASP Dep. Check', color: '#000099' },
    ],
    Infrastructure: [
      { label: 'Docker', color: '#2496ED' },
      { label: 'Nginx', color: '#009639' },
      { label: 'GitHub Actions', color: '#2088FF' },
      { label: 'Hetzner VPS', color: '#D50C2D' },
      { label: "Let's Encrypt", color: '#003A70' },
      { label: 'ghcr.io', color: '#24292E' },
      { label: 'Docker Compose', color: '#2496ED' },
      { label: 'UFW / Fail2ban', color: '#E95420' },
    ],
  };

  /** Ordered list of stack category names for template iteration. */
  readonly stackCategories = Object.keys(this.stack);
}
