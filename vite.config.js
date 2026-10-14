import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { randomBytes } from 'node:crypto'
import privyRegions from './regions/privy-regions.js'

// TEMPORARY, for PRI-87 manual verification.
// Restore the original with:  cp ../.demo-vite.restore vite.config.js
//
// Makes the dev server behave like a real strict-CSP host: a fresh nonce on
// every response, the policy in a real header rather than a meta tag, and the
// nonce substituted into the banner tag.
const BACKEND = 'http://127.0.0.1:3001'

// Where the deployed demo talks to. Dev proxies to BACKEND instead.
const STAGING = ' https://privy.idfystaging.com https://privy.idfy.com https://api.pyxis.privybyidfy.app'

// Fixed test nonce. It must match the literal nonce= on the banner tag in
// index.html, and Vite's html.cspNonce needs one known value for the <style>
// tags its dev client injects. A real host mints a fresh CSPRNG nonce per
// response instead: randomBytes(18).toString('base64').
const NONCE = randomBytes(18).toString('base64')   // CSPRNG, one per dev-server start / per build
// const NONCE = 'EDN9X8++t9iaowoNsOS+Ag=='

// Third-party vendors the demo loads on purpose, so the scanner and the banner
// have real cookies to find (PRI-89). Only frame, image and network sources
// widen. script-src stays nonce + 'strict-dynamic', which is what the PRI-87
// suite tests: vendor scripts still run only when a nonced script loads them.
// The LinkedIn, Meta, CleverTap, MoEngage and VWO hosts are listed ahead of
// their tags, which land once the test accounts exist.
const VENDOR_FRAMES = [
    'https://www.googletagmanager.com', 'https://*.doubleclick.net', 'https://*.googlesyndication.com',
    'https://www.google.com', 'https://maps.google.com', 'https://recaptcha.google.com',
    'https://www.youtube.com', 'https://www.youtube-nocookie.com', 'https://open.spotify.com',
    'https://player.vimeo.com', 'https://www.facebook.com', 'https://platform.twitter.com',
    'https://syndication.twitter.com', 'https://*.hsforms.net', 'https://*.hsforms.com',
    'https://*.hubspot.com', 'https://vars.hotjar.com', 'https://*.adtrafficquality.google'
].join(' ')

const VENDOR_IMAGES = [
    'https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com',
    'https://*.doubleclick.net', 'https://*.googlesyndication.com', 'https://*.adtrafficquality.google',
    'https://www.google.com', 'https://www.google.co.in', 'https://*.gstatic.com',
    'https://cdn.prod.website-files.com', 'https://*.hotjar.com', 'https://*.hubspot.com',
    'https://*.hsforms.com', 'https://*.hsforms.net', 'https://*.hs-analytics.net',
    'https://*.hsadspixel.net', 'https://*.hs-embed-reporting.com', 'https://*.clarity.ms', 'https://c.bing.com', 'https://*.twitter.com',
    'https://*.twimg.com', 'https://*.x.com', 'https://www.facebook.com', 'https://px.ads.linkedin.com',
    'https://*.clevertap-prod.com', 'https://*.moengage.com', 'https://*.visualwebsiteoptimizer.com'
].join(' ')

const VENDOR_CONNECT = [
    'https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com',
    'https://*.doubleclick.net', 'https://*.googlesyndication.com', 'https://*.adtrafficquality.google',
    'https://www.google.com', 'https://*.hotjar.com', 'https://*.hotjar.io', 'wss://*.hotjar.com',
    'https://*.hsforms.com', 'https://*.hsforms.net', 'https://hubspot-forms-static-embed.s3.amazonaws.com',
    'https://*.hubspot.com', 'https://*.hubapi.com', 'https://*.hs-banner.com',
    'https://*.hscollectedforms.net', 'https://*.hs-analytics.net', 'https://*.clarity.ms',
    'https://*.twitter.com', 'https://*.x.com', 'https://www.facebook.com', 'https://connect.facebook.net',
    'https://px.ads.linkedin.com', 'https://*.linkedin.com', 'https://*.clevertap-prod.com',
    'https://*.wzrkt.com', 'https://*.moengage.com', 'https://*.visualwebsiteoptimizer.com',
    'https://*.vwo.com'
].join(' ')

// The policy the BUILT page carries. GitHub Pages cannot send response headers,
// so the deployed demo declares its policy in a meta tag. Same shape as the dev
// header below, with the origins the deployed page actually reaches.
//
// The nonce is minted once per build, so every visitor to a given deploy sees
// the same value. Fine for a demo whose job is to prove the plumbing. NOT the
// pattern a real client should copy: a real host mints a fresh nonce per
// response, server side.
function deployedPolicy(nonce) {
    return [
        "default-src 'self'",
        `script-src 'nonce-${nonce}' 'strict-dynamic'`,
        `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
        'font-src https://fonts.gstatic.com data:',
        `connect-src 'self' ${STAGING} ${VENDOR_CONNECT}`,
        `img-src 'self' data: ${VENDOR_IMAGES}`,
        `frame-src 'self' ${STAGING} ${VENDOR_FRAMES}`,
        "object-src 'none'",
        "base-uri 'none'"
    ].join('; ')
}

function strictCsp() {
    let nonce = ''
    return {
        name: 'privy-strict-csp',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                // nonce = randomBytes(18).toString('base64')   // CSPRNG, never Math.random
                nonce = NONCE
                res.setHeader('Content-Security-Policy', [
                    "default-src 'self'",
                    // No unsafe-inline: a nonce in this directive makes the
                    // browser ignore it anyway. That is the whole point of FR-9.
                    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
                    // 'self' lets the site's own built stylesheet load. It
                    // does not allow inline styles.
                    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
                    'font-src https://fonts.gstatic.com data:',
                    `connect-src 'self' ws: ${BACKEND} ${VENDOR_CONNECT}`,
                    `img-src 'self' data: ${VENDOR_IMAGES}`,
                    `frame-src 'self' ${BACKEND} ${VENDOR_FRAMES}`,
                    "object-src 'none'",
                    "base-uri 'none'"
                ].join('; '))
                next()
            })
        },
        transformIndexHtml: {
            order: 'post',
            handler: (html, ctx) => {
                // A build has no request cycle, so configureServer never runs
                // and `nonce` is still ''. Mint one for the artifact, or every
                // tag ships with nonce="" and the page carries no policy at all.
                // const value = nonce || randomBytes(18).toString('base64')
                const value = NONCE

                // The banner tag is deliberately excluded from the blanket
                // rule below. Auto-nonceing it would make it impossible to
                // test the un-nonced case by removing the attribute: the
                // plugin would silently put it back and the banner would
                // always work. Only __PRIVY_NONCE__ opts that tag in.
                const out = html
                    .replace(/__PRIVY_NONCE__/g, value)
                    .replace(/<script(?![^>]*\bnonce=)(?![^>]*cookie-banner\/assets)/g, `<script nonce="${value}"`)
                    .replace(/<style(?![^>]*\bnonce=)/g, `<style nonce="${value}"`)

                // Dev already carries the policy in a real response header.
                if (ctx.server) {
                    return out
                }
                return out.replace(
                    /<head>/i,
                    `<head>\n    <meta http-equiv="Content-Security-Policy" content="${deployedPolicy(value)}">`
                )
            }
        }
    }
}

// ---------------------------------------------------------------------------
// CSP nonce toggle (PRI-87 / TRD-CKM-006)
//
// Only one of the two exports below may be active at a time.
// Change which one is commented out, then restart the dev server.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// ENABLE CSP NONCE - uncomment the line below to serve a strict
// Content-Security-Policy with a fresh nonce on every response, and to
// substitute that nonce into the __PRIVY_NONCE__ placeholder on the banner tag
// in index.html. This is what a real client running a nonce policy looks like.
// ---------------------------------------------------------------------------

// html.cspNonce makes Vite nonce the <style> tags it injects for imported CSS.
// Regional builds skip the strict CSP: the Cookie Lab embeds (Instagram, TikTok,
// Reddit, Stripe...) inject inline styles that a nonce-only policy blocks.
const csp = process.env.PRIVY_REGION ? [] : [strictCsp()]
export default defineConfig({ plugins: [react(), privyRegions(), ...csp], html: { cspNonce: NONCE }, base: '/' })

// DISABLE CSP - uncomment the block below to serve no policy header at all.
// The banner must still render and work exactly the same, which is the whole
// point of FR-6: with no nonce on the page every stamping step is a no-op.
// The __PRIVY_NONCE__ placeholder is left unsubstituted in this mode and is
// harmless, because a nonce attribute is only consulted when a policy names one.

// export default defineConfig({
//   plugins: [react()],
//   base: '/'
// })