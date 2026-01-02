const routes = (handler) => [
  { method: 'POST', path: '/albums', handler: (r,h) => handler.postAlbumHandler(r,h) },
  { method: 'GET', path: '/albums', handler: () => handler.getAlbumsHandler() },
  { method: 'GET', path: '/albums/{id}', handler: (r,h) => handler.getAlbumByIdHandler(r,h) },
  { method: 'PUT', path: '/albums/{id}', handler: (r,h) => handler.putAlbumByIdHandler(r,h) },
  { method: 'DELETE', path: '/albums/{id}', handler: (r,h) => handler.deleteAlbumByIdHandler(r,h) },

  // upload cover
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    options: {
      payload: {
        maxBytes: 512000,
        output: 'stream',
        parse: true,
        multipart: true,
      },
    },
    handler: (r,h) => handler.postCoverHandler(r,h),
  },

  // likes (auth required)
  { method: 'POST', path: '/albums/{id}/likes', options: { auth: 'openmusic_jwt' }, handler: (r,h) => handler.postLikeAlbumHandler(r,h) },
  { method: 'DELETE', path: '/albums/{id}/likes', options: { auth: 'openmusic_jwt' }, handler: (r,h) => handler.deleteLikeAlbumHandler(r,h) },
  { method: 'GET', path: '/albums/{id}/likes', handler: (r,h) => handler.getAlbumLikesHandler(r,h) },
];

module.exports = routes;
