const routes = (handler) => [
  { method: 'POST', path: '/playlists', options: { auth: 'openmusic_jwt' }, handler: (r,h) => handler.postPlaylistHandler(r,h) },
  { method: 'GET', path: '/playlists', options: { auth: 'openmusic_jwt' }, handler: (r) => handler.getPlaylistsHandler(r) },
  { method: 'DELETE', path: '/playlists/{id}', options: { auth: 'openmusic_jwt' }, handler: (r) => handler.deletePlaylistByIdHandler(r) },

  { method: 'POST', path: '/playlists/{id}/songs', options: { auth: 'openmusic_jwt' }, handler: (r,h) => handler.postSongToPlaylistHandler(r,h) },
  { method: 'GET', path: '/playlists/{id}/songs', options: { auth: 'openmusic_jwt' }, handler: (r) => handler.getSongsFromPlaylistHandler(r) },
  { method: 'DELETE', path: '/playlists/{id}/songs', options: { auth: 'openmusic_jwt' }, handler: (r) => handler.deleteSongFromPlaylistHandler(r) },

  { method: 'GET', path: '/playlists/{id}/activities', options: { auth: 'openmusic_jwt' }, handler: (r) => handler.getPlaylistActivitiesHandler(r) },
];

module.exports = routes;
