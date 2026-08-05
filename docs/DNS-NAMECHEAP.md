# Configure Namecheap DNS For Vercel

Vercel is the only production host for Garcia Builder.

## Setup

1. In Vercel, open the Garcia Builder project and add the production domains.
2. In Namecheap, open `Domain List`, select the domain, and open `Advanced DNS`.
3. Create the DNS records shown by Vercel for the apex domain and `www`.
4. Remove conflicting parking, redirect, A, AAAA or CNAME records for the same hosts.
5. Return to Vercel and wait for each domain to show as configured.
6. Select the preferred production domain and redirect the alternate domain to it.

Use the values currently displayed by Vercel. Do not copy old provider records
or guess IP addresses.

## Related Configuration

- Set the preferred domain as `PUBLIC_SITE_URL` in Vercel.
- Add the production URLs to Supabase Authentication redirect settings.
- Keep canonical URLs, `robots.txt` and `sitemap.xml` on the same preferred domain.
- Verify HTTPS and the assessment API after DNS propagation.
