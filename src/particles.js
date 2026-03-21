// src/particles.js

/**
 * Build initial particle array.
 * @param {number} W
 * @param {number} H
 * @param {object} config
 * @returns {Array<{x:number,y:number,vx:number,vy:number,r:number,gold:boolean}>}
 */
export function buildParticles(W, H, config) {
  return Array.from({ length: config.particleCount }, () => ({
    x:    Math.random() * W,
    y:    Math.random() * H,
    vx:   (Math.random() - 0.5) * 0.5,
    vy:   (Math.random() - 0.5) * 0.5,
    r:    Math.random() * (config.particleSizeMax - config.particleSizeMin) + config.particleSizeMin,
    gold: Math.random() < config.accentRatio,
  }))
}

/**
 * Update particle positions — apply attraction toward (mx, my), damp velocity, wrap edges.
 * @param {Array} particles
 * @param {number} W
 * @param {number} H
 * @param {number} mx - attraction x (cursor or tap)
 * @param {number} my - attraction y
 * @param {object} config
 */
export function updateParticles(particles, W, H, mx, my, config) {
  for (const p of particles) {
    const dx = mx - p.x
    const dy = my - p.y
    const d  = Math.sqrt(dx * dx + dy * dy)
    if (d < config.mouseAttractionRadius) {
      const f = (config.mouseAttractionRadius - d) / config.mouseAttractionRadius
      p.vx += dx * f * config.mouseAttractionStrength
      p.vy += dy * f * config.mouseAttractionStrength
    }
    p.vx *= 0.98
    p.vy *= 0.98
    p.x  += p.vx
    p.y  += p.vy
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
  }
}

/**
 * Draw particles and connection lines between nearby pairs.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} particles
 * @param {object} config
 */
export function drawParticles(ctx, particles, config) {
  for (const p of particles) {
    // Draw dot
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = p.gold ? config.particleAccentColor : config.particleBaseColor
    ctx.fill()

    // Draw connection lines to nearby particles
    for (const q of particles) {
      if (q === p) continue
      const dx = p.x - q.x
      const dy = p.y - q.y
      const d  = Math.sqrt(dx * dx + dy * dy)
      if (d < config.connectionDistance) {
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(q.x, q.y)
        const a = (1 - d / config.connectionDistance) * config.connectionOpacity
        ctx.strokeStyle = (p.gold || q.gold)
          ? `rgba(255,215,0,${a})`
          : `rgba(255,255,255,${a})`
        ctx.lineWidth = 0.8
        ctx.stroke()
      }
    }
  }
}
