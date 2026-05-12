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

      // Load pet image and logo in parallel
      const [petImage, logoImage] = await Promise.all([
        loadImage(petImageUrl),
        loadImage('/logo.svg').catch(() => null),
      ])
      progress.value = 50

      // Draw pet image fitting within the canvas (no cropping)
      drawImageContain(ctx, petImage, WIDTH, HEIGHT)
      progress.value = 60

      // Draw semi-transparent gradient overlay at top for text legibility
      const topGradient = ctx.createLinearGradient(0, 0, 0, 300)
      topGradient.addColorStop(0, 'rgba(0, 0, 0, 0.55)')
      topGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = topGradient
      ctx.fillRect(0, 0, WIDTH, 300)

      // Draw semi-transparent gradient overlay at bottom for text legibility
      const bottomGradient = ctx.createLinearGradient(0, HEIGHT - 280, 0, HEIGHT)
      bottomGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
      bottomGradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)')
      ctx.fillStyle = bottomGradient
      ctx.fillRect(0, HEIGHT - 280, WIDTH, 280)
      progress.value = 70

      // Draw logo (top right corner with white circular background)
      if (logoImage) {
        const logoSize = 90
        const logoPadding = 40
        const logoCenterX = WIDTH - logoPadding - logoSize / 2
        const logoCenterY = logoPadding + logoSize / 2

        // White circular background for visibility
        ctx.beginPath()
        ctx.arc(logoCenterX, logoCenterY, logoSize / 2 + 8, 0, Math.PI * 2)
        ctx.fillStyle = '#117F60'
        ctx.fill()

        // Maintain logo aspect ratio within the square area
        const logoAspect = logoImage.width / logoImage.height
        let drawW = logoSize
        let drawH = logoSize

        if (logoAspect > 1) {
          // Wider than tall: fit width, scale height
          drawH = logoSize / logoAspect
        } else if (logoAspect < 1) {
          // Taller than wide: fit height, scale width
          drawW = logoSize * logoAspect
        }

        const drawX = WIDTH - logoPadding - logoSize + (logoSize - drawW) / 2
        const drawY = logoPadding + (logoSize - drawH) / 2

        ctx.drawImage(logoImage, drawX, drawY, drawW, drawH)
      }

      // Draw "Adopta a" text (top left)
      drawTextWithOutline(ctx, 'Adopta a', 50, 90, {
        font: 'bold 42px "Bricolage Grotesque", system-ui, sans-serif',
        fillColor: '#ffffff',
        strokeColor: '#121212',
        strokeWidth: 5,
        textAlign: 'left',
      })

      // Draw pet name (larger, below "Adopta a")
      drawTextWithOutline(ctx, petName, 50, 155, {
        font: 'bold 78px "Bricolage Grotesque", system-ui, sans-serif',
        fillColor: '#ffffff',
        strokeColor: '#121212',
        strokeWidth: 7,
        textAlign: 'left',
      })
      progress.value = 80

      // Generate QR code
      const qrUrl = `${window.location.origin}/mascotas/${petId}`
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        color: { dark: '#121212', light: '#ffffff' },
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M',
      })
      const qrImage = await loadImage(qrDataUrl)

      // Draw QR code (bottom right corner)
      const qrSize = 150
      const qrPadding = 40
      ctx.drawImage(qrImage, WIDTH - qrSize - qrPadding, HEIGHT - qrSize - qrPadding, qrSize, qrSize)

      // Draw phone number (bottom left) if available
      if (phone) {
        drawTextWithOutline(ctx, phone, 50, HEIGHT - 60, {
          font: 'bold 36px "Bricolage Grotesque", system-ui, sans-serif',
          fillColor: '#ffffff',
          strokeColor: '#121212',
          strokeWidth: 5,
          textAlign: 'left',
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
