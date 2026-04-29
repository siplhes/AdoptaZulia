import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { testId } = body

  if (!testId) {
    throw createError({ statusCode: 400, statusMessage: 'testId is required' })
  }

  if (!config.autonomaClientId || !config.autonomaClientSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Autonoma credentials not configured',
    })
  }

  try {
    const response = await fetch(`https://autonoma.app/api/test/${testId}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      statusMessage: err.message || 'Failed to trigger Autonoma test',
    })
  }
})
