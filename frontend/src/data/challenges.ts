export type Challenge = {
  id: string
  title: string
  description: string
  category: '5G Protocol' | 'Web' | 'Network'
  flag: string
}

export const challenges: Challenge[] = [
  {
    id: 'ctf5g-1',
    title: 'CTF5G-1: NAS Message Parsing',
    description:
      'Inspect a simplified NAS registration flow and locate the parsing assumption that enables a validation bypass.',
    category: '5G Protocol',
    flag: 'CTF5G{nas_parsing_basics}',
  },
  {
    id: 'ctf5g-2',
    title: 'CTF5G-2: Web Token Leakage',
    description: 'Identify the token leak pattern and leverage it to access a protected endpoint.',
    category: 'Web',
    flag: 'CTF5G{never_log_tokens}',
  },
  {
    id: 'ctf5g-3',
    title: 'CTF5G-3: SYN Flood Mitigation',
    description: 'Trigger burst traffic against a simulated endpoint and observe throttling behavior.',
    category: 'Network',
    flag: 'CTF5G{rate_limits_help_not_fix}',
  },
]

