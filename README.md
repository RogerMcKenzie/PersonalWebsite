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

## Mobile layout

At widths up to 1000px, `site/mobile.css` turns the actual rear camera clockwise into a vertical body, with the physical wheel and camera buttons below its LCD. The live HTML stays upright inside the rotated aperture and scrolls above the persistent navigation. Home, Apps, Photos and Menu remain visible on every screen; Menu contains About, Résumé and Contact. The hardware controls keep their menu, playback, section, home and previous/next actions; wheel input is converted back into the camera’s original coordinates. Mobile projects expand in place, About flows in one column, and photographs retain their full framing in detail. Vertical scrolling stays inside the LCD; horizontal swipes and the on-screen arrows browse photographs. Browser Back returns from photo/video detail to the grid. The résumé retains its Google Docs source with visible Open and Download PDF links.

The static HTML stays visible until the app initializes, so a failed script download leaves readable content. Image space is reserved while loading, photo failures show a message, and slow résumé previews retain direct document access. Desktop camera projection and assets are unchanged.

Browser review covered 320, 375, 390 and 430px phone widths, landscape, both sides of the 1000px breakpoint and 1440px desktop, with no horizontal overflow. The vertical camera and its controls fit in a 320 × 667 viewport; the smaller LCD uses two rows of navigation below 356px. Project expansion, menu navigation/focus, photo detail, browser history and résumé actions were checked in the browser. Physical iOS/Android testing remains separate.
