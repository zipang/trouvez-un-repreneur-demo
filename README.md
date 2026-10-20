# Trouvez Un Repreneur — production site

This directory holds the production build of **Trouvez Un Repreneur**. The
source repository is `git@github.com:zipang/trouvez-un-repreneur.git`. It
builds this directory from `src/`.

> **Do not edit the generated files.** The build overwrites them. Change the
> sources in `src/` of the source repository, then run `bun run build`.

## Deployment

| Item        | Value                                                  |
| ----------- | ------------------------------------------------------ |
| Git remote  | `git@github.com:zipang/trouvez-un-repreneur-demo.git`  |
| Branch      | `master`                                               |
| Host        | Vercel                                                 |
| Runtime     | Bun                                                    |
| Build step  | none (the files are already built)                     |
| Output root | `.`                                                    |

Each push to `master` starts a production deployment. The `master` branch
tracks `origin/master` and pushes to the repository above.

## Contents

| Path           | Role                                                         |
| -------------- | ------------------------------------------------------------ |
| `index.html`   | Landing page with the inlined estimation wizard               |
| `chunk-*.js`   | Bundled and minified JavaScript                               |
| `chunk-*.css`  | Purged CSS of the design system and the components            |
| `api/`         | Serverless API functions (TypeScript, Bun runtime)            |
| `services/`    | Shared modules that the API functions import                  |
| `vercel.json`  | Vercel configuration and API route rewrite                    |
| `README.md`    | This file                                                     |

The page is a single full-screen estimation wizard. It has no site header and
no site footer. The wizard owns the viewport and works from 320 px wide.

## Build and deploy

Run these commands in the parent repository:

```sh
bun run build   # rebuild this directory from src/
bun run deploy  # rebuild, commit and push this directory
```

The build preserves `.git`, `.gitignore`, `README.md`, `package.json` and
`vercel.json`.

## Local preview

Preview the built files only:

```sh
bunx serve www
```

This static server does not run the API functions.

Preview the full site with the API, from the parent repository:

```sh
BASE_URL=http://localhost:3000 bun ./serve.ts --preprod
```

Open `http://localhost:3000/`.

## Environment variables

Set these variables in the Vercel project settings.

| Variable                    | Required | Role                                                                 |
| --------------------------- | -------- | -------------------------------------------------------------------- |
| `BASE_URL`                  | yes      | Public base URL. The API resolves request URLs and same-origin requests with it. |
| `API_CLIENTS`               | no       | JSON map of external origins to their API keys.                       |
| `MIDDLEWARE_LOG_PARAMETERS` | no       | Set to `TRUE` to log the request parameters.                          |

Without `BASE_URL`, the API functions respond with an internal error.

## API

The endpoint `/api/car-model?plate=AB-123-CD` returns the vehicle for a plate.
`vercel.json` rewrites `/api/car-model` to `api/car-model/GET.ts`.

Every response uses the same envelope:

```json
{ "status": 200, "success": true, "error": null, "payload": {} }
```

The client reads the vehicle fields from `payload`.
