import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ChevronDown, Lock, CheckCircle2, XCircle, Code2, BookOpen } from 'lucide-react'
import { cn } from '../lib/cn'
import { attackLessons } from '../data/attackLesson'

type DefenseEntry = {
  id: string
  attackKey: string
  attack: string
  category: string
  catColor: string
  emoji: string
  tagline: string
  vulnerability: string
  attackFlow: { emoji: string; label: string; bad: string }[]
  defenseFlow: { emoji: string; label: string; good: string }[]
  defenses: { title: string; description: string; icon: string }[]
}

const defenseData: DefenseEntry[] = [
  {
    id: 'dom-xss', attackKey: 'dom-xss',
    attack: 'DOM Cross-Site Scripting', category: 'Web', catColor: 'bg-blue-500/15 text-blue-300 ring-blue-500/25', emoji: '🌐',
    tagline: 'Malicious script injected via DOM sink executes in victim browser',
    vulnerability: 'User input written to innerHTML without sanitization becomes executable code in the browser.',
    attackFlow: [
      { emoji: '👤', label: 'Attacker crafts URL', bad: '?q=<script>evil()</script>' },
      { emoji: '🔗', label: 'Victim clicks link', bad: 'Opens malicious URL' },
      { emoji: '💀', label: 'Script runs', bad: 'Steals cookies, redirects, defaces' },
    ],
    defenseFlow: [
      { emoji: '🛡️', label: 'textContent used', good: 'Never innerHTML for user data' },
      { emoji: '📋', label: 'CSP header blocks', good: 'Inline scripts rejected by browser' },
      { emoji: '✅', label: 'Attack neutralized', good: 'Payload rendered as plain text' },
    ],
    defenses: [
      { icon: '📋', title: 'Content Security Policy (CSP)', description: 'Deploy a strict CSP header that whitelists approved script sources. Use nonces or hashes — injected attacker scripts are blocked by the browser even if they reach the DOM.' },
      { icon: '✏️', title: 'Use textContent, Not innerHTML', description: 'Never assign user-supplied data to innerHTML, outerHTML, or document.write. textContent renders everything as plain text — no HTML parsing, no script execution.' },
      { icon: '🔐', title: 'Trusted Types API', description: 'Enable the browser\'s Trusted Types API to enforce that only explicitly sanitized values reach dangerous DOM sinks. Platform-level defense that breaks DOM XSS at the root.' },
    ],
  },
  {
    id: 'csrf', attackKey: 'csrf',
    attack: 'Cross-Site Request Forgery', category: 'Web', catColor: 'bg-blue-500/15 text-blue-300 ring-blue-500/25', emoji: '🪤',
    tagline: 'Forged request from attacker site exploits victim\'s active session',
    vulnerability: 'Browsers automatically attach cookies to every request — the server can\'t distinguish forged requests from real ones.',
    attackFlow: [
      { emoji: '🏦', label: 'Victim logged into bank', bad: 'Session cookie active' },
      { emoji: '🌐', label: 'Victim visits evil.com', bad: 'Auto-submits hidden form to bank' },
      { emoji: '💸', label: 'Bank processes transfer', bad: 'Cookie attached = trusted' },
    ],
    defenseFlow: [
      { emoji: '🎟️', label: 'CSRF token required', good: 'Secret token in every form' },
      { emoji: '🍪', label: 'SameSite=Strict cookie', good: 'Browser withholds cross-site cookies' },
      { emoji: '✅', label: 'Forged request rejected', good: 'Missing token = 403 Forbidden' },
    ],
    defenses: [
      { icon: '🎟️', title: 'Anti-CSRF Synchronizer Token', description: 'Include a unique secret token in every form. Server validates it before processing — attackers from other origins cannot access or replicate this token, so forged requests are rejected.' },
      { icon: '🍪', title: 'SameSite Cookie Attribute', description: 'Set session cookies with SameSite=Strict or Lax. The browser withholds cookies on cross-site requests, neutralizing the attack mechanism before it reaches the server.' },
      { icon: '🔍', title: 'Origin / Referer Validation', description: 'Server inspects the Origin or Referer header on every state-changing request. Requests originating from unexpected domains are rejected immediately.' },
    ],
  },
  {
    id: 'tcp-syn', attackKey: 'tcp-syn-flood',
    attack: 'TCP SYN Flood', category: 'Network/Protocol', catColor: 'bg-rose-500/15 text-rose-300 ring-rose-500/25', emoji: '🌊',
    tagline: 'Spoofed SYN packets exhaust server connection queue — DoS',
    vulnerability: 'Server allocates RAM for every SYN before handshake completes. Flood with fake IPs fills the queue, dropping real users.',
    attackFlow: [
      { emoji: '💻', label: 'Attacker floods SYNs', bad: '50,000 packets/sec, fake IPs' },
      { emoji: '📦', label: 'Queue fills (512 slots)', bad: 'Server allocates TCB for each' },
      { emoji: '🚫', label: 'Real users blocked', bad: 'No space — connection refused' },
    ],
    defenseFlow: [
      { emoji: '🍪', label: 'SYN Cookie issued', good: 'No RAM until ACK received' },
      { emoji: '🔒', label: 'Rate limiter fires', good: 'Too many SYNs/IP = dropped' },
      { emoji: '✅', label: 'Real users connect', good: 'Queue never exhausted' },
    ],
    defenses: [
      { icon: '🍪', title: 'SYN Cookies', description: 'Instead of allocating state on SYN receipt, encode connection params into a cryptographic ISN. State is created only when a valid ACK arrives — queue exhaustion becomes impossible.' },
      { icon: '⚡', title: 'Rate Limiting & Throttling', description: 'Firewall rules drop packets from IPs exceeding SYN-per-second thresholds. Limits the damage radius of any single attacking source significantly.' },
      { icon: '🌐', title: 'Ingress Filtering (BCP 38)', description: 'ISPs validate source IPs at network edges, discarding packets with spoofed addresses. Removes the spoofing capability that makes SYN floods so effective.' },
    ],
  },
  {
    id: 'sniffing', attackKey: 'packet-sniffing',
    attack: 'Packet Sniffing', category: 'Network', catColor: 'bg-rose-500/15 text-rose-300 ring-rose-500/25', emoji: '👁️',
    tagline: 'NIC in promiscuous mode captures all plaintext traffic on segment',
    vulnerability: 'HTTP traffic travels as readable text. Any host on the same network can capture and read every byte.',
    attackFlow: [
      { emoji: '🌐', label: 'Victim sends HTTP POST', bad: 'username=admin&pass=secret' },
      { emoji: '📡', label: 'Frames broadcast on network', bad: 'Wi-Fi / hub shares to all' },
      { emoji: '👁️', label: 'Attacker reads credentials', bad: 'Plaintext captured instantly' },
    ],
    defenseFlow: [
      { emoji: '🔐', label: 'TLS 1.3 encrypts traffic', good: 'Captured packets = ciphertext' },
      { emoji: '📍', label: 'Cert pinning prevents MITM', good: 'Fake certs rejected' },
      { emoji: '✅', label: 'Sniffed data useless', good: 'Forward secrecy protects past sessions' },
    ],
    defenses: [
      { icon: '🔐', title: 'TLS 1.3 Everywhere', description: 'Encrypt all communications. Even if packets are captured, content is ciphertext. TLS 1.3 with ECDHE key exchange provides forward secrecy — past sessions can\'t be decrypted later.' },
      { icon: '🌐', title: 'VPN & Network Segmentation', description: 'Tunnel traffic through VPNs on untrusted networks. Segment internal networks with VLANs to limit broadcast domains and reduce the surface area for passive listeners.' },
      { icon: '📍', title: 'Certificate Pinning', description: 'Pin server certificates in client apps to prevent MITM attacks where an attacker presents a fraudulent cert to intercept TLS sessions.' },
    ],
  },
  {
    id: 'timing', attackKey: 'timing-side-channel',
    attack: 'Timing Side-Channel', category: 'Cryptography', catColor: 'bg-purple-500/15 text-purple-300 ring-purple-500/25', emoji: '⏱️',
    tagline: 'Response time variations reveal secret characters one at a time',
    vulnerability: 'Early-exit string comparison leaks how many characters matched via measurable response time differences.',
    attackFlow: [
      { emoji: '⏱️', label: '"aaaaa" → 0.1ms', bad: 'Wrong at position 0, exits fast' },
      { emoji: '⏱️', label: '"saaaa" → 0.2ms', bad: 'Matches pos 0 — slightly slower' },
      { emoji: '🔓', label: 'Secret recovered', bad: '26×N attempts reveals full secret' },
    ],
    defenseFlow: [
      { emoji: '⚖️', label: 'Constant-time compare', good: 'All inputs take equal time' },
      { emoji: '🎲', label: 'Random delay added', good: 'Masks timing signal' },
      { emoji: '✅', label: 'Timing attack defeated', good: 'No information in response time' },
    ],
    defenses: [
      { icon: '⚖️', title: 'Constant-Time Comparison', description: 'Use hmac.compare_digest (Python) or crypto.timingSafeEqual (Node.js). These compare ALL bytes regardless of where a mismatch occurs — execution time is always identical.' },
      { icon: '🌿', title: 'Avoid Branch-on-Secret', description: 'Refactor any conditional logic depending on secret values so all branches take the same time. Never use early-exit loops when comparing passwords, tokens, or keys.' },
      { icon: '🎲', title: 'Add Calibrated Noise', description: 'Introduce random delays into authentication responses to mask genuine timing variations — making statistical timing analysis infeasible over any practical measurement window.' },
    ],
  },
  {
    id: 'mitm-crypto', attackKey: 'meet-in-the-middle',
    attack: 'Meet-in-the-Middle Crypto', category: 'Cryptography', catColor: 'bg-purple-500/15 text-purple-300 ring-purple-500/25', emoji: '🔑',
    tagline: '2DES appears to give 2^112 security but actually only 2^57',
    vulnerability: 'Double encryption with two short keys can be cracked by precomputing from both ends and meeting in the middle.',
    attackFlow: [
      { emoji: '📊', label: 'Encrypt P with all K1', bad: 'Build 2^56 entry table' },
      { emoji: '📊', label: 'Decrypt C with all K2', bad: 'Build second 2^56 table' },
      { emoji: '🔓', label: 'Find collision', bad: 'Tables meet → K1 and K2 revealed' },
    ],
    defenseFlow: [
      { emoji: '🛡️', label: 'AES-256 used instead', good: '256-bit key, no MITM weakness' },
      { emoji: '🔏', label: 'AEAD mode (GCM)', good: 'Authenticity + confidentiality' },
      { emoji: '✅', label: 'Cryptographically secure', good: '2^256 brute force — infeasible' },
    ],
    defenses: [
      { icon: '🛡️', title: 'Use AES-256 or AES-128', description: 'AES-256 provides true 256-bit security. NIST recommends AES-128 minimum; AES-256 for long-term data protection. No meet-in-the-middle weakness.' },
      { icon: '🔑', title: 'Triple DES with 3 Keys (3TDEA)', description: 'If legacy systems require DES, use 3DES with K1 ≠ K2 ≠ K3. Raises effective cost to ~2^112, making precomputation attacks computationally infeasible.' },
      { icon: '🔏', title: 'Authenticated Encryption (AEAD)', description: 'Use AES-GCM or ChaCha20-Poly1305 for both confidentiality and authenticity. Prevents chosen-plaintext attacks that are a prerequisite for practical MITM crypto attacks.' },
    ],
  },
  {
    id: 'rop', attackKey: 'rop',
    attack: 'Return-Oriented Programming', category: 'Systems', catColor: 'bg-orange-500/15 text-orange-300 ring-orange-500/25', emoji: '⛓️',
    tagline: 'Reuses existing code gadgets to execute arbitrary logic without injecting shellcode',
    vulnerability: 'Buffer overflow overwrites the return address. DEP/NX blocks injected code — but ROP reuses existing executable code.',
    attackFlow: [
      { emoji: '💾', label: 'Buffer overflow triggered', bad: 'Return address overwritten' },
      { emoji: '🔍', label: 'Gadgets chained on stack', bad: 'pop rdi→/bin/sh→system()' },
      { emoji: '🐚', label: 'Shell spawned', bad: 'DEP/NX bypassed completely' },
    ],
    defenseFlow: [
      { emoji: '🎲', label: 'ASLR randomizes addresses', good: 'Gadget locations unpredictable' },
      { emoji: '🐦', label: 'Stack canary detects overflow', good: 'Crash before return executed' },
      { emoji: '✅', label: 'Chain broken', good: 'CFI enforces valid RET targets' },
    ],
    defenses: [
      { icon: '🎲', title: 'ASLR + PIE', description: 'Randomize base address of executable, stack, heap and libraries at each run. With PIE enabled, attackers cannot reliably predict gadget addresses without a separate information leak.' },
      { icon: '🐦', title: 'Stack Canaries', description: 'Place a random value before the return address on the stack. Runtime checks the canary before executing RET — corruption triggers crash before exploitation can occur.' },
      { icon: '🔒', title: 'Control-Flow Integrity (CFI)', description: 'Enforce at compile time that all indirect branches (CALL/RET) target only legitimately intended locations. Directly breaks ROP gadget chains by making arbitrary RET targets illegal.' },
    ],
  },
  {
    id: 'apt', attackKey: 'apt-config',
    attack: 'APT Configuration Exploitation', category: '5G Protocol', catColor: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25', emoji: '📡',
    tagline: 'Misconfigured AMF accepts crafted NAS messages without authentication',
    vulnerability: 'AMF with NULL integrity / no AUSF verification accepts any NAS registration — attacker enters 5G core network.',
    attackFlow: [
      { emoji: '🔍', label: 'AMF exposed on network', bad: 'No interface binding restriction' },
      { emoji: '📡', label: 'Fake NAS Registration sent', bad: 'No SUPI verification by AMF' },
      { emoji: '🌐', label: 'Core network access gained', bad: 'Pivots to SMF, UPF, NRF' },
    ],
    defenseFlow: [
      { emoji: '🔐', label: 'mTLS between all NFs', good: 'Mutual authentication required' },
      { emoji: '📋', label: 'NIA2/NEA2 enforced', good: 'NULL integrity/cipher disabled' },
      { emoji: '✅', label: 'Unauthorized NAS rejected', good: 'AUSF validation mandatory' },
    ],
    defenses: [
      { icon: '🔐', title: 'Harden NF Config (3GPP TS 33.501)', description: 'Follow 3GPP security hardening. Enforce mutual TLS between all Network Functions. Disable NIA0/NEA0 (NULL integrity/cipher). Apply least-privilege on SBI interfaces.' },
      { icon: '🏝️', title: 'Network Slice Isolation', description: 'Apply strict slice-level access controls so compromise of one slice cannot pivot to others. Isolate control-plane and user-plane traffic between slices with separate security domains.' },
      { icon: '📊', title: 'Continuous Config Auditing', description: 'Continuously scan NF configurations against approved security baselines. Integrate with SIEM to correlate anomalous NAS message patterns against configuration drift.' },
    ],
  },
]

// ── Attack vs Defense flow visualizer ────────────────────────────────────────
function FlowVisualizer({ entry, mode }: { entry: DefenseEntry; mode: 'attack' | 'defense' }) {
  const flow = mode === 'attack' ? entry.attackFlow : entry.defenseFlow
  return (
    <div className="flex flex-col gap-2">
      {flow.map((step, i) => (
        <motion.div
          key={`${mode}-${i}`}
          initial={{ opacity: 0, x: mode === 'attack' ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className={cn(
            'flex items-start gap-3 rounded-lg px-3 py-2.5 text-xs',
            mode === 'attack'
              ? 'border border-rose-500/20 bg-rose-500/5'
              : 'border border-emerald-500/20 bg-emerald-500/5',
          )}
        >
          <span className="text-base shrink-0">{step.emoji}</span>
          <div>
            <div className={cn('font-semibold', mode === 'attack' ? 'text-rose-300' : 'text-emerald-300')}>
              {step.label}
            </div>
            <div className={cn('mt-0.5', mode === 'attack' ? 'text-rose-400/70' : 'text-emerald-400/70')}>
              {mode === 'attack' ? step.bad : step.good}
            </div>
          </div>
          {mode === 'attack' && <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-500 ml-auto mt-0.5" />}
          {mode === 'defense' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500 ml-auto mt-0.5" />}
        </motion.div>
      ))}
    </div>
  )
}

// ── Defense card ──────────────────────────────────────────────────────────────
type CardTab = 'overview' | 'code'

function DefenseCard({ entry, index }: { entry: DefenseEntry; index: number }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'attack' | 'defense'>('attack')
  const [cardTab, setCardTab] = useState<CardTab>('overview')
  const lesson = attackLessons[entry.attackKey]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm"
    >
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-zinc-800/40 transition"
      >
        <div className="text-2xl shrink-0">{entry.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1', entry.catColor)}>
              {entry.category}
            </span>
            <span className="text-sm font-bold text-zinc-100">{entry.attack}</span>
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">{entry.tagline}</div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-zinc-600 shrink-0">
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </button>

      {/* Expanded body */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-800 px-5 pb-5 pt-4 space-y-4">
              {/* Vulnerability summary */}
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-xs text-yellow-200 leading-relaxed">
                <span className="font-semibold">⚠️ Root Cause: </span>{entry.vulnerability}
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-950 p-1">
                {(['overview', 'code'] as CardTab[]).map(t => (
                  <button key={t} onClick={() => setCardTab(t)}
                    className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                      cardTab === t ? 'bg-[#005A43] text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                    )}>
                    {t === 'overview' ? <><BookOpen className="h-3 w-3" /> Attack vs Defense</> : <><Code2 className="h-3 w-3" /> Code Fix</>}
                  </button>
                ))}
              </div>

              {cardTab === 'overview' && (
                <div>
                  {/* Toggle */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setMode('attack')}
                      className={cn('flex-1 rounded-xl py-2 text-xs font-bold transition',
                        mode === 'attack' ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                      )}
                    >
                      ⚔️ Without Defense
                    </button>
                    <button
                      onClick={() => setMode('defense')}
                      className={cn('flex-1 rounded-xl py-2 text-xs font-bold transition',
                        mode === 'defense' ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                      )}
                    >
                      🛡️ With Defense Applied
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <FlowVisualizer entry={entry} mode={mode} />
                    </motion.div>
                  </AnimatePresence>

                  {/* Defense strategies */}
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {entry.defenses.map((d, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-base">{d.icon}</span>
                          <span className="text-xs font-bold text-zinc-200">{d.title}</span>
                        </div>
                        <div className="text-xs text-zinc-500 leading-relaxed">{d.description}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {cardTab === 'code' && lesson && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-rose-500/20 bg-zinc-950 overflow-hidden">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-400 border-b border-zinc-800 bg-rose-500/5 flex items-center gap-1.5">
                      <XCircle className="h-3 w-3" /> Vulnerable Pattern
                    </div>
                    <pre className="p-3 text-[11px] text-zinc-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">{lesson.vulnerableCode}</pre>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-zinc-950 overflow-hidden">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 border-b border-zinc-800 bg-emerald-500/5 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3" /> Secure Fix
                    </div>
                    <pre className="p-3 text-[11px] text-zinc-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">{lesson.secureCode}</pre>
                  </div>
                </div>
              )}

              {cardTab === 'code' && !lesson && (
                <div className="text-zinc-500 text-sm text-center py-4">Code example not available.</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const CATS = ['All', 'Web', 'Network', 'Protocol', 'Cryptography', 'Systems', '5G Protocol']

export function DefensePage() {
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All'
    ? defenseData
    : defenseData.filter(e => e.category.includes(filter))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#005A43]/20 ring-1 ring-[#005A43]/30">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-zinc-100">Defense Strategies</div>
            <div className="text-xs text-zinc-500">
              For each attack: understand the root cause → see the attack vs defense flow → read the code fix
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: 'Attack Types', value: '8', color: 'text-rose-400' },
            { label: 'Defense Strategies', value: '24', color: 'text-emerald-400' },
            { label: 'Code Examples', value: '16', color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="rounded-lg bg-zinc-900 px-3 py-2 text-center">
              <div className={cn('text-xl font-bold', s.color)}>{s.value}</div>
              <div className="text-[10px] text-zinc-600 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATS.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={cn('rounded-full px-3 py-1 text-xs font-semibold transition',
              filter === cat ? 'bg-[#005A43] text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300'
            )}>
            {cat}
          </button>
        ))}
      </div>

      {/* Defense cards */}
      <div className="space-y-2">
        {filtered.map((entry, i) => (
          <DefenseCard key={entry.id} entry={entry} index={i} />
        ))}
      </div>
    </div>
  )
}
