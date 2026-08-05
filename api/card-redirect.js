'use strict';

const { buildCardRedirectUrl } = require('../lib/card-redirect.cjs');

module.exports = function cardRedirect(req, res) {
  res.statusCode = 302;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Location', buildCardRedirectUrl(req.query));
  res.end();
};
