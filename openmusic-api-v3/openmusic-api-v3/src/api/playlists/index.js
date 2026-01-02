const routes = require('./routes');
const PlaylistsHandler = require('./handler');

module.exports = {
  name: 'playlists',
  register: async (server, options) => {
    const handler = new PlaylistsHandler(options);
    server.route(routes(handler));
  },
};
