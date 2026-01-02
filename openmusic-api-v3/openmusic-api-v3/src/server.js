require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const config = require('./utils/config');
const ClientError = require('./exceptions/ClientError');

// services
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistSongActivitiesService = require('./services/postgres/PlaylistSongActivitiesService');
const UserAlbumLikesService = require('./services/postgres/UserAlbumLikesService');
const CacheService = require('./services/redis/CacheService');

// plugins
const albums = require('./api/albums');
const songs = require('./api/songs');
const users = require('./api/users');
const authentications = require('./api/authentications');
const playlists = require('./api/playlists');
const collaborations = require('./api/collaborations');
const exportsPlugin = require('./api/exports');

// validators
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const UsersValidator = require('./validator/users');
const AuthenticationsValidator = require('./validator/authentications');
const PlaylistsValidator = require('./validator/playlists');
const CollaborationsValidator = require('./validator/collaborations');
const ExportsValidator = require('./validator/exports');

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService();
  const activitiesService = new PlaylistSongActivitiesService();

  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const likesService = new UserAlbumLikesService();
  const cacheService = new CacheService();

  const server = Hapi.server({
    host: config.app.host,
    port: config.app.port,
    routes: {
      cors: { origin: ['*'] },
    },
  });

  await server.register([Jwt, Inert]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: config.jwt.accessTokenKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.jwt.accessTokenAge,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: { id: artifacts.decoded.payload.id },
    }),
  });

  // serve uploaded files
  server.route({
    method: 'GET',
    path: '/uploads/{param*}',
    handler: {
      directory: {
        path: path.join(__dirname, '../uploads'),
      },
    },
  });

  await server.register([
    {
      plugin: albums,
      options: {
        albumsService,
        songsService,
        likesService,
        cacheService,
        validator: AlbumsValidator,
      },
    },
    { plugin: songs, options: { service: songsService, validator: SongsValidator } },
    { plugin: users, options: { service: usersService, validator: UsersValidator } },
    { plugin: authentications, options: { usersService, authenticationsService, validator: AuthenticationsValidator } },
    {
      plugin: playlists,
      options: {
        playlistsService,
        playlistSongsService,
        songsService,
        activitiesService,
        validator: PlaylistsValidator,
      },
    },
    { plugin: collaborations, options: { collaborationsService, playlistsService, usersService, validator: CollaborationsValidator } },
    { plugin: exportsPlugin, options: { playlistsService, validator: ExportsValidator } },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({ status: 'fail', message: response.message });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // Handle payload too large (413) - Hapi returns this as Boom error
      if (response.output && response.output.statusCode === 413) {
        const newResponse = h.response({
          status: 'fail',
          message: 'Payload content length greater than maximum allowed: 512000',
        });
        newResponse.code(413);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      // eslint-disable-next-line no-console
      console.error(response);
      const newResponse = h.response({ status: 'error', message: 'Maaf, terjadi kegagalan pada server kami.' });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  // eslint-disable-next-line no-console
  console.log(`OpenMusic API v3 running at ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

init().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
