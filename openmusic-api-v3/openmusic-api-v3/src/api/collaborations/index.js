const routes = require('./routes');
const CollaborationsHandler = require('./handler');

module.exports = {
  name: 'collaborations',
  register: async (server, options) => {
    const handler = new CollaborationsHandler(options);
    server.route(routes(handler));
  },
};
