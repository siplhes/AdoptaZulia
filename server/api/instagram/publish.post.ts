const GRAPH_API_VERSION = 'v19.0'
const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 60000

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }

  const body = await readBody(event)
  const { imageUrl, caption = '' } = body

  if (!imageUrl || typeof imageUrl !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'imageUrl is required' })
  }

  const config = useRuntimeConfig(event)
  const accessToken = config.instagramAccessToken as string | undefined
  const instagramId = config.instagramBusinessId as string | undefined

  if (!accessToken) {
    throw createError({ statusCode: 500, statusMessage: 'INSTAGRAM_ACCESS_TOKEN not configured' })
  }
  if (!instagramId) {
    throw createError({ statusCode: 500, statusMessage: 'INSTAGRAM_BUSINESS_ID not configured' })
  }

  // STEP 1 — Create media container
  let creationId: string
  try {
    const containerResponse = await $fetch<{ id: string }>(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${instagramId}/media`,
      {
        method: 'POST',
        query: {
          image_url: imageUrl,
          caption,
          access_token: accessToken,
        },
      }
    )
    creationId = containerResponse.id
  } catch (err: any) {
    const fbError = err?.data?.error?.message || err?.message || String(err)
    throw createError({
      statusCode: 502,
      statusMessage: `Instagram media creation failed: ${fbError}`,
    })
  }

  // STEP 2 — Poll container status until ready
  const startTime = Date.now()
  let ready = false

  while (!ready && Date.now() - startTime < POLL_TIMEOUT_MS) {
    try {
      const status = await $fetch<{ status_code?: string }>(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${creationId}`,
        {
          method: 'GET',
          query: {
            fields: 'status_code',
            access_token: accessToken,
          },
        }
      )

      if (status.status_code === 'FINISHED') {
        ready = true
      } else if (status.status_code === 'ERROR') {
        throw createError({
          statusCode: 502,
          statusMessage: 'Instagram media processing failed (status: ERROR)',
        })
      } else {
        await sleep(POLL_INTERVAL_MS)
      }
    } catch (err: any) {
      if (err.statusCode) throw err
      const fbError = err?.data?.error?.message || err?.message || String(err)
      throw createError({
        statusCode: 502,
        statusMessage: `Instagram status check failed: ${fbError}`,
      })
    }
  }

  if (!ready) {
    throw createError({
      statusCode: 504,
      statusMessage: 'Instagram media processing timeout',
    })
  }

  // STEP 3 — Publish the container
  let publishResponse: { id: string }
  try {
    publishResponse = await $fetch<{ id: string }>(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${instagramId}/media_publish`,
      {
        method: 'POST',
        query: {
          creation_id: creationId,
          access_token: accessToken,
        },
      }
    )
  } catch (err: any) {
    const fbError = err?.data?.error?.message || err?.message || String(err)
    throw createError({
      statusCode: 502,
      statusMessage: `Instagram publish failed: ${fbError}`,
    })
  }

  return {
    success: true,
    instagramMediaId: publishResponse.id,
    creationId,
  }
})