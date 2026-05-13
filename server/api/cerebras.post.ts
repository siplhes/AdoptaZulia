import Cerebras from '@cerebras/cerebras_cloud_sdk'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const apiKey = config.cerebrasApiKey

    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'CEREBRAS_API_KEY not configured'
      })
    }

    const body = await readBody(event)
    const { prompt } = body

    if (!prompt) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Prompt is required'
      })
    }

    const cerebras = new Cerebras({ apiKey })

    const completion = await cerebras.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3.1-8b',
      max_completion_tokens: 512,
      temperature: 0.1,
      top_p: 0.9,
      stream: false
    })

    const content = completion.choices[0]?.message?.content || ''

    return {
      content
    }
  } catch (error: any) {
    console.error('Cerebras API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to generate response'
    })
  }
})
