// src/grain.js

/**
 * Build an array of pre-rendered offscreen grain canvases.
 * @param {number} W - canvas width
 * @param {number} H - canvas height
 * @param {object} config - merged config
 * @param {boolean} isTouch - true on touch devices
 * @returns {HTMLCanvasElement[]}
 */
export function buildGrainFrames(W, H, config, isTouch) {
  const frames = isTouch ? 3 : 6
  const scale  = isTouch ? 0.5 : 1
  const gW = Math.ceil(W * scale)
  const gH = Math.ceil(H * scale)
  const result = []

  for (let i = 0; i < frames; i++) {
    const off = document.createElement('canvas')
    off.width  = gW
    off.height = gH
    const c  = off.getContext('2d')
    const id = c.createImageData(gW, gH)
    const d  = id.data
    for (let j = 0; j < d.length; j += 4) {
      const v = Math.random() * 255 | 0
      d[j] = d[j + 1] = d[j + 2] = v
      d[j + 3] = (Math.random() * 55 + 12) | 0
    }
    c.putImageData(id, 0, 0)
    result.push(off)
  }
  return result
}

/**
 * Draw the current grain frame onto the main canvas.
 * Uses 'screen' blend mode — works correctly only on dark backgrounds.
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement[]} frames
 * @param {number} index - current frame index
 * @param {number} W
 * @param {number} H
 * @param {object} config
 */
export function drawGrain(ctx, frames, index, W, H, config) {
  if (!frames[index]) return
  ctx.globalAlpha = config.grainOpacity
  ctx.globalCompositeOperation = 'screen'
  ctx.drawImage(frames[index], 0, 0, W, H)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
}
