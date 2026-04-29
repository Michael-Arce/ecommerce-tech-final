import { CohereClient } from 'cohere-ai'
import { recordAiCall } from './metrics.js'

let client: CohereClient | null = null

function getClient(): CohereClient {
  if (!client) {
    if (!process.env.COHERE_API_KEY) throw new Error('COHERE_API_KEY is not set')
    client = new CohereClient({ token: process.env.COHERE_API_KEY })
  }
  return client
}

export async function embedQuery(text: string): Promise<number[]> {
  try {
    const res = await getClient().embed(
      { texts: [text], model: 'embed-multilingual-v3.0', inputType: 'search_query' },
      { timeoutInSeconds: 10 },
    )
    recordAiCall('cohere')
    return (res.embeddings as number[][])[0]
  } catch (err) {
    recordAiCall('cohere', true)
    throw err
  }
}
