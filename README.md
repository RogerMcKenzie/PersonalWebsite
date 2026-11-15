# Roger McKenzie — Personal Website

My portfolio, presented as the camera I shoot with: a Sony ZV-E10 whose screen shows the site. Apps I've built, photographs, my résumé and how to reach me.

Live at [rogermckz.com](https://rogermckz.com/).

## How it works

Plain HTML, CSS and JavaScript in `site/`, with no build step.

- **Content** is ordinary HTML in `index.html`, so it reads without JavaScript and for crawlers. `llms.txt` has a plain-text summary.
- **The screen** (`app.js`) turns that content into the camera's LCD: a live-view home screen, a menu, project lists, a photo slideshow, videos, the résumé and contact. The hardware buttons, the wheel (`wheel.js`), the keyboard, scrolling and dragging all navigate.
- **The 3D body** (`camera3d.js`) replaces the rear photo with a live [Three.js](https://threejs.org/) model on desktop. `camera-screen.js` keeps the HTML screen and buttons registered to the model as it moves, so everything stays real, accessible HTML. `camera-extras.js` adds the shutter, record button, power switch, zoom, flip-out screen and port doors.
- **Phones, no WebGL or a failed load** keep the rear photo and a stacked layout. Reduced-motion settings skip the animation.

| File | What it holds |
| --- | --- |
| `style.css` | Base tokens and page layout |
| `camera.css` | Camera body, hardware controls and 3D states |
| `lcd.css` | The LCD interface |
| `assets/camera/` | Rear photo and the 3D model |

## Run locally

```bash
npm run dev
```

Then open http://localhost:4173.

## Checks

```bash
npm ci
npm run check
npm test
```

`check` syntax-checks the scripts. `test` loads the shipped model and checks the printed button legends, asset budgets, the screen's projection at 12 sizes and rotations, depth hit testing, keyboard use and the fallback when 3D is torn down. Both run on every pull request.

## Résumé

[Open on Google Docs](https://docs.google.com/document/d/15JX0X1Reny-b6ptbkC4ADLikTLXrJYg3/edit) or [download the PDF](https://docs.google.com/document/d/15JX0X1Reny-b6ptbkC4ADLikTLXrJYg3/export?format=pdf).

## Credits

The 3D model is my own personal, non-commercial depiction of a camera I use. It is not Sony artwork and doesn't imply any affiliation with Sony. Three.js r170 loads from jsDelivr.

## Social

- GitHub: [github.com/RogerMcKenzie](https://github.com/RogerMcKenzie)
- LinkedIn: [linkedin.com/in/rogermckenzie](https://www.linkedin.com/in/rogermckenzie/)
- YouTube: [youtube.com/@RogerMcKenzie1](https://www.youtube.com/@RogerMcKenzie1)
