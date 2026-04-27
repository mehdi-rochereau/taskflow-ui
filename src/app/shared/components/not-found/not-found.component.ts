import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

/**
 * Component displayed when the user navigates to an unknown route.
 *
 * Shows a 404 error page with a link back to `/projects`.
 * Registered as the wildcard route (`**`) in `app.routes.ts`.
 *
 * Uses `OnPush` change detection — no dynamic data, purely static.
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {}
