const config = {
  app: {
    host: process.env.HOST || 'localhost',
    port: Number(process.env.PORT || 5000),
  },
  database: {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE,
  },
  jwt: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenAge: Number(process.env.ACCESS_TOKEN_AGE || 1800),
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
    queue: 'export:playlists',
  },
  redis: {
    host: process.env.REDIS_SERVER,
    port: Number(process.env.REDIS_PORT || 6379),
  },
  storage: {
    baseUrl: process.env.COVER_BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
  },
};

module.exports = config;
