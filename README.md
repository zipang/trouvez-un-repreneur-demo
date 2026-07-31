# rachatvoitureexpress — site statique

Version exportable du site **Rachat Voiture Express** (landing page
« Estimez et vendez cash »), issue de l'expérimentation
`design/experiments/fresh-start`.

Le site est **100 % statique** : HTML + CSS + un peu de JavaScript inline.
Pas de build, pas d'installation, pas de variables d'environnement.

## Contenu

| Fichier          | Rôle                                                        |
| ---------------- | ----------------------------------------------------------- |
| `index.html`     | Page d'accueil (HTML + JS inline : wizard d'estimation, upload photos) |
| `fresh-start.css`| Design system complet (tokens + composants)                 |
| `color-variants.css` | Variante de palette                                         |
| `vercel.json`    | Configuration Vercel explicite (site statique, sans framework) |

Les polices (Google Fonts) et les photos (Unsplash) sont chargées depuis
leurs CDN respectifs — aucune ressource locale à déployer en plus.

---

## Déploiement sur Vercel

### Option A — Déploiement automatique à chaque push (recommandé)

Le site est un repo Git. Le déploiement se déclenche tout seul à chaque
push sur la branche par défaut.

1. **Pousser le code sur un hébergeur Git** (GitHub, GitLab ou Bitbucket) :

   ```sh
   cd www
   git remote add origin https://github.com/<votre-compte>/<repo>.git
   git push -u origin main
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

3. **Déploiements suivants** : chaque `git push` sur `main` déclenche
   automatiquement une mise en production. Rien à faire.

### Option B — Déploiement via la CLI

Si vous préférez déployer sans passer par un repo Git :

```sh
# Installation une fois (nécessite Node.js)
npm i -g vercel

# Premier déploiement (liaison du projet, framework "Other")
cd www
vercel

# Mise en production
vercel --prod
```

Le site est alors disponible sur l'URL `https://<projet>.vercel.app`.

### Ajouter un nom de domaine

1. Dans le tableau de bord Vercel : **Project → Settings → Domains**.
2. Ajoutez `rachatvoitureexpress.fr` (et éventuellement `www.`).
3. Suivez les instructions DNS affichées (Apex via ALIAS/ANAME chez votre
   registrar, ou simple redirection).

### Vérifier localement avant de déployer

```sh
cd www
bun --hot index.html
```

Ou simplement ouvrir `index.html` dans un navigateur — tout est statique,
aucun serveur n'est requis.
