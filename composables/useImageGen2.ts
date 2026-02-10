import { ref, computed } from 'vue'
import QRCode from 'qrcode'
import { useFeatures } from './useFeatures'

// Types
interface ImageGenOptions {
  backgroundColor?: string
  frameImageUrl?: string
  downloadFilename?: string
  quality?: number
  format?: 'png' | 'jpeg' | 'webp'
  autoDownload?: boolean
  skipFeatureCheck?: boolean // Allow bypassing feature check (for admins)
}

interface GeneratedImage {
  dataUrl: string
  blob: Blob
  filename: string
}

// Image cache for performance
const imageCache = new Map<string, HTMLImageElement>()

export function useImageGen2() {
  const { features, ensureInitialized } = useFeatures()

  const generating = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  // Check if feature is available
  const isEnabled = computed(() => features.value.imageGeneration === true)

  /**
   * Load an image with CORS handling and caching
   */
  async function loadImage(url: string): Promise<HTMLImageElement> {
    // Check cache first
    if (imageCache.has(url)) {
      return imageCache.get(url)!
    }

    return new Promise((resolve, reject) => {
      const img = new Image()

      // Proxy S3 images to avoid CORS issues
      let finalUrl = url
      if (url.includes('s3.') && url.includes('amazonaws.com')) {
        finalUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`
      }

      img.crossOrigin = 'anonymous'
      img.onload = () => {
        imageCache.set(url, img)
        resolve(img)
      }
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = finalUrl
    })
  }

  /**
   * Load custom font
   */
  async function loadFont(fontName: string, fontUrl: string): Promise<void> {
    try {
      const fontFace = new FontFace(fontName, `url(${fontUrl})`)
      await fontFace.load()
      document.fonts.add(fontFace)
    } catch (err) {
      console.warn(`Failed to load font ${fontName}, using fallback`)
    }
  }

  /**
   * Draw text with outline
   */
  function drawTextWithOutline(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    options: {
      font: string
      fillColor: string
      strokeColor: string
      strokeWidth: number
    }
  ) {
    ctx.font = options.font
    ctx.fillStyle = options.fillColor
    ctx.strokeStyle = options.strokeColor
    ctx.lineWidth = options.strokeWidth
    ctx.textAlign = 'center'
    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)
  }

  /**
   * Generate a shareable pet image with frame, text and QR code
   */
  async function generatePetImage(
    petName: string,
    petImageUrl: string,
    petId: string,
    options: ImageGenOptions = {}
  ): Promise<GeneratedImage | null> {
    generating.value = true
    progress.value = 0
    error.value = null

    try {
      // Check if feature is enabled (unless explicitly skipped)
      if (!options.skipFeatureCheck) {
        await ensureInitialized()
        if (!isEnabled.value) {
          throw new Error('La generación de imágenes está desactivada')
        }
      }
      // Config with defaults
      const config = {
        backgroundColor: options.backgroundColor || '#f5f5f4',
        frameImageUrl: options.frameImageUrl || '/frame.png',
        quality: options.quality || 0.92,
        format: options.format || 'png',
        autoDownload: options.autoDownload !== false,
        filename:
          options.downloadFilename ||
          `adopta-a-${petName.toLowerCase().replace(/\s+/g, '-')}.${options.format || 'png'}`,
      }

      // Canvas dimensions (4:5 ratio - optimal for Instagram)
      const WIDTH = 1080
      const HEIGHT = 1350

      // Create canvas
      const canvas = document.createElement('canvas')
      canvas.width = WIDTH
      canvas.height = HEIGHT
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Canvas context not available')
      }

      progress.value = 10

      // Load font
      await loadFont('Bricolage Grotesque', '/bricolage.ttf')
      progress.value = 20

      // Draw background
      ctx.fillStyle = config.backgroundColor
      ctx.fillRect(0, 0, WIDTH, HEIGHT)
      progress.value = 25

      // Load images in parallel
      const [frameImage, petImage] = await Promise.all([
        loadImage(config.frameImageUrl),
        loadImage(petImageUrl),
      ])
      progress.value = 50

      // Calculate pet image dimensions (maintain aspect ratio)
      const petAspect = petImage.width / petImage.height
      const targetWidth = WIDTH * 0.9
      const targetHeight = HEIGHT * 0.85

      let drawWidth: number, drawHeight: number
      if (petAspect > targetWidth / targetHeight) {
        drawWidth = targetWidth
        drawHeight = targetWidth / petAspect
      } else {
        drawHeight = targetHeight
        drawWidth = targetHeight * petAspect
      }

      const imgX = (WIDTH - drawWidth) / 2
      const imgY = (HEIGHT - drawHeight) / 2 - 50

      // Draw pet image
      ctx.drawImage(petImage, imgX, imgY, drawWidth, drawHeight)
      progress.value = 60

      // Draw frame overlay
      ctx.drawImage(frameImage, 0, 0, WIDTH, HEIGHT)
      progress.value = 70

      // Draw "Adopta a" text
      drawTextWithOutline(ctx, 'Adopta a', WIDTH / 2, HEIGHT - 280, {
        font: 'bold 44px "Bricolage Grotesque", system-ui, sans-serif',
        fillColor: '#ffffff',
        strokeColor: '#121212',
        strokeWidth: 6,
      })

      // Draw pet name (larger)
      drawTextWithOutline(ctx, petName, WIDTH / 2, HEIGHT - 215, {
        font: 'bold 86px "Bricolage Grotesque", system-ui, sans-serif',
        fillColor: '#ffffff',
        strokeColor: '#121212',
        strokeWidth: 8,
      })
      progress.value = 80

      // Generate QR code
      const qrUrl = `${window.location.origin}/mascotas/${petId}`
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        color: { dark: '#ffffff', light: '#121212' },
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M',
      })
      const qrImage = await loadImage(qrDataUrl)

      // Draw QR code
      const qrSize = 160
      ctx.drawImage(qrImage, (WIDTH - qrSize) / 2, HEIGHT - 175, qrSize, qrSize)
      progress.value = 90

      // Generate output
      const mimeType =
        config.format === 'jpeg'
          ? 'image/jpeg'
          : config.format === 'webp'
            ? 'image/webp'
            : 'image/png'
      const dataUrl = canvas.toDataURL(mimeType, config.quality)

      // Convert to blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      progress.value = 95

      // Auto download if enabled
      if (config.autoDownload) {
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = config.filename
        link.click()
      }

      progress.value = 100
      generating.value = false

      return {
        dataUrl,
        blob,
        filename: config.filename,
      }
    } catch (err) {
      console.error('Error generating pet image:', err)
      error.value = err instanceof Error ? err.message : 'Error generating image'
      generating.value = false
      progress.value = 0
      return null
    }
  }

  /**
   * Generate image without downloading (for preview)
   */
  async function generatePetImagePreview(
    petName: string,
    petImageUrl: string,
    petId: string,
    options: Omit<ImageGenOptions, 'autoDownload'> = {}
  ): Promise<string | null> {
    const result = await generatePetImage(petName, petImageUrl, petId, {
      ...options,
      autoDownload: false,
    })
    return result?.dataUrl || null
  }

  /**
   * Clear image cache
   */
  function clearCache(): void {
    imageCache.clear()
  }

  return {
    generatePetImage,
    generatePetImagePreview,
    clearCache,
    isEnabled,
    generating,
    progress,
    error,
  }
}
