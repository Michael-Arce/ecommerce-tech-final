import { describe, it, expect, afterEach } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { prisma } from '../lib/prisma.js'

const TEST_EMAILS = ['test.user@gmail.com', 'new.admin@premiumtech.com']

// Clean up any users created during tests
afterEach(async () => {
  await prisma.user.deleteMany({ where: { email: { in: TEST_EMAILS } } })
})

describe('POST /api/auth/login', () => {
  it('returns 200 and an accessToken for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@premiumtech.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.accessToken).toBeDefined()
    expect(res.body.data.email).toBe('admin@premiumtech.com')
    expect(res.body.data.passwordHash).toBeUndefined()
  })

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@premiumtech.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('returns 401 for unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 for invalid request body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: '123' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/register', () => {
  const newUser = {
    firstName: 'Test',
    lastName:  'User',
    email:     'test.user@gmail.com',
    password:  'password123',
  }

  it('creates a new user and returns 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.email).toBe(newUser.email)
    expect(res.body.data.passwordHash).toBeUndefined()
    expect(res.body.accessToken).toBeDefined()
    const payload = JSON.parse(Buffer.from(res.body.accessToken.split('.')[1], 'base64').toString())
    expect(payload.role).toBe('customer')
  })

  it('assigns admin role to @premiumtech.com emails', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...newUser, email: 'new.admin@premiumtech.com' })

    expect(res.status).toBe(201)
    const payload = JSON.parse(Buffer.from(res.body.accessToken.split('.')[1], 'base64').toString())
    expect(payload.role).toBe('admin')
  })

  it('returns 409 when email is already registered', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...newUser, email: 'admin@premiumtech.com' })

    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })
})
