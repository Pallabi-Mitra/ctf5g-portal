import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import {
  Network, Shield, Radio, Globe, Server, Layers,
  ChevronRight, X, Wifi, Lock, Database, Activity,
  Cpu, ArrowRight, Settings, Zap
} from 'lucide-react'

// ── NF definitions ────────────────────────────────────────────────────────────
const NF_DATA: Record<string, any> = {
  NSSF: { label:'NSSF', full:'Network Slice Selection Function', glow:'#7c3aed', color:'text-violet-300', ring:'ring-violet-500/50', bg:'bg-violet-500/10', border:'border-violet-500/30', icon:'Layers', plane:'control', description:'Selects the appropriate network slice for each UE session based on NSSAI and operator policies.', responsibilities:['Network slice selection','Slice assistance info','Allowed NSSAI determination'], interfaces:['Nnssf (to AMF)','NRF discovery'] },
  SMSF: { label:'SMSF', full:'SMS Function', glow:'#db2777', color:'text-pink-300', ring:'ring-pink-500/50', bg:'bg-pink-500/10', border:'border-pink-500/30', icon:'Activity', plane:'control', description:'Handles SMS delivery over NAS, bridging legacy SMS infrastructure with the 5G core.', responsibilities:['SMS relay over NAS','SMS-SC interaction','UE reachability management'], interfaces:['Nsmsf (to AMF)','IP-SM-GW'] },
  UDM: { label:'UDM', full:'Unified Data Management', glow:'#0891b2', color:'text-cyan-300', ring:'ring-cyan-500/50', bg:'bg-cyan-500/10', border:'border-cyan-500/30', icon:'Database', plane:'control', description:'Stores subscriber data and manages authentication credentials. Computes AKA authentication vectors.', responsibilities:['Subscriber data management','Authentication vector generation','Service area restrictions'], interfaces:['Nudm (to AMF, SMF, AUSF)','UDR backend'] },
  PCF: { label:'PCF', full:'Policy Control Function', glow:'#ea580c', color:'text-orange-300', ring:'ring-orange-500/50', bg:'bg-orange-500/10', border:'border-orange-500/30', icon:'Lock', plane:'control', description:'Enforces policy rules for sessions, QoS, and charging. Provides policy decisions to AMF and SMF.', responsibilities:['AM policy control','SM policy control','QoS flow binding'], interfaces:['Npcf (to AMF, SMF)'] },
  CHF: { label:'CHF', full:'Charging Function', glow:'#ca8a04', color:'text-yellow-300', ring:'ring-yellow-500/50', bg:'bg-yellow-500/10', border:'border-yellow-500/30', icon:'Activity', plane:'control', description:'Handles online and offline charging. Tracks data consumption and generates CDRs.', responsibilities:['Online charging (OCS)','Offline charging','CDR generation'], interfaces:['Nchf (to SMF, PCF)'] },
  NRF: { label:'NRF', full:'Network Repository Function', glow:'#d97706', color:'text-amber-300', ring:'ring-amber-500/50', bg:'bg-amber-500/10', border:'border-amber-500/30', icon:'Database', plane:'control', description:'Service registry for all 5G NFs. NFs register and discover each other dynamically.', responsibilities:['NF registration & discovery','NF profile storage','OAuth2 token authorization'], interfaces:['Nnrf — used by all NFs'] },
  AUSF: { label:'AUSF', full:'Authentication Server Function', glow:'#059669', color:'text-emerald-300', ring:'ring-emerald-500/50', bg:'bg-emerald-500/10', border:'border-emerald-500/30', icon:'Shield', plane:'control', description:"Performs UE authentication using 5G-AKA or EAP-AKA' protocols. Works with UDM to derive session keys.", responsibilities:["5G-AKA authentication","EAP-AKA' authentication",'Key derivation (KAUSF)'], interfaces:['Nausf (to AMF)','Nudm (to UDM)'] },
  AMF: { label:'AMF', full:'Access & Mobility Management Function', glow:'#0284c7', color:'text-sky-300', ring:'ring-sky-500/50', bg:'bg-sky-500/10', border:'border-sky-500/30', icon:'Network', plane:'control', description:'Central control-plane NF. Handles UE registration, mobility, and NAS signaling.', responsibilities:['UE registration','Mobility management','NAS signaling termination','Slice selection'], interfaces:['N1 (to UE)','N2 (to gNB)','N8/N12/N15'] },
  SMF: { label:'SMF', full:'Session Management Function', glow:'#0d9488', color:'text-teal-300', ring:'ring-teal-500/50', bg:'bg-teal-500/10', border:'border-teal-500/30', icon:'Server', plane:'control', description:'Manages PDU session lifecycle. Controls the UPF for traffic handling.', responsibilities:['PDU session management','UPF control','IP address allocation','QoS enforcement'], interfaces:['N4 (to UPF)','N7 (to PCF)','N11 (to AMF)'] },
  UPF: { label:'UPF', full:'User Plane Function', glow:'#16a34a', color:'text-green-300', ring:'ring-green-500/50', bg:'bg-green-500/10', border:'border-green-500/30', icon:'Globe', plane:'user', description:'Data plane anchor. All user traffic flows through UPF. Connects RAN to the internet.', responsibilities:['Packet routing & forwarding','Traffic inspection','QoS enforcement'], interfaces:['N3 (to gNB)','N6 (to DN)','N4 (to SMF)'] },
  gNB: { label:'gNB', full:'5G Base Station (gNodeB)', glow:'#ca8a04', color:'text-yellow-300', ring:'ring-yellow-500/50', bg:'bg-yellow-500/10', border:'border-yellow-500/30', icon:'Radio', plane:'radio', description:'5G radio access node. Provides air interface to UEs and connects to the 5G core.', responsibilities:['Radio resource management','NAS relay to AMF','Beam management'], interfaces:['N2 (to AMF)','N3 (to UPF)','Xn (to other gNBs)'] },
  UE: { label:'UE', full:'User Equipment', glow:'#e11d48', color:'text-rose-300', ring:'ring-rose-500/50', bg:'bg-rose-500/10', border:'border-rose-500/30', icon:'Wifi', plane:'radio', description:'Your phone or any 5G device. Communicates with gNB over the 5G air interface.', responsibilities:['NAS signaling','5G-AKA authentication','PDU session requests'], interfaces:['Uu (air interface to gNB)'] },
  DN: { label:'DN', full:'Data Network (Internet)', glow:'#4f46e5', color:'text-indigo-300', ring:'ring-indigo-500/50', bg:'bg-indigo-500/10', border:'border-indigo-500/30', icon:'Globe', plane:'user', description:'External data network — internet, IMS, or private enterprise network.', responsibilities:['External connectivity','Application servers','IMS / VoNR'], interfaces:['N6 (from UPF)'] },
  OSS: { label:'OSS', full:'Operations Support System', glow:'#71717a', color:'text-zinc-300', ring:'ring-zinc-500/50', bg:'bg-zinc-500/10', border:'border-zinc-500/30', icon:'Settings', plane:'ops', description:'Manages network operations, fault management, configuration, and performance monitoring.', responsibilities:['Network management','Fault & performance monitoring','Configuration management'], interfaces:['O1 (to NFs)','O2 (to cloud infra)'] },
  BSS: { label:'BSS', full:'Business Support System', glow:'#b45309', color:'text-amber-200', ring:'ring-amber-400/50', bg:'bg-amber-400/10', border:'border-amber-400/30', icon:'Settings', plane:'ops', description:'Handles customer-facing operations: billing, subscriptions, order management.', responsibilities:['Customer management','Billing & revenue','Order management'], interfaces:['Itf-N (to OSS)','Nchf (to CHF)'] },
}

const ICONS: Record<string, React.ReactNode> = {
  Layers: <Layers className="h-4 w-4"/>, Activity: <Activity className="h-4 w-4"/>,
  Database: <Database className="h-4 w-4"/>, Lock: <Lock className="h-4 w-4"/>,
  Shield: <Shield className="h-4 w-4"/>, Network: <Network className="h-4 w-4"/>,
  Server: <Server className="h-4 w-4"/>, Globe: <Globe className="h-4 w-4"/>,
  Radio: <Radio className="h-4 w-4"/>, Wifi: <Wifi className="h-4 w-4"/>,
  Settings: <Settings className="h-4 w-4"/>,
}

const FLOW_STEPS = [
  { from:'UE', to:'gNB', label:'Registration Request (NAS)', color:'#f43f5e', desc:'The UE sends a Registration Request over the 5G air interface (Uu) to the gNB, encrypted using SUCI to conceal the permanent identity.' },
  { from:'gNB', to:'AMF', label:'N2 — Initial UE Message', color:'#0ea5e9', desc:'The gNB forwards the NAS message to the selected AMF via N2 (NGAP protocol). The AMF becomes the mobility anchor for this UE.' },
  { from:'AMF', to:'AUSF', label:'Authentication Request', color:'#10b981', desc:"AMF initiates authentication by sending an Nausf_UEAuthentication request to AUSF, which selects 5G-AKA or EAP-AKA'." },
  { from:'AUSF', to:'UDM', label:'Get Auth Vectors', color:'#06b6d4', desc:'AUSF calls UDM to retrieve authentication vectors. UDM computes the expected response and derives KAUSF.' },
  { from:'AMF', to:'SMF', label:'PDU Session Create', color:'#14b8a6', desc:'Once authenticated, the UE requests a PDU Session. AMF selects SMF and sends Nsmf_PDUSession_CreateSMContext.' },
  { from:'SMF', to:'UPF', label:'N4 Session Establish', color:'#22c55e', desc:'SMF establishes a session with UPF via N4 using PFCP, programming packet detection and forwarding rules.' },
  { from:'UPF', to:'DN', label:'N6 — Data Flow', color:'#818cf8', desc:'UPF is now the user-plane anchor. Traffic: UE → gNB (N3) → UPF (N6) → Internet. Full 5G connectivity achieved.' },
]

// ── Animated pulse dot ────────────────────────────────────────────────────────
function PulseDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
    </span>
  )
}

// ── Glowing NF node ────────────────────────────────────────────────────────────
function NFNode({ id, onClick, active, delay = 0 }: { id: string; onClick: ()=>void; active: boolean; delay?: number }) {
  const nf = NF_DATA[id]
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.1, y: -3 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center cursor-pointer w-full transition-all duration-200 group"
      style={{
        background: active
          ? `linear-gradient(135deg, ${nf.glow}22, ${nf.glow}11)`
          : 'rgba(24,24,27,0.8)',
        borderColor: active ? nf.glow + '80' : 'rgba(63,63,70,0.6)',
        boxShadow: active
          ? `0 0 20px ${nf.glow}40, 0 0 40px ${nf.glow}20, inset 0 1px 0 ${nf.glow}30`
          : 'none',
      }}
    >
      {/* Hover glow overlay */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(circle at center, ${nf.glow}20, transparent 70%)` }} />

      {/* Active ring pulse */}
      {active && (
        <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{ boxShadow: [`0 0 0 0 ${nf.glow}60`, `0 0 0 6px ${nf.glow}00`] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      <div className={`transition-colors ${active ? nf.color : 'text-zinc-500 group-hover:' + nf.color.replace('text-', 'text-')}`}
        style={{ filter: active ? `drop-shadow(0 0 4px ${nf.glow})` : 'none' }}>
        {ICONS[nf.icon]}
      </div>
      <span className={`text-[11px] font-bold tracking-wide transition-colors ${active ? nf.color : 'text-zinc-400 group-hover:text-zinc-200'}`}>
        {nf.label}
      </span>
      {active && <PulseDot color={nf.glow} />}
    </motion.button>
  )
}

// ── Animated data packet travelling along a wire ───────────────────────────────
function DataPacket({ color, delay }: { color: string; delay: number }) {
  return (
    <motion.div
      className="absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full pointer-events-none"
      style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
      initial={{ left: '0%', opacity: 0 }}
      animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.8, delay, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
    />
  )
}

// ── Connector wire with flowing packets ────────────────────────────────────────
function Wire({ label, color = '#10b981', vertical = false, packets = true }: { label?: string; color?: string; vertical?: boolean; packets?: boolean }) {
  return (
    <div className={`relative flex ${vertical ? 'flex-col items-center' : 'items-center'}`}>
      {vertical ? (
        <div className="relative w-px" style={{ height: 28, background: `linear-gradient(to bottom, ${color}40, ${color}60)` }}>
          {packets && <motion.div
            className="absolute left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full pointer-events-none"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
            initial={{ top: '0%', opacity: 0 }}
            animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
          />}
        </div>
      ) : (
        <div className="relative h-px flex-1" style={{ background: `linear-gradient(to right, ${color}20, ${color}60, ${color}20)` }}>
          {packets && <DataPacket color={color} delay={0} />}
          {packets && <DataPacket color={color} delay={1.5} />}
        </div>
      )}
      {label && (
        <span className="absolute text-[9px] font-mono text-zinc-600 whitespace-nowrap"
          style={{ top: vertical ? '50%' : '100%', left: vertical ? '110%' : '50%', transform: vertical ? 'translateY(-50%)' : 'translateX(-50%)', marginTop: vertical ? 0 : 2 }}>
          {label}
        </span>
      )}
    </div>
  )
}

// ── SBI Bus ─────────────────────────────────────────────────────────────────
function SBIBus() {
  return (
    <div className="relative flex items-center gap-2 py-1">
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #10b98140, #10b981, #10b98140, transparent)', boxShadow: '0 0 8px #10b98130' }} />
      <motion.div
        className="relative shrink-0 rounded-full border px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-widest"
        style={{ borderColor: '#10b98150', background: 'linear-gradient(135deg, #10b98115, #05966910)', color: '#6ee7b7', boxShadow: '0 0 20px #10b98120' }}
        animate={{ boxShadow: ['0 0 12px #10b98120', '0 0 24px #10b98140', '0 0 12px #10b98120'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        SBI — Service Based Interface
      </motion.div>
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #10b98140, #10b981, #10b98140, transparent)', boxShadow: '0 0 8px #10b98130' }} />
      {/* travelling packets on bus */}
      <DataPacket color="#10b981" delay={0} />
      <DataPacket color="#10b981" delay={2} />
    </div>
  )
}

// ── Detail panel ─────────────────────────────────────────────────────────────
function DetailPanel({ id, onClose }: { id: string; onClose: ()=>void }) {
  const nf = NF_DATA[id]
  const planeBadgeStyle: Record<string,string> = {
    control: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    user: 'border-green-500/30 bg-green-500/10 text-green-300',
    radio: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
    ops: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
  }
  return (
    <motion.div key={id}
      initial={{ opacity:0, x:24, scale:0.97 }}
      animate={{ opacity:1, x:0, scale:1 }}
      exit={{ opacity:0, x:24, scale:0.97 }}
      transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
      className="flex flex-col gap-4 rounded-2xl border p-5 backdrop-blur-sm"
      style={{
        borderColor: nf.glow + '40',
        background: `linear-gradient(135deg, ${nf.glow}10, rgba(9,9,11,0.95))`,
        boxShadow: `0 0 40px ${nf.glow}20, inset 0 1px 0 ${nf.glow}20`,
      }}
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl" style={{ background: `linear-gradient(to right, transparent, ${nf.glow}, transparent)` }} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.div
            className="rounded-xl p-2.5 ring-1"
            style={{ background: nf.glow + '20', borderColor: nf.glow + '50', boxShadow: `0 0 16px ${nf.glow}30` }}
            animate={{ boxShadow: [`0 0 12px ${nf.glow}30`, `0 0 24px ${nf.glow}50`, `0 0 12px ${nf.glow}30`] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span style={{ color: nf.glow, filter: `drop-shadow(0 0 4px ${nf.glow})` }}>{ICONS[nf.icon]}</span>
          </motion.div>
          <div>
            <div className="text-lg font-bold" style={{ color: nf.glow, textShadow: `0 0 20px ${nf.glow}80` }}>{nf.label}</div>
            <div className="text-xs text-zinc-500">{nf.full}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${planeBadgeStyle[nf.plane]}`}>
            {nf.plane}
          </span>
          <button onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:text-zinc-200 transition-colors hover:bg-white/5">
            <X className="h-4 w-4"/>
          </button>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-zinc-400">{nf.description}</p>

      <div>
        <div className="mb-2.5 flex items-center gap-2">
          <div className="h-px flex-1" style={{ background: nf.glow + '30' }} />
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: nf.glow + 'aa' }}>Responsibilities</span>
          <div className="h-px flex-1" style={{ background: nf.glow + '30' }} />
        </div>
        <ul className="flex flex-col gap-2">
          {nf.responsibilities.map((r: string, i: number) => (
            <motion.li key={i}
              initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
              transition={{ delay: 0.1 + i*0.06 }}
              className="flex items-start gap-2 text-sm text-zinc-300">
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: nf.glow }}/>
              {r}
            </motion.li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mb-2.5 flex items-center gap-2">
          <div className="h-px flex-1" style={{ background: nf.glow + '30' }} />
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: nf.glow + 'aa' }}>Interfaces</span>
          <div className="h-px flex-1" style={{ background: nf.glow + '30' }} />
        </div>
        <div className="flex flex-wrap gap-2">
          {nf.interfaces.map((iface: string, i: number) => (
            <motion.span key={i}
              initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
              transition={{ delay: 0.2 + i*0.05, type:'spring', stiffness:300 }}
              className="rounded-lg border px-2.5 py-1 text-[11px] font-mono font-medium"
              style={{ borderColor: nf.glow + '40', background: nf.glow + '15', color: nf.glow }}>
              {iface}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function Core5GOverviewPage() {
  const [selected, setSelected] = useState<string|null>(null)
  const [flowStep, setFlowStep] = useState<number|null>(null)
  const [showFlow, setShowFlow] = useState(false)
  const [hoveredNode, setHoveredNode] = useState<string|null>(null)
  const toggle = (id: string) => setSelected(prev => prev===id ? null : id)

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)', filter: 'blur(40px)' }} />
      </div>

      {/* Header */}
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="text-emerald-400" style={{ filter: 'drop-shadow(0 0 8px #10b981)' }}>
              <Cpu className="h-5 w-5"/>
            </motion.div>
            <div className="text-xl font-bold tracking-tight text-zinc-100" style={{ textShadow: '0 0 30px #10b98140' }}>
              Core 5G Network
            </div>
            <motion.span
              className="rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-300"
              style={{ borderColor: '#10b98140', background: '#10b98110', boxShadow: '0 0 12px #10b98120' }}
              animate={{ boxShadow: ['0 0 8px #10b98120', '0 0 20px #10b98140', '0 0 8px #10b98120'] }}
              transition={{ duration: 2, repeat: Infinity }}>
              5G SA
            </motion.span>
          </div>
          <div className="mt-1 text-sm text-zinc-500 ml-8">
            Interactive architecture — click any node to explore
          </div>
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
          <PulseDot color="#10b981" />
          <span className="font-mono text-xs text-emerald-400">Network Online</span>
        </div>
      </div>

      {/* Plane legend */}
      <div className="flex flex-wrap gap-2">
        {[
          { label:'Control Plane', color:'#0ea5e9' },
          { label:'User Plane', color:'#22c55e' },
          { label:'Radio Access', color:'#eab308' },
          { label:'Operations', color:'#71717a' },
        ].map(p => (
          <div key={p.label} className="flex items-center gap-1.5 rounded-full border px-3 py-1"
            style={{ borderColor: p.color + '30', background: p.color + '10' }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs font-medium" style={{ color: p.color }}>{p.label}</span>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* ── Architecture diagram ── */}
        <div className="lg:col-span-2 relative rounded-2xl border border-zinc-800/80 p-5 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(9,9,11,0.95), rgba(15,15,18,0.98))', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>

          {/* Grid texture */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* ROW 1 — top NFs + OSS/BSS */}
          <div className="mb-2">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-px flex-1 bg-zinc-800" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Network Services Layer</span>
              <span className="h-px flex-1 bg-zinc-800" />
            </div>
            <div className="flex gap-2 items-start">
              <div className="flex flex-1 gap-2">
                {['NSSF','SMSF','UDM','PCF','CHF'].map((id, i) => (
                  <div key={id} className="flex-1 min-w-0">
                    <NFNode id={id} onClick={() => toggle(id)} active={selected===id} delay={i*0.06}/>
                  </div>
                ))}
              </div>
              {/* OSS/BSS sidebar */}
              <div className="flex flex-col gap-2 shrink-0 w-14">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] font-mono text-zinc-700">↔</span>
                </div>
                <NFNode id="OSS" onClick={() => toggle('OSS')} active={selected==='OSS'} delay={0.3}/>
                <NFNode id="BSS" onClick={() => toggle('BSS')} active={selected==='BSS'} delay={0.35}/>
              </div>
            </div>
          </div>

          {/* Vertical wires from top row to SBI */}
          <div className="flex gap-2 pr-16 mb-1">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="flex-1 flex justify-center">
                <Wire vertical color="#10b98150" packets={false}/>
              </div>
            ))}
          </div>

          {/* SBI Bus */}
          <SBIBus />

          {/* Vertical wires from SBI to core NFs */}
          <div className="flex gap-2 mb-1">
            {[0,1,2,3].map(i => (
              <div key={i} className="flex-1 flex justify-center">
                <Wire vertical color="#10b98160" packets={i===2||i===3}/>
              </div>
            ))}
          </div>

          {/* ROW 2 — NRF AUSF AMF SMF */}
          <div className="mb-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-px flex-1 bg-zinc-800" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Core Control Plane</span>
              <span className="h-px flex-1 bg-zinc-800" />
            </div>
            <div className="flex gap-2">
              {['NRF','AUSF','AMF','SMF'].map((id, i) => (
                <div key={id} className="flex-1 min-w-0">
                  <NFNode id={id} onClick={() => toggle(id)} active={selected===id} delay={0.2+i*0.06}/>
                </div>
              ))}
            </div>
          </div>

          {/* N2/N4 wires down */}
          <div className="flex gap-2 mb-2">
            <div className="flex-1"/>
            <div className="flex-1"/>
            {/* N2 from AMF */}
            <div className="flex-1 flex flex-col items-center gap-0">
              <Wire vertical color="#0ea5e9" label="N2"/>
              <span className="text-[9px] text-zinc-600 font-mono mt-0.5">N2</span>
            </div>
            {/* N4 from SMF */}
            <div className="flex-1 flex flex-col items-center gap-0">
              <Wire vertical color="#14b8a6" label="N4"/>
              <span className="text-[9px] text-zinc-600 font-mono mt-0.5">N4</span>
            </div>
          </div>

          {/* ROW 3 — Radio + User Plane */}
          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-zinc-800" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Radio Access & User Plane</span>
            <span className="h-px flex-1 bg-zinc-800" />
          </div>

          <div className="mt-2 grid grid-cols-9 gap-1 items-center">
            {/* UE + gNB */}
            <div className="col-span-2 flex flex-col gap-2">
              <NFNode id="UE" onClick={() => toggle('UE')} active={selected==='UE'} delay={0.4}/>
              <NFNode id="gNB" onClick={() => toggle('gNB')} active={selected==='gNB'} delay={0.45}/>
            </div>

            {/* Air interface wire */}
            <div className="col-span-2 flex flex-col items-center justify-center gap-1 pt-2">
              <div className="relative w-full h-px" style={{ background: 'linear-gradient(to right, #eab30860, #eab308, #eab30860)', boxShadow: '0 0 6px #eab30840' }}>
                <DataPacket color="#eab308" delay={0}/>
                <DataPacket color="#eab308" delay={2}/>
              </div>
              <span className="text-[9px] font-mono text-yellow-600 mt-1">Uu / N3</span>
            </div>

            {/* Spacer */}
            <div className="col-span-1"/>

            {/* UPF + DN */}
            <div className="col-span-4 flex gap-2">
              <div className="flex-1">
                <NFNode id="UPF" onClick={() => toggle('UPF')} active={selected==='UPF'} delay={0.5}/>
              </div>
              {/* N6 wire between UPF and DN */}
              <div className="flex items-center">
                <div className="relative w-8 h-px" style={{ background: 'linear-gradient(to right, #4f46e560, #4f46e5)', boxShadow: '0 0 6px #4f46e530' }}>
                  <DataPacket color="#818cf8" delay={0.5}/>
                </div>
              </div>
              <div className="flex-1">
                <NFNode id="DN" onClick={() => toggle('DN')} active={selected==='DN'} delay={0.55}/>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-zinc-700 font-mono">
            ◈ click any node for full details
          </p>
        </div>

        {/* ── Detail panel ── */}
        <div className="lg:col-span-1 relative">
          <AnimatePresence mode="wait">
            {selected ? (
              <DetailPanel key={selected} id={selected} onClose={() => setSelected(null)}/>
            ) : (
              <motion.div key="placeholder" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="flex h-full min-h-72 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-8 text-center">
                <motion.div
                  animate={{ rotate: [0,10,-10,0], scale: [1,1.05,1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                  <Network className="h-10 w-10 text-zinc-700"/>
                </motion.div>
                <div className="text-sm font-semibold text-zinc-500">Select a network function</div>
                <div className="text-xs text-zinc-700 leading-relaxed">Click any glowing node to see its full role, responsibilities, and interfaces in the 5G architecture.</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Registration flow ── */}
      <div className="relative rounded-2xl border border-zinc-800/80 p-5 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(9,9,11,0.95), rgba(14,14,18,0.98))' }}>

        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 opacity-10"
          style={{ background: 'radial-gradient(ellipse, #0ea5e9, transparent)', filter: 'blur(20px)' }} />

        <div className="relative mb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-sky-400" style={{ filter: 'drop-shadow(0 0 4px #0ea5e9)' }}/>
              <span className="text-sm font-bold text-zinc-100">5G Registration Flow</span>
            </div>
            <div className="mt-0.5 text-xs text-zinc-600 ml-6">Step through how a UE connects to the 5G core</div>
          </div>
          <motion.button
            onClick={() => { setShowFlow(true); setFlowStep(0) }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-300 transition-all"
            style={{ boxShadow: '0 0 16px #0ea5e920' }}
            animate={{ boxShadow: ['0 0 10px #0ea5e910', '0 0 20px #0ea5e930', '0 0 10px #0ea5e910'] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <Activity className="h-3.5 w-3.5"/> Start Flow
          </motion.button>
        </div>

        {showFlow && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {FLOW_STEPS.map((step, i) => (
                <motion.button key={i}
                  initial={{ opacity:0, y:8 }}
                  animate={{ opacity: flowStep!==null&&i<=flowStep?1:0.3, y:0 }}
                  transition={{ delay: i*0.08 }}
                  onClick={() => setFlowStep(i)}
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all cursor-pointer"
                  style={{
                    borderColor: flowStep===i ? step.color+'60' : 'rgba(63,63,70,0.5)',
                    background: flowStep===i ? step.color+'15' : 'rgba(24,24,27,0.6)',
                    boxShadow: flowStep===i ? `0 0 16px ${step.color}30` : 'none',
                  }}>
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: step.color, boxShadow: flowStep===i ? `0 0 6px ${step.color}` : 'none' }}/>
                  <span className="font-mono font-bold" style={{ color: flowStep===i ? step.color : '#a1a1aa' }}>{step.from}</span>
                  <ArrowRight className="h-3 w-3 text-zinc-600"/>
                  <span className="font-mono font-bold" style={{ color: flowStep===i ? step.color : '#a1a1aa' }}>{step.to}</span>
                  <span className="hidden sm:inline text-zinc-600 text-[10px]">— {step.label}</span>
                </motion.button>
              ))}
            </div>

            {flowStep !== null && (
              <motion.div key={flowStep}
                initial={{ opacity:0, y:8, scale:0.98 }}
                animate={{ opacity:1, y:0, scale:1 }}
                transition={{ duration:0.25 }}
                className="relative rounded-xl border p-4 overflow-hidden"
                style={{
                  borderColor: FLOW_STEPS[flowStep].color + '40',
                  background: `linear-gradient(135deg, ${FLOW_STEPS[flowStep].color}10, rgba(9,9,11,0.9))`,
                  boxShadow: `0 0 24px ${FLOW_STEPS[flowStep].color}15`,
                }}>
                <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${FLOW_STEPS[flowStep].color}, transparent)` }}/>
                <div className="flex items-center gap-3 mb-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: FLOW_STEPS[flowStep].color, boxShadow: `0 0 8px ${FLOW_STEPS[flowStep].color}` }}/>
                  <span className="text-sm font-bold" style={{ color: FLOW_STEPS[flowStep].color }}>
                    Step {flowStep+1}: {FLOW_STEPS[flowStep].label}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{FLOW_STEPS[flowStep].desc}</p>
                <div className="mt-3 flex justify-between items-center">
                  <button onClick={() => setFlowStep(f => Math.max(0,(f??0)-1))} disabled={flowStep===0}
                    className="text-xs text-zinc-600 hover:text-zinc-300 disabled:opacity-20 transition-colors">← Previous</button>
                  <div className="flex gap-1.5">
                    {FLOW_STEPS.map((_,i) => (
                      <div key={i} className="h-1.5 rounded-full transition-all"
                        style={{ width: i===flowStep?16:6, backgroundColor: i===flowStep ? FLOW_STEPS[flowStep].color : '#3f3f46' }}/>
                    ))}
                  </div>
                  <button
                    onClick={() => { if(flowStep<FLOW_STEPS.length-1) setFlowStep(f=>(f??0)+1); else { setShowFlow(false); setFlowStep(null) } }}
                    className="text-xs font-bold transition-colors"
                    style={{ color: FLOW_STEPS[flowStep].color }}>
                    {flowStep<FLOW_STEPS.length-1 ? 'Next →' : 'Done ✓'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* ── Interface reference table ── */}
      <div className="rounded-2xl border border-zinc-800/80 p-5"
        style={{ background: 'linear-gradient(135deg, rgba(9,9,11,0.95), rgba(12,12,15,0.98))' }}>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800"/>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Key Interfaces</span>
          <div className="h-px flex-1 bg-zinc-800"/>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Interface','Between','Protocol','Purpose'].map(h => (
                  <th key={h} className="pb-2.5 pr-4 text-left font-bold uppercase tracking-wider text-zinc-600 text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {[
                ['Uu','UE ↔ gNB','NR (5G Radio)','Air interface','#eab308'],
                ['N1','UE ↔ AMF','NAS (over N2)','UE registration signaling','#f43f5e'],
                ['N2','gNB ↔ AMF','NGAP','Control plane — UE context','#0ea5e9'],
                ['N3','gNB ↔ UPF','GTP-U','User plane data tunneling','#eab308'],
                ['N4','SMF ↔ UPF','PFCP','Session management & rules','#14b8a6'],
                ['N6','UPF ↔ DN','IP','External data network','#818cf8'],
                ['N11','AMF ↔ SMF','HTTP/2 (SBI)','PDU session coordination','#0ea5e9'],
                ['O1','OSS ↔ NFs','NETCONF','Network management','#71717a'],
              ].map(([iface,between,proto,purpose,color]) => (
                <motion.tr key={iface}
                  whileHover={{ backgroundColor: color + '08' }}
                  className="transition-colors cursor-default">
                  <td className="py-2.5 pr-4">
                    <span className="font-mono font-bold text-[11px] rounded px-1.5 py-0.5"
                      style={{ color: color as string, background: (color as string)+'15', border: `1px solid ${color}30` }}>
                      {iface}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-zinc-300">{between}</td>
                  <td className="py-2.5 pr-4 text-violet-300 font-mono">{proto}</td>
                  <td className="py-2.5 pr-4 text-zinc-500">{purpose}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
