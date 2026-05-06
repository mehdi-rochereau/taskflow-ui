import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { projectResolver } from './core/resolvers/project-resolver';

/**
 * Application route configuration for TaskFlow UI.
 *
 * All components are lazy-loaded via `loadComponent` for optimal initial bundle size.
 *
 * Route structure:
 * - `(root)` — public, `LandingComponent`
 * - `/login` — public, `LoginComponent`
 * - `/register` — public, `RegisterComponent`
 * - `/api-docs` — public, `ApiDocsComponent`
 * - `(root, protected)` — `LayoutComponent` shell with `AuthGuard`
 *   - `/projects` — `ProjectListComponent`
 *   - `/projects/:id` — `ProjectDetailComponent`, pre-loaded by `ProjectResolver`
 * - `**` — wildcard, `NotFoundComponent`
 *
 * @see AuthGuard
 * @see ProjectResolver
 */
export const routes: Routes = [
  // ── Public routes ──────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'api-docs',
    loadComponent: () =>
      import('./shared/components/api-docs/api-docs.component').then((m) => m.ApiDocsComponent),
  },

  // ── Protected routes ───────────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/project-list/project-list.component').then(
            (m) => m.ProjectListComponent,
          ),
      },
      {
        path: 'projects/:id',
        resolve: { project: projectResolver },
        loadComponent: () =>
          import('./features/projects/project-detail/project-detail.component').then(
            (m) => m.ProjectDetailComponent,
          ),
      },
    ],
  },

  // ── Wildcard ───────────────────────────────────────────
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
