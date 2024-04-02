import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const users = await knex('users').select()

    return { users }
  })

  app.post('/', async (request, reply) => {
    const createUserSchema = z.object({
      name: z.string().min(2, 'Nome é obrigatório'),
    })

    const { name } = createUserSchema.parse(request.body)

    const data = await knex('users')
      .insert({
        id: randomUUID(),
        name,
      })
      .returning('id')

    const userId = data[0].id

    return reply
      .setCookie('userId', userId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      .status(201)
      .send()
  })
}
