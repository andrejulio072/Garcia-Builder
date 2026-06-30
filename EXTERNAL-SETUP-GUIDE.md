# Garcia Builder Automation Pipeline - External Setup Guide

## Overview

The 4-step automation pipeline is now implemented in code. This document outlines the external configuration you need to complete.

**Pipeline Status:**
- ✅ **Step 1: Lead Capture** - Code deployed, ready to use
- ✅ **Step 2: Purchase Webhook** - Code deployed, needs My PT Hub configuration
- ✅ **Step 3: Abandoned Checkout Recovery** - Code deployed, needs scheduler setup
- ⏳ **Step 4: Zapier Automation** - Code ready, needs Zapier setup

---

## Step 1: Lead Capture on Pricing Page

**Status:** ✅ **READY TO USE** (No external setup needed)

**What it does:**
- Email input field appears on /pricing.html before pricing cards
- Captures email + attribution data when "Save Email" button clicked
- Stores in Supabase `newsletter_subscribers` table with source = "pricing_page"
- Sends welcome email with link to 28-day quickstart guide
- Stores lead as backup in case PT Hub purchase doesn't complete

**Implementation:**
- `pricing.html`: Added lead capture form section (lines 421-436)
- `js/pricing.js`: Added form handler + Supabase integration
- API endpoint: `/api/newsletter` (existing, reused)

**User Flow:**
```
User visits /pricing.html
    ↓
Sees "Secure your spot" email input
    ↓
Enters email + clicks "Save Email"
    ↓
Email sent to /api/newsletter
    ↓
Stored in newsletter_subscribers table
    ↓
Welcome email sent (if Brevo/SMTP configured)
    ↓
User can now proceed to My PT Hub checkout
```

**External Config:** None required - uses existing Supabase + Brevo

---

## Step 2: Purchase Webhook from My PT Hub

**Status:** ✅ **CODE READY** - Needs My PT Hub configuration

**What it does:**
- Receives POST requests from My PT Hub when customer completes purchase
- Records purchase in Supabase `purchases` table
- Extracts source attribution (where lead came from: ads, organic, etc.)
- Forwards to Zapier (optional, for automated onboarding)
- Enables purchase tracking and ROI analysis

**Implementation:**
- API endpoint: `/api/mypthub-purchase-webhook`
- Creates/updates records in `purchases` table
- Extracts UTM parameters from pricing leads

### Setup Steps:

**1. Create Supabase `purchases` Table**

Run this SQL in Supabase → SQL Editor:

```sql
-- Create purchases table
CREATE TABLE purchases (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  plan_key TEXT NOT NULL,
  plan_name TEXT,
  amount DECIMAL(10, 2),
  currency TEXT,
  transaction_id TEXT UNIQUE,
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  purchased_at TIMESTAMP,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_purchases_email ON purchases(email);
CREATE INDEX idx_purchases_transaction_id ON purchases(transaction_id);

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own purchases
CREATE POLICY "Users can read their own purchases"
  ON purchases FOR SELECT
  USING (auth.email() = email);
```

**2. Configure My PT Hub Webhook**

1. Log in to My PT Hub → Settings
2. Navigate to **Webhooks** or **Integrations**
3. Create new webhook:
   - **Event:** Purchase Completed / Order Complete
   - **URL:** `https://garciabuilder.fitness/api/mypthub-purchase-webhook`
   - **Method:** POST
   - **Content-Type:** application/json
   - **Headers:** (if PT Hub uses auth)
     - Add `X-Webhook-Secret` header with value from env var `MYPTHUB_WEBHOOK_SECRET`

4. PT Hub should POST payload like:
```json
{
  "event": "purchase.completed",
  "customer_email": "user@example.com",
  "customer_name": "John Doe",
  "plan_key": "monthly",
  "plan_name": "Monthly Online Coaching",
  "amount": 17500,
  "currency": "EUR",
  "transaction_id": "pt-hub-txn-12345",
  "signature": "..."
}
```

**3. Add Environment Variables** (if using signature validation)

Add to `.env`:
```env
MYPTHUB_WEBHOOK_SECRET=your_secret_key_from_pt_hub
```

**Verification:**
- After purchase completes on PT Hub, check Supabase:
  ```sql
  SELECT * FROM purchases WHERE email = 'customer@example.com';
  ```
- Should show purchase record with source attribution

---

## Step 3: Abandoned Checkout Recovery

**Status:** ✅ **CODE READY** - Needs scheduler + Supabase table

**What it does:**
- Monitors pricing page leads for 72 hours
- Sends automated reminder emails if no purchase detected:
  - First reminder at **24 hours** after lead captured
  - Second reminder at **48 hours** after lead captured  
  - Final reminder at **72 hours** after lead captured
- Typical recovery rate: **8-12%** of abandoned checkouts
- Purpose: Re-engage users who showed interest but didn't complete

**Implementation:**
- API endpoint: `/api/abandoned-checkout-recovery`
- Queries `newsletter_subscribers` + `purchases` tables
- Sends via Brevo or SMTP

### Setup Steps:

**1. Create Supabase Tracking Table**

Run in Supabase → SQL Editor:

```sql
-- Track sent reminders to avoid duplicates
CREATE TABLE abandoned_checkout_reminders (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- 'first_reminder', 'second_reminder', 'final_reminder'
  sent_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX idx_abandoned_reminders_lead ON abandoned_checkout_reminders(lead_id);
CREATE INDEX idx_abandoned_reminders_email_type ON abandoned_checkout_reminders(email_type);
```

**2. Set Up Scheduler**

Choose one of:

**Option A: Vercel Cron** (if deployed on Vercel)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/abandoned-checkout-recovery",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs hourly. The endpoint checks which reminders are due and sends them.

**Option B: External Cron Service** (e.g., EasyCron)

1. Go to https://www.easycron.com
2. Create new cron job:
   - **URL:** `https://garciabuilder.fitness/api/abandoned-checkout-recovery`
   - **Method:** POST
   - **Frequency:** Every hour (`0 * * * *`)
   - **Headers:** Add `X-Scheduler-Secret: your_secret_key`

3. Add to `.env`:
```env
SCHEDULER_SECRET=your_secret_key
```

**Option C: Node.js Node-Cron** (local or deployment)

If you want to run it on your server:

```javascript
import cron from 'node-cron';
import fetch from 'node-fetch';

// Run every hour
cron.schedule('0 * * * *', async () => {
  const response = await fetch('https://garciabuilder.fitness/api/abandoned-checkout-recovery', {
    method: 'POST',
    headers: {
      'X-Scheduler-Secret': process.env.SCHEDULER_SECRET
    }
  });
  console.log('Abandoned checkout recovery ran:', response.status);
});
```

**3. Configure Email Provider**

Ensure one of these is configured in `.env`:

**Brevo (Recommended):**
```env
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=andre@garciabuilder.fitness
BREVO_SENDER_NAME=Garcia Builder
```

**SMTP Fallback:**
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=andre@garciabuilder.fitness
```

**Verification:**
- Run endpoint manually: `curl -X POST https://garciabuilder.fitness/api/abandoned-checkout-recovery -H "X-Scheduler-Secret: your_secret"`
- Check email inbox for reminder emails
- Check Supabase `abandoned_checkout_reminders` table for logged sends

---

## Step 4: Zapier Automation

**Status:** ✅ **CODE READY** - Needs Zapier setup + triggers

**What it does:**
- Fully automates client onboarding after PT Hub purchase
- Triggers automated email sequences
- Tags client with purchase source for analytics
- Creates client profile in PT Hub automatically (optional)

**Workflow:**
```
My PT Hub Purchase Webhook
    ↓
/api/mypthub-purchase-webhook receives event
    ↓
Forwards to Zapier webhook
    ↓
Zapier processes multi-step automation:
    1. Extract customer data from webhook
    2. Create/update client in PT Hub CRM (if needed)
    3. Send Welcome Email (intro + first workout)
    4. Send Onboarding Checklist Email
    5. Tag client with source (ads/organic/referral)
    6. Create task in project management tool (optional)
```

### Setup Steps:

**1. Get My PT Hub API Credentials**

1. Log in to My PT Hub
2. Go to **Settings** → **API** or **Developers**
3. Generate API key
4. Store securely (you'll need this for Zapier)

**2. Create Zapier Account**

1. Go to https://zapier.com
2. Sign up (free account works for basic automation)
3. Click **"Create Zap"**

**3. Set Up Trigger: Webhook**

1. Search for **"Webhooks by Zapier"**
2. Select **"Catch Raw Hook"**
3. Zapier will give you a unique webhook URL
4. Add this URL to the webhook endpoint in `.env`:
   ```env
   ZAPIER_PURCHASE_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/YOUR_UNIQUE_ID/
   ```
5. Test the trigger by running a test purchase

**4. Add Actions**

Add steps to your Zapier zap:

**Step 1: Extract Data**
- Action: **Formatter by Zapier** → **Text**
- Parse the webhook JSON payload
- Extract: email, customer_name, plan_name, amount, etc.

**Step 2: Send Welcome Email**
- Action: **Gmail** (or **Email by Zapier**)
- To: `Customer Email` (from step 1)
- Subject: `Welcome to [Plan Name] Coaching!`
- Body: (template below)

**Step 3: Send Onboarding Checklist**
- Action: **Gmail** (or **Email by Zapier**)
- Delay: 2 days after previous action
- Subject: `Your Onboarding Checklist - [Plan Name]`
- Body: (template below)

**Step 4: Tag in PT Hub (Optional)**
- Action: **My PT Hub** → **Create/Update Client**
- Email: `Customer Email`
- Name: `Customer Name`
- Tags: Add `source:pricing_page` or `source:ads` based on attribution

**Step 5: Spreadsheet Tracking (Optional)**
- Action: **Google Sheets** → **Create Spreadsheet Row**
- Tracks all purchases for manual review

### Email Templates:

**Welcome Email:**
```
Subject: Welcome to [Plan Name] Coaching!

Hi [Customer Name],

Congratulations on starting your transformation journey! 🎉

Your [Plan Name] coaching plan starts today. Here's what happens next:

1. Check your PT Hub app for your first week's workouts
2. Review your personalized nutrition targets
3. Watch for your first check-in email (tomorrow at 9 AM)

Your first workout is waiting for you in PT Hub. Let's get started!

Questions? Reply to this email or book a quick consultation:
https://calendly.com/andrenjulio072/consultation

Let's build that version of you,
Andre | Garcia Builder

P.S. This is your personalized plan. It's designed specifically for your goal and current fitness level.
```

**Onboarding Checklist:**
```
Subject: Your Onboarding Checklist - [Plan Name]

Hi [Customer Name],

You're halfway through your first week! Here's your onboarding checklist:

□ Downloaded PT Hub app (if not already done)
□ Completed your first 2 workouts
□ Logged your meals in the nutrition section (optional but recommended)
□ Reviewed your weekly goals
□ Booked your first check-in call

Next: You'll get your first progress assessment in 7 days.

Questions or stuck on something? Reply here - I'm here to help!

Best,
Andre
Garcia Builder Coaching
```

### Deployment:

1. **Test flow manually:**
   - Send test purchase to webhook endpoint
   - Watch Zapier trigger dashboard for incoming data
   - Verify all emails send

2. **Monitor:**
   - Check Zapier task history for failures
   - Add error handlers for failed emails
   - Set up Zapier alerts for errors

3. **Optimize:**
   - Track email open rates in Gmail
   - Adjust send times based on user engagement
   - A/B test different subject lines

---

## Environment Variables Checklist

Add these to your `.env` file:

```env
# Step 2: My PT Hub Webhook
MYPTHUB_WEBHOOK_SECRET=your_pt_hub_webhook_secret

# Step 3: Abandoned Checkout Recovery
SCHEDULER_SECRET=your_scheduler_secret

# Step 4: Zapier Integration
ZAPIER_PURCHASE_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/YOUR_ID/

# Email Configuration (both steps 3 & 4)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=andre@garciabuilder.fitness
BREVO_SENDER_NAME=Garcia Builder

# Alternative: SMTP
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=andre@garciabuilder.fitness
```

---

## Testing Checklist

### Step 1: Lead Capture
- [ ] Visit `/pricing.html`
- [ ] Enter email in "Secure your spot" form
- [ ] Click "Save Email"
- [ ] See success message
- [ ] Check Supabase: `newsletter_subscribers` has new row with `source='pricing_page'`
- [ ] Check email inbox for welcome email

### Step 2: Purchase Webhook
- [ ] Create test purchase in My PT Hub
- [ ] Webhook delivers to `/api/mypthub-purchase-webhook`
- [ ] Check Supabase: `purchases` table has new row
- [ ] Verify `transaction_id` is unique and populated

### Step 3: Abandoned Checkout Recovery
- [ ] Create test lead 25+ hours ago in `newsletter_subscribers`
- [ ] Trigger scheduler: `curl -X POST https://garciabuilder.fitness/api/abandoned-checkout-recovery -H "X-Scheduler-Secret: ..."`
- [ ] Check email inbox for first reminder
- [ ] Verify Supabase: `abandoned_checkout_reminders` has new row

### Step 4: Zapier Automation
- [ ] Verify Zapier zap is active and published
- [ ] Send test purchase through webhook
- [ ] Check Zapier task history shows successful execution
- [ ] Verify welcome email arrives (check spam folder)
- [ ] Verify PT Hub client created (if using that action)

---

## Troubleshooting

**"Lead capture form not showing"**
- Restart preview server: `npm run serve`
- Clear browser cache (Cmd+Shift+R)
- Check browser console for JS errors

**"Webhook not receiving events"**
- Verify My PT Hub webhook URL is correct (copy-paste from your dashboard)
- Check My PT Hub webhooks retry settings (retry on failure)
- Test manually: `curl -X POST https://your-site/api/mypthub-purchase-webhook -H "Content-Type: application/json" -d '{"test": true}'`
- Check server logs for errors

**"Emails not sending"**
- Verify Brevo API key is valid
- Check email address format in webhook payload
- Look for "Brevo send failed" in server logs
- Test SMTP credentials independently

**"Abandoned checkout recovery not running"**
- Verify cron schedule is correct (24h intervals)
- Check scheduler logs (Vercel/EasyCron dashboard)
- Manually trigger: `curl -X POST https://your-site/api/abandoned-checkout-recovery`
- Verify `SCHEDULER_SECRET` matches in .env

**"Zapier not forwarding data"**
- Test webhook with `curl` to verify it accepts data
- Check Zapier trigger settings for correct webhook format
- Look at Zapier task history for specific error messages
- Verify action email addresses are correct

---

## Support & Next Steps

After completing all external setup:

1. **Monitor** the first 10-15 purchases to verify all systems work
2. **Test email flows** end-to-end with internal email addresses
3. **Adjust timings** for abandoned checkout reminders based on your data
4. **Optimize** Zapier sequences based on engagement metrics
5. **Consider** adding SMS reminders as a secondary channel (Twilio)

Questions? Reply to this document with specific issues.

---

## Summary of Integrations

| Step | Component | Provider | Status |
|------|-----------|----------|--------|
| 1 | Lead Capture | Supabase + Brevo | ✅ Ready |
| 2 | Purchase Webhook | My PT Hub + Supabase | ⏳ Needs config |
| 3 | Abandoned Recovery | Scheduler + Email | ⏳ Needs setup |
| 4 | Client Onboarding | Zapier + Email | ⏳ Needs Zapier |

**Total Setup Time:** 2-3 hours (mostly copy-pasting credentials and creating tables)

