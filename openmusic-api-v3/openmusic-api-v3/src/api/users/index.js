const routes = require('./routes');
const UsersHandler = require('./handler');

module.exports = {
  name: 'users',
  register: async (server, options) => {
    const handler = new UsersHandler(options);
    server.route(routes(handler));
  },
};
