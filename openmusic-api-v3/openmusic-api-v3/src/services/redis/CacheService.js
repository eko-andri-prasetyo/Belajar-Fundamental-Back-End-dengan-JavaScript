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
    if (!this._isReady) throw new Error('Redis not ready');
    const result = await this._client.get(key);
    return result;
  }

  async set(key, value, expirationInSecond = 1800) {
    if (!this._isReady) throw new Error('Redis not ready');
    await this._client.set(key, value, { EX: expirationInSecond });
  }

  async delete(key) {
    if (!this._isReady) return;
    await this._client.del(key);
  }
}

module.exports = CacheService;
