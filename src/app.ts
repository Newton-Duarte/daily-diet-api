import fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import { usersRoutes } from './tables/users'

export const app = fastify()

app.register(fastifyCookie)
app.register(usersRoutes, {
  prefix: '/users',
})

app.get('/', () => {
  return { message: 'Daily Diet API' }
})
