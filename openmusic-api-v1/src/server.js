require('dotenv').config();

const Hapi = require('@hapi/hapi');

const ClientError = require('./exceptions/ClientError');

const albumsPlugin = require('./api/albums');
const songsPlugin = require('./api/songs');

const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');

const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Error handling (Dicoding style)
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    // Handle errors thrown by handlers / services
    if (response instanceof Error) {
      // ClientError: 400 / 404
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // Hapi/Boom errors (e.g. 404 route not found)
      if (response.isBoom) {
        const statusCode = response.output.statusCode;

        // For 404, follow Dicoding response contract
        if (statusCode === 404) {
          const newResponse = h.response({
            status: 'fail',
            message: 'Resource tidak ditemukan',
          });
          newResponse.code(404);
          return newResponse;
        }

        // for other boom errors (like payload too large, etc) keep as fail
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(statusCode);
        return newResponse;
      }

      // Unhandled server error
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      // eslint-disable-next-line no-console
      console.error(response);
      return newResponse;
    }

    return h.continue;
  });

  await server.register([
    {
      plugin: albumsPlugin,
      options: {
        service: new AlbumsService(),
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songsPlugin,
      options: {
        service: new SongsService(),
        validator: SongsValidator,
      },
    },
  ]);

  await server.start();
  // eslint-disable-next-line no-console
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
