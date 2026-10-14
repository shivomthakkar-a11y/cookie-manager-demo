import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import './styles/lab.css'

const POLL_MS = 500

// Cookies this site sets itself. Each is written only once its category is
// consented to, the way a well-behaved site gates its own cookies.
const FIRST_PARTY = [
  { name: 'lab_session', category: 'NECESSARY', value: () => Math.random().toString(36).slice(2, 10) },
  { name: 'lab_theme', category: 'FUNCTIONAL', value: () => 'dark' },
  { name: 'lab_ab_variant', category: 'ANALYTICS', value: () => (Math.random() < 0.5 ? 'A' : 'B') }
]

function readConsent() {
  const match = document.cookie.match(/(?:^|; )privyConsent=([^;]*)/)
  try {
    return JSON.parse(match ? match[1] : localStorage.getItem('privyConsent') || '{}')
  } catch {
    return {}
  }
}

function cookieNames() {
  return document.cookie ? document.cookie.split('; ').map((c) => c.split('=')[0]) : []
}

// A vendor counts as running once the browser has requested any of its hosts,
// unless one of its tags is still held. Static iframes start their request
// before the banner parks them, so a held tag outranks network evidence.
function requestedUrls() {
  return performance.getEntriesByType('resource').map((e) => e.name)
}

const HELD = '[privy-data-src], script[type="text/plain"], script[type="text/x-privy-demo-gated"]'

function isHeld(hosts) {
  return [...document.querySelectorAll(HELD)].some((el) => {
    const src = el.getAttribute('privy-data-src') || el.getAttribute('data-src') || el.textContent
    return hosts.some((h) => src.includes(h))
  })
}

function App() {
  const [stats, setStats] = useState({ total: 0, running: 0 })
  const [log, setLog] = useState([])
  const [firstParty, setFirstParty] = useState([])

  useEffect(() => {
    // Default buffer is 250 entries; ad and video embeds fill that quickly.
    performance.setResourceTimingBufferSize(2000)
    const start = performance.now()
    let seen = new Set()

    const tick = () => {
      const consent = readConsent()
      FIRST_PARTY.forEach((c) => {
        if (consent[c.category] === true && !cookieNames().includes(c.name)) {
          document.cookie = `${c.name}=${c.value()}; path=/; max-age=86400`
        }
      })

      const urls = requestedUrls()
      const cards = [...document.querySelectorAll('[data-lab-vendor]')]
      let running = 0
      cards.forEach((card) => {
        const hosts = card.dataset.labHosts.split(',')
        const isRunning = !isHeld(hosts) && urls.some((u) => hosts.some((h) => u.includes(h)))
        if (isRunning) running++
        const chip = card.querySelector('.lab-chip')
        chip.textContent = isRunning ? 'RUNNING' : 'BLOCKED'
        chip.className = `lab-chip ${isRunning ? 'ok' : 'blk'}`
      })
      setStats({ total: cards.length, running })

      const names = cookieNames()
      const now = new Set(names)
      const added = names.filter((n) => !seen.has(n))
      const removed = [...seen].filter((n) => !now.has(n))
      if (added.length || removed.length) {
        const t = ((performance.now() - start) / 1000).toFixed(1)
        setLog((prev) => [
          ...prev,
          ...added.map((n) => ({ t, name: n, event: 'set' })),
          ...removed.map((n) => ({ t, name: n, event: 'removed' }))
        ])
      }
      seen = now
      setFirstParty(FIRST_PARTY.map((c) => ({ ...c, set: now.has(c.name) })))
    }

    tick()
    const id = setInterval(tick, POLL_MS)
    return () => clearInterval(id)
  }, [])

  const firstPartyTarget = document.getElementById('lab-first-party')
  const logTarget = document.getElementById('lab-log')

  return (
    <>
      <div className="lab-stats">
        <div className="lab-stat"><b>{stats.total}</b><span>vendors embedded</span></div>
        <div className="lab-stat"><b className="blk">{stats.total - stats.running}</b><span>not contacted yet</span></div>
        <div className="lab-stat"><b className="ok">{stats.running}</b><span>running</span></div>
        <div className="lab-stat"><b>{firstParty.filter((c) => c.set).length}</b><span>first-party cookies set</span></div>
      </div>

      {firstPartyTarget && createPortal(
        <table className="lab-table">
          <thead><tr><th>Cookie</th><th>Category</th><th>Now</th></tr></thead>
          <tbody>
            {firstParty.map((c) => (
              <tr key={c.name}>
                <td><code>{c.name}</code></td>
                <td>{c.category.toLowerCase()}</td>
                <td><span className={`lab-chip ${c.set ? 'ok' : 'blk'}`}>{c.set ? 'SET' : 'NOT SET'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>,
        firstPartyTarget
      )}

      {logTarget && createPortal(
        <table className="lab-table">
          <thead><tr><th>Time (s)</th><th>Cookie</th><th>Event</th></tr></thead>
          <tbody>
            {log.map((row, i) => (
              <tr key={i}><td>{row.t}</td><td><code>{row.name}</code></td><td>{row.event}</td></tr>
            ))}
          </tbody>
        </table>,
        logTarget
      )}
    </>
  )
}

export default App
