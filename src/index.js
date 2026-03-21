// src/index.js
import { buildGrainFrames, drawGrain } from './grain.js'
import { buildParticles, updateParticles, drawParticles } from './particles.js'
import { drawGlow, drawVignette } from './effects.js'

/** @type {Required<GrainCanvasOptions>} */
export const defaults = {
  backgroundColor:         '#080808',
  particleCount:           90,
  particleSizeMin:         0.8,
  particleSizeMax:         2.8,
  particleBaseColor:       'rgba(255,255,255,0.55)',
  particleAccentColor:     'rgba(255,215,0,0.75)',
  accentRatio:             0.25,
  mouseAttractionRadius:   200,
  mouseAttractionStrength: 0.0008,
  connectionDistance:      110,
  connectionOpacity:       0.25,
  glowRadius:              140,
  glowColor:               'rgba(255,215,0,0.07)',
  grainOpacity:            0.35,
  grainSwapInterval:       50,
  vignetteOpacity:         0.6,
}

/**
 * Merge user options over defaults and clamp numeric values.
 * @param {Partial<GrainCanvasOptions>} userConfig
 * @returns {Required<GrainCanvasOptions>}
 */
function mergeConfig(userConfig = {}) {
  const c = { ...defaults, ...userConfig }
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
  c.particleCount           = clamp(Math.round(c.particleCount), 1, 500)
  c.accentRatio             = clamp(c.accentRatio, 0, 1)
  c.grainOpacity            = clamp(c.grainOpacity, 0, 1)
  c.vignetteOpacity         = clamp(c.vignetteOpacity, 0, 1)
  c.grainSwapInterval       = Math.max(33, c.grainSwapInterval)
  c.mouseAttractionRadius   = Math.max(1, c.mouseAttractionRadius)
  c.connectionDistance      = Math.max(1, c.connectionDistance)
  return c
}

/**
 * @typedef {object} GrainCanvasOptions
 * @property {string}  [backgroundColor]
 * @property {number}  [particleCount]
 * @property {number}  [particleSizeMin]
 * @property {number}  [particleSizeMax]
 * @property {string}  [particleBaseColor]
 * @property {string}  [particleAccentColor]
 * @property {number}  [accentRatio]
 * @property {number}  [mouseAttractionRadius]
 * @property {number}  [mouseAttractionStrength]
 * @property {number}  [connectionDistance]
 * @property {number}  [connectionOpacity]
 * @property {number}  [glowRadius]
 * @property {string}  [glowColor]
 * @property {number}  [grainOpacity]
 * @property {number}  [grainSwapInterval]
 * @property {number}  [vignetteOpacity]
 */

/**
 * Initialise the grain canvas effect.
 * The canvas is sized automatically via ResizeObserver.
 * Ensure the canvas has non-zero CSS dimensions before calling init.
 *
 * @param {HTMLCanvasElement} canvasEl
 * @param {GrainCanvasOptions} [options]
 * @returns {() => void} destroy function — safe to call multiple times
 */
export function init(canvasEl, options) {
  const config  = mergeConfig(options)
  const isTouch = !window.matchMedia('(hover: hover)').matches

  let W = canvasEl.clientWidth
  let H = canvasEl.clientHeight

  if (W === 0 || H === 0) {
    console.warn('[grain-canvas] Canvas has zero dimensions. Ensure CSS gives it a non-zero size before calling init().')
  }

  canvasEl.width  = W
  canvasEl.height = H

  const ctx = canvasEl.getContext('2d')

  let grainFrames   = buildGrainFrames(W, H, config, isTouch)
  let grainIndex    = 0
  let lastGrainSwap = 0
  let particles     = buildParticles(W, H, config)
  let mx            = W / 2
  let my            = H / 2
  let rafId         = null
  let paused        = false
  let destroyed     = false

  // ── Resize ────────────────────────────────────────────────────
  const ro = new ResizeObserver(() => {
    W = canvasEl.clientWidth
    H = canvasEl.clientHeight
    canvasEl.width  = W
    canvasEl.height = H
    grainFrames = buildGrainFrames(W, H, config, isTouch)
    for (const p of particles) {
      p.x = Math.min(p.x, W)
      p.y = Math.min(p.y, H)
    }
  })
  ro.observe(canvasEl)

  // ── Input events ──────────────────────────────────────────────
  const onMouseMove  = e => { mx = e.clientX; my = e.clientY }
  const onTouchStart = e => {
    const t = e.changedTouches[0]
    mx = t.clientX
    my = t.clientY
  }
  const onTouchEnd   = () => { mx = W / 2; my = H / 2 }
  const onVisibility = () => { paused = document.hidden }

  if (!isTouch) {
    window.addEventListener('mousemove', onMouseMove)
  } else {
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend',   onTouchEnd,   { passive: true })
  }
  document.addEventListener('visibilitychange', onVisibility)

  // ── Animation loop ────────────────────────────────────────────
  function frame(timestamp) {
    if (destroyed) return
    rafId = requestAnimationFrame(frame)
    if (paused) return

    ctx.fillStyle = config.backgroundColor
    ctx.fillRect(0, 0, W, H)

    updateParticles(particles, W, H, mx, my, config)
    drawParticles(ctx, particles, config)
    drawGlow(ctx, mx, my, W, H, config)

    if (timestamp - lastGrainSwap > config.grainSwapInterval) {
      grainIndex    = (grainIndex + 1) % grainFrames.length
      lastGrainSwap = timestamp
    }
    drawGrain(ctx, grainFrames, grainIndex, W, H, config)
    drawVignette(ctx, W, H, config)
  }

  rafId = requestAnimationFrame(frame)

  // ── Destroy ───────────────────────────────────────────────────
  return function destroy() {
    if (destroyed) return
    destroyed = true
    cancelAnimationFrame(rafId)
    ro.disconnect()
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchend', onTouchEnd)
    document.removeEventListener('visibilitychange', onVisibility)
    canvasEl = null  // release canvas ref to avoid memory leaks in SPA route changes
  }
}
