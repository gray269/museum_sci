# PHÉNOMÈNES — mini-application science & art

Cette première version contient trois œuvres interactives :

1. **Résonance** — interférences entre deux ondes.
2. **Invisible** — visualisation artistique d'un champ créé par deux charges.
3. **Papillon** — attracteur de Lorenz et sensibilité aux conditions initiales.

## Essai immédiat sur ordinateur

Ouvre `index.html` dans un navigateur. Les animations fonctionnent directement.

Le mode hors ligne et l'installation nécessitent que l'application soit publiée
sur une adresse HTTPS. Le moyen gratuit le plus simple est GitHub Pages.

## Publication gratuite avec GitHub Pages

1. Crée un nouveau dépôt GitHub, par exemple `phenomenes`.
2. Décompresse l'archive et dépose **le contenu du dossier** dans le dépôt :
   `index.html`, `app.js`, `style.css`, `manifest.webmanifest`, `sw.js` et `icons`.
3. Dans le dépôt, ouvre `Settings`, puis `Pages`.
4. Dans `Build and deployment`, choisis `Deploy from a branch`.
5. Choisis la branche `main` et le dossier `/ (root)`, puis enregistre.
6. GitHub fournit ensuite une adresse de type :
   `https://ton-identifiant.github.io/phenomenes/`

## Installation sur téléphone

### Android

Ouvre l'adresse dans Chrome. Utilise le bouton `Installer` de l'application ou
le menu du navigateur, puis `Installer l'application` / `Ajouter à l'écran
d'accueil`.

### iPhone / iPad

Ouvre l'adresse dans Safari, touche `Partager`, puis `Sur l'écran d'accueil`.

## Modifier les textes ou ajouter une œuvre

- Les titres, poèmes et explications sont dans l'objet `SCENES` de `app.js`.
- Les trois simulations sont dans les fonctions :
  - `drawWaves()`
  - `drawField()`
  - `drawChaos()`
- Les couleurs sont définies dans `paletteSets`.
- Le style de l'interface se trouve dans `style.css`.

## Créer plus tard un véritable APK Android

Le même code HTML/CSS/JavaScript pourra être enveloppé dans une application
Android avec Capacitor. Cette étape demande Node.js et Android Studio, mais il
n'est pas nécessaire de recommencer les simulations.
