import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

/**
 * Service responsible for authentication and session management.
 *
 * Uses HttpOnly cookies for JWT storage — the browser sends the `jwt` cookie
 * automatically on every request when withCredentials is enabled.
 * No sensitive data is stored in localStorage — username and email are kept
 * in memory as readonly Signals and restored via the silent refresh mechanism.
 *
 * Token lifecycle:
 * - JWT cookie (`jwt`): valid 15 minutes — scoped to `/api`
 * - Refresh token cookie (`refreshToken`): valid 7 days, rotated on each use — scoped to `/api/auth`
 *
 * @see AuthInterceptor for silent refresh implementation
 * @see AuthGuard for route protection
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  /**
   * Reactive signal indicating whether the user is currently authenticated.
   * Initialized to false — updated on login, register, refresh and logout.
   */
  readonly isAuthenticated = signal<boolean>(false);

  private readonly _username = signal<string | null>(null);
  private readonly _email = signal<string | null>(null);

  /**
   * Readonly signal exposing the authenticated user's username.
   * Null when not authenticated or before the first refresh completes.
   */
  readonly username = this._username.asReadonly();

  /**
   * Readonly signal exposing the authenticated user's email.
   * Null when not authenticated or before the first refresh completes.
   */
  readonly email = this._email.asReadonly();

  /**
   * Authenticates the user with the given credentials.
   * On success, updates the username, email and auth signals.
   * The JWT cookie is set automatically by the API response.
   *
   * @param request - Login payload containing identifier and password
   * @returns Observable emitting the authentication response
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(tap((response) => this.storeSession(response)));
  }

  /**
   * Registers a new user account.
   * On success, updates the username, email and auth signals.
   * The JWT cookie is set automatically by the API response.
   *
   * @param request - Registration payload containing username, email and password
   * @returns Observable emitting the authentication response
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(tap((response) => this.storeSession(response)));
  }

  /**
   * Requests a new JWT token using the refresh token cookie.
   * The `refreshToken` HttpOnly cookie is sent automatically by the browser.
   * On success, updates the username, email and auth signals.
   * Used by AuthInterceptor for silent token refresh on 401 responses.
   *
   * @returns Observable emitting the new authentication response
   */
  refresh(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, {})
      .pipe(tap((response) => this.storeSession(response)));
  }

  /**
   * Logs out the current user by calling the API logout endpoint,
   * which revokes all active refresh tokens and clears the HttpOnly cookies.
   * Clears the in-memory session regardless of the API response.
   */
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  /**
   * Returns the authenticated user's username, or null if not authenticated.
   */
  getUsername(): string | null {
    return this._username();
  }

  /**
   * Returns the authenticated user's email, or null if not authenticated.
   */
  getEmail(): string | null {
    return this._email();
  }

  /**
   * Stores the session in memory by updating the username, email
   * and authentication signals from the API response.
   *
   * @param response - The authentication response from the API
   */
  private storeSession(response: AuthResponse): void {
    this._username.set(response.username);
    this._email.set(response.email);
    this.isAuthenticated.set(true);
  }

  /**
   * Clears the in-memory session by resetting all signals to null/false
   * and redirecting the user to the login page.
   */
  private clearSession(): void {
    this._username.set(null);
    this._email.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }
}
