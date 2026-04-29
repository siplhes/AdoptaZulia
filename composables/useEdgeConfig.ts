import { get, createClient } from '@vercel/edge-config'

let client: ReturnType<typeof createClient> | null = null

function getClient() {
  if (!client) {
    client = createClient(process.env.EDGE_CONFIG)
  }
  return client
}

/**
 * Lee una feature flag desde Vercel Edge Config.
 * Gratis en plan Hobby con límites generosos.
 *
 * @example
 * const showNewAdoptionFlow = await getFeatureFlag('show_new_adoption_flow')
 */
export async function getFeatureFlag<T = boolean>(key: string): Promise<T | undefined> {
  try {
    const c = getClient()
    return await c.get<T>(key)
  } catch {
    // Fallback silencioso si Edge Config no está configurado
    return undefined
  }
}

/**
 * Verifica si una feature flag está activada.
 * @example
 * const isEnabled = await isFeatureEnabled('show_new_adoption_flow')
 */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  const value = await getFeatureFlag(key)
  return value === true
}
