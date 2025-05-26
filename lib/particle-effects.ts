export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
  maxLife: number
  r: number
  g: number
  b: number
}

export interface Bubble {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  life: number
  elapsed: number
}

export function createExplosion(x: number, y: number, count: number, color: string): Particle[] {
  const particles: Particle[] = []

  // Parse color to RGB
  let r = 255,
    g = 255,
    b = 255
  if (color.startsWith("#") && color.length === 7) {
    r = Number.parseInt(color.slice(1, 3), 16)
    g = Number.parseInt(color.slice(3, 5), 16)
    b = Number.parseInt(color.slice(5, 7), 16)
  }

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 3 + 1

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 4 + 2,
      opacity: 1,
      life: 500 + Math.random() * 500,
      maxLife: 1000,
      r,
      g,
      b,
    })
  }

  return particles
}

export function createBubbleTrail(x: number, y: number, count: number, color: string): Particle[] {
  const particles: Particle[] = []

  // Parse color to RGB
  let r = 255,
    g = 255,
    b = 255
  if (color.startsWith("#") && color.length === 7) {
    r = Number.parseInt(color.slice(1, 3), 16)
    g = Number.parseInt(color.slice(3, 5), 16)
    b = Number.parseInt(color.slice(5, 7), 16)
  }

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 2 + 0.5

    particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1, // Bubbles rise
      size: Math.random() * 3 + 1,
      opacity: 0.7,
      life: 300 + Math.random() * 300,
      maxLife: 600,
      r,
      g,
      b,
    })
  }

  return particles
}

export function createShockwave(x: number, y: number, color: string): Particle[] {
  const particles: Particle[] = []

  // Parse color to RGB
  let r = 255,
    g = 255,
    b = 255
  if (color.startsWith("#") && color.length === 7) {
    r = Number.parseInt(color.slice(1, 3), 16)
    g = Number.parseInt(color.slice(3, 5), 16)
    b = Number.parseInt(color.slice(5, 7), 16)
  }

  // Create particles in a circle
  const count = 36
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * 3,
      vy: Math.sin(angle) * 3,
      size: 5,
      opacity: 0.8,
      life: 500,
      maxLife: 500,
      r,
      g,
      b,
    })
  }

  return particles
}

export function createGlowingTrail(x: number, y: number, count: number, color: string): Particle[] {
  const particles: Particle[] = []

  // Parse color to RGB
  let r = 255,
    g = 255,
    b = 255
  if (color.startsWith("#") && color.length === 7) {
    r = Number.parseInt(color.slice(1, 3), 16)
    g = Number.parseInt(color.slice(3, 5), 16)
    b = Number.parseInt(color.slice(5, 7), 16)
  }

  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 6 + 2,
      opacity: 0.7,
      life: 200 + Math.random() * 300,
      maxLife: 500,
      r,
      g,
      b,
    })
  }

  return particles
}
