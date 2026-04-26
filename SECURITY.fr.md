> 🇬🇧 [Read in English](SECURITY.md)

# Politique de Sécurité

## Vue d'ensemble

Ce document décrit les mesures de sécurité mises en place dans le frontend TaskFlow
et présente les limitations connues ainsi que les améliorations prévues.

TaskFlow est un projet portfolio démontrant les bonnes pratiques de sécurité
d'une application web moderne avec Angular 19, Spring Boot 3.5,
authentification JWT et cookies HttpOnly.

---

## Versions supportées

| Version | Supportée |
|---------|-----------|
| 1.0.x   | ✅        |

---

## Mesures de sécurité

### Authentification & Gestion des sessions

- **Cookies HttpOnly** — Le token JWT d'accès est stocké dans un cookie `HttpOnly`
  nommé `jwt` (chemin `/api`, expiration 15 minutes). Inaccessible au JavaScript,
  ce qui empêche le vol de token par XSS.
- **Rotation des Refresh Tokens** — Les refresh tokens sont à usage unique et stockés
  dans un cookie `HttpOnly` nommé `refreshToken` (chemin `/api/auth`, expiration 7 jours).
  Chaque utilisation révoque le token précédent et en émet un nouveau.
- **Rafraîchissement silencieux** — Les tokens JWT expirés sont automatiquement
  renouvelés via l'`AuthInterceptor` sans interrompre l'expérience utilisateur.
- **Restauration de session** — Au rechargement de page, l'`AuthGuard` tente un
  rafraîchissement silencieux pour restaurer la session depuis le cookie refresh token.
- **Déconnexion sécurisée** — Le logout appelle `POST /api/auth/logout` qui révoque
  tous les refresh tokens actifs côté serveur et efface les deux cookies HttpOnly.
- **Aucune donnée sensible en localStorage** — Seules des données d'affichage
  non sensibles sont stockées côté client. Tous les tokens d'authentification
  sont gérés via des cookies HttpOnly.

### Sécurité des échanges

- **HTTPS obligatoire en production** — Toutes les communications utilisent TLS.
- **HSTS** — En-tête `Strict-Transport-Security` avec `includeSubDomains` et
  `max-age=31536000` appliqué par le serveur API.
- **`withCredentials: true`** — Configuré globalement via le `CredentialsInterceptor`
  pour garantir l'envoi des cookies avec chaque requête cross-origin.

### Prévention XSS

- **Échappement automatique Angular** — Toutes les valeurs interpolées (`{{ }}`)
  sont automatiquement échappées par le moteur de templates Angular.
- `bypassSecurityTrust` n'est **jamais utilisé** dans ce projet.
- Aucune manipulation directe du DOM via `innerHTML` ou équivalent.
- **Content Security Policy** — `default-src 'self'; frame-ancestors 'none'`
  appliqué par le serveur API, empêchant l'injection de scripts non autorisés.

### Prévention CSRF

- **Cookies SameSite=Strict** — Tous les cookies HttpOnly utilisent `SameSite=Strict`,
  empêchant les attaques CSRF.
- **API sans état** — L'API n'utilise pas de cookies de session,
  éliminant le vecteur d'attaque CSRF principal.

### Contrôle d'accès

- **Guards de routes** — L'`AuthGuard` empêche l'accès aux routes protégées
  sans session valide. Les utilisateurs non authentifiés sont redirigés vers `/login`.
- **Vérification côté serveur** — Toutes les autorisations sont vérifiées côté serveur
  via Spring Security, indépendamment des guards côté client. Voir
  [taskflow-api/SECURITY.fr.md](https://github.com/mehdi-rochereau/taskflow-api/blob/main/SECURITY.fr.md).

### En-têtes de sécurité HTTP

Tous les en-têtes de sécurité sont appliqués par le serveur API :

| En-tête | Valeur |
|---------|--------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Content-Security-Policy` | `default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'` |
| `Referrer-Policy` | `no-referrer` |

### Limitation de débit (Rate Limiting)

La limitation de débit est appliquée côté serveur. Voir
[taskflow-api/SECURITY.fr.md](https://github.com/mehdi-rochereau/taskflow-api/blob/main/SECURITY.fr.md)
pour les détails.

### Nettoyage des tokens

- **Purge planifiée** — Les refresh tokens expirés et révoqués sont automatiquement
  supprimés chaque jour à 2h00 via une tâche planifiée,
  évitant une croissance illimitée de la base de données.

### Gestion des erreurs

- Les réponses HTTP `500` affichent un message générique — les détails internes
  ne sont jamais exposés au client.
- Les réponses HTTP `429` affichent un message convivial de limitation de débit.
- Les réponses HTTP `401` déclenchent un rafraîchissement automatique de session
  ou une déconnexion selon le contexte.

---

## Principes de sécurité appliqués

| Principe | Implémentation |
|----------|----------------|
| **Défense en profondeur** | AuthGuard + AuthInterceptor + Spring Security + vérification de propriété |
| **Moindre privilège** | Cookies scopés (`/api`, `/api/auth`), usage minimal du localStorage |
| **Échec sécurisé** | Rafraîchissement échoué → déconnexion automatique et redirection vers `/login` |
| **Séparation des responsabilités** | Logique d'auth centralisée dans `AuthService` et `AuthInterceptor` |
| **Pas de sécurité par l'obscurité** | La sécurité repose sur des standards éprouvés (JWT, HttpOnly, SameSite) |

---

## Limitations connues

### Visibilité des cookies en développement

En développement (`localhost`), le flag `Secure` est désactivé sur les cookies
(`application.cookie.secure=false`). En production, ce flag est activé et les cookies
ne sont transmis que via HTTPS.

### Limitation de débit au rechargement de page

L'endpoint `/api/auth/refresh` est soumis à une limitation de débit (configurable côté serveur).
Des rechargements fréquents en peu de temps peuvent déclencher cette limite et forcer
une nouvelle authentification. C'est un compromis connu entre sécurité et expérience utilisateur.
Voir [taskflow-api](https://github.com/mehdi-rochereau/taskflow-api) pour la configuration.

### Pas de Content Security Policy côté Angular

Les en-têtes CSP sont appliqués par le serveur API, pas par l'application Angular elle-même.
Lorsque le frontend est servi indépendamment (ex. via Nginx), les en-têtes CSP doivent
être ajoutés à la configuration Nginx.

---

## Améliorations prévues

- [ ] Ajouter les en-têtes CSP à la configuration Nginx lors du déploiement
- [ ] Implémenter un endpoint de suppression de compte (`DELETE /api/users/me`) pour la conformité RGPD
- [ ] Ajouter un endpoint `GET /api/auth/me` pour éliminer tout état de session côté client
- [ ] Envisager un token CSRF basé sur un cookie `HttpOnly` pour une protection CSRF renforcée
- [ ] OAuth2 Google + GitHub (prévu)

---

## Signaler une vulnérabilité

Si vous découvrez une vulnérabilité de sécurité dans ce projet, merci de la signaler
de manière responsable en contactant :

**Email :** mehdi.rochereau.dev@gmail.com

Merci d'inclure :
- Une description de la vulnérabilité
- Les étapes pour la reproduire
- L'impact potentiel

Ce projet est un portfolio et n'est pas destiné à une utilisation en production
avec de vraies données utilisateurs. Le délai de réponse peut varier.

---

## Liens associés

- [taskflow-api](https://github.com/mehdi-rochereau/taskflow-api) — API REST Spring Boot
- [taskflow-api/SECURITY.fr.md](https://github.com/mehdi-rochereau/taskflow-api/blob/main/SECURITY.fr.md) — Politique de sécurité de l'API
