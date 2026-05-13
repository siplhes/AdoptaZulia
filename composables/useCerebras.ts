export interface CerebrasResponse {
  content: string
}

export const useCerebras = async (prompt: string): Promise<CerebrasResponse> => {
  try {
    const response = await $fetch<CerebrasResponse>('/api/cerebras', {
      method: 'POST',
      body: { prompt }
    })
    return response
  } catch (error: any) {
    console.error('Error calling Cerebras API:', error)
    throw error
  }
}
