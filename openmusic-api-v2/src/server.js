require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const ClientError = require('./exceptions/ClientError');

const albumsPlugin = require('./api/albums');
const songsPlugin = require('./api/songs');
const usersPlugin = require('./api/users');
const authenticationsPlugin = require('./api/authentications');
const playlistsPlugin = require('./api/playlists');
const collaborationsPlugin = require('./api/collaborations');
const playlistActivitiesPlugin = require('./api/playlistActivities');

const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistActivitiesService = require('./services/postgres/PlaylistActivitiesService');

const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const UsersValidator = require('./validator/users');
const AuthenticationsValidator = require('./validator/authentications');
const PlaylistsValidator = require('./validator/playlists');
const CollaborationsValidator = require('./validator/collaborations');

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

  // JWT auth strategy for protected resources
  await server.register(Jwt);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: Number(process.env.ACCESS_TOKEN_AGE ?? 1800),
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: { id: artifacts.decoded.payload.userId },
    }),
  });

  // Error handling (Dicoding style)
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    // Handle errors thrown by handlers / services
    if (response instanceof Error) {
      // ClientError: 400 / 401 / 403 / 404
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // Hapi/Boom errors (e.g. 404 route not found, 401 missing token, etc)
      if (response.isBoom) {
        const statusCode = response.output.statusCode;

        if (statusCode === 404) {
          const newResponse = h.response({
            status: 'fail',
            message: 'Resource tidak ditemukan',
          });
          newResponse.code(404);
          return newResponse;
        }

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

  // init services
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();
  const collaborationsService = new CollaborationsService();
  const playlistSongsService = new PlaylistSongsService();
  const playlistActivitiesService = new PlaylistActivitiesService();

  await server.register([
    {
      plugin: albumsPlugin,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songsPlugin,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: usersPlugin,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authenticationsPlugin,
      options: {
        usersService,
        authenticationsService,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlistsPlugin,
      options: {
        playlistsService,
        playlistSongsService,
        songsService,
        activitiesService: playlistActivitiesService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborationsPlugin,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: playlistActivitiesPlugin,
      options: {
        activitiesService: playlistActivitiesService,
        playlistsService,
      },
    },
  ]);

  await server.start();
  // eslint-disable-next-line no-console
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
