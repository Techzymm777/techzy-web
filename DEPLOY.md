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

## The ambient audio track

The sound toggle plays `public/audio/ambient-loop.mp3` via
`src/motion/sound.js` (fade in/out on toggle, suspend on tab blur). Sound is
ON by default: autoplay is attempted at boot, and when the browser blocks it
(most do before any user gesture) playback starts at the visitor's first
interaction instead.

Current track: **"Cinematic Space Journey – Interstellar Odyssey"** (1:19,
looped) — https://pixabay.com/music/ambient-cinematic-space-journey-interstellar-odyssey-365175/
Licensed under the Pixabay Content License: free for commercial use, no
attribution required, but the file may not be redistributed standalone.

To swap the track: replace `public/audio/ambient-loop.mp3` with the new file
(same name, no code change) and update this section's provenance note.

## Local verification before shipping

```bash
nvm use 22
npm ci
npm run test     # 23 unit tests
npm run build    # outputs dist/
npm run preview  # serves the prod build locally
```
