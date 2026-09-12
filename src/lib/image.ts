const FULL_MAX_SIZE = 1400
const THUMB_MAX_SIZE = 400
const QUALITY = 0.82

export interface CompressedImage {
  full: Blob
  thumb: Blob
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Gambar tidak dapat dibaca. Coba pakai format JPG atau PNG.'))
    image.src = src
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob === null) {
          reject(new Error('Gagal mengompres gambar.'))
        } else {
          resolve(blob)
        }
      },
      type,
      quality,
    )
  })
}

function drawScaled(source: HTMLImageElement, maxSize: number): HTMLCanvasElement {
  const width = source.naturalWidth
  const height = source.naturalHeight

  const scale = Math.min(1, maxSize / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))

  const context = canvas.getContext('2d')
  if (context === null) {
    throw new Error('Browser tidak mendukung pengolahan gambar.')
  }
  context.drawImage(source, 0, 0, canvas.width, canvas.height)

  return canvas
}

async function encode(canvas: HTMLCanvasElement): Promise<Blob> {
  const webp = await canvasToBlob(canvas, 'image/webp', QUALITY)
  if (webp.type === 'image/webp') {
    return webp
  }

  // Browser lama mengabaikan permintaan WebP dan mengembalikan PNG yang jauh
  // lebih besar, jadi dikodekan ulang sebagai JPEG.
  return canvasToBlob(canvas, 'image/jpeg', QUALITY)
}

export async function compressImage(file: File): Promise<CompressedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File yang dipilih bukan gambar.')
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(objectUrl)
    const full = await encode(drawScaled(image, FULL_MAX_SIZE))
    const thumb = await encode(drawScaled(image, THUMB_MAX_SIZE))

    return { full, thumb }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
