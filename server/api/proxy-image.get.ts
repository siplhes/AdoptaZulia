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

    // Verificar que la URL es de nuestro bucket S3 para evitar abusos
    if (!imageUrl.includes('nsfwclothesmaracaibo.s3.us-east-2.amazonaws.com')) {
      return createError({
        statusCode: 403,
        statusMessage: 'Solo se permiten URLs de nuestro bucket S3'
      })
    }

    // Obtener la imagen de S3
    const response = await fetch(imageUrl, {
      responseType: 'arrayBuffer'
    })

    // Establecer las cabeceras apropiadas
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    setResponseHeader(event, 'Content-Type', contentType)
    setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')

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