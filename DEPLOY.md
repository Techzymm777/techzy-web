# Deploying Techzy

Hosted on Netlify, auto-deployed from this repo. `netlify.toml` is the source
of truth for build settings and overrides anything set in the Netlify UI.

## Build settings

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | 22 (pinned via `NODE_VERSION` in `netlify.toml`) |

**Branch workflow:** `staging` is the default branch — all feature work
pushes and merges there, and its Netlify branch deploy is the staging
environment. `main` is production: it only moves when a `staging` → `main`
pull request is manually reviewed and merged (that merge is the production
release). The `coming-soon/` folder is kept in the repo — to take
production offline again, point `[context.production]` in `netlify.toml`
at it (see git history of this file for the exact block).

## Things the build relies on

- **SPA routing**: `public/_redirects` contains `/* /index.html 200` so the
  client-side router owns every path. Unknown paths return HTTP 200 with the
  client-rendered 404 page (accepted trade-off, see PR #5).
- **Netlify Forms**: the hidden `<form name="contact" data-netlify="true">`
  snapshot in `index.html` is what registers the form at deploy time. Do not
  remove it — the interactive form on `/contact` is rendered client-side and
  posts against that registration with the same field names.
- **No secrets in the repo**: environment variables live in the Netlify UI.
  The Amplitude browser key in `src/amplitude-init.js` is a public client key.

## Swapping in the licensed audio track

The sound toggle currently plays a Web Audio drone (`src/motion/sound.js`).
Once a track is licensed:

1. Drop the file at `public/audio/<track>.mp3` (or `.ogg`).
2. In `src/motion/sound.js`, replace `startAudio`/`stopAudio` with an
   `<audio loop src="/audio/<track>.mp3">` element and call
   `.play()`/`.pause()`.
3. Keep the existing behavior around it: gentle fade in/out on toggle, the
   `visibilitychange` suspend/resume, OFF by default, and playback only ever
   starting from the user's tap (autoplay policies).

## Local verification before shipping

```bash
nvm use 22
npm ci
npm run test     # 23 unit tests
npm run build    # outputs dist/
npm run preview  # serves the prod build locally
```
