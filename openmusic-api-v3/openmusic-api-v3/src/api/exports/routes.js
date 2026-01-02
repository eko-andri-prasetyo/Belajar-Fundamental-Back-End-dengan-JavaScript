const routes = (handler) => [
  { method: 'POST', path: '/export/playlists/{playlistId}', options: { auth: 'openmusic_jwt' }, handler: (r,h) => handler.postExportPlaylistHandler(r,h) },
];
module.exports = routes;
