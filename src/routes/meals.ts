/* eslint-disable camelcase */
import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const userId = request.cookies.userId

    if (!userId) {
      return reply.status(400).send({
        error: 'Usuário não encontrado',
        message: 'Informe o campo userId nos cookies',
      })
    }

    const userMeals = await knex('meals').select()

    return { meals: userMeals }
  })

  app.post('/', async (request, reply) => {
    const userId = request.cookies.userId

    if (!userId) {
      return reply.status(400).send({
        error: 'Usuário não encontrado',
        message: 'Informe o campo userId nos cookies',
      })
    }

    const createMealSchema = z.object({
      name: z.string().min(3, 'Nome da refeição é obrigatório'),
      description: z.string(),
      inside_diet: z.boolean(),
      date: z.coerce.date(),
    })

    const { name, description, inside_diet, date } = createMealSchema.parse(
      request.body,
    )

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      inside_diet,
      date,
      user_id: userId,
    })

    return reply.status(201).send()
  })
}
