import { createError, defineEventHandler, getQuery, setResponseHeader } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Obtener la URL de la imagen desde los parámetros de consulta
    const query = getQuery(event)
    const imageUrl = query.url as string

    if (!imageUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'URL de imagen requerida',
      })
    }

    // Validar que la URL es válida
    let parsedUrl: URL
    try {
      parsedUrl = new URL(imageUrl)
    } catch (err) {
      throw createError({ statusCode: 400, statusMessage: 'URL inválida' })
    }

    // Lista de dominios permitidos (coincidencia por sufijo para subdominios)
    const allowedDomains = [
      'nsfwclothesmaracaibo.s3.us-east-2.amazonaws.com',
      's3.us-east-2.amazonaws.com',
      'amazonaws.com',
      'cloudfront.net',
      'fbcdn.net',
      'akamaihd.net',
      'cloudinary.com',
      'imgur.com',
      'unsplash.com',
      'pexels.com',
      'pixabay.com',
      'googleusercontent.com',
    ]

    const hostname = parsedUrl.hostname.toLowerCase()

    // Verificar que el hostname coincide exactamente o termina con uno de los dominios permitidos
    const isAllowed = allowedDomains.some(
      (domain) => hostname === domain || hostname.endsWith('.' + domain)
    )

    if (!isAllowed) {
      console.warn('Intento de acceder a una imagen desde un dominio no permitido:', imageUrl)
      throw createError({
        statusCode: 403,
        statusMessage: 'Solo se permiten URLs de dominios confiables',
      })
    }

    // Obtener la imagen usando el fetch global disponible en Node/Nuxt
    const response = await fetch(imageUrl)

    if (!response || !response.ok) {
      const status = response?.status || 502
      const statusText = response?.statusText || 'Error fetching image'
      console.error(`Error fetching image. Status: ${status} ${statusText}`, imageUrl)
      throw createError({
        statusCode: status,
        statusMessage: `Error al obtener la imagen (${status})`,
      })
    }

    // Leer el body como arrayBuffer y convertir a Buffer para devolverlo desde el endpoint
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Establecer las cabeceras apropiadas
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    setResponseHeader(event, 'Content-Type', contentType)
    setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
    setResponseHeader(event, 'Cross-Origin-Resource-Policy', 'cross-origin')

    // Devolver la imagen como buffer
    return buffer
  } catch (error: any) {
    console.error('Error al obtener la imagen:', error)
    if (error && error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Error al obtener la imagen' })
  }
})
