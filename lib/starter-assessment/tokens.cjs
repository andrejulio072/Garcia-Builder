const crypto = require('crypto');

function generateResultToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashResultToken(token) {
  return crypto.createHash('sha256').update(String(token || ''), 'utf8').digest('hex');
}

function getTokenExpiryDate(now = new Date()) {
  const days = Number.parseInt(process.env.RESULT_TOKEN_EXPIRY_DAYS || '30', 10);
  const safeDays = Number.isFinite(days) && days > 0 ? days : 30;
  return new Date(now.getTime() + safeDays * 24 * 60 * 60 * 1000);
}

module.exports = {
  generateResultToken,
  getTokenExpiryDate,
  hashResultToken
};
