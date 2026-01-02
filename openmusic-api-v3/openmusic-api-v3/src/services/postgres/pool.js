const { Pool } = require('pg');
const config = require('../../utils/config');

const pool = new Pool({
  user: config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
});

module.exports = pool;
