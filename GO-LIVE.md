# Taking this site to a production domain

Right now the site lives on Adobe's shared preview/live infrastructure:

- Preview: `https://main--eds-capstone-ajay--ajayajju2412.aem.page/`
- Live: `https://main--eds-capstone-ajay--ajayajju2412.aem.live/`

That `.aem.live` URL is already a fully working, published site — it's just not on a domain anyone would actually type into a browser, and Adobe deliberately blocks search engines from indexing it (more on why below). Getting to a real production domain is mostly a DNS/CDN exercise, not a code change. Nothing in `blocks/`, `scripts/`, or `styles/` needs to be touched for this.

## The short version

1. Pick a CDN.
2. Point it at `https://main--eds-capstone-ajay--ajayajju2412.aem.live` as the origin.
3. Set a few required headers.
4. Point DNS at the CDN.
5. Test on a staging hostname before cutting over the real domain.
6. Flip `robots.txt` and `helix-sitemap.yaml` over to the real domain once it's live.

## Picking a CDN

Two realistic options for this project:

**Adobe-managed CDN** — comes with the AEM Sites as a Cloud Service license, least setup work, Adobe handles the cert and most of the config for you. This is the path I'd pick for a project like this one unless there's already an existing CDN contract to reuse.

**Bring-your-own CDN** — Cloudflare, Fastly, Akamai, or CloudFront all have documented setups for Edge Delivery Services. Worth it if the org already standardizes on one of these, or needs CDN-level features (WAF rules, custom edge logic) that the managed option doesn't expose.

Either way, the origin is the same: `https://main--eds-capstone-ajay--ajayajju2412.aem.live`. Always the `main` branch for production — never a feature branch.

## Required CDN configuration

Whichever CDN gets picked, it needs these settings pointed at the origin above:

- `X-Forwarded-Host` header set to the real production domain
- `X-Push-Invalidation: enabled` — this is what lets a publish in Document Authoring instantly bust the CDN cache instead of waiting on a TTL
- Respect the origin's cache-control headers rather than overriding them
- gzip/compression on
- Query strings forwarded to origin *and* included in the cache key (a lot of default CDN configs strip these — worth double-checking)
- Suppress or zero out the `Age` response header

The Fastly/Cloudflare/Akamai/CloudFront guides linked below all bake these in; if it's the Adobe-managed CDN, they're handled automatically.

## DNS

Once the CDN's configured, point the production domain's DNS at it (CNAME, typically) per whatever the chosen CDN's docs specify. Adobe's own guidance is to test the whole thing on a staging hostname first — including the `www` → apex redirect (or the reverse) — before touching the real domain's DNS.

## What changes once a real domain exists

Two files in this repo currently reference the `.aem.live` hostname directly and need updating once there's a real domain:

- `robots.txt` — the `Sitemap:` line currently points at `main--eds-capstone-ajay--ajayajju2412.aem.live/sitemap.xml`
- `helix-sitemap.yaml` — the `origin` field is set to the same `.aem.live` host

Also worth knowing: **`.aem.page` and `.aem.live` are intentionally hidden from search engines** by a platform-level default `robots.txt` override, specifically to avoid duplicate-content penalties before a site has a real domain. That's not a bug we can work around — it's why our own `robots.txt` in this repo hasn't been "live" in the sense of actually affecting crawlers yet. It'll take effect automatically once the production domain is configured, no extra step needed beyond updating the two references above.

## After cutover

A few things worth checking in the days after the domain actually goes live, not just at the moment of cutover:

- Re-run Lighthouse against the real domain, not just `.aem.live` — CDNs can quietly regress performance (HTTP/1.1 fallback, bot-detection middleware, extra redirect hops are the usual culprits)
- Watch for a spike in 404s from old URLs that didn't get a redirect entry — check `redirects.json` against whatever's showing up in analytics or the CDN's access logs
- If analytics/martech tags are wired up, confirm they're actually firing on the new hostname — some tools key off origin and silently go quiet on a domain change

## Reference

- [Go-Live Checklist](https://www.aem.live/docs/go-live-checklist) — the full version of the above, with the analytics/telemetry/auth items that don't apply to this project yet
- [BYO CDN Setup](https://www.aem.live/docs/byo-cdn-setup) — vendor-specific guides (Cloudflare, Fastly, Akamai, CloudFront) and the Adobe-managed CDN option
- [Push Invalidation Setup](https://www.aem.live/docs/setup-byo-cdn-push-invalidation)
