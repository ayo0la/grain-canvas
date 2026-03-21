// src/effects.js

/**
 * Draw a radial glow at the cursor/tap position.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} mx
 * @param {number} my
 * @param {number} W
 * @param {number} H
 * @param {object} config
 */
export function drawGlow(ctx, mx, my, W, H, config) {
  const g = ctx.createRadialGradient(mx, my, 0, mx, my, config.glowRadius)
  g.addColorStop(0, config.glowColor)
  g.addColorStop(1, 'transparent')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

/**
 * Draw a vignette — darkens the canvas edges via a radial gradient.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {object} config
 */
export function drawVignette(ctx, W, H, config) {
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.08, W / 2, H / 2, H * 0.85)
  vig.addColorStop(0, 'transparent')
  vig.addColorStop(1, `rgba(0,0,0,${config.vignetteOpacity})`)
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, W, H)
}
