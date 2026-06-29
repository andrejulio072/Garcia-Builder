# Platform cost analysis: My PT Hub vs My PT Hub (transition until own app)

Date: 2026-06-29
Purpose: Decide the best platform economics and operational path until Garcia Builder own app is ready.

## Scope
This compares:
- Current My PT Hub usage costs
- My PT Hub entry and scale costs (based on publicly visible pricing data)
- Which option is better for a 6-18 month transition window

## Pricing inputs captured (public pages)

### My PT Hub (USD)
Source: https://www.mypthub.com/pricing
- Grow: $9/month (up to 2 clients)
- Pro 5: $23/month (up to 5 clients)
- Studio Plus: $248/month (up to 500 clients, per location)
- Add-ons (Grow/Pro tier):
  - Business: $25/month
  - Advanced Nutrition: $20/month (Pro 5/15) and $45/month (Pro 30-200)
  - Video Coaching: $10/month
  - Stripe Integrated Payments: $10/month
  - Custom Branded App (Pro): one-time setup fee $169

Note: Pro 15/30/50/100/200 base prices were not exposed in the fetched text, so those specific base costs need direct quote or screenshot confirmation.

### My PT Hub (EUR)
Source: https://www.mypthub.net/pricing
- Starter: EUR 22.50/month (3 clients)
- Premium: EUR 52/month (unlimited clients)
- Ultimate: EUR 195/month (includes add-ons bundle)
- Add-ons on Premium:
  - Additional trainer: EUR 10/month each
  - White label app: EUR 145/month
  - Check-Ins AI: EUR 10/month
  - Zapier: EUR 18/month
  - Custom branded app: EUR 95 one-time

## Cost scenarios (monthly run-rate)

Because currencies differ (USD vs EUR), this section keeps native-currency values to avoid FX distortion.

### Scenario A: Lean coaching ops (no white label, no advanced AI stack)
- Needs: client management, workouts, nutrition basics, messaging, simple payments

My PT Hub:
- Premium = EUR 52/month (unlimited clients)

My PT Hub:
- 5 clients: Pro 5 = USD 23/month
- 6+ clients: requires higher Pro tier (exact tier base price not confirmed in fetched text)

Interpretation:
- At very small scale (<=5 clients), My PT Hub can be cheaper.
- At >5 clients, My PT Hub has predictable flat cost with unlimited clients.

### Scenario B: Growth coaching ops (payments + automation + nutrition + video)
- Needs: stronger automation and sales operations

My PT Hub (Premium + add-ons):
- EUR 52 + 10 (AI) + 18 (Zapier) = EUR 80/month
- If white label app needed: + EUR 145 => EUR 225/month total

My PT Hub (Pro tier + add-ons):
- Base Pro tier (depends on client volume) +
- Business 25 + Nutrition 20/45 + Video 10 + Stripe 10
- Add-ons subtotal = USD 65/month (or USD 90/month for Pro 30-200 nutrition tier)
- Plus one-time branded app setup fee USD 169 (if branded app needed)

Interpretation:
- My PT Hub can become cost-efficient if base Pro tier at your client count is competitive.
- My PT Hub remains highly predictable at EUR 80 without white label, but white label pushes it to EUR 225.

### Scenario C: Brand-first app experience before your own app
- Needs: your own app identity in stores

My PT Hub:
- White label = EUR 145/month recurring (plus platform plan)

My PT Hub:
- Pro custom branded app = one-time USD 169 setup (based on visible pricing text)
- Studio plans include broader branding options at much higher base monthly (USD 248)

Interpretation:
- If recurring white label cost is a concern, My PT Hub branded option may be cheaper in medium term, depending on plan fit and exact branding requirements.

## 12-month total cost examples (simple model)

### My PT Hub
- Premium only: 52 x 12 = EUR 624/year
- Premium + AI + Zapier: 80 x 12 = EUR 960/year
- Premium + white label + AI + Zapier: 225 x 12 = EUR 2,700/year
- Premium + custom branded app (one-time): EUR 624 + EUR 95 = EUR 719 first year

### My PT Hub (known floor values only)
- Pro 5 only (<=5 clients): 23 x 12 = USD 276/year
- Pro 5 + Business + Nutrition + Video + Stripe:
  - (23 + 25 + 20 + 10 + 10) x 12 = USD 1,056/year
  - + one-time branded app setup (if needed): USD 1,225 first year

Important: for >5 clients, replace Pro 5 with correct Pro tier price to compute accurate annual total.

## Operational fit (not just cost)

### My PT Hub advantages
- Strong ecosystem for coach workflows and automations
- Structured add-on model for payments/video/nutrition
- Good path for digital coaching scale

### My PT Hub constraints
- Tiered client limits and add-on stacking can increase complexity
- Exact financial decision depends on missing Pro tier base prices for your client band

### My PT Hub advantages
- Premium unlimited clients at low, predictable base cost
- Simple cost planning while building your own stack
- Already in use today (lower transition friction)

### My PT Hub constraints
- White label recurring fee is significant
- Some advanced workflows may require multiple add-ons

## Recommendation (until own app)

Recommended path now:
1. Keep My PT Hub as delivery platform short-term (fast, predictable, low migration risk).
2. Do not commit to recurring white label yet unless brand-store presence is critical this quarter.
3. Build your owned core in parallel (Supabase + Stripe + onboarding automations + client data model).
4. Re-evaluate My PT Hub with exact quote when one of these triggers happens:
   - Active clients exceed current operating comfort
  - You need deeper automation/video/sales orchestration than current stack supports
   - You want lower branded-app total cost than My PT Hub white label recurring fee

Decision rule:
- If your next 12 months prioritize margin and predictability: My PT Hub Premium path wins.
- If your next 12 months prioritize advanced automation and coaching ecosystem depth (and quoted tier pricing is favorable): My PT Hub can win.

## Data needed to finalize decision with precision
- Your active client count now and 6/12-month forecast
- Need for white label app now vs later
- Must-have add-ons (AI, Zapier, video, integrated payments)
- Number of additional trainers planned
- Target monthly margin per client

## Suggested next action (immediate)
Run a 30-minute decision workshop with these outputs:
1. Confirm forecast bands: 0-5, 6-25, 26-60, 61+
2. Lock feature bundle required for next 6 months
3. Request My PT Hub quote for the exact expected client tier
4. Compare 12-month TCO in a single sheet and decide go/no-go for migration

