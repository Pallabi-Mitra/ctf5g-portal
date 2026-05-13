import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, CheckSquare, Square, Info } from 'lucide-react'
import { cn } from '../lib/cn'

export type SubAttack = {
  id: string
  name: string
  description: string
  technique?: string  // MITRE FiGHT technique ID e.g. FGT1234
}

// Sub-attacks per main attack key
export const SUB_ATTACKS: Record<string, SubAttack[]> = {
  'dom-xss': [
    { id:'dom-xss-1', name:'Cookie Theft via document.cookie', description:'Inject script that reads and exfiltrates session cookies to attacker-controlled server.', technique:'FGT1185' },
    { id:'dom-xss-2', name:'DOM Redirect to Phishing Page', description:'Overwrite window.location to silently redirect victim to a credential-harvesting clone.', technique:'FGT1189' },
    { id:'dom-xss-3', name:'Keylogger Injection', description:'Attach event listener to capture all keystrokes including passwords typed after page load.', technique:'FGT1056' },
    { id:'dom-xss-4', name:'BeEF Hook Injection', description:'Load Browser Exploitation Framework hook script to gain persistent browser control.', technique:'FGT1185.001' },
  ],
  'csrf': [
    { id:'csrf-1', name:'Funds Transfer Forgery', description:'Auto-submit hidden form that triggers unauthorized bank transfer from victim session.', technique:'FGT1111' },
    { id:'csrf-2', name:'Account Takeover via Email Change', description:'Force a POST request to change victim account email to attacker-controlled address.', technique:'FGT1098' },
    { id:'csrf-3', name:'Admin Privilege Escalation', description:'Forge admin-level action on behalf of a logged-in administrator.', technique:'FGT1078' },
  ],
  'tcp-syn-flood': [
    { id:'syn-1', name:'Spoofed Source IP Flood', description:'Send SYN packets with randomized spoofed source IPs to prevent backscatter tracing.', technique:'FGT1498.001' },
    { id:'syn-2', name:'Amplified SYN-ACK Reflection', description:'Use third-party reflectors to amplify SYN-ACK traffic toward the target.', technique:'FGT1498.002' },
    { id:'syn-3', name:'Targeted Port Exhaustion', description:'Flood a specific port (443/80) to take down only HTTPS/HTTP while leaving SSH alive.', technique:'FGT1499' },
    { id:'syn-4', name:'Connection Queue Exhaustion', description:'Fill the backlog queue (default 512 slots) to deny all new legitimate TCP connections.', technique:'FGT1499.001' },
  ],
  'packet-sniffing': [
    { id:'sniff-1', name:'HTTP Credential Capture', description:'Capture plaintext POST requests containing usernames and passwords.', technique:'FGT1040' },
    { id:'sniff-2', name:'DNS Query Harvesting', description:'Passively record all DNS queries to build a map of hosts and services on the network.', technique:'FGT1040.001' },
    { id:'sniff-3', name:'VoIP Call Interception', description:'Capture RTP streams and reconstruct audio from unencrypted VoIP calls.', technique:'FGT1040.002' },
    { id:'sniff-4', name:'NAS Message Capture (5G)', description:'Intercept unprotected NAS messages before security mode command to extract IMSI.', technique:'FGT5011' },
  ],
  'timing-side-channel': [
    { id:'timing-1', name:'Character-by-Character Token Recovery', description:'Probe each character position individually using statistical timing differences.', technique:'FGT1600' },
    { id:'timing-2', name:'Password Length Detection', description:'Determine password length by measuring comparison time for different length inputs.', technique:'FGT1600.001' },
    { id:'timing-3', name:'Crypto Key Leakage via Cache Timing', description:'Exploit CPU cache timing differences in AES table lookups to recover key bits.', technique:'FGT1600.002' },
  ],
  'meet-in-the-middle': [
    { id:'mitm-crypto-1', name:'2DES Known-Plaintext Attack', description:'Exploit 2^56 precomputed table to crack 2DES in 2^57 operations instead of 2^112.', technique:'FGT1600.003' },
    { id:'mitm-crypto-2', name:'Double Encryption Bypass', description:'Show that double-encrypting with the same cipher provides negligible security increase.', technique:'FGT1600.004' },
    { id:'mitm-crypto-3', name:'Birthday Attack on Hash Chains', description:'Find collisions in intermediate values using birthday paradox for efficient table lookup.', technique:'FGT1600.005' },
  ],
  'rop': [
    { id:'rop-1', name:'ret2libc (Return to libc)', description:'Chain return addresses to call system() from libc without injecting any shellcode.', technique:'FGT1574.004' },
    { id:'rop-2', name:'ASLR Bypass via Info Leak', description:'Use a format string or read-what-where gadget to leak a libc address, defeating ASLR.', technique:'FGT1574.005' },
    { id:'rop-3', name:'Stack Pivot', description:'Use xchg/pop gadgets to pivot the stack pointer to attacker-controlled memory.', technique:'FGT1574.006' },
    { id:'rop-4', name:'SROP (Sigreturn-Oriented Programming)', description:'Use sigreturn syscall to load attacker-controlled register state with minimal gadgets.', technique:'FGT1574.007' },
  ],
  'apt-config': [
    { id:'apt-1', name:'NAS Authentication Bypass (NULL Integrity)', description:'Send NAS Registration with NIA0/NEA0 NULL algorithms to skip integrity protection.', technique:'FGT5012' },
    { id:'apt-2', name:'SUPI/IMSI Extraction', description:'Exploit misconfigured AMF to retrieve permanent subscriber identity without auth.', technique:'FGT5013' },
    { id:'apt-3', name:'Fake gNB Registration', description:'Register a rogue base station with the core network by exploiting missing N2 authentication.', technique:'FGT5014' },
    { id:'apt-4', name:'UDM Subscriber Data Manipulation', description:'Access UDM API without proper scope validation to read or modify subscriber profiles.', technique:'FGT5015' },
    { id:'apt-5', name:'OAuth Token Exploitation', description:'Exploit misconfigured NRF OAuth2 scope to obtain tokens for unauthorized NF access.', technique:'FGT5016' },
  ],
}

interface SubAttackSelectorProps {
  attackKey: string
  selected: string[]
  onChange: (ids: string[]) => void
}

export function SubAttackSelector({ attackKey, selected, onChange }: SubAttackSelectorProps) {
  const [open, setOpen] = useState(false)
  const subs = SUB_ATTACKS[attackKey] ?? []

  if (subs.length === 0) return null

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])
  }
  const selectAll = () => onChange(subs.map(s => s.id))
  const clearAll = () => onChange([])

  const selectedNames = subs.filter(s => selected.includes(s.id)).map(s => s.name)

  return (
    <div className="mt-3">
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-all',
          open
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">
            Sub-Attack Techniques
          </div>
          <div className="text-xs text-zinc-300 truncate">
            {selected.length === 0
              ? 'Select specific techniques to attempt'
              : selected.length === subs.length
                ? 'All techniques selected'
                : selectedNames.slice(0, 2).join(', ') + (selected.length > 2 ? ` +${selected.length - 2} more` : '')}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selected.length > 0 && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] text-emerald-400 ring-1 ring-emerald-500/25">
              {selected.length}/{subs.length}
            </span>
          )}
          {open ? <ChevronUp className="h-3.5 w-3.5 text-zinc-500"/> : <ChevronDown className="h-3.5 w-3.5 text-zinc-500"/>}
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, height:0 }}
            animate={{ opacity:1, height:'auto' }}
            exit={{ opacity:0, height:0 }}
            transition={{ duration:0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden">
              {/* Select all / clear header */}
              <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                  {subs.length} techniques available
                </span>
                <div className="flex gap-3">
                  <button onClick={selectAll} className="font-mono text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors">
                    Select all
                  </button>
                  <button onClick={clearAll} className="font-mono text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors">
                    Clear
                  </button>
                </div>
              </div>

              {/* Sub-attack list */}
              <div className="max-h-56 overflow-y-auto divide-y divide-zinc-800/50">
                {subs.map(sub => {
                  const checked = selected.includes(sub.id)
                  return (
                    <motion.button
                      key={sub.id}
                      onClick={() => toggle(sub.id)}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                      className="w-full flex items-start gap-3 px-3 py-3 text-left transition-colors"
                    >
                      <div className={cn('mt-0.5 shrink-0 transition-colors', checked ? 'text-emerald-400' : 'text-zinc-600')}>
                        {checked ? <CheckSquare className="h-4 w-4"/> : <Square className="h-4 w-4"/>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn('text-xs font-semibold transition-colors', checked ? 'text-zinc-100' : 'text-zinc-400')}>
                            {sub.name}
                          </span>
                          {sub.technique && (
                            <span className="rounded px-1.5 py-0.5 font-mono text-[10px] bg-zinc-800 text-zinc-500 ring-1 ring-zinc-700">
                              {sub.technique}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-600">{sub.description}</p>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer with selection count */}
              {selected.length > 0 && (
                <div className="border-t border-zinc-800 px-3 py-2 flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-zinc-600 shrink-0"/>
                  <span className="font-mono text-[10px] text-zinc-600">
                    {selected.length} technique{selected.length>1?'s':''} selected — shown in attack walkthrough
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
