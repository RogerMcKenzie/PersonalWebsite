# Roger McKenzie — Personal Website

The interactive Sony ZV-E10 portfolio, with Roger’s projects, photography, videos, résumé and contact information on its LCD. Desktop renders the camera in 3D using vendored Three.js; phones and browsers without WebGL use the rear camera image and HTML controls.

## Run locally

Run `npm run dev`, then open http://localhost:4183. The site in `site/` is plain HTML, CSS and JavaScript; no compilation or dependency installation is needed.

## Validate

Run `npm run check` for JavaScript syntax and `npm run test:camera` for the shipped model, LCD projection, controls, depth hit-testing and fallback behavior.

## Publish

Cloudflare Workers Builds watches this repository’s `main` branch. After a push or merge to `main`, the existing `npx wrangler deploy` command publishes `site/` to the `personalwebsite` Worker using `wrangler.jsonc`. Both https://rogermckz.com and https://rogermckz.dev serve that same deployment.

## Site files

- `site/index.html`: page, static content, script imports and font loading
- `site/app.js`: LCD content, navigation, photos, videos and dialogs
- `site/camera3d.js`, `site/camera-screen.js`, `site/camera-extras.js`: rendering, LCD projection and camera interactions
- `site/style.css`, `site/camera.css`, `site/lcd.css`, `site/screen-glass.css`: layout and display styling
- `site/assets/`: portraits, photographs, camera model and fallback images
- `site/vendor/three/`: Three.js runtime and its license

The résumé loads directly from Roger’s Google Doc. Keep asset query versions current when changing camera scripts or model files.
