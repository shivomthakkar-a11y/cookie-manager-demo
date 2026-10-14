/**
 * Regional banner demo (EU / US / India).
 *
 * Inert unless PRIVY_REGION is set, so the default build stays the live
 * cookie-manager.sanketsaboo.com site (QE's privyauto suite asserts on it).
 *
 * With PRIVY_REGION set it:
 *   - swaps the banner tag for that region's banner (regions.json),
 *   - for an opt-out region, pre-seeds consent as all-granted before the banner
 *     loads. The product has no opt-out mode; the banner keeps an existing
 *     consent value and auto-blocking reads it, so trackers run until the
 *     visitor opts out,
 *   - holds GTM, Clarity and Google's ad script until the matching consent exists,
 *   - injects a region switcher bar with a consent reset.
 *
 * In dev the banner and its API calls are proxied through the dev server, so
 * consent POSTs from localhost are same-origin and not blocked by the staging
 * CORS allow-list.
 */
import { readFileSync } from 'node:fs'

const config = JSON.parse(readFileSync(new URL('./regions.json', import.meta.url), 'utf8'))
const BANNER_TAG = /<script[^>]*cookie-banner\/assets\/[^>]*><\/script>/
const ASSET_PATH = (ouId, bannerId) => `/cookie-manager/cookie-banner/assets/${ouId}/${bannerId}`

// Must match the categories in the generated banner's DEFAULT_COOKIE_CONSENT.
// update:false plus the banner id mark it as "seen, not yet answered", so the
// banner neither treats it as a fresh visit (which reloads when
// reload_on_consent is on) nor as a recorded choice (which hides the banner).
//
// Consent stored for another banner is replaced, not kept: it was given under
// opt-in defaults (the placeholder deploy served the opt-in live-site banner).
const optOutSeed = (bannerId) => `<script>
  (function () {
    try {
      var name = 'privyConsent'
      if (localStorage.getItem('privyConsentedBannerId') === ${JSON.stringify(bannerId)}) return
      var all = JSON.stringify({ NECESSARY: true, FUNCTIONAL: true, ANALYTICS: true, MARKETING: true, update: false })
      document.cookie = name + '=' + all + '; path=/; max-age=31536000'
      localStorage.setItem(name, all)
      localStorage.setItem('privyConsentedBannerId', ${JSON.stringify(bannerId)})
    } catch (e) { console.warn('privy demo: opt-out seed failed', e) }
  })()
</script>`

// GTM and Google's ad script load before the banner and are not in the scanned
// tag list, so the banner cannot block them, and Clarity slips past it (below):
// on the live site Clarity, GA4 and Ads cookies are set before any consent. A real client gates these on consent
// (Consent Mode or a consent-gated loader); the regional builds do the same.
//
// The custom type matters: the banner revives inline type="text/plain" scripts
// once it considers them consented, which for an untagged inline script is
// immediately.
const GATED_TYPE = 'text/x-privy-demo-gated'
const GATES = [
    {
        name: 'Google Tag Manager',
        match: /<script>(\(function\(w,d,s,l,i\)\{[\s\S]*?GTM-[A-Z0-9]+'\);)<\/script>/,
        to: (m, body) => `<script type="${GATED_TYPE}" data-privy-demo-gate="ANALYTICS,MARKETING">${body}</script>`
    },
    {
        // The banner does mark this tag blocked, but only after the browser has
        // queued it, so Clarity still runs and sets _clck before consent.
        name: 'Microsoft Clarity',
        match: /<script type="text\/javascript">(\s*\(function \(c, l, a, r, i, t, y\)[\s\S]*?"clarity", "script", "[a-z0-9]+"\);\s*)<\/script>/,
        to: (m, body) => `<script type="${GATED_TYPE}" data-privy-demo-gate="ANALYTICS">${body}</script>`
    },
    {
        name: 'Google Publisher Tag',
        match: /<script async src="(https:\/\/securepubads\.g\.doubleclick\.net\/tag\/js\/gpt\.js)"><\/script>/,
        to: (m, src) => `<script type="${GATED_TYPE}" data-privy-demo-gate="MARKETING" data-src="${src}"></script>`
    }
]

const GATE_RUNNER = `<script>
  (function () {
    function consent() {
      try {
        var m = document.cookie.match(/(?:^|; )privyConsent=([^;]*)/)
        return JSON.parse(m ? m[1] : localStorage.getItem('privyConsent') || '{}')
      } catch (e) { return {} }
    }
    function release() {
      var c = consent()
      document.querySelectorAll('script[type="${GATED_TYPE}"]').forEach(function (el) {
        if (!el.parentNode) return
        var needs = el.getAttribute('data-privy-demo-gate').split(',')
        if (!needs.every(function (k) { return c[k] === true })) return
        var s = document.createElement('script')
        s.nonce = el.nonce
        if (el.dataset.src) { s.src = el.dataset.src; s.async = true } else { s.text = el.textContent }
        el.parentNode.replaceChild(s, el)
      })
    }
    // The banner announces every consent change on the dataLayer. Released on
    // the next task, never inside the push: GTM pushes while it boots, and a
    // throw here would abort the banner's own consent submission.
    var dl = window.dataLayer = window.dataLayer || []
    var push = dl.push
    dl.push = function () { var r = push.apply(dl, arguments); setTimeout(release, 0); return r }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', release)
    else release()
  })()
</script>`

function gateTrackers(html) {
    return GATES.reduce((out, gate) => {
        if (!gate.match.test(out)) {
            throw new Error(`privy-regions: ${gate.name} snippet not found in index.html`)
        }
        return out.replace(gate.match, gate.to)
    }, html)
}

function regionBar(current, urlFor) {
    const links = Object.entries(config.regions).map(([key, r]) => {
        const cls = key === current ? 'privy-demo-region privy-demo-region--active' : 'privy-demo-region'
        return `<a class="${cls}" href="${urlFor(key, r)}">${r.label} <span>${r.law} · ${r.model}</span></a>`
    }).join('')
    // Classes only, no style attributes: the strict CSP has no 'unsafe-inline'.
    return `<style>
  body { padding-top: 48px; }
  /* The site header is absolutely positioned at top: 0. */
  header.header { top: 48px; }
  .privy-demo-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 2147483000; height: 48px;
    display: flex; align-items: center; gap: 8px; padding: 0 16px; overflow-x: auto;
    background: #0f172a; color: #e2e8f0; font: 14px/1.2 system-ui, sans-serif; }
  .privy-demo-bar strong { margin-right: 8px; white-space: nowrap; }
  .privy-demo-region { color: #e2e8f0; text-decoration: none; padding: 6px 10px; border-radius: 6px;
    border: 1px solid #334155; white-space: nowrap; }
  .privy-demo-region span { opacity: .7; font-size: 12px; }
  .privy-demo-region--active { background: #e2e8f0; color: #0f172a; border-color: #e2e8f0; }
  .privy-demo-reset { margin-left: auto; padding: 6px 10px; border-radius: 6px; border: 1px solid #64748b;
    background: transparent; color: #e2e8f0; cursor: pointer; white-space: nowrap; font: inherit; }
</style>
<div class="privy-demo-bar" role="navigation" aria-label="Demo region">
  <strong>Privy consent demo</strong>${links}
  <button type="button" class="privy-demo-reset" id="privy-demo-reset">Reset consent</button>
</div>
<script>
  document.getElementById('privy-demo-reset').addEventListener('click', function () {
    ['privyConsent', 'privyConsentedBannerId'].forEach(function (k) { localStorage.removeItem(k) })
    document.cookie = 'privyConsent=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    location.reload()
  })
</script>`
}

export default function privyRegions() {
    const regionKey = process.env.PRIVY_REGION
    if (!regionKey) {
        return { name: 'privy-regions' }
    }
    const region = config.regions[regionKey]
    if (!region) {
        throw new Error(`PRIVY_REGION=${regionKey} is not in regions/regions.json`)
    }
    if (config.ouId === 'TBD' || region.bannerId === 'TBD') {
        throw new Error(`privy-regions: set ouId and ${regionKey}.bannerId in regions/regions.json`)
    }
    let isDev = false
    const assetPath = ASSET_PATH(config.ouId, region.bannerId)

    return {
        name: 'privy-regions',
        config(_, { command }) {
            isDev = command === 'serve'
            if (!isDev) return {}
            return {
                server: {
                    port: region.devPort,
                    strictPort: true,
                    proxy: { '/cookie-manager': { target: config.bannerOrigin, changeOrigin: true } }
                }
            }
        },
        configureServer(server) {
            // Registered directly, so it runs ahead of the proxy: the banner is
            // fetched here and its absolute staging URLs made relative.
            server.middlewares.use(assetPath, async (req, res) => {
                res.setHeader('Content-Type', 'text/javascript')
                res.setHeader('Cache-Control', 'no-store')
                try {
                    const upstream = await fetch(config.bannerOrigin + assetPath)
                    res.statusCode = upstream.status
                    res.end((await upstream.text()).split(config.bannerOrigin).join(''))
                } catch (error) {
                    res.statusCode = 502
                    res.end(`console.error(${JSON.stringify(`privy demo: banner fetch failed: ${error.message}`)})`)
                }
            })
        },
        transformIndexHtml(html) {
            if (!BANNER_TAG.test(html)) {
                throw new Error('privy-regions: banner tag not found in index.html')
            }
            const src = isDev ? assetPath : config.bannerOrigin + assetPath
            const banner = `<script type="text/javascript" src="${src}" nonce="__PRIVY_NONCE__"></script>`
            const seed = region.model === 'opt-out' ? optOutSeed(region.bannerId) + '\n' : ''
            const urlFor = (key, r) => (isDev ? `http://localhost:${r.devPort}/` : `${r.url}/`)
            return gateTrackers(html)
                .replace(BANNER_TAG, seed + banner)
                .replace(/<body>/i, `<body>\n${regionBar(regionKey, urlFor)}\n${GATE_RUNNER}`)
        }
    }
}
