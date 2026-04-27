import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { environment } from '../../../../environments/environment';
import { RouterLink } from '@angular/router';

/**
 * Dumb component displaying the application footer.
 *
 * Provides three categories of links:
 * - **API Documentation** — Swagger UI (external) and Redoc (embedded at `/api-docs`)
 * - **Copyright** — current year and developer credit
 * - **Developer** — GitHub and LinkedIn profile links
 *
 * Swagger and Redoc URLs are environment-aware — they point to `localhost:8082`
 * in development and to the production domain in production builds.
 *
 * Uses `OnPush` change detection — all data is static and never changes at runtime.
 *
 * @see ApiDocsComponent
 * @see environment
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule, MatDividerModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  /** Current year — used in the copyright notice. */
  readonly currentYear = new Date().getFullYear();

  /** GitHub profile URL of the developer. */
  readonly githubUrl = 'https://github.com/mehdi-rochereau';

  /** LinkedIn profile URL of the developer. */
  readonly linkedinUrl = 'https://www.linkedin.com/in/mehdi-rochereau/';

  /** Swagger UI URL — environment-aware. */
  readonly swaggerUrl = environment.swaggerUrl;
}
