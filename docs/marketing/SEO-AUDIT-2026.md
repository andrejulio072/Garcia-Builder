# Technical SEO audit — 2026 release

Audit date: 2026-08-04

Canonical host: `https://www.garciabuilder.fitness`

Scope: repository and local-preview evidence; no production deployment or Search Console mutation

## Executive result

The repository now has a controlled extensionless URL and metadata contract. The local preview is technically consistent, but production launch remains conditional on a preview deployment, real Lighthouse/browser evidence, Search Console/Bing checks, final legal values, and manual tag/cookie verification.

## Implemented and verified in the repository

| Area | Result | Evidence |
| --- | --- | --- |
| Controlled page manifest | 63 entries | `config/seo-pages.json` records source, path, title, description, canonical, indexability, sitemap inclusion, page type, primary image and last meaningful modification. |
| Sitemap | 58 indexable URLs | Generated only from the controlled manifest. Campaign, private result, auth and admin routes are excluded. |
| Extensionless URLs | Implemented | Indexable canonicals and sitemap URLs have no `.html`. Vercel has explicit permanent redirects plus `cleanUrls: true`; destinations are extensionless. |
| Indexing rules | Implemented | `/assessment` and `/start` use `noindex, follow`; the private result shell uses `noindex, nofollow`; controlled private/campaign pages are absent from the sitemap. |
| Metadata contract | Passing | Every controlled page has one title, description, canonical and robots tag plus Open Graph/Twitter fields; indexable titles and descriptions are unique. |
| Structured data | Passing repository validation | JSON-LD parses, unsupported `Review` and `AggregateRating` types are rejected, and URLs use canonical routes. Manual Rich Results testing is still required. |
| Internal links | Passing | Public links use controlled extensionless paths and the link-integrity check rejects redirected `.html` targets. |
| Topic clusters | Implemented | Article pages link to the relevant online-coaching or fat-loss pillar and to the starter assessment. Related-article blocks provide lateral links. |
| Image dimensions | 188 occurrences corrected | Intrinsic width/height and async decoding were added from the actual local assets. |
| Responsive images | 107 occurrences / 37 unique oversized sources | 109 responsive WebP files are generated and connected with `srcset`/`sizes`. See `image-performance-report.json`. |
| Live route validation | 58/58 local preview URLs returned 200 | `SEO_BASE_URL=http://localhost:5197 npm run seo:live` against the manifest-aware local server. Production must be rechecked after deployment. |

## Canonical and routing policy

- Canonical host is always `www.garciabuilder.fitness`.
- Public indexable routes are extensionless.
- `.html` sources remain implementation files and redirect permanently when requested publicly.
- Vercel preserves query strings on redirect; representative UTM redirects still require preview/production confirmation.
- The assessment is a campaign route and never enters the sitemap.
- Result tokens never enter HTML metadata, the manifest or sitemap.
- Admin, authentication, dashboard, success and test routes remain non-indexable and outside the public manifest.

## Structured-data policy

Allowed types are `Organization`, `WebSite`, `Person`, `ProfessionalService`, `Service`, `BreadcrumbList`, `Article`, and `FAQPage` where matching content is visible. The automated check rejects `Review` and `AggregateRating`. Social `sameAs`, professional claims, service areas, prices and dates must be removed or corrected whenever they are not visibly supportable.

## Topic-cluster map

```text
Online coaching (/online-coaching)
├── training structure and progression articles
├── weekly check-in and consistency articles
├── recovery, mobility and schedule articles
└── relevant starter assessment CTA (/assessment)

Fat-loss structure (/start-fat-loss)
├── calories, meal timing and nutrition articles
├── protein, supplements and meal-prep articles
├── hunger, habits and alcohol articles
└── relevant starter assessment CTA (/assessment)
```

## Multilingual SEO decision

The JavaScript language selector does not create indexable alternate documents, so no `hreflang` is emitted. A future multilingual release should use real, separately crawlable routes such as `/en/`, `/pt/` and `/es/`, with complete translated content, self-canonicals, reciprocal `hreflang` links and an appropriate `x-default`. Do not add locale annotations before those documents exist.

## Performance targets and evidence policy

The repeatable Lighthouse command is `npm run audit:lighthouse`. It audits `/`, `/online-coaching` and `/assessment` at a 390 × 844 mobile viewport and stores local reports in ignored `lighthouse-results/`. Release testing targets LCP below 2.5 seconds, CLS below 0.1 and field INP below 200 ms. Lighthouse is lab evidence and cannot prove production field INP; production Core Web Vitals must be monitored after launch.

Local mobile lab evidence after the layout-stability fixes:

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 41 | 99 | 96 | 100 | 7,024 ms | 0.001 | 1,508 ms |
| `/online-coaching` | 61 | 100 | 100 | 100 | 5,419 ms | 0.000 | 590 ms |
| `/assessment` | 70 | 100 | 96 | 69 (intentionally `noindex`) | 5,475 ms | 0.093 | 0 ms |

The dynamically loaded navbar and late KPI replacement were corrected, reducing homepage CLS from 0.606 to 0.001 and online-coaching CLS from 0.125 to zero. The homepage and online-coaching LCP/performance targets are still not met under Lighthouse mobile simulation. Their remaining critical path includes legacy sitewide CSS, component loading and analytics code; a broad analytics redesign is outside this sprint, so preview/CDN validation and a later focused public-shell performance pass remain launch follow-ups.

## Manual/external work before launch

- [ ] Run the full Lighthouse command against the final release environment and review reports, not only scores.
- [ ] Validate homepage, online coaching, packages, transformations, one article and legal pages in Google Rich Results Test where relevant.
- [ ] Verify the canonical domain property in Search Console and Bing Webmaster Tools.
- [ ] Submit the generated sitemap and inspect a sample from every page type.
- [ ] Confirm Google-selected canonicals match declared canonicals after recrawl.
- [ ] Review Page indexing, Core Web Vitals, manual actions and rich-result reports.
- [ ] Re-run `npm run seo:live` with `SEO_BASE_URL` set to the approved preview and then production URL.
- [ ] Inspect representative `.html` redirects with UTMs and confirm query preservation.
- [ ] Re-audit image/LCP choices after final CDN behavior is known.
- [ ] Confirm final consent/tag scripts do not add layout shift or block the assessment's LCP resource.

## Commands

```text
npm run seo:manifest:apply
npm run seo:images
npm run seo:clusters
npm run seo:contract
npm run seo:audit
npm run test:links
SEO_BASE_URL=<preview-origin> npm run seo:live
npm run audit:lighthouse
```
