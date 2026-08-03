const eventHandler = require('../../lib/starter-assessment/event-handler.cjs');
const { createAssessmentEndpoint } = require('../../lib/starter-assessment/http.cjs');

module.exports = createAssessmentEndpoint(eventHandler, ['POST']);
