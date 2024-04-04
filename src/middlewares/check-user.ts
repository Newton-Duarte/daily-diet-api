import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkUser(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.cookies.userId

  if (!userId) {
    return reply.status(401).send({
      error: 'Usuário não encontrado',
      message: 'Informe o campo userId nos cookies',
    })
  }
}
