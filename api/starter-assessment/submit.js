const submitHandler = require('../../lib/starter-assessment/submit-handler.cjs');
const { createAssessmentEndpoint } = require('../../lib/starter-assessment/http.cjs');

module.exports = createAssessmentEndpoint(submitHandler, ['POST']);
