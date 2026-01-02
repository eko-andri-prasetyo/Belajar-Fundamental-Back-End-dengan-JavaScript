const { createClient } = require('redis');
const config = require('../../utils/config');

class CacheService {
  constructor() {
    this._client = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
    });

    this._client.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Redis Client Error', err);
    });

    this._isReady = false;
    this._client.connect().then(() => { this._isReady = true; }).catch(() => {});
  }

  async get(key) {
    if (!this._isReady) return null;
    try {
      const result = await this._client.get(key);
      return result;
    } catch (error) {
      return null;
    }
  }

  async set(key, value, expirationInSecond = 1800) {
    if (!this._isReady) return;
    try {
      await this._client.set(key, value, { EX: expirationInSecond });
    } catch (error) {
      // Ignore cache set errors
    }
  }

  async delete(key) {
    if (!this._isReady) return;
    try {
      await this._client.del(key);
    } catch (error) {
      // Ignore cache delete errors
    }
  }
}

module.exports = CacheService;
