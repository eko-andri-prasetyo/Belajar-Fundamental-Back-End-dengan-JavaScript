const routes = require('./routes');
const AuthenticationsHandler = require('./handler');

module.exports = {
  name: 'authentications',
  register: async (server, options) => {
    const handler = new AuthenticationsHandler(options);
    server.route(routes(handler));
  },
};
