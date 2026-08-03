const resultHandler = require('../../lib/starter-assessment/result-handler.cjs');
const { createAssessmentEndpoint } = require('../../lib/starter-assessment/http.cjs');

module.exports = createAssessmentEndpoint(resultHandler, ['GET']);
