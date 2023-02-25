/**
 * This file allows you to configure the Fastify Server settings
 * used by the RedwoodJS dev server.
 *
 * It also applies when running RedwoodJS with `yarn rw serve`.
 *
 * For the Fastify server options that you can set, see:
 * https://www.fastify.io/docs/latest/Reference/Server/#factory
 *
 * Examples include: logger settings, timeouts, maximum payload limits, and more.
 *
 * Note: This configuration does not apply in a serverless deploy.
 */

/** @type {import('fastify').FastifyServerOptions} */
const config = {
  requestTimeout: 15_000,
  logger: {
    // Note: If running locally using `yarn rw serve` you may want to adust
    // the default non-development level to `info`
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  },
}

const wsConnections = {}
const players = {}

/**
 * You can also register Fastify plugins and additional routes for the API and Web sides
 * in the configureFastify function.
 *
 * This function has access to the Fastify instance and options, such as the side
 * (web, api, or proxy) that is being configured and other settings like the apiRootPath
 * of the functions endpoint.
 *
 * Note: This configuration does not apply in a serverless deploy.
 */

/** @type {import('@redwoodjs/api-server/dist/fastify').FastifySideConfigFn} */
const configureFastify = async (fastify, options) => {
  if (options.side === 'api') {
    fastify.log.info({ custom: { options } }, 'Configuring api side')

    fastify.register(require('@fastify/websocket'))

    fastify.register(async (fastify) => {
      fastify.get('/ws', { websocket: true }, (connection) => {
        connection.socket.on('message', (message) => {
          console.log(`/ws message: ${message}`)

          try {
            const player = JSON.parse(message)
            wsConnections[player.playerId] = connection
            players[player.playerId] = player.score

            Object.values(wsConnections).forEach((wsConnection) => {
              wsConnection.socket.send(JSON.stringify(players))
            })
          } catch (e) {
            console.error('Could not parse input', message)
            console.error('error object:', e)
          }
        })

        connection.socket.on('close', () => {
          console.log('Client disconnected')
        })
      })
    })
  }

  if (options.side === 'web') {
    fastify.log.info({ custom: { options } }, 'Configuring web side')
  }

  return fastify
}

module.exports = {
  config,
  configureFastify,
}
