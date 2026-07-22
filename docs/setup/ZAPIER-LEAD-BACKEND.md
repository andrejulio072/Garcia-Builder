# Zapier Lead Backend

The coaching application form posts to `/api/lead`. Valid consultation applications are normalized on the server, forwarded to Zapier, saved to Supabase, and then returned to the browser as accepted.

## Canonical Payload

Zapier receives one flat JSON object. Do not use **Pick Off A Child Key** in the Catch Hook because there is no nested child object.

```json
{
  "schemaVersion": "1.0",
  "type": "coaching_application",
  "lead_id": "",
  "submittedAt": "",
  "firstName": "",
  "lastName": "",
  "fullName": "",
  "email": "",
  "phone": "",
  "goal": "",
  "currentWeight": "",
  "mainStruggle": "",
  "trainingLocation": "",
  "startTimeline": "",
  "investmentReadiness": "",
  "consent": true,
  "consent_text": "Yes",
  "source": "",
  "page": "",
  "utm_source": "",
  "utm_medium": "",
  "utm_campaign": "",
  "utm_content": "",
  "utm_term": "",
  "gclid": "",
  "fbclid": ""
}
```

All text fields are strings. Missing optional fields are empty strings. `consent` is a boolean and `consent_text` is `Yes` or `No`. `email` is lowercase, `fullName` is built from `firstName` and `lastName`, and `submittedAt` is ISO 8601.

## Required Fields

The backend requires:

`firstName`, `lastName`, `email`, `phone`, `goal`, `currentWeight`, `mainStruggle`, `trainingLocation`, `startTimeline`, `investmentReadiness`, `consent`.

The backend accepts camelCase and snake_case aliases, including `first_name`, `current_weight`, `main_struggle`, `training_location`, `start_timeline`, `investment_readiness`, `leadId`, and UTM camelCase names.

## Environment Variables

Primary Zapier webhook:

`ZAPIER_LEAD_WEBHOOK_URL`

Legacy fallback, preserved when present:

`ZAPIER_MAIN_COACHING_WEBHOOK_URL`

Optional hot-lead webhook:

`ZAPIER_HOT_LEAD_WEBHOOK_URL`

Do not hardcode webhook URLs in frontend code or documentation.

## Zapier Setup

Step 1 is **Webhooks by Zapier - Catch Hook**. Leave **Pick Off A Child Key** blank.

Step 2 is **Google Sheets - Create Spreadsheet Row**. Map fields directly from Step 1, for example Step 1 `email` to the sheet email column.

Step 3 is **Gmail - Internal lead alert**.

Step 4 is **Gmail - Applicant confirmation**. Send it to Step 1 `email`.

Do not use old Zapier sample **Querystring** fields. Use the direct Step 1 fields from the JSON body.

## Duplicate Protection

The frontend sends one `lead_id` per form submission. The backend keeps an in-memory duplicate cache for 10 minutes. A repeated valid request with the same `lead_id` returns HTTP 200 with:

```json
{
  "ok": true,
  "duplicate": true,
  "leadId": "..."
}
```

The duplicate request does not call Zapier again. Different lead IDs are separate applications. Invalid submissions are not stored in the duplicate cache.

## API Responses

Accepted application:

```json
{
  "ok": true,
  "leadId": "...",
  "zapierSent": true,
  "leadSaved": true,
  "hotLead": false,
  "hotLeadSent": false,
  "hotLeadSkipped": true,
  "message": "Thanks - your application has been received. I'll review your goal and get back to you."
}
```

Missing required fields:

```json
{
  "error": "Missing required consultation fields",
  "missingFields": ["firstName"]
}
```

Primary Zapier rejection:

```json
{
  "ok": false,
  "error": "Lead forwarding failed. Please try again or message Andre directly."
}
```

## Supabase Storage

The backend preserves the existing `leads` table fallback strategy. When the schema supports it, it stores:

- `email`: normalized lowercase email
- `name`: full name
- `source`: canonical source
- `type`: `consultation`
- `status`: `new`
- `notes`: canonical payload serialized as JSON

If a schema column is missing, the existing fallback payloads are tried.

## Hot Leads

Hot-lead detection is case-insensitive:

- `investmentReadiness` equals `Ready now`
- `startTimeline` equals `Now` or `This week`

Failure of `ZAPIER_HOT_LEAD_WEBHOOK_URL` is logged but does not reject an application already accepted by the primary Zapier hook.

## Tests

Run local mocked tests:

```bash
npm test --silent
```

Run only the backend contract:

```bash
node scripts/lead-backend.check.mjs
```

## Optional Deployed Endpoint Test

This sends the safe synthetic fixture to a deployed `/api/lead`. It is blocked unless explicitly enabled:

```bash
ALLOW_LIVE_LEAD_TEST=true BASE_URL=https://garciabuilder.fitness TEST_EMAIL=andrenjulio072+backendtest@gmail.com node scripts/test-lead-endpoint.mjs
```

The script prints only HTTP status and sanitized response fields. It never prints secrets.
