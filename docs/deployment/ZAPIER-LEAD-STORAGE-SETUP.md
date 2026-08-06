# Zapier lead storage setup

Status: workbook and mapping prepared; live Zapier connection and real-provider tests remain manual.

## Storage decision

Use two layers:

1. **Supabase is the source of truth.** The assessment API writes the durable lead first. It contains the authoritative consent, attribution, recommendation and delivery state.
2. **Google Sheets is the operational mirror.** Zapier adds a convenient row for reviewing leads, assigning follow-up and recording pipeline progress.

Do not replace Supabase with the spreadsheet. If Zapier or Google Sheets is unavailable, the assessment must still succeed after the Supabase insert.

The prepared native Google Sheet is named `Garcia Builder Lead Register` and contains:

- `Dashboard`: formula-driven lead, status, pipeline and follow-up totals.
- `Leads`: exact webhook fields followed by editable pipeline fields.
- `Lists & Zapier`: the eight-step Zap blueprint and field-by-field mapping.

Keep the Google Sheet private, do not publish it to the web, and restrict access to authorised users because it contains contact data and private result links.

## Core Zap

### 1. Trigger

Create a Zap with **Webhooks by Zapier → Catch Hook**.

Copy the generated URL into the server-only Vercel environment variable:

```text
ZAPIER_LEAD_WEBHOOK_URL=https://hooks.zapier.com/...
```

Do not put the hook URL in `env-config.json`, page HTML or browser JavaScript.

### 2. Capture a real sample

Run one assessment submission in the intended preview environment. Zapier should receive the payload only after the lead has been saved in Supabase.

The required minimum sample fields are:

- `lead_id`
- `created_at`
- `full_name`
- `email`
- `lead_status`
- `lead_score`

### 3. Reject malformed requests

Add **Filter by Zapier** and continue only when both `lead_id` and `email` exist.

### 4. Deduplicate

Add **Google Sheets → Lookup Spreadsheet Row**:

- Spreadsheet: `Garcia Builder Lead Register`
- Worksheet: `Leads`
- Lookup column: `lead_id`
- Lookup value: webhook `lead_id`

Continue to row creation only when no matching row exists. `lead_id` is the spreadsheet deduplication key.

### 5. Create the operational row

Add **Google Sheets → Create Spreadsheet Row** and map every webhook field to the same-named column. The `Lists & Zapier` tab contains the complete mapping.

Set these spreadsheet-only values on creation:

- `pipeline_stage`: `New`
- `follow_up_status`: `Needs follow-up`
- `owner`: `Andre` or blank

Leave `next_follow_up_at`, `last_contacted_at` and `notes` editable in the sheet.

### 6. Warm-lead alert

Create a path or a separate filtered Zap where `lead_status` equals `warm`. Send Andre only the information needed to act:

- name
- email and optional WhatsApp
- primary goal
- lead score
- preferred support
- result URL

### 7. Optional email nurture

Marketing automation may continue only when both conditions are true:

```text
nurture_eligible = true
marketing_email_consent = true
```

Use `nurture_sequence` to select the correct language/recommendation sequence. The transactional result email is separate and does not depend on marketing consent.

### 8. Publish only after live tests

Complete all checks in the separate manual launch checklist before enabling the Zap for production traffic.

## Acceptance tests

- Submit one lead with marketing consent `false`: Supabase and the sheet receive the lead; no marketing nurture starts.
- Submit one lead with marketing consent `true`: Supabase and the sheet receive the lead; the approved nurture path may start.
- Submit without optional WhatsApp: the row is created successfully.
- Replay the same payload: `lead_id` lookup prevents a second row.
- Temporarily make the Zapier action fail: the Supabase lead and visitor result still succeed.
- Confirm the spreadsheet row, Supabase row and result link refer to the same `lead_id`.

## Data governance still required

Before production ads, Andre/legal must approve retention periods for:

- leads without marketing consent;
- leads with active marketing consent;
- spreadsheet copies and Zapier task history;
- suppression records after unsubscribe.

The spreadsheet is not a reason to retain data indefinitely.
