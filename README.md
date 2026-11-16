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

At widths up to 1000px, `site/mobile.css` turns the actual rear camera clockwise into a vertical body, with the physical wheel and camera buttons below its LCD. The live HTML stays upright inside the rotated aperture and scrolls above the persistent navigation. Home uses the same full-bleed portrait and LCD template as desktop. Apps, Photos and Menu navigation stays visible on content screens; Menu contains About, Résumé and Contact. The hardware controls keep their menu, playback, section, home and previous/next actions; wheel input is converted back into the camera’s original coordinates. Mobile uses a separate rear render without control ink, with upright HTML labels and icons over the same buttons; desktop retains its original printed image and model. Regenerate the mobile image with `blender --background --python scripts/render-mobile-camera.py`; the script reads the shipped GLB and preserves the existing poster framing and lighting. Mobile projects expand in place, About flows in one column, and photographs retain their full framing in detail. Vertical scrolling stays inside the LCD; horizontal swipes and the on-screen arrows browse photographs. Browser Back returns from photo/video detail to the grid. Mobile Résumé leads with Open résumé and Download PDF actions, with an optional inline preview; desktop retains its embedded Google Doc.

The static HTML stays visible until the app initializes, so a failed script download leaves readable content. Image space is reserved while loading, photo failures show a message, and slow résumé previews retain direct document access. Desktop camera projection and assets are unchanged.

Browser review covered 320, 375, 390 and 430px phone widths, landscape, both sides of the 1000px breakpoint and 1440px desktop, with no horizontal overflow. Mobile starts near edge-to-edge, trimming the poster’s transparent margins instead of scaling the body down to the viewport height; lower controls stay reachable through normal page scrolling. The smaller LCD uses two rows of navigation below 356px. Project expansion, menu navigation/focus, photo detail, browser history and résumé actions were checked in the browser. Physical iOS/Android testing remains separate.

The mobile poster applies the same red wheel-segment color as the desktop renderer. The Home portrait keeps its existing crop; only the outer camera is enlarged.

## Mobile entrance

On a fresh mobile page load, `site/mobile-intro.js` plays a 1.75-second rendered camera turn and crossfades into the existing LCD and controls. The H.264 clip is about 185 KB; phones still do not download Three.js or the GLB. Desktop retains its live 3D entrance. Reduced motion and data saver skip the clip entirely. Tapping, scrolling, keyboard input, a width change or hiding the page immediately restores the normal camera. Autoplay/load failures and a 1.2-second loading deadline also fall back to the still image. Section navigation does not replay the entrance.

Regenerate the clip with `blender --background --python scripts/render-mobile-intro.py` (requires ffmpeg). It shares the poster renderer’s model, lighting, red wheel material, framing and overscan. `npm run test:mobile-intro` checks lifecycle and accessibility fallbacks; browser checks cover playback, the LCD handoff, tap-to-skip, navigation and desktop isolation.
