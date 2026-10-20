## API de développement

### Convention REST

Le chemin des fichiers source mime le chemin de l'API : un handler vit dans
`src/api/<resource>/<METHOD>.ts` et sert la route `/api/<resource>`. Par
exemple `api/car-model/GET.ts` expose `GET /api/car-model`. Ajouter une
nouvelle ressource ou méthode revient à créer le fichier correspondant :
`serve.ts` découvre les routes au démarrage. Une méthode non servie renvoie
405 avec l'en-tête `Allow`, et `withCors` répond aux preflights `OPTIONS`.

Sur Vercel, un handler `api/<resource>/<METHOD>.ts` est exposé sous
`/api/<resource>/<METHOD>` : chaque route doit donc avoir sa rewrite dans
`www/vercel.json` (ex. `/api/car-model` → `/api/car-model/GET`).

| Fichier | Rôle |
|---|---|
| [`api/car-model/GET.ts`](./api/car-model/GET.ts) | Handler `GET /api/car-model` (recherche par plaque) |
| [`api/errors.ts`](./api/errors.ts) | Codes d'erreur standardisés des réponses d'erreur |
| [`services/plate-lookup/index.ts`](./services/plate-lookup/index.ts) | Service de recherche de plaque (futur) |

### Authentification

Une requête est same-origin quand son `Origin` (ou, à défaut, l'hôte de la
requête — les navigateurs omettent `Origin` sur un GET same-origin) partage le
nom de domaine de `BASE_URL` : elle est alors autorisée sans clé. Toute autre
origine est considérée comme externe et doit correspondre à une entrée de
`API_CLIENTS` avec la bonne `x-api-key`.

`API_CLIENTS` est un objet JSON associant chaque origine externe autorisée à sa
clé d'API :

```json
{ "https://client-a.com": "KEY_A", "https://client-b.com": "KEY_B" }
```

Exemple d'appel externe avec `curl` :

```sh
curl -H 'Origin: https://client-a.com' -H 'x-api-key: KEY_A' \
  'https://api.example.com/api/car-model?plate=ED-512-BL'
```

### Journalisation des paramètres

Quand `MIDDLEWARE_LOG_PARAMETERS` vaut `TRUE`, le middleware `withLog` ajoute
à sa ligne de log les paramètres de la requête (query et body JSON ou
formulaire), fusionnés dans un objet JSON tronqué à 100 caractères :

```
[api] GET /api/car-model -> 200 (1.2ms) params={"plate":"ED-512-BL"}
```

Cette option est désactivée par défaut (`FALSE`) : à n'activer que pour le
débogage, car elle expose les données envoyées par les clients dans les logs.
