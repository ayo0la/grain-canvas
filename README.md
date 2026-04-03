# @ayo0la/grain-canvas

Animated film grain + floating particle system as a canvas background. Zero dependencies. Fully configurable. Works anywhere.

**[Live demo](https://ayoola-morakinyo.vercel.app)** — seen on my portfolio site.

---

## Install

```bash
npm install @ayo0la/grain-canvas
```

## Usage

```html
<canvas id="bg"></canvas>
```

```css
#bg {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
}
```

```js
import { init } from '@ayo0la/grain-canvas'

const destroy = init(document.getElementById('bg'))

// Later, to clean up:
destroy()
```

The canvas must have non-zero CSS dimensions before calling `init`. If it's 0×0, a console warning is emitted and the effect will start once the canvas is resized.

---

## Config

All options are optional. The defaults below produce the effect shown in the demo.

```js
import { init, defaults } from '@ayo0la/grain-canvas'

const destroy = init(canvas, {
  accentRatio: 0.4,
  backgroundColor: '#050505',
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `backgroundColor` | `string` | `'#080808'` | Canvas fill color. Use near-black for grain to look right. |
| `particleCount` | `number` | `90` | Number of particles. Clamped 1–500. |
| `particleSizeMin` | `number` | `0.8` | Minimum particle radius (px). |
| `particleSizeMax` | `number` | `2.8` | Maximum particle radius (px). |
| `particleBaseColor` | `string` | `'rgba(255,255,255,0.55)'` | Color of standard particles. |
| `particleAccentColor` | `string` | `'rgba(255,215,0,0.75)'` | Color of accent particles. |
| `accentRatio` | `number` | `0.25` | Fraction of particles using accent color. Clamped 0–1. |
| `mouseAttractionRadius` | `number` | `200` | Cursor attraction radius (px). |
| `mouseAttractionStrength` | `number` | `0.0008` | Attraction force multiplier. |
| `connectionDistance` | `number` | `110` | Max distance (px) to draw lines between particles. |
| `connectionOpacity` | `number` | `0.25` | Max opacity of connection lines. |
| `glowRadius` | `number` | `140` | Radius of cursor/tap glow (px). |
| `glowColor` | `string` | `'rgba(255,215,0,0.07)'` | Color of cursor/tap glow. |
| `grainOpacity` | `number` | `0.35` | Grain overlay opacity. Clamped 0–1. |
| `grainSwapInterval` | `number` | `50` | Milliseconds between grain frame swaps. Minimum 33ms. |
| `vignetteOpacity` | `number` | `0.6` | Edge vignette darkness. Clamped 0–1. |

Color strings are passed directly to the Canvas 2D API — invalid values render as transparent.

---

## Mobile

Mobile behaviour is automatic and not configurable:

- Grain renders at half resolution with 3 frames instead of 6 for performance
- Tapping attracts particles (same as cursor on desktop)
- Releasing your finger resets the attraction point to the canvas center
- The animation loop pauses automatically when the tab is hidden

---

## Known limitations

- **Grain uses `screen` blend mode** — designed for dark backgrounds. Light `backgroundColor` values will look washed out.
- **Color strings are not validated** — invalid CSS colors render as transparent, matching browser canvas behavior.
- **`0.x.y` is unstable** — per semver convention, minor versions may include breaking changes until `1.0.0`.

---

## React

```jsx
import { useEffect, useRef } from 'react'
import { init } from '@ayo0la/grain-canvas'

export function GrainBackground({ options }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const destroy = init(canvasRef.current, options)
    return destroy
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%' }}
    />
  )
}
```

---

## Cleanup

`init` returns a `destroy` function. Call it to cancel the animation loop and remove all event listeners. Safe to call more than once. The canvas is not cleared — the last painted frame stays visible.

```js
const destroy = init(canvas)
// ...
destroy() // stops the effect
destroy() // no-op, safe
```

---

## License

MIT
