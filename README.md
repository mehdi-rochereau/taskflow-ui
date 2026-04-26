# TaskFlow UI

> 🇫🇷 [Version française](README.fr.md)

A modern task management frontend built with Angular 19 and Angular Material,
consuming the TaskFlow REST API with secure HttpOnly cookie authentication,
silent token refresh and a fully responsive interface.

[![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.dev/)
[![Angular Material](https://img.shields.io/badge/Angular%20Material-19-757575?style=flat&logo=material-design&logoColor=white)](https://material.angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## Overview

TaskFlow UI is the Angular frontend for the TaskFlow API. It allows authenticated
users to manage their projects and tasks through a clean, responsive interface.
The application demonstrates modern Angular patterns including Signals, Smart/Dumb
component architecture, HTTP interceptors, route guards and resolvers.

For security details, see [SECURITY.md](SECURITY.md).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Angular 19 |
| UI Library | Angular Material 19 (Material 3) |
| Language | TypeScript 5.x |
| Styling | SCSS + CSS Variables (Material 3 theming) |
| State Management | Angular Signals |
| HTTP | HttpClient + Interceptors |
| Routing | Angular Router (lazy loading) |
| Forms | Reactive Forms |
| API Documentation | Redoc (embedded) |
| Build Tool | Angular CLI |

---

## Architecture

```
src/app/
├── core/                     # Singleton services, interceptors, guards, resolvers, models
│   ├── guards/               # AuthGuard — route protection with silent refresh
│   ├── interceptors/         # CredentialsInterceptor, AuthInterceptor, ErrorInterceptor
│   ├── models/               # TypeScript interfaces (auth, project, task, api-error)
│   ├── resolvers/            # ProjectResolver — data loading before navigation
│   └── services/             # AuthService, ProjectService, TaskService, NotificationService
├── features/                 # Feature modules
│   ├── auth/                 # LoginComponent, RegisterComponent
│   └── projects/             # ProjectListComponent, ProjectDetailComponent
│       ├── project-header/   # Smart/Dumb: project header with back button
│       ├── task-filters/     # Smart/Dumb: status and priority filters
│       ├── task-table/       # Smart/Dumb: task table with actions
│       └── dialogs/          # ProjectFormDialog, TaskFormDialog, TaskDetailDialog, ConfirmDialog
└── shared/                   # Reusable components, pipes, utilities
    ├── components/           # NotFoundComponent, ApiDocsComponent, ConfirmDialogComponent
    ├── layout/               # LayoutComponent, FooterComponent
    ├── pipes/                # TaskStatusPipe, TaskPriorityPipe
    └── utils/                # getFieldErrors() — shared form validation utility
```

The application follows the **Smart/Dumb component pattern**:
- **Smart components** (`ProjectDetailComponent`, `ProjectListComponent`) — manage state,
  HTTP calls and business logic
- **Dumb components** (`ProjectHeaderComponent`, `TaskTableComponent`, `TaskFiltersComponent`)
  — receive data via `@Input()` and emit events via `@Output()`, using `OnPush` change detection

---

## Features

- Secure authentication — login and register with username or email
- HttpOnly cookie session management — JWT (15 min) + Refresh Token (7 days)
- Silent token refresh — automatic JWT renewal via `AuthInterceptor` on 401 responses
- Session restoration on page reload via `AuthGuard`
- Full CRUD on projects and tasks
- Task filtering by status and priority — persisted in URL query params
- Client-side project search — real-time filtering with Angular Signals
- Task progress bar — visual completion ratio per project
- Responsive design — mobile and desktop layouts
- Angular Material 3 theming — Cyan/Orange palette
- Embedded Redoc API documentation at `/api-docs`
- Notification system — success and error snackbars
- Confirm dialogs for destructive actions
- 404 page with wildcard route
- i18n ready — API error messages in English and French

---

## Prerequisites

- Node.js 22+
- Angular CLI 21+
- [taskflow-api](https://github.com/mehdi-rochereau/taskflow-api) running on `http://localhost:8082`

---

## Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/mehdi-rochereau/taskflow-ui.git
cd taskflow-ui
```

**2. Install dependencies**

```bash
npm install
```

**3. Start the development server**

```bash
ng serve
```

The application starts on `http://localhost:4200`.

**4. Make sure the API is running**

See [taskflow-api](https://github.com/mehdi-rochereau/taskflow-api) for setup instructions.

---

## Environment Configuration

Environment files are located in `src/environments/`.

| Variable | Development | Production |
|----------|-------------|------------|
| `apiUrl` | `http://localhost:8082/api` | `https://api.taskflow.mehdi-rochereau.dev/api` |
| `apiBaseUrl` | `http://localhost:8082` | `https://api.taskflow.mehdi-rochereau.dev` |
| `swaggerUrl` | `http://localhost:8082/swagger-ui/index.html` | `https://api.taskflow.mehdi-rochereau.dev/swagger-ui/index.html` |

---

## Key Angular Patterns Demonstrated

### Signals
```typescript
// Reactive state without RxJS overhead
readonly isAuthenticated = signal<boolean>(false);
readonly username = this._username.asReadonly();
```

### Smart/Dumb Components
```typescript
// Dumb component — pure display, OnPush
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class TaskTableComponent {
  @Input({ required: true }) tasks: Task[] = [];
  @Output() edit = new EventEmitter<{ event: Event, task: Task }>();
}
```

### Silent Refresh Interceptor
```typescript
// Automatic JWT renewal on 401
return next(req).pipe(
  catchError(err => {
    if (err.status === 401 && !req.url.includes('/auth')) {
      return authService.refresh().pipe(
        switchMap(() => next(req)),
        catchError(() => { authService.logout(); ... })
      );
    }
  })
);
```

### Resolver
```typescript
// Data loaded before component activation
export const projectResolver: ResolveFn<Project> = (route) => {
  return projectService.getProjectById(Number(route.paramMap.get('id'))).pipe(
    catchError(() => { router.navigate(['/projects']); return EMPTY; })
  );
};
```

---

## Application Structure

### Routes

| Path | Component | Guard | Resolver |
|------|-----------|-------|----------|
| `/login` | `LoginComponent` | — | — |
| `/register` | `RegisterComponent` | — | — |
| `/projects` | `ProjectListComponent` | `AuthGuard` | — |
| `/projects/:id` | `ProjectDetailComponent` | `AuthGuard` | `ProjectResolver` |
| `/api-docs` | `ApiDocsComponent` | — | — |
| `**` | `NotFoundComponent` | — | — |

### Interceptors

| Interceptor | Role |
|-------------|------|
| `CredentialsInterceptor` | Adds `withCredentials: true` to all requests |
| `AuthInterceptor` | Handles 401 responses with silent token refresh |
| `ErrorInterceptor` | Handles 500 and 429 responses with snackbar notifications |

---

## Planned Improvements

- [ ] Docker + Nginx deployment
- [ ] GitHub Actions CI/CD
- [ ] OAuth2 login (Google / GitHub)
- [ ] `TaskTableComponent` — add sortable columns
- [ ] `GET /api/auth/me` — eliminate all client-side session state
- [ ] i18n — Angular internationalization for UI text

---

## Known Architectural Decisions

**JWT in HttpOnly cookies instead of localStorage**
Tokens are never accessible to JavaScript, significantly reducing XSS risk.
Angular sends them automatically via `withCredentials: true`.

**Signals over RxJS for component state**
Angular 19 Signals provide a simpler, more performant alternative to BehaviorSubject
for local component state while remaining interoperable with Observables.

**OnPush change detection on all dumb components**
Reduces unnecessary re-renders by only checking components when their `@Input()` references change.

---

## Ecosystem

| Repository | Description |
|------------|-------------|
| [taskflow-ui](https://github.com/mehdi-rochereau/taskflow-ui) | Angular frontend (this repo) |
| [taskflow-api](https://github.com/mehdi-rochereau/taskflow-api) | Spring Boot REST API |
| [SECURITY.md](SECURITY.md) | Frontend security policy |
| [taskflow-api/SECURITY.md](https://github.com/mehdi-rochereau/taskflow-api/blob/main/SECURITY.md) | API security policy |
