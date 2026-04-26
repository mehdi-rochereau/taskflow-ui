# TaskFlow UI

> 🇬🇧 [Read in English](README.md)

Un frontend de gestion de tâches moderne construit avec Angular 19 et Angular Material,
consommant l'API REST TaskFlow avec une authentification sécurisée par cookies HttpOnly,
un rafraîchissement silencieux des tokens et une interface entièrement responsive.

[![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.dev/)
[![Angular Material](https://img.shields.io/badge/Angular%20Material-19-757575?style=flat&logo=material-design&logoColor=white)](https://material.angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## Vue d'ensemble

TaskFlow UI est le frontend Angular de l'API TaskFlow. Il permet aux utilisateurs
authentifiés de gérer leurs projets et tâches via une interface claire et responsive.
L'application démontre les patterns Angular modernes : Signals, architecture Smart/Dumb,
intercepteurs HTTP, guards de routes et resolvers.

Pour les détails de sécurité, voir [SECURITY.fr.md](SECURITY.fr.md).

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Angular 19 |
| UI Library | Angular Material 19 (Material 3) |
| Langage | TypeScript 5.x |
| Styles | SCSS + Variables CSS (thème Material 3) |
| Gestion d'état | Angular Signals |
| HTTP | HttpClient + Intercepteurs |
| Routing | Angular Router (lazy loading) |
| Formulaires | Reactive Forms |
| Documentation API | Redoc (intégré) |
| Build | Angular CLI |

---

## Architecture

```
src/app/
├── core/                     # Services singleton, intercepteurs, guards, resolvers, modèles
│   ├── guards/               # AuthGuard — protection des routes avec rafraîchissement silencieux
│   ├── interceptors/         # CredentialsInterceptor, AuthInterceptor, ErrorInterceptor
│   ├── models/               # Interfaces TypeScript (auth, project, task, api-error)
│   ├── resolvers/            # ProjectResolver — chargement des données avant navigation
│   └── services/             # AuthService, ProjectService, TaskService, NotificationService
├── features/                 # Modules fonctionnels
│   ├── auth/                 # LoginComponent, RegisterComponent
│   └── projects/             # ProjectListComponent, ProjectDetailComponent
│       ├── project-header/   # Smart/Dumb : en-tête projet avec bouton retour
│       ├── task-filters/     # Smart/Dumb : filtres statut et priorité
│       ├── task-table/       # Smart/Dumb : tableau des tâches avec actions
│       └── dialogs/          # ProjectFormDialog, TaskFormDialog, TaskDetailDialog, ConfirmDialog
└── shared/                   # Composants, pipes et utilitaires réutilisables
    ├── components/           # NotFoundComponent, ApiDocsComponent, ConfirmDialogComponent
    ├── layout/               # LayoutComponent, FooterComponent
    ├── pipes/                # TaskStatusPipe, TaskPriorityPipe
    └── utils/                # getFieldErrors() — utilitaire de validation de formulaires
```

L'application suit le **pattern Smart/Dumb components** :
- **Composants Smart** (`ProjectDetailComponent`, `ProjectListComponent`) — gèrent l'état,
  les appels HTTP et la logique métier
- **Composants Dumb** (`ProjectHeaderComponent`, `TaskTableComponent`, `TaskFiltersComponent`)
  — reçoivent les données via `@Input()` et émettent des événements via `@Output()`,
  avec détection de changements `OnPush`

---

## Fonctionnalités

- Authentification sécurisée — connexion et inscription avec nom d'utilisateur ou email
- Gestion de session par cookies HttpOnly — JWT (15 min) + Refresh Token (7 jours)
- Rafraîchissement silencieux — renouvellement automatique du JWT via `AuthInterceptor` sur les réponses 401
- Restauration de session au rechargement de page via `AuthGuard`
- CRUD complet sur les projets et les tâches
- Filtrage des tâches par statut et priorité — persisté dans les query params de l'URL
- Recherche de projets côté client — filtrage temps réel avec Angular Signals
- Barre de progression des tâches — ratio de complétion visuel par projet
- Design responsive — layouts mobile et desktop
- Thème Angular Material 3 — palette Cyan/Orange
- Documentation API Redoc intégrée sur `/api-docs`
- Système de notifications — snackbars succès et erreur
- Dialogs de confirmation pour les actions destructives
- Page 404 avec route wildcard
- Prêt pour l'i18n — messages d'erreur API en anglais et français

---

## Prérequis

- Node.js 22+
- Angular CLI 21+
- [taskflow-api](https://github.com/mehdi-rochereau/taskflow-api) démarré sur `http://localhost:8082`

---

## Démarrage rapide

**1. Cloner le dépôt**

```bash
git clone https://github.com/mehdi-rochereau/taskflow-ui.git
cd taskflow-ui
```

**2. Installer les dépendances**

```bash
npm install
```

**3. Démarrer le serveur de développement**

```bash
ng serve
```

L'application démarre sur `http://localhost:4200`.

**4. S'assurer que l'API est démarrée**

Voir [taskflow-api](https://github.com/mehdi-rochereau/taskflow-api) pour les instructions de démarrage.

---

## Configuration des environnements

Les fichiers d'environnement sont dans `src/environments/`.

| Variable | Développement | Production |
|----------|---------------|------------|
| `apiUrl` | `http://localhost:8082/api` | `https://api.taskflow.mehdi-rochereau.dev/api` |
| `apiBaseUrl` | `http://localhost:8082` | `https://api.taskflow.mehdi-rochereau.dev` |
| `swaggerUrl` | `http://localhost:8082/swagger-ui/index.html` | `https://api.taskflow.mehdi-rochereau.dev/swagger-ui/index.html` |

---

## Patterns Angular démontrés

### Signals
```typescript
// État réactif sans surcharge RxJS
readonly isAuthenticated = signal<boolean>(false);
readonly username = this._username.asReadonly();
```

### Composants Smart/Dumb
```typescript
// Composant Dumb — affichage pur, OnPush
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class TaskTableComponent {
  @Input({ required: true }) tasks: Task[] = [];
  @Output() edit = new EventEmitter<{ event: Event, task: Task }>();
}
```

### Intercepteur de rafraîchissement silencieux
```typescript
// Renouvellement automatique du JWT sur 401
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
// Données chargées avant l'activation du composant
export const projectResolver: ResolveFn<Project> = (route) => {
  return projectService.getProjectById(Number(route.paramMap.get('id'))).pipe(
    catchError(() => { router.navigate(['/projects']); return EMPTY; })
  );
};
```

---

## Structure de l'application

### Routes

| Chemin | Composant | Guard | Resolver |
|--------|-----------|-------|----------|
| `/login` | `LoginComponent` | — | — |
| `/register` | `RegisterComponent` | — | — |
| `/projects` | `ProjectListComponent` | `AuthGuard` | — |
| `/projects/:id` | `ProjectDetailComponent` | `AuthGuard` | `ProjectResolver` |
| `/api-docs` | `ApiDocsComponent` | — | — |
| `**` | `NotFoundComponent` | — | — |

### Intercepteurs

| Intercepteur | Rôle |
|--------------|------|
| `CredentialsInterceptor` | Ajoute `withCredentials: true` à toutes les requêtes |
| `AuthInterceptor` | Gère les réponses 401 avec rafraîchissement silencieux |
| `ErrorInterceptor` | Gère les réponses 500 et 429 avec notifications snackbar |

---

## Améliorations prévues

- [ ] Déploiement Docker + Nginx
- [ ] CI/CD GitHub Actions
- [ ] Connexion OAuth2 (Google / GitHub)
- [ ] `TaskTableComponent` — colonnes triables
- [ ] `GET /api/auth/me` — éliminer tout état de session côté client
- [ ] i18n — internationalisation Angular pour les textes de l'interface

---

## Décisions architecturales

**JWT dans des cookies HttpOnly plutôt que localStorage**
Les tokens ne sont jamais accessibles au JavaScript, réduisant significativement
le risque XSS. Angular les envoie automatiquement via `withCredentials: true`.

**Signals plutôt que RxJS pour l'état des composants**
Les Signals Angular 19 offrent une alternative plus simple et plus performante
aux BehaviorSubject pour l'état local des composants, tout en restant
interopérables avec les Observables.

**Détection de changements OnPush sur tous les composants Dumb**
Réduit les re-rendus inutiles en ne vérifiant les composants que lorsque
leurs références `@Input()` changent.

---

## Écosystème

| Dépôt | Description |
|-------|-------------|
| [taskflow-ui](https://github.com/mehdi-rochereau/taskflow-ui) | Frontend Angular (ce dépôt) |
| [taskflow-api](https://github.com/mehdi-rochereau/taskflow-api) | API REST Spring Boot |
| [SECURITY.fr.md](SECURITY.fr.md) | Politique de sécurité du frontend |
| [taskflow-api/SECURITY.fr.md](https://github.com/mehdi-rochereau/taskflow-api/blob/main/SECURITY.fr.md) | Politique de sécurité de l'API |
