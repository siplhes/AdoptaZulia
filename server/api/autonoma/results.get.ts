import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { runId } = getQuery(event) as { runId: string }

  if (!runId) {
    throw createError({ statusCode: 400, statusMessage: 'runId is required' })
  }

  if (!config.autonomaClientId || !config.autonomaClientSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Autonoma credentials not configured',
    })
  }

  try {
    const response = await fetch(`https://autonoma.app/api/run/${runId}`, {
      method: 'GET',
      headers: {
        'X-Client-Id': config.autonomaClientId,
        'X-Client-Secret': config.autonomaClientSecret,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw createError({
        statusCode: response.status,
        statusMessage: `Autonoma API error: ${errorText}`,
      })
    }

    const data = await response.json()
    return { success: true, data }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Failed to fetch Autonoma results',
    })
  }
})
