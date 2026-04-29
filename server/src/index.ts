import { app } from './app.js'
import { logger } from './lib/logger.js'

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () => {
  logger.info(`server running on http://localhost:${PORT}`)
})
