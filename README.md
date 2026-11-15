# Roger McKenzie — Personal Website

An interactive Sony ZV-E10 portfolio with projects, photographs, videos, résumé and contact information on its LCD. Desktop uses a 3D camera; phones and browsers without WebGL use the rear image and HTML controls.

## Run locally

Run `npm ci`, then `npm run dev` and open http://localhost:4184.

`npm run build` copies the pinned Three.js runtime, GLTF loader, loader utility and license from `node_modules/three` into `site/vendor/three`. Those generated assets are ignored by Git; the browser serves them locally without a CDN.

## Validate

Run `npm run check` for JavaScript syntax and `npm run test:camera` for model budgets, LCD projection, controls, depth hit-testing and fallback behavior. Run the build first after a clean install.

## Publish

Cloudflare Workers Builds watches `main`. After a push or merge, its existing `npx wrangler deploy` command runs the asset build configured in `wrangler.jsonc` and publishes `site/` to `personalwebsite`. Both https://rogermckz.com and https://rogermckz.dev serve that same Worker. Feature branches get isolated Cloudflare previews.

## Site files

- `site/index.html`: entry point and static fallback content
- `site/portfolio-views.js`: content and LCD HTML templates
- `site/app.js`: navigation, photos, video and résumé
- `site/camera3d.js`: desktop rendering, lighting and motion
- `site/camera-screen.js`: HTML projection and hit testing
- `site/camera-extras.js`: top and side controls
- `site/style.css`, `site/camera.css`, `site/lcd.css`: layout, camera and display styles
- `site/assets/`: portrait, photos, model and fallback image

The résumé loads directly from Roger’s Google Doc. Update asset query versions when changing the runtime or model.
