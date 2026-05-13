/**
 * Lee una feature flag desde Vercel Edge Config.
 * Gratis en plan Hobby con límites generosos.
 *
 * @example
 * const showNewAdoptionFlow = await getFeatureFlag('show_new_adoption_flow')
 */
export async function getFeatureFlag<T = boolean>(key: string): Promise<T | undefined> {
  // Fallback silencioso - Edge Config removido
  return undefined
}

