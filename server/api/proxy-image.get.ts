import { createError, defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  try {
    // Obtener la URL de la imagen desde los parámetros de consulta
    const query = getQuery(event)
    const imageUrl = query.url as string

    if (!imageUrl) {
      return createError({
        statusCode: 400,
        statusMessage: 'URL de imagen requerida'
      })
    }

    // Lista de dominios permitidos
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
      'googleusercontent.com'
    ]

    // Verificar que la URL es de un dominio permitido
    const isAllowed = allowedDomains.some(domain => imageUrl.includes(domain))
    
    if (!isAllowed) {
      console.warn('Intento de acceder a una imagen desde un dominio no permitido:', imageUrl)
      return createError({
        statusCode: 403,
        statusMessage: 'Solo se permiten URLs de dominios confiables'
      })
    }

    // Obtener la imagen
    const response = await fetch(imageUrl, {
      responseType: 'arrayBuffer'
    })

    // Establecer las cabeceras apropiadas
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    setResponseHeader(event, 'Content-Type', contentType)
    setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
    setResponseHeader(event, 'Cross-Origin-Resource-Policy', 'cross-origin')

    // Devolver la imagen como respuesta
    return response
  } catch (error) {
    console.error('Error al obtener la imagen:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Error al obtener la imagen'
    })
  }
})