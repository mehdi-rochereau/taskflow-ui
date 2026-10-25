# Stratégie de tests

> 🇬🇧 [English version](TESTING.md)

Ce document énonce ce qui est testé dans ce dépôt, ce qui ne l'est pas, et
pourquoi. Il a été écrit avant les tests qu'il décrit, afin que le plan précède
le travail plutôt que d'être reconstitué à partir de lui.

---

## Deux niveaux, pas davantage

Les **tests unitaires** couvrent la logique qui porte un risque réel, les
fonctions pures, les services HTTP, et la chaîne d'authentification formée des
intercepteurs, du garde de route et du resolver. Ils utilisent Vitest, et
TestBed uniquement là où l'injecteur d'Angular est nécessaire.

Les **tests de composant** couvrent le raccordement entre un composant, son
template et ses services. Ils utilisent TestBed avec le vrai template et les
harnais de test d'Angular Material. Le réseau est remplacé par
`HttpTestingController`, jamais par un serveur en fonctionnement.

Le second niveau est ce que ce projet appelle intégration. C'est la seule forme
d'intégration qu'un frontend possède. Il n'y a ici ni base de données, ni
transaction, ni couche de persistance, donc transposer la notion d'intégration
de l'API n'aurait aucun sens.

---

## Ce qui est volontairement hors périmètre

**Les tests qui démarrent l'API et une base de données.** Le frontend n'a rien
à intégrer à ce niveau. Le véritable risque de frontière est la dérive de
contrat, lorsque les types TypeScript décrivent une promesse plutôt que ce que
le réseau renvoie réellement. Ce risque trouve sa réponse dans un test de
contrat contre `/v3/api-docs`, pas dans le démarrage de la pile.

**Les tests de bout en bout dans un navigateur.** Ils recoupent en partie les
tests de fumée du déploiement continu et la vérification des en-têtes en
production, et ils exigent de l'infrastructure. Envisageables plus tard, une
fois les deux niveaux ci-dessus en place.

**La couverture comme objectif.** Un frontend contient une grande quantité de
template et de code de liaison dont le coût de test dépasse la valeur. Les
seuils ont été posés à partir d'une mesure réelle plutôt que recopiés depuis les
95 pour cent de l'API. Ce que le chiffre mesure vraiment est exposé plus bas.

---

## Lancer les tests

```bash
npm test              # passe unique, sans couverture, la boucle de développement
npm run test:watch    # boucle de surveillance pour le travail local
npm run test:coverage # passe unique avec couverture et seuils, ce que lance le CI
```

Aucun backend, aucune base de données et aucun Docker ne sont nécessaires.
`HttpTestingController` remplace entièrement le réseau. Une suite qui exige un
backend en fonctionnement est une suite qu'on cesse de lancer.

Le CI exécute `npm run test:coverage` après ESLint et avant la compilation de
production. L'étape est bloquante, aussi bien sur un test en échec que sur une
couverture inférieure à un seuil.

---

## Conventions

Les fichiers de test vivent à côté du fichier qu'ils couvrent et portent le même
nom de base, ainsi `form-errors.ts` est couvert par `form-errors.spec.ts`.

`describe`, `it`, `expect` et `vi` sont globaux, déclarés par
`"types": ["vitest/globals"]` dans `tsconfig.spec.json`. Ils ne sont pas
importés.

Le constructeur `@angular/build:unit-test` génère lui-même l'initialisation de
TestBed, il n'y a donc aucun fichier de montage manuel dans ce dépôt.

Un test affirme un comportement, jamais la simple existence d'un symbole. Les
vingt-huit fichiers générés par le CLI Angular ont été supprimés plutôt que
remplis. Chacun affirmait `expect(x).toBeTruthy()`, ce qui passe sur du code
cassé, et ensemble ils donnaient l'apparence d'une suite complète sans rien
vérifier.

---

## Couverture par domaine

| Domaine                                                         | Niveau    | État |
| --------------------------------------------------------------- | --------- | ---- |
| `getFieldErrors`, `passwordMatchValidator`, les deux pipes      | unitaire  | ✅   |
| `AuthService`, `ProjectService`, `TaskService`                  | unitaire  | ✅   |
| `authInterceptor`, `errorInterceptor`, `credentialsInterceptor` | unitaire  | ✅   |
| `authGuard`, `projectResolver`                                  | unitaire  | ✅   |
| `LoginComponent`, `ProjectListComponent`, `TaskTableComponent`  | composant | ✅   |
| Mesure de couverture et seuils                                  | outillage | ✅   |

`NotificationService` est absent de ce tableau à dessein. Il enveloppe
`MatSnackBar` et non `HttpClient`, il n'expose donc aucun contrat HTTP et ne
détient aucun état propre. Il sera exercé au niveau composant le jour où un test
aura besoin d'affirmer qu'un message a été affiché.

Le niveau composant laisse volontairement deux choses de côté. Les flux de
dialogues de `ProjectListComponent` orchestrent deux autres composants, un test
ici mesurerait donc ceux-là plutôt que celui-ci. Et la transition de largeur de
`TaskTableComponent`, du jeu de colonnes large vers le jeu réduit, n'est pas
couverte. Une instance neuve prouve que la largeur de la fenêtre décide de
l'en-tête rendu, mais provoquer un redimensionnement sur une instance vivante
n'a jamais atteint le tableau sous jsdom. Ce mécanisme disparaîtra avec la
migration prévue vers `BreakpointObserver`.

---

## Ce que mesure le chiffre de couverture

La mesure de référence relevée le 25 octobre 2026, avec quatre-vingt-dix tests.

| Indicateur   | Mesuré  | Seuil |
| ------------ | ------- | ----- |
| Instructions | 79,48 % | 78    |
| Branches     | 81,64 % | 80    |
| Fonctions    | 68,80 % | 67    |
| Lignes       | 80,66 % | 79    |

Il faut lire ce chiffre pour ce qu'il est. Le fournisseur v8 ne rapporte que les
fichiers qu'un test a réellement chargés, donc un composant qu'aucun fichier de
test n'importe n'apparaît pas du tout dans le rapport. Le pourcentage décrit
ainsi la qualité de couverture du code testé, et non la part de l'application
qui est testée. Le tableau de couverture ci-dessus est l'inventaire réel, et
c'est lui qu'il faut lire.

Ce choix est délibéré. Inclure tous les fichiers de `src/app` ferait tomber le
chiffre autour du quart, en comptant à zéro des composants que cette stratégie a
décidé de ne pas tester, ce qui punit une décision documentée par un chiffre
démoralisant sans rien mesurer de nouveau.

Le chiffre des fonctions est le plus bas des quatre, et il s'explique plutôt
qu'il n'inquiète. `ProjectFormDialogComponent` et `ConfirmDialogComponent` sont
tirés dans le rapport parce que `ProjectListComponent` les importe, alors
qu'aucun test ne les exerce, et les trois méthodes de dialogue de
`ProjectListComponent` lui-même sont hors périmètre pour la même raison.

Chaque seuil se tient un à deux points sous sa valeur mesurée. Un seuil posé
exactement sur la mesure échoue au premier changement anodin, ce qui apprend aux
gens à relever la barre plutôt qu'à combler le manque.

Les seuils vivent dans `vitest.config.ts` parce que le constructeur
`@angular/build:unit-test` expose la mesure de couverture mais aucune option de
seuil. Le constructeur charge ce fichier par son option `runnerConfig`, et
l'équipe Angular indique explicitement qu'elle n'en supporte pas le contenu.
C'est donc l'un des premiers endroits à vérifier lors d'une montée de version
majeure d'Angular.

---

## Tests écrits à la suite d'un défaut

Cinq entrées à ce jour, et cette section a vocation à s'allonger.

`authInterceptor` a été la première priorité de la suite. Un conflit entre lui et
`errorInterceptor` sur les réponses 401 a atteint la production une fois, et le
rafraîchissement silencieux est le mécanisme que personne n'ose toucher sans
filet. Un test fige désormais le silence d'`errorInterceptor` sur 401, qui est
précisément le point sur lequel les deux intercepteurs se contredisaient.

`authInterceptor` excluait les points d'entrée d'authentification par
`req.url.includes('/auth')`, un test de sous-chaîne qui correspond n'importe où
dans l'URL. Un point d'entrée légitime comme `/api/projects/authors` était donc
traité comme une URL d'authentification et privé de rafraîchissement, laissant
l'utilisateur sur un 401 que rien ne rejouait. L'exclusion est maintenant ancrée
sur le chemin de base d'authentification, et un test couvre cette URL exacte.

`projectResolver` validait son paramètre de route par `isNaN` seul. `Number(null)`
et `Number('')` valent tous deux zéro, donc un identifiant absent ou vide
franchissait le garde et atteignait l'API sous la forme `getProjectById(0)`, et
`Number('1.5')` passait sous forme de fraction. Le resolver rejette désormais
tout ce qui n'est pas un entier strictement positif, et quatre tests couvrent ces
cas.

`passwordMatchValidator` efface son erreur sur le contrôle `confirmPassword`
lorsque les deux champs redeviennent identiques. Deux champs vides sont égaux,
donc cette branche d'effacement s'exécute sur un formulaire vide, et sans son
garde `hasError` elle effacerait l'erreur `required`. Un test fige ce cas.

`LoginComponent` lisait `err.error.message` derrière une assertion de type, qui
ne produit aucune vérification à l'exécution. Une réponse sans corps, comme le
503 que renvoie nginx pendant un redéploiement, laisse `err.error` à nul, et la
lecture de `message` levait une exception dans le gestionnaire d'erreur. Le
formulaire restait alors muet, sans rien pour expliquer l'échec. Un chaînage
optionnel rend le message de repli de nouveau atteignable, et un test vide un
503 à corps nul.
