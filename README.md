# rachatvoitureexpress — site statique

Version exportable du site **Rachat Voiture Express** (landing page
« Estimez et vendez cash »), issue de l'expérimentation
`design/experiments/fresh-start`.

⚠️ **Ce dossier est généré automatiquement.** La source de vérité se trouve
dans `src/`. Les modifications actives du front-end, du design system et de
l'API doivent être faites dans `src/`, puis synchronisées vers `www/` via
`bun run build` (voir le README à la racine du projet).

Le site est **100 % statique** : HTML + CSS + un peu de JavaScript inline.

## Contenu

| Fichier          | Rôle                                                        |
| ---------------- | ----------------------------------------------------------- |
| `index.html`     | Page d'accueil (HTML + JS inline : wizard d'estimation, upload photos) |
| `rachat-voiture-express.css`| Design system complet (tokens + composants)        |
| `color-variants.css` | Variante de palette                                         |
| `vercel.json`    | Configuration Vercel explicite (site statique, sans framework) |

Les polices (Google Fonts) et les photos (Unsplash) sont chargées depuis
leurs CDN respectifs — aucune ressource locale à déployer en plus.

---

## Déploiement sur Vercel

### Déploiement automatique à chaque push

Le site est un repo Git. Le déploiement se déclenche tout seul à chaque
push sur la branche par défaut (master).

1. **Pousser le code sur un hébergeur Git** (GitHub, GitLab ou Bitbucket) :

   ```sh
   cd www
   git remote add origin https://github.com/<votre-compte>/<repo>.git
   git push -u origin master
   ```

2. **Importer le projet dans Vercel** :
   - Rendez-vous sur <https://vercel.com/new>.
   - Connectez votre compte Git, puis **Import** sur le repo créé.
   - Les réglages sont déjà les bons (détectés automatiquement ou fournis
     par `vercel.json`) :
     - **Framework Preset** : `Other`
     - **Build Command** : *(aucun)*
     - **Output Directory** : `.` (la racine, où se trouve `index.html`)
   - Cliquez sur **Deploy**.

3. **Déploiements suivants** : chaque `git push` sur `master` déclenche
   automatiquement une mise en production. Rien à faire.

### Vérifier localement avant de déployer

```sh
cd www
bunx serve .          # http://localhost:3000
```

Ou simplement ouvrir `index.html` dans un navigateur — tout est statique,
aucun serveur n'est requis.

### Audit qualité (vitals + a11y)

Deux audits rapides à lancer sur le site déployé, via `agent-browser` :

```sh
# Core Web Vitals : TTFB, FCP, LCP, CLS, INP (+ --json pour le détail)
agent-browser vitals https://rachat-voiture-express.vercel.app --json

# Audit d'accessibilité axe-core (violations WCAG + sélecteurs des nœuds)
agent-browser a11y https://rachat-voiture-express.vercel.app --json
```

Pour un **rapport Lighthouse complet** (Performance, Accessibility, Best
Practices, SEO) :

```sh
npx lighthouse https://rachat-voiture-express.vercel.app \
  --preset=desktop --output=html --output-path=lighthouse.html
```

État au 31/07/2026 :

- **vitals** : TTFB 5.3 ms, FCP 520 ms, LCP 520 ms, CLS 0.0001 — très bon.
- **a11y** : 2 violations à corriger —
  - *color-contrast* (serious) : les accents doré `#ffc502` / orange `#ff5a00`
    sur fonds clairs (labels, brand, kickers, CTA) sous les ratios WCAG ;
  - *heading-order* (moderate) : des `h3`/`h4` sautent un niveau.
  - à vérifier manuellement : `aria-label` sur des `div` sans `role`
    (`form-card`, `card__header`), étoiles et légendes sur images.
