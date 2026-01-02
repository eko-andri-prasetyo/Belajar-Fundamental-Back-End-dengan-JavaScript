const routes = (handler) => [
  { method: 'POST', path: '/authentications', handler: (r,h) => handler.postAuthenticationHandler(r,h) },
  { method: 'PUT', path: '/authentications', handler: (r) => handler.putAuthenticationHandler(r) },
  { method: 'DELETE', path: '/authentications', handler: (r) => handler.deleteAuthenticationHandler(r) },
];
module.exports = routes;
