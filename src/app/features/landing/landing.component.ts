import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { AuthService } from '../../core/services/auth.service';

/**
 * Public landing page displayed at the root route `/`.
 *
 * Presents the TaskFlow project to visitors — stack, features,
 * demo instructions and links to documentation.
 * Accessible without authentication.
 *
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
export class LandingComponent {
  private readonly authService = inject(AuthService);
  readonly isAuthenticated = this.authService.isAuthenticated;
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

  readonly stackCategories = Object.keys(this.stack);
}
