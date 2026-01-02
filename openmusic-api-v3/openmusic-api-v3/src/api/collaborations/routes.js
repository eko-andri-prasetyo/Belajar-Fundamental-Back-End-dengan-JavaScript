const routes = (handler) => [
  { method: 'POST', path: '/collaborations', options: { auth: 'openmusic_jwt' }, handler: (r,h) => handler.postCollaborationHandler(r,h) },
  { method: 'DELETE', path: '/collaborations', options: { auth: 'openmusic_jwt' }, handler: (r) => handler.deleteCollaborationHandler(r) },
];
module.exports = routes;
