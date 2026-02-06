import { ref } from 'vue'
import QRCode from 'qrcode'

interface ImageGenOptions {
  backgroundColor?: string
  frameImageUrl?: string
  downloadFilename?: string
}

export function useImageGen2() {
  const generating = ref(false)
  const error = ref<string | null>(null)

  /**
   * Genera una imagen compartible de una mascota con marco, logo y código QR
   * Solución especial para problemas de CORS con S3
   */
  async function generatePetImage(
    petName: string,
    petImageUrl: string,
    petId: string,
    options: ImageGenOptions = {}
  ): Promise<string | null> {
    generating.value = true
    error.value = null

    try {
      // Configuración predeterminada
      const backgroundColor = options.backgroundColor || '#f5f5f4'
      const frameImageUrl = options.frameImageUrl || '/frame.png'
      const downloadFilename = options.downloadFilename || `adopta-a-${petName.toLowerCase().replace(/\s+/g, '-')}.png`
      
      // Dimensiones del canvas (4:5 ratio)
      const canvasWidth = 1000
      const canvasHeight = 1250
      
      // Crear canvas
      const canvas = document.createElement('canvas')
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('No se pudo obtener el contexto del canvas')
      }

      // Cargar la fuente Bricolage Grotesque desde archivo local
      const fontFace = new FontFace('Bricolage Grotesque', 'url(/bricolage.ttf)')
      await fontFace.load()
      document.fonts.add(fontFace)

      // Dibujar fondo
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Cargar imagen de la mascota
      function loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
          const img = new Image()
          
          // Si la URL es de S3, usar el proxy para evitar problemas de CORS
          if (url.includes('nsfwclothesmaracaibo.s3.us-east-2.amazonaws.com')) {
            url = `/api/proxy-image?url=${encodeURIComponent(url)}`
          }
          
          img.crossOrigin = 'anonymous'    // ¡antes de asignar src!
          img.onload  = () => resolve(img)
          img.onerror = () => reject(new Error(`No se pudo cargar ${url}`))
          img.src = url
        })
      }

      // Cargar imágenes necesarias
      const [frameImage, petImage] = await Promise.all([
        loadImage(frameImageUrl),
        loadImage(petImageUrl)
      ])

      // Dibujar imagen de la mascota detrás del frame
      const imgWidth = canvasWidth * 0.9
      const imgHeight = canvasHeight * 0.9
      const imgX = (canvasWidth - imgWidth) / 2
      const imgY = 10
      ctx.drawImage(petImage, imgX, imgY, imgWidth, imgHeight)

      // Dibujar frame encima de la imagen de la mascota
      ctx.drawImage(frameImage, 0, 0, canvasWidth, canvasHeight)
      
      // Configurar el texto en dos líneas con la nueva fuente
      ctx.textAlign = 'center'
      
      // Primera línea - "¡Adopta a"
      ctx.font = 'bold 40px "Bricolage Grotesque", sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#121212'
      ctx.lineWidth = 5
      const textY1 = canvasHeight - 270
      ctx.strokeText("Adopta a", canvasWidth / 2, textY1)
      ctx.fillText("Adopta a", canvasWidth / 2, textY1)
      
      // Segunda línea - nombre de la mascota (más grande)
      ctx.font = 'bold 80px "Bricolage Grotesque", sans-serif'
      ctx.lineWidth = 8
      const textY2 = canvasHeight - 210
      ctx.strokeText(`${petName}`, canvasWidth / 2, textY2)
      ctx.fillText(`${petName}`, canvasWidth / 2, textY2)

      // Generar código QR
      const qrCodeUrl = window.location.origin + `/mascotas/${petId}`
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
        color: {
          dark: '#ffffff',
          light: '#121212'
        },
        width: 200,
        margin: 1
      })
      const qrCodeImage = await loadImage(qrCodeDataUrl)

      // Dibujar código QR
      const qrSize = 180
      const qrX = (canvasWidth - qrSize) / 2
      const qrY = canvasHeight - 195
      ctx.drawImage(qrCodeImage, qrX, qrY, qrSize, qrSize)

      // Generar y descargar la imagen
      const dataUrl = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.href = dataUrl
      downloadLink.download = downloadFilename
      downloadLink.click()

      generating.value = false
      return dataUrl
    } catch (err) {
      console.error('Error generando imagen:', err)
      error.value = 'Error al generar la imagen. Por favor, inténtalo de nuevo.'
      generating.value = false
      return null
    }
  }

  return {
    generatePetImage,
    generating,
    error
  }
}
