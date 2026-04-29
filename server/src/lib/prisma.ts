import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Neon free tier pauses compute after ~5 min of inactivity, which kills open
// pg-pool connections with "Connection terminated unexpectedly".
// idleTimeoutMillis: 30_000 closes idle connections before Neon pulls the rug.
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
  idleTimeoutMillis:      30_000,
  connectionTimeoutMillis: 5_000,
  max: 5,
})

const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter })
