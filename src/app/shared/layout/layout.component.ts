import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { FooterComponent } from './footer/footer.component';

/**
 * Root layout component for all authenticated routes.
 *
 * Provides the application shell for protected pages, including:
 * - A top toolbar with the TaskFlow brand logo and a profile menu
 * - A `<router-outlet>` rendering the active child route
 * - A footer with API documentation and developer links
 *
 * The profile menu displays the authenticated user's avatar (initials),
 * username and email, and provides a logout action.
 *
 * Wraps all routes protected by `AuthGuard` as the parent component
 * in the route configuration.
 *
 * @see AuthService
 * @see FooterComponent
 * @see AuthGuard
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    RouterLink,
    FooterComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);

  /** Readonly Signal exposing the authenticated user's username. Null before session is restored. */
  readonly username = this.authService.username;

  /** Readonly Signal exposing the authenticated user's email. Null before session is restored. */
  readonly email = this.authService.email;

  /** Logs out the current user and redirects to `/login`. */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Returns the first letter of the username in uppercase, used as the avatar initials.
   * Returns an empty string if the username is not yet available.
   */
  getInitials(): string {
    const name = this.username();
    if (!name) return '';
    return name[0].toUpperCase();
  }
}
