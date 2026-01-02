const routes = require('./routes');
const ExportsHandler = require('./handler');

module.exports = {
  name: 'exports',
  register: async (server, options) => {
    const handler = new ExportsHandler(options);
    server.route(routes(handler));
  },
};
