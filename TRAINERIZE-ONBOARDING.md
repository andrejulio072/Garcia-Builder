# Trainerize Onboarding — Setup & Test Guide

This guide explains how the post-payment onboarding flow works and how to configure it.

## What’s included

- Server-side onboarding email sent on successful payment (Stripe webhook)
- Success page CTA button that links the customer directly to your Trainerize invite
- End-to-end metadata passthrough so the invite link travels from checkout creation → Stripe → success page → email

## Configuration options

You can provide the Trainerize invite link in any of these ways (priority top to bottom):

1. Client param (recommended for flexibility)

- The pricing page now sends `trainerizeInvite` when creating the checkout session if present.
- You can set it via:
  - Add a meta tag on any page that launches checkout:
    `<meta name="trainerize:invite" content="https://link.trainerize.com/your-invite" />`
  - Or set a global in a script tag before the pricing JS loads:
    `window.GB_TRAINERIZE_INVITE = 'https://link.trainerize.com/your-invite'`

1. Server environment fallback

- If no client param is provided, the server uses `TRAINERIZE_INVITE_URL` from env.
- Set it in your environment:
  - `TRAINERIZE_INVITE_URL=https://link.trainerize.com/your-invite`

The link is stored in Stripe session metadata and included in the `/api/payment-status/:sessionId` response so the success page can display the CTA.

## SMTP for onboarding email

To send onboarding emails automatically on `checkout.session.completed`, set these env vars:

- `SMTP_HOST`
- `SMTP_PORT` (587 or 465)
- `SMTP_USER`
- `SMTP_PASS`
- `FROM_EMAIL` (for example, `no-reply@garciabuilder.fitness`)

If SMTP isn’t fully configured, the email step is skipped safely.

## Test the flow

1. Add the meta tag on the success page or pricing page with your invite URL.
2. Run the backend and complete a test payment (Stripe test mode):
   - Server: `npm start` (Render/production uses your existing deploy)
3. After paying, confirm on the success page:
   - The Trainerize CTA appears and opens your invite URL
4. Check your email (to the customer address used):
   - You should receive the onboarding email with the same invite link

## Notes

- The success page hides the CTA if no invite link is available.
- Email locale is inferred simply (en/pt). You can adjust later if needed.
- This enhancement is backward-compatible: if no link is provided anywhere, everything else continues to work.
