interface Rgb {
  r: number
  g: number
  b: number
}

const DEFAULT_ACCENT = '#ee4d2d'

export interface AccentShades {
  accent: string
  dark: string
  soft: string
}

function parseHex(hex: string): Rgb | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim())

  if (match === null) {
    return null
  }

  const value = Number.parseInt(match[1], 16)

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function toHex({ r, g, b }: Rgb): string {
  const part = (value: number): string =>
    Math.min(255, Math.max(0, Math.round(value)))
      .toString(16)
      .padStart(2, '0')

  return `#${part(r)}${part(g)}${part(b)}`
}

function mix(from: number, to: number, amount: number): number {
  return from + (to - from) * amount
}

// Satu warna pilihan pengguna diturunkan menjadi tiga nada: warna utama, versi
// lebih gelap untuk keadaan ditekan, dan versi pucat untuk latar belakang.
export function accentShades(hex: string): AccentShades {
  const rgb = parseHex(hex)

  if (rgb === null) {
    return accentShades(DEFAULT_ACCENT)
  }

  return {
    accent: toHex(rgb),
    dark: toHex({
      r: mix(rgb.r, 0, 0.15),
      g: mix(rgb.g, 0, 0.15),
      b: mix(rgb.b, 0, 0.15),
    }),
    soft: toHex({
      r: mix(rgb.r, 255, 0.92),
      g: mix(rgb.g, 255, 0.92),
      b: mix(rgb.b, 255, 0.92),
    }),
  }
}
