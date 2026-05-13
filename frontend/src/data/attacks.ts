export type AttackChallenge = {
  key:
    | 'dom-xss'
    | 'tcp-syn-flood'
    | 'packet-sniffing'
    | 'csrf'
    | 'timing-side-channel'
    | 'meet-in-the-middle'
    | 'rop'
    | 'apt-config'
  title: string
  category: 'Web' | 'Protocol' | 'Network' | 'Cryptography' | 'Systems' | '5G Protocol'
  description: string
  targetLabel: 'Target URL' | 'Target IP' | 'Target System'
  targetValue: string
  flag: string
  points: number
}

export const attackChallenges: AttackChallenge[] = [
  {
    key: 'dom-xss',
    title: 'DOM Cross Site Scripting',
    category: 'Web',
    description:
      'Exploit a DOM-based XSS sink to execute attacker-controlled script in the victim browser context and exfiltrate session data.',
    targetLabel: 'Target URL',
    targetValue: 'http://localhost:5173/app/attacks?lab=dom-xss',
    flag: 'FLAG{DOM_XSS_SUCCESS}',
    points: 100,
  },
  {
    key: 'csrf',
    title: 'Cross-Site Request Forgery',
    category: 'Web',
    description:
      'Forge an authenticated request from a victim browser to a target server by exploiting implicit cookie trust — trigger an unauthorized funds transfer.',
    targetLabel: 'Target URL',
    targetValue: 'http://localhost:8000/transfer',
    flag: 'FLAG{CSRF_SUCCESS}',
    points: 100,
  },
  {
    key: 'tcp-syn-flood',
    title: 'TCP SYN Flood Attack',
    category: 'Protocol',
    description:
      'Simulate a SYN flood by generating burst traffic with spoofed source IPs and observe connection queue exhaustion under load.',
    targetLabel: 'Target IP',
    targetValue: '192.168.56.101',
    flag: 'FLAG{SYN_FLOOD_SUCCESS}',
    points: 100,
  },
  {
    key: 'packet-sniffing',
    title: 'Packet Sniffing',
    category: 'Network',
    description:
      'Place a network interface in promiscuous mode to capture and inspect plaintext traffic and recover secrets transmitted over an insecure channel.',
    targetLabel: 'Target IP',
    targetValue: '10.0.0.20',
    flag: 'FLAG{PACKET_SNIFF_SUCCESS}',
    points: 100,
  },
  {
    key: 'timing-side-channel',
    title: 'Timing Side Channel Attack',
    category: 'Cryptography',
    description:
      'Exploit response time variations in an early-exit string comparison to recover a secret token character by character through statistical timing analysis.',
    targetLabel: 'Target IP',
    targetValue: '10.0.0.55',
    flag: 'FLAG{TIMING_ATTACK_SUCCESS}',
    points: 100,
  },
  {
    key: 'meet-in-the-middle',
    title: 'Meet-in-the-Middle Crypto Attack',
    category: 'Cryptography',
    description:
      'Break 2DES double-encryption by precomputing a lookup table from known plaintext-ciphertext pairs, exploiting the reduced 2^57 effective keyspace.',
    targetLabel: 'Target System',
    targetValue: 'crypto-lab.ctf5g.local',
    flag: 'FLAG{MITM_CRYPTO_SUCCESS}',
    points: 100,
  },
  {
    key: 'rop',
    title: 'Return Oriented Programming',
    category: 'Systems',
    description:
      'Chain existing code gadgets ending in RET instructions to bypass DEP/NX protections after a stack buffer overflow — achieve arbitrary code execution without injecting shellcode.',
    targetLabel: 'Target System',
    targetValue: 'systems-lab.ctf5g.local',
    flag: 'FLAG{ROP_CHAIN_SUCCESS}',
    points: 100,
  },
  {
    key: 'apt-config',
    title: 'APT Configuration Exploitation',
    category: '5G Protocol',
    description:
      'Send crafted NAS registration messages to a misconfigured AMF to bypass authentication and gain unauthorized access to the 5G core network.',
    targetLabel: 'Target IP',
    targetValue: '172.16.0.10',
    flag: 'FLAG{APT_CONFIG_SUCCESS}',
    points: 100,
  },
]
