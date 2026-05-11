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
  phone?: string
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
      textAlign?: CanvasTextAlign
    }
  ) {
    ctx.font = options.font
    ctx.fillStyle = options.fillColor
    ctx.strokeStyle = options.strokeColor
    ctx.lineWidth = options.strokeWidth
    ctx.textAlign = options.textAlign || 'center'
    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)
  }

  /**
   * Draw image covering the entire canvas (object-fit: cover)
   */
  function drawImageCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number
  ) {
    const imgAspect = img.width / img.height
    const canvasAspect = canvasWidth / canvasHeight

    let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number

    if (imgAspect > canvasAspect) {
      // Image is wider relative to canvas: fit height, crop sides
      drawHeight = canvasHeight
      drawWidth = canvasHeight * imgAspect
      offsetX = (canvasWidth - drawWidth) / 2
      offsetY = 0
    } else {
      // Image is taller relative to canvas: fit width, crop top/bottom
      drawWidth = canvasWidth
      drawHeight = canvasWidth / imgAspect
      offsetX = 0
      offsetY = (canvasHeight - drawHeight) / 2
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
  }

  /**
   * Draw image fitting within the canvas (object-fit: contain)
   */
  function drawImageContain(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number
  ) {
    const imgAspect = img.width / img.height
    const canvasAspect = canvasWidth / canvasHeight

    let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number

    if (imgAspect > canvasAspect) {
      // Image is wider relative to canvas: fit width, leave space top/bottom
      drawWidth = canvasWidth
      drawHeight = canvasWidth / imgAspect
      offsetX = 0
      offsetY = (canvasHeight - drawHeight) / 2
    } else {
      // Image is taller relative to canvas: fit height, leave space sides
      drawHeight = canvasHeight
      drawWidth = canvasHeight * imgAspect
      offsetX = (canvasWidth - drawWidth) / 2
      offsetY = 0
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
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
    const phone = options.phone || ''
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
        backgroundColor: options.backgroundColor || '#117F60',
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

      // Load pet image and logo in parallel
      const [petImage, logoImage] = await Promise.all([
        loadImage(petImageUrl),
        loadImage('/logo.svg').catch(() => null),
      ])
      progress.value = 50

      // Draw pet image occupying 75% of poster height with cover fit
      const petImageAreaHeight = HEIGHT * 0.75
      const imgAspect = petImage.width / petImage.height
      const canvasAspect = WIDTH / petImageAreaHeight

      let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number

      if (imgAspect > canvasAspect) {
        // Image is wider: fit height, crop sides
        drawHeight = petImageAreaHeight
        drawWidth = petImageAreaHeight * imgAspect
        offsetX = (WIDTH - drawWidth) / 2
        offsetY = 0
      } else {
        // Image is taller: fit width, crop top/bottom
        drawWidth = WIDTH
        drawHeight = WIDTH / imgAspect
        offsetX = 0
        offsetY = (petImageAreaHeight - drawHeight) / 2
      }

      ctx.drawImage(petImage, offsetX, offsetY, drawWidth, drawHeight)
      progress.value = 60

      // Draw green background below pet image
      const greenBackgroundY = petImageAreaHeight
      ctx.fillStyle = config.backgroundColor
      ctx.fillRect(0, greenBackgroundY, WIDTH, HEIGHT - petImageAreaHeight)

      progress.value = 70

      // Calculate column positions for 3-column layout
      const columnWidth = WIDTH / 3
      const greenAreaHeight = HEIGHT - petImageAreaHeight
      const centerY = greenBackgroundY + greenAreaHeight / 2

      // Left column: Text (Adopta a + pet name)
      drawTextWithOutline(ctx, 'Adopta a', columnWidth / 2, centerY - 50, {
        font: 'bold 48px "Bricolage Grotesque", system-ui, sans-serif',
        fillColor: '#ffffff',
        strokeColor: '#121212',
        strokeWidth: 6,
        textAlign: 'center',
      })

      drawTextWithOutline(ctx, petName, columnWidth / 2, centerY + 40, {
        font: 'bold 78px "Bricolage Grotesque", system-ui, sans-serif',
        fillColor: '#ffffff',
        strokeColor: '#121212',
        strokeWidth: 8,
        textAlign: 'center',
      })

      // Middle column: Logo (much larger)
      if (logoImage) {
        const logoSize = 200
        const logoX = columnWidth + (columnWidth - logoSize) / 2
        const logoY = centerY - logoSize / 2
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
      }

      progress.value = 80

      // Generate QR code
      const qrUrl = `${window.location.origin}/mascotas/${petId}`
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        color: { dark: '#121212', light: '#ffffff' },
        width: 300,
        margin: 1,
        errorCorrectionLevel: 'M',
      })
      const qrImage = await loadImage(qrDataUrl)

      // Right column: QR code (much larger)
      const qrSize = 220
      const qrX = columnWidth * 2 + (columnWidth - qrSize) / 2
      const qrY = centerY - qrSize / 2
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

      // Draw phone number below QR code if available
      if (phone) {
        drawTextWithOutline(ctx, phone, columnWidth * 2 + columnWidth / 2, centerY + qrSize / 2 + 50, {
          font: 'bold 36px "Bricolage Grotesque", system-ui, sans-serif',
          fillColor: '#ffffff',
          strokeColor: '#121212',
          strokeWidth: 6,
          textAlign: 'center',
        })
      }
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
