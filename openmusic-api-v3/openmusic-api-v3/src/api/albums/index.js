const routes = require('./routes');
const AlbumsHandler = require('./handler');

module.exports = {
  name: 'albums',
  register: async (server, options) => {
    const handler = new AlbumsHandler(options);
    server.route(routes(handler));
  },
};
