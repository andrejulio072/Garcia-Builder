import inquiryHandler from './inquiry.js';

function getJsonBody(req) {
  if (!req) return {};
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      console.warn('contact.js: failed to parse body string', error);
      return {};
    }
  }
  try {
    return JSON.parse(req.body || '{}');
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = getJsonBody(req);
  const preferredContact = payload.preferred_contact || payload.preferredContact || '';
  const goal = payload.primary_goal || payload.goal || '';
  const timeline = payload.timeline || payload.availability || '';
  const budget = payload.budget || '';
  const messageDetails = [
    payload.message || '',
    preferredContact ? `Preferred contact: ${preferredContact}` : '',
    timeline ? `Target timeline: ${timeline}` : '',
    budget ? `Monthly budget: ${budget}` : '',
  ].filter(Boolean).join('\n\n');

  req.body = {
    name: payload.name || null,
    email: payload.email || null,
    phone: payload.phone || null,
    goal,
    experience: payload.experience || null,
    availability: timeline || null,
    message: messageDetails,
    source: payload.source || 'Contact Page',
    page: payload.page_path || payload.page || req.headers.referer || '',
  };

  return inquiryHandler(req, res);
}
