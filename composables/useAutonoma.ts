interface AutonomaTestResult {
  id: string
  status: 'running' | 'passed' | 'failed'
  url: string
  createdAt: string
}

interface AutonomaRunResponse {
  testId: string
  runId: string
  status: string
  url: string
}

/**
 * Composable para interactuar con Autonoma AI Testing Platform.
 * Requiere variables de entorno AUTONOMA_CLIENT_ID y AUTONOMA_CLIENT_SECRET.
 *
 * Uso típico:
 * const { triggerTest, getResults } = useAutonoma()
 * await triggerTest('test-id-123')
 */
export function useAutonoma() {
  const config = useRuntimeConfig()

  async function triggerTest(testId: string): Promise<AutonomaRunResponse | null> {
    try {
      const response = await fetch(`https://autonoma.app/api/test/${testId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': config.autonomaClientId as string,
          'X-Client-Secret': config.autonomaClientSecret as string,
        },
      })

      if (!response.ok) {
        console.error('Autonoma trigger failed:', response.statusText)
        return null
      }

      return await response.json()
    } catch (err) {
      console.error('Autonoma error:', err)
      return null
    }
  }

  async function getResults(runId: string): Promise<AutonomaTestResult | null> {
    try {
      const response = await fetch(`https://autonoma.app/api/run/${runId}`, {
        method: 'GET',
        headers: {
          'X-Client-Id': config.autonomaClientId as string,
          'X-Client-Secret': config.autonomaClientSecret as string,
        },
      })

      if (!response.ok) return null
      return await response.json()
    } catch (err) {
      console.error('Autonoma get results error:', err)
      return null
    }
  }

  return {
    triggerTest,
    getResults,
  }
}
