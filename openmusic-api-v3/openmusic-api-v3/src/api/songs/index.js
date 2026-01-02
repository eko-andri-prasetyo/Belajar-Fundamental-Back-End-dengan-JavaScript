const routes = require('./routes');
const SongsHandler = require('./handler');

module.exports = {
  name: 'songs',
  register: async (server, options) => {
    const handler = new SongsHandler(options);
    server.route(routes(handler));
  },
};
