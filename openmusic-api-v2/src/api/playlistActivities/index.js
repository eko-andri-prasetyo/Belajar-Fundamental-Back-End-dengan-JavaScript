const PlaylistActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistActivities',
  version: '1.0.0',
  register: async (server, { activitiesService, playlistsService }) => {
    const handler = new PlaylistActivitiesHandler(activitiesService, playlistsService);
    server.route(routes(handler));
  },
};
