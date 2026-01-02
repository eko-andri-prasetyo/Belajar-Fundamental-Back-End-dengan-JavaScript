const jwt = require('jsonwebtoken');

const TokenManager = {
  generateAccessToken: (payload) => {
    const ttlSec = Number(process.env.ACCESS_TOKEN_AGE ?? 1800);
    return jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, { expiresIn: ttlSec });
  },

  generateRefreshToken: (payload) => jwt.sign(payload, process.env.REFRESH_TOKEN_KEY),

  verifyRefreshToken: (refreshToken) => jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY),
};

module.exports = TokenManager;
