// Dedicated Vercel function entrypoint. Stripe implementation remains shared
// with legacy payment aliases while assessment functions stay independent.
module.exports = require('../stripe-server-premium');
