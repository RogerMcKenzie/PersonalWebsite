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

At widths up to 1000px, `site/mobile.css` turns the actual rear camera clockwise into a vertical body, with the physical wheel and camera buttons below its LCD. The live HTML stays upright inside the rotated aperture and scrolls above the persistent navigation. Home uses the same full-bleed portrait and LCD template as desktop. Projects, Photos and Menu navigation stays visible on content screens; Menu contains About, Résumé and Contact. The hardware controls keep their menu, playback, section, home and previous/next actions; wheel input is converted back into the camera’s original coordinates. Mobile uses a separate rear render without control ink, with upright HTML labels and icons over the same buttons; desktop retains its original printed image and model. Regenerate the mobile image with `blender --background --python scripts/render-mobile-camera.py`; the script reads the shipped GLB and preserves the existing poster framing and lighting. Mobile projects expand in place, About flows in one column, and photographs retain their full framing in detail. Long content scrolls inside the LCD; photo detail opens in a phone-filling viewer. Browser Back returns from photo/video detail to the grid. Mobile Résumé shows the live Google Doc immediately in a full-page proportion viewer, followed by an Open résumé link and the Download PDF button. Content and actions scroll within the LCD above the persistent navigation; desktop retains its embedded Google Doc.

The static HTML stays visible until the app initializes, so a failed script download leaves readable content. Image space is reserved while loading, photo failures show a message, and slow résumé previews retain direct document access. Desktop camera projection is unchanged.

Browser review covered 320, 375, 390 and 430px phone widths, landscape, both sides of the 1000px breakpoint and 1440px desktop, with no horizontal overflow. Mobile starts near edge-to-edge, trimming the poster’s transparent margins instead of scaling the body down to the viewport height; lower controls stay reachable through normal page scrolling. The smaller LCD uses two rows of navigation below 356px. Project expansion, menu navigation/focus, photo detail, browser history and résumé actions were checked in the browser. Physical iOS/Android testing remains separate.

The live mobile wheel segment uses the same camera red as the desktop renderer. The Home portrait keeps its existing crop; only the outer camera is enlarged.

## Mobile entrance

On a fresh mobile page load, `site/mobile-intro.js` plays a 1.75-second rendered camera turn and crossfades into the existing LCD and controls. The H.264 clip is about 185 KB; phones still do not download Three.js or the GLB. Desktop retains its live 3D entrance. Reduced motion and data saver skip the clip entirely. Tapping, scrolling, keyboard input, a width change or hiding the page immediately restores the normal camera. Autoplay/load failures and a 1.2-second loading deadline also fall back to the still image. Section navigation does not replay the entrance.

Regenerate the clip with `blender --background --python scripts/render-mobile-intro.py` (requires ffmpeg). It shares the poster renderer’s model, lighting, red wheel material, framing and overscan. `npm run test:mobile-intro` checks lifecycle and accessibility fallbacks; browser checks cover playback, the LCD handoff, tap-to-skip, navigation and desktop isolation.

## Destination names

Home, About, Projects, Photos, Résumé and Contact are the public destination names on both layouts. `site/sections.js` supplies runtime navigation labels, section headings and inner-page titles. Static fallback copy uses the same names. Videos remains a tab under Photos; Experience remains a topic under About. Projects uses `#projects`; `#work` remains an alias, as do `#outside` → `#photos` and `#experience` → `#resume`. Aliases replace their history entry so Back still returns to the preceding page.

The desktop model and rear poster print PROJECTS and RÉSUMÉ on the existing wheel surfaces. Mobile continues to use upright HTML labels over its blank poster and entrance clip.

Regenerate the renamed wheel decal and desktop poster with `blender --background --python scripts/update-camera-labels.py` (requires ImageMagick). This appends only the replacement decal to the GLB, preserving all other model data and AO, and is safe to repeat. Its atlas helpers follow the original Blender generator; full model rebuilds should use the same PROJECTS/RÉSUMÉ legends and label version 4. Mobile assets contain no rear lettering and do not need regeneration for this change. `npm run test:sections` checks both templates, the static fallback, navigation names and legacy aliases.

## Mobile wheel selection

The mobile still has no baked red segment. An SVG arc registered to the real wheel uses the same section angles as the desktop model, so About points right, Projects down, Photos left and Résumé up after the body rotates. Screen navigation, menus, browser history and wheel input all update it. The arc tracks dragging without a transition and settles to the selected section on release; normal moves take the shortest turn and respect reduced motion. The desktop model and mobile entrance clip retain their own rendered segment. Regenerate the still with `scripts/render-mobile-camera.py`; only that render hides `Wheel_Highlight`.


## Mobile camera framing and expanded photos

The mobile camera uses a closer crop of the same rear render, optically centring the LCD while retaining the hinge, SONY wordmark and real wheel. The wheel labels sit closer to its ring. The photo contact sheet fits all four images above the persistent navigation. Short phones can still scroll the page to reach the lower hardware controls.

On phones, tapping a photograph opens a native modal over the contact sheet. `site/mobile-photo-viewer.js` expands the actual thumbnail into the full photograph and returns it to the current thumbnail when closed. The grid stays mounted, preserving its scroll position. All photos, browser Back and Escape return to the camera; browser Forward reopens the detail. Native modal focus containment and focus restoration keep keyboard navigation in the right place. Previous/next controls remain visible, horizontal swipes follow the finger, and the first and last images resist outward swipes. Pinch zoom remains available through the browser. Loading, retry, interrupted motion and reduced-motion preferences are handled without a second image library. Desktop keeps its embedded slideshow.

`npm run test:mobile-photos` exercises retry and delayed image requests, modal cleanup, transition interruption, swipe boundaries, focus restoration, reduced motion and reopening during close. Browser review covers portrait and landscape layouts, thumbnail return, swipe, arrow buttons/keys, Escape, history and crossing the desktop breakpoint. Physical iOS/Android testing remains separate.

The physical Home button carries `aria-current="page"` and a solid camera-red rim while Home is selected. Mobile and live 3D wheel segments clear in that state and return for the other sections; dragging the wheel still shows its position.

Desktop menu previews use individual portrait and sunset crops, plus a live Google Docs iframe for Résumé. The résumé iframe loads only when selected, shares the full résumé viewer’s page scaling, and is released when the menu closes. The Projects preview names Studio Stack and Jenna’s Recipes. Mobile retains its compact menu and full résumé view.

The mobile LCD is centred precisely on the viewport using its 43.92% anchor in the rotated camera image. It extends upward by 6.5% and downward by 4% of the camera width into the unused black bezels, leaving a narrow lip inside the physical frame. The hardware controls, hinge and SONY wordmark keep their existing positions.

## Combined content gallery

The gallery opens on All content, followed by Videos and Photos. All content lists YouTube videos first, then photographs. Each item keeps its original player or photo viewer, including the mobile shared transition and browser Back/Forward behavior. The grid scrolls inside the desktop LCD and mixed mobile view, and keyboard/hardware browsing reveals the selected item.

Projects includes a direct Content shortcut to Videos. Routes `#content/all`, `#content/videos`, and `#content/photos` retain the selected filter. Legacy `#photos` and `#outside` bookmarks open photographs. The shutter opens Photos and the playback shortcut opens Videos. Add media to the `videos` and `photos` arrays in `site/portfolio-views.js`; All content updates automatically. Validate this behavior with `npm run test:content`.
