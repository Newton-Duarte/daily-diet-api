/* eslint-disable camelcase */
import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { checkUser } from '../middlewares/check-user'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkUser)

  app.get('/', async (request) => {
    const userId = request.cookies.userId

    const userMeals = await knex('meals')
      .where({
        user_id: userId,
      })
      .select()

    return { meals: userMeals }
  })

  app.get('/:id', async (request) => {
    const userId = request.cookies.userId

    const getMealSchema = z.object({
      id: z.string(),
    })

    const { id } = getMealSchema.parse(request.params)

    const userMeal = await knex('meals')
      .where({
        user_id: userId,
        id,
      })
      .first()

    return { meal: userMeal }
  })

  app.post('/', async (request, reply) => {
    const userId = request.cookies.userId

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

  app.put('/:id', async (request, reply) => {
    const userId = request.cookies.userId

    const updateMealSchema = z.object({
      id: z.string(),
      name: z.string().min(3, 'Nome da refeição é obrigatório'),
      description: z.string(),
      inside_diet: z.boolean(),
      date: z.coerce.date(),
    })

    const { id, name, description, inside_diet, date } = updateMealSchema.parse(
      request.body,
    )

    const findMeal = await knex('meals')
      .where({
        user_id: userId,
        id,
      })
      .first()

    if (!findMeal) {
      return reply.status(404).send({
        error: 'Meal not found',
        message: 'The Meal with the provided ID was not found',
      })
    }

    await knex('meals')
      .where({
        user_id: userId,
        id,
      })
      .update({
        name,
        description,
        inside_diet,
        date,
      })
  })

  app.delete('/:id', async (request, reply) => {
    const userId = request.cookies.userId

    const deleteMealSchema = z.object({
      id: z.string(),
    })

    const { id } = deleteMealSchema.parse(request.params)

    const findMeal = await knex('meals')
      .where({
        user_id: userId,
        id,
      })
      .first()

    if (!findMeal) {
      return reply.status(404).send({
        error: 'Meal not found',
        message: 'The Meal with the provided ID was not found',
      })
    }

    await knex('meals')
      .where({
        user_id: userId,
        id,
      })
      .delete()
  })

  app.get('/analytics', async (request) => {
    const userId = request.cookies.userId

    const meals = await knex('meals').where({
      user_id: userId,
    })

    const insideDietMeals = meals.filter((meal) => meal.inside_diet)
    const outsideDietMeals = meals.filter((meal) => !meal.inside_diet)
    const bestInsideDietStreak = meals.reduce(
      (streak, meal) => {
        if (meal.inside_diet) {
          streak.currentStreak += 1
        } else {
          streak.currentStreak = 0
        }

        if (streak.currentStreak > streak.bestStreak) {
          streak.bestStreak = streak.currentStreak
        }

        return streak
      },
      {
        currentStreak: 0,
        bestStreak: 0,
      },
    )

    return {
      total_meals: meals.length,
      inside_diet_total_meals: insideDietMeals.length,
      outside_diet_total_meals: outsideDietMeals.length,
      best_inside_diet_streak: bestInsideDietStreak.bestStreak,
    }
  })
}
