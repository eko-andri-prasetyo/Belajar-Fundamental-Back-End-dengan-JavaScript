const routes = (handler) => [
  { method: 'POST', path: '/songs', handler: (r,h) => handler.postSongHandler(r,h) },
  { method: 'GET', path: '/songs', handler: (r) => handler.getSongsHandler(r) },
  { method: 'GET', path: '/songs/{id}', handler: (r) => handler.getSongByIdHandler(r) },
  { method: 'PUT', path: '/songs/{id}', handler: (r) => handler.putSongByIdHandler(r) },
  { method: 'DELETE', path: '/songs/{id}', handler: (r) => handler.deleteSongByIdHandler(r) },
];
module.exports = routes;
