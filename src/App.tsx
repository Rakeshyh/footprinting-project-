/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Globe, 
  Server, 
  Lock, 
  AlertTriangle, 
  MapPin, 
  Share2, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  Terminal,
  Shield,
  Activity,
  Download,
  Zap,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  User,
  Key,
  ShieldAlert,
  Cpu,
  Code,
  Github,
  Twitter,
  Instagram,
  Linkedin,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { osintService, getMockData } from './services/osintService';

// Fix for Leaflet default icon issues relative to path/build
const hackerIcon = L.divIcon({
  className: 'custom-hacker-marker',
  html: `<div class="w-4 h-4 bg-hacker-green rounded-full border-2 border-black animate-pulse shadow-[0_0_10px_rgba(0,255,136,1)]"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});
import { aiService } from './services/aiService';
import { 
  IntelGridData, 
  AiAnalysis, 
  WhoisData, 
  DnsData, 
  TechStackData, 
  BreachData, 
  IpStats, 
  SocialPresence 
} from './types';

// --- Auth Component ---

const AuthPage = ({ onAuth }: { onAuth: (user: string) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validatePassword = (pw: string) => {
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pw);
    return pw.length >= 8 && hasLetter && hasNumber && hasSymbol;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isLogin) {
      if (!name) {
        setError('OPERATOR NAME REQUIRED.');
        return;
      }
      if (!validatePassword(password)) {
        setError('PASSWORD MUST BE 8+ CHARS WITH LETTERS, NUMBERS, AND SYMBOLS.');
        return;
      }
    }

    const users = JSON.parse(localStorage.getItem('osint_users') || '{}');

    if (isLogin) {
      const userData = users[email];
      if (userData && (userData === password || userData.password === password)) {
        onAuth(email);
      } else {
        setError('INVALID CREDENTIALS DETECTED.');
      }
    } else {
      if (users[email]) {
        setError('UID ALREADY REGISTERED IN DATABASE.');
        return;
      }
      users[email] = { name, password };
      localStorage.setItem('osint_users', JSON.stringify(users));
      
      setSuccess('REGISTRATION COMPLETE. COMMENCE LOGIN.');
      setIsLogin(true);
      setPassword('');
      setName('');
    }
  };

  return (
    <div className="min-h-screen bg-hacker-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="scanline" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md p-8 rounded-2xl relative z-10 border-hacker-green/30 shadow-2xl shadow-hacker-green/5"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-hacker-green/10 rounded-full flex items-center justify-center mb-4 border border-hacker-green/20">
            <ShieldAlert size={32} className="text-hacker-green animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-widest text-hacker-green uppercase">{isLogin ? 'Authorized Access' : 'New Operator'}</h2>
          <p className="text-[10px] text-white/30 uppercase mt-2">Intelligence Terminal v4.02 // Handshake Protocol</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase tracking-widest ml-1 font-bold">Operator_Name</label>
              <div className="relative group">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-hacker-cyan opacity-50 group-focus-within:opacity-100 transition-opacity" />
                <input 
                  type="text" 
                  required
                  className="w-full bg-black/40 border border-hacker-green/20 py-3 pl-10 pr-4 text-sm text-hacker-cyan focus:outline-none focus:border-hacker-cyan transition-all placeholder:text-white/10"
                  placeholder="AGENT_SMITH"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] text-white/40 uppercase tracking-widest ml-1 font-bold">Vector_ID (Email)</label>
            <div className="relative group">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-hacker-cyan opacity-50 group-focus-within:opacity-100 transition-opacity" />
              <input 
                type="email" 
                required
                className="w-full bg-black/40 border border-hacker-green/20 py-3 pl-10 pr-4 text-sm text-hacker-cyan focus:outline-none focus:border-hacker-cyan transition-all placeholder:text-white/10"
                placeholder="root@recon.net"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-white/40 uppercase tracking-widest ml-1 font-bold">Access_Key (Password)</label>
            <div className="relative group">
              <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-hacker-cyan opacity-50 group-focus-within:opacity-100 transition-opacity" />
              <input 
                type="password" 
                required
                className="w-full bg-black/40 border border-hacker-green/20 py-3 pl-10 pr-4 text-sm text-hacker-cyan focus:outline-none focus:border-hacker-cyan transition-all placeholder:text-white/10"
                placeholder="********"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[9px] text-hacker-red font-bold uppercase p-2 bg-hacker-red/10 border border-hacker-red/20 rounded text-center"
              >
                ERROR: {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[9px] text-hacker-green font-bold uppercase p-2 bg-hacker-green/10 border border-hacker-green/20 rounded text-center"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            className="w-full py-3 bg-hacker-green hover:bg-hacker-cyan text-black font-bold uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-hacker-cyan/20 mt-4"
          >
            {isLogin ? 'Establish Uplink' : 'Encrypt Identity'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-[10px] text-white/40 hover:text-hacker-green transition-colors uppercase tracking-[0.2em]"
          >
            {isLogin ? 'Initiate New Operator Registration' : 'Return to Login Terminal'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Components ---

const StatusBadge = ({ state }: { state: 'CLEAN' | 'EXPOSED' | 'WARNING' | 'SCANNING' }) => {
  const colors = {
    CLEAN: 'bg-hacker-green/10 text-hacker-green border-hacker-green/30',
    EXPOSED: 'bg-hacker-red/10 text-hacker-red border-hacker-red/30',
    WARNING: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    SCANNING: 'bg-hacker-cyan/10 text-hacker-cyan border-hacker-cyan/30'
  };

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-mono ${colors[state]}`}>
      {state}
    </span>
  );
};

const CardSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-white/5 rounded w-3/4"></div>
    <div className="space-y-2">
      <div className="h-3 bg-white/5 rounded w-full"></div>
      <div className="h-3 bg-white/5 rounded w-5/6"></div>
      <div className="h-3 bg-white/5 rounded w-4/6"></div>
    </div>
  </div>
);

const HackerLoader = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" className="w-full h-full hacker-loader-ring">
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="70 180"
        className="text-hacker-green opacity-40"
      />
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="50 150"
        className="text-hacker-cyan opacity-60"
        style={{ animationDirection: 'reverse', animationDuration: '3s' }}
      />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-1.5 h-1.5 bg-hacker-green rounded-full hacker-loader-pulse shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
    </div>
  </div>
);

const IntelMap = ({ lat, lon, city }: { lat: number, lon: number, city: string }) => (
  <div className="w-full h-24 bg-black/40 border border-white/10 rounded overflow-hidden relative">
    <MapContainer 
      center={[lat, lon]} 
      zoom={8} 
      scrollWheelZoom={false} 
      zoomControl={false}
      attributionControl={false}
      style={{ height: '100%', width: '100%', zIndex: 1 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lon]} icon={hackerIcon} />
    </MapContainer>
    <div className="absolute bottom-1 right-1 z-[10] bg-black/80 px-1 text-[7px] text-hacker-cyan uppercase font-bold border border-hacker-cyan/30">
      LOC: {lat.toFixed(2)}, {lon.toFixed(2)}
    </div>
  </div>
);

interface IntelCardProps {
  title: string;
  icon: React.ReactNode;
  loading: boolean;
  status: 'CLEAN' | 'EXPOSED' | 'WARNING' | 'SCANNING';
  children: React.ReactNode;
  raw?: any;
}

const IntelCard = ({ title, icon, loading, status, children, raw, index }: IntelCardProps & { index: number }) => {
  const [expanded, setExpanded] = useState(false);

  const copyToClipboard = () => {
    if (raw) {
      navigator.clipboard.writeText(JSON.stringify(raw, null, 2));
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.23, 1, 0.32, 1]
      }}
      className={`glass-card glow-border rounded-lg p-3 flex flex-col h-full relative overflow-hidden transition-all duration-500 group border border-white/5 hover:border-hacker-green/30 ${
        status === 'SCANNING' ? 'shadow-[0_0_20px_rgba(0,212,255,0.05)]' : 
        status === 'EXPOSED' ? 'shadow-[0_0_20px_rgba(255,68,68,0.05)] border-hacker-red/20' : 
        'hover:shadow-[0_0_30px_rgba(0,255,136,0.05)]'
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-hacker-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md bg-white/5 group-hover:bg-hacker-green/10 transition-colors ${
            status === 'EXPOSED' ? 'text-hacker-red bg-hacker-red/5' : 
            status === 'SCANNING' ? 'text-hacker-cyan animate-pulse' : 
            'text-hacker-green'
          }`}>
            {React.cloneElement(icon as React.ReactElement<any>, { size: 14 })}
          </div>
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 group-hover:text-white transition-colors">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge state={status} />
          {raw && (
            <button 
              onClick={copyToClipboard}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/30 hover:text-hacker-green transition-all"
              title="Copy Raw Data"
            >
              <Copy size={10} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 text-[11px] font-mono relative z-10">
        {loading ? (
          <div className="space-y-3 py-2">
            <div className="h-2 bg-white/5 rounded w-full animate-pulse" />
            <div className="h-2 bg-white/5 rounded w-3/4 animate-pulse" style={{ animationDelay: '0.1s' }} />
            <div className="h-2 bg-white/5 rounded w-5/6 animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        )}
      </div>

      {raw && !loading && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center justify-center gap-2 text-[8px] uppercase font-mono text-white/20 hover:text-hacker-cyan w-full pt-2 border-t border-white/5 transition-all group-hover:border-hacker-green/10"
        >
          <div className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={10} />
          </div>
          {expanded ? 'Mute_Source' : 'Inspect_Raw_Payload'}
        </button>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.pre 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 p-2 bg-black/80 rounded text-[9px] font-mono text-hacker-green/40 overflow-x-auto max-h-40 whitespace-pre-wrap border border-hacker-green/10"
          >
            {JSON.stringify(raw, null, 2)}
          </motion.pre>
        )}
      </AnimatePresence>
      
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-hacker-green/20" />
      <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-hacker-green/20" />
    </motion.div>
  );
};

const RiskMeter = ({ score, animate = true, level }: { score: number, animate?: boolean, level?: string }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }
    const timer = setTimeout(() => {
      setDisplayScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score, animate]);

  const getColor = (s: number) => {
    if (s < 30) return '#00ff88';
    if (s < 60) return '#fbbf24';
    if (s < 85) return '#f97316';
    return '#ff4444';
  };

  return (
    <div className="flex flex-col items-center justify-center border-r border-hacker-green/20 pr-8">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="48"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="56"
            cy="56"
            r="48"
            stroke={getColor(displayScore)}
            strokeWidth="8"
            fill="none"
            strokeDasharray="301.6"
            initial={{ strokeDashoffset: 301.6 }}
            animate={{ strokeDashoffset: 301.6 - (301.6 * displayScore) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-mono font-bold" style={{ color: getColor(displayScore) }}>
            {displayScore}
          </span>
          <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Risk Index</span>
        </div>
      </div>
      <div className={`mt-4 text-black font-bold px-4 py-0.5 text-[10px] rounded-full uppercase tracking-tighter shadow-lg ${
        level === 'CRITICAL' ? 'bg-hacker-red shadow-hacker-red/20' : 
        level === 'HIGH' ? 'bg-orange-500 shadow-orange-500/20' :
        'bg-hacker-green shadow-hacker-green/20'
      }`}>
        {level || 'Scanning...'}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<string | null>(localStorage.getItem('osint_session'));
  const [target, setTarget] = useState('');
  const [mode, setMode] = useState<'DOMAIN' | 'EMAIL' | 'USERNAME'>('DOMAIN');
  const [isScanning, setIsScanning] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [intelData, setIntelData] = useState<IntelGridData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [hibpKey, setHibpKey] = useState('');

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleAuth = (email: string) => {
    localStorage.setItem('osint_session', email);
    setUser(email);
    addLog(`Operator ${email} authenticated.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('osint_session');
    setUser(null);
  };

  const calculateQuickScore = (data: IntelGridData) => {
    let score = 0;
    if (data.breaches && data.breaches.length > 0) score += data.breaches.length * 25;
    if (data.techStack && data.techStack.technologies && data.techStack.technologies.length > 0) score += data.techStack.technologies.length * 2;
    if (data.socials) {
      const foundCount = data.socials.filter(s => s.exists === 'found').length;
      score += foundCount * 5;
    }
    if (data.dns && (data.dns.mxRecords.length === 0)) score += 10;
    
    // shodan/ip context
    if (data.ipStats?.org.toLowerCase().includes('cloud') || data.ipStats?.org.toLowerCase().includes('hosting')) {
      score += 5;
    }

    return Math.min(score, 100);
  };

  const handleScan = async (demo: boolean = false) => {
    const actualTarget = demo ? 'google.com' : target;
    if (!actualTarget && !demo) return;
    
    setIsScanning(true);
    setAiAnalysis(null);
    setIntelData(null); // Reset old data
    setIsDemo(demo);
    addLog(`Initializing scan for target: ${actualTarget}...`);
    addLog(`Protocol: ${mode} // Vector: ${demo ? 'EMULATED' : 'LIVE'}`);

    if (demo) setTarget('google.com');

    try {
      let data: IntelGridData;
      
      if (demo) {
        await new Promise(r => setTimeout(r, 2000));
        data = getMockData('google.com');
      } else {
        // Run all recon modules
        const results = await Promise.allSettled([
          mode === 'DOMAIN' ? osintService.fetchWhois(actualTarget) : Promise.resolve({}),
          mode === 'DOMAIN' ? osintService.fetchDns(actualTarget) : Promise.resolve({ aRecords: [], mxRecords: [], txtRecords: [], nsRecords: [] }),
          mode === 'DOMAIN' ? osintService.fetchTechStack(actualTarget) : Promise.resolve({ technologies: [] }),
          mode === 'EMAIL' || mode === 'DOMAIN' ? osintService.fetchBreaches(actualTarget, hibpKey) : Promise.resolve([]),
          mode === 'DOMAIN' ? osintService.fetchIpStats(actualTarget) : Promise.resolve(undefined),
          mode === 'USERNAME' || mode === 'DOMAIN' || mode === 'EMAIL' 
            ? osintService.checkSocials(actualTarget.includes('@') ? actualTarget.split('@')[0] : actualTarget.split('.')[0]) 
            : Promise.resolve([]),
          mode === 'DOMAIN' ? osintService.fetchHeaders(actualTarget) : Promise.resolve(null)
        ]);

        data = {
          whois: results[0].status === 'fulfilled' ? results[0].value : null,
          dns: results[1].status === 'fulfilled' ? results[1].value : null,
          techStack: results[2].status === 'fulfilled' ? results[2].value as TechStackData : null,
          breaches: results[3].status === 'fulfilled' ? results[3].value : null,
          ipStats: results[4].status === 'fulfilled' ? results[4].value : null,
          socials: results[5].status === 'fulfilled' ? results[5].value : null,
          headers: results[6].status === 'fulfilled' ? (results[6].value as Record<string, string>) : null
        };
      }

      setIntelData(data);
      addLog(`Recon modules synchronized. Analyzing results...`);
      
      // AI analysis step
      const analysis = await aiService.analyzeIntel(data, actualTarget);
      setAiAnalysis(analysis);
      addLog(`AI Analysis complete. Risk Index: ${analysis.riskScore}%`);

    } catch (err) {
      console.error('Scan Failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const exportReport = () => {
    if (!intelData) return;
    
    const report = {
      target,
      timestamp: new Date().toISOString(),
      intel: intelData,
      aiAnalysis,
      quickScore: quickScore
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recon_report_${target}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickScore = useMemo(() => {
    if (!intelData) return 0;
    return calculateQuickScore(intelData);
  }, [intelData]);

  if (!user) return <AuthPage onAuth={handleAuth} />;

  return (
    <div className="min-h-screen bg-hacker-bg font-mono text-hacker-green grid-pattern relative overflow-hidden flex flex-col">
      {/* Visual Effects */}
      <div className="scanline" />
      {isScanning && <div className="radar-sweep" />}

      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 p-4 md:p-6 lg:p-8 relative z-20">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-6 border-b border-hacker-green/20 pb-4 gap-6">
          <div className="w-full md:w-auto">
            <div className="text-[10px] opacity-50 uppercase tracking-widest mb-1 flex items-center gap-2">
              <span>System Intelligence Terminal</span>
              <span className="w-1 h-1 rounded-full bg-hacker-green animate-pulse"></span>
              <span className="text-hacker-green/40">ONLINE</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-2">
              <span className="bg-hacker-green text-black px-1.5 py-0.5">NEURAL</span> RECON V4.02
            </h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-2xl w-full">
            <div className="relative flex-1 group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-hacker-cyan text-sm font-bold tracking-widest group-focus-within:animate-pulse">{"$>"}</div>
              <input 
                type="text" 
                placeholder={`ENTER TARGET ${mode}...`}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-black/40 border border-hacker-green/30 py-2.5 pl-10 pr-4 text-sm text-hacker-cyan focus:outline-none focus:border-hacker-cyan transition-all placeholder:text-hacker-cyan/40"
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
            </div>
            
            <div className="flex border border-hacker-green/30 p-1 bg-black/40 h-fit">
              {['DOMAIN', 'EMAIL', 'USERNAME'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m as any)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase transition-all ${
                    mode === m 
                      ? 'bg-hacker-green text-black' 
                      : 'text-white/40 hover:text-white opacity-40 hover:opacity-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handleScan()}
              disabled={isScanning || !target}
              className="px-4 py-2 bg-hacker-green hover:bg-hacker-cyan text-black font-bold uppercase text-[10px] tracking-widest transition-all disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {isScanning ? <HackerLoader size={14} /> : <Zap size={14} />}
              <span>Scan</span>
            </button>
          </div>

          <div className="text-right hidden md:block">
            <div className="text-[9px] opacity-40 uppercase tracking-widest">Global Timestamp</div>
            <div className="text-xs text-white/70 font-bold">{new Date().toISOString().replace('T', ' // ').split('.')[0]} UTC</div>
          </div>
        </header>

        {/* Demo Toggle & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleScan(true)}
              className="text-[9px] text-hacker-cyan hover:text-hacker-green transition-colors flex items-center gap-2 px-3 py-1 rounded border border-hacker-cyan/30 hover:border-hacker-green/30 uppercase tracking-widest font-bold"
            >
              <Activity size={10} />
              Demo_Mode.exe
            </button>
            {(mode === 'EMAIL' || mode === 'DOMAIN') && (
              <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-white/10 group/token">
                <Lock size={10} className="text-white/30 group-focus-within/token:text-hacker-cyan transition-colors" />
                <input 
                  type="password" 
                  placeholder="HIBP_TOKEN"
                  value={hibpKey}
                  onChange={(e) => setHibpKey(e.target.value)}
                  className="bg-transparent border-none text-[10px] w-24 focus:ring-0 outline-none text-hacker-cyan placeholder:text-white/10"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-[9px] text-white/30 truncate">
            <span className="flex items-center gap-1"><Terminal size={10} /> SESSION_ALPHA_7</span>
            <span>|</span>
            <span className="flex items-center gap-1 text-hacker-green">● SECURE_CHANNEL_READY</span>
          </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Card 1: WHOIS */}
          <IntelCard 
            index={0}
            title="WHOIS_RECON_MATRIX" 
            icon={<Globe size={18} />} 
            loading={isScanning && (mode === 'DOMAIN' || isDemo)}
            status={isScanning && (mode === 'DOMAIN' || isDemo) ? 'SCANNING' : (intelData?.whois && Object.keys(intelData.whois).length > 1 ? 'CLEAN' : (intelData ? 'WARNING' : 'CLEAN'))}
            raw={intelData?.whois?.raw}
          >
            {intelData?.whois && Object.keys(intelData.whois).length > 1 ? (
              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="opacity-40 uppercase">REGISTRAR:</span> <span className="text-hacker-cyan truncate ml-2 font-bold">{intelData.whois.registrar || 'N/A'}</span></div>
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="opacity-40 uppercase">ESTABLISHED:</span> <span>{intelData.whois.createdDate ? intelData.whois.createdDate.split('T')[0] : 'N/A'}</span></div>
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="opacity-40 uppercase">TERMINATION:</span> <span className={`${new Date(intelData.whois.expiryDate || 0) < new Date() ? 'text-hacker-red font-bold' : 'text-hacker-green font-bold'}`}>
                  {intelData.whois.expiryDate ? intelData.whois.expiryDate.split('T')[0] : 'N/A'}
                </span></div>
                <div className="pt-2">
                  <div className="opacity-40 mb-1 uppercase text-[8px] flex items-center gap-1"><Terminal size={8} /> RESOLVERS:</div>
                  <div className="grid grid-cols-1 gap-1 text-[9px] text-hacker-cyan/60 font-medium">
                    {intelData.whois.nameServers?.slice(0, 2)?.map((ns, i) => (
                      <div key={i} className="truncate bg-white/5 px-1 py-0.5 border-l border-hacker-cyan/30">{ns}</div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-20 py-6 border border-dashed border-white/10 rounded">
                <Globe size={24} className="mb-2 animate-pulse" />
                <div className="italic text-[10px]">Awaiting Uplink Synchronization...</div>
              </div>
            )}
          </IntelCard>

          {/* Card 2: DNS */}
          <IntelCard 
            index={1}
            title="DNS_LAYER_PROBE" 
            icon={<Server size={18} />} 
            loading={isScanning && (mode === 'DOMAIN' || isDemo)}
            status={isScanning && (mode === 'DOMAIN' || isDemo) ? 'SCANNING' : (intelData?.dns && (intelData.dns.aRecords.length > 0 || intelData.dns.nsRecords.length > 0) ? 'CLEAN' : (intelData ? 'WARNING' : 'CLEAN'))}
            raw={intelData?.dns}
          >
            {intelData?.dns ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 group/rec">
                  <span className="bg-hacker-cyan/10 border border-hacker-cyan/30 px-1 text-[8px] w-6 text-center text-hacker-cyan font-bold">A</span>
                  <span className="text-white/80 truncate font-mono">{intelData.dns.aRecords[0]?.data || 'NOT_RESOLVED'}</span>
                </div>
                <div className="flex items-center gap-2 group/rec">
                  <span className="bg-amber-500/10 border border-amber-500/30 px-1 text-[8px] w-6 text-center text-amber-500 font-bold">MX</span>
                  <span className="text-white/80 truncate font-mono">{intelData.dns.mxRecords[0]?.data || 'NULL_MX'}</span>
                </div>
                <div className="flex items-center gap-2 group/rec">
                  <span className="bg-purple-500/10 border border-purple-500/30 px-1 text-[8px] w-6 text-center text-purple-500 font-bold">TX</span>
                  <span className="text-white/80 truncate font-mono text-[8px] leading-tight overflow-hidden text-ellipsis line-clamp-2">{intelData.dns.txtRecords[0]?.data || 'EMPTY_TXT'}</span>
                </div>
                <div className="mt-3 bg-hacker-green/5 p-2 border border-hacker-green/10 text-[8px] italic opacity-60 flex items-center gap-2">
                  <Activity size={10} className="text-hacker-green animate-pulse" />
                  <span>INTEGRITY_CHECK: 8.8.8.8 // SUCCESS</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-20 py-6 border border-dashed border-white/10 rounded">
                <Server size={24} className="mb-2 animate-pulse" />
                <div className="italic text-[10px]">Resolving Infrastructure Hierarchy...</div>
              </div>
            )}
          </IntelCard>          {/* Card 3: Technology Stack */}
          <IntelCard 
            index={2}
            title="TECH_STACK_IDENTIFIER" 
            icon={<Cpu size={18} />} 
            loading={isScanning && (mode === 'DOMAIN' || isDemo)}
            status={isScanning && (mode === 'DOMAIN' || isDemo) ? 'SCANNING' : (intelData?.techStack?.technologies && intelData.techStack.technologies.length > 0 ? 'CLEAN' : (intelData ? 'WARNING' : 'CLEAN'))}
            raw={intelData?.techStack}
          >
            {intelData?.techStack && intelData.techStack.technologies && intelData.techStack.technologies.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {intelData.techStack.technologies.map((tech, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 bg-white/5 border border-white/10 p-2 rounded w-[70px] hover:border-hacker-cyan/50 hover:bg-hacker-cyan/5 transition-all group/tech shadow-lg">
                      <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-hacker-cyan group-hover/tech:scale-110 transition-transform">
                        <Code size={14} />
                      </div>
                      <span className="text-[7px] font-bold text-center uppercase tracking-tighter truncate w-full">{tech}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-hacker-cyan/5 border-l-2 border-hacker-cyan p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity size={10} className="text-hacker-cyan" />
                    <span className="text-[8px] font-bold text-hacker-cyan">HEURISTIC_ANALYSIS</span>
                  </div>
                  <p className="text-[9px] text-white/50 leading-relaxed italic">
                    Detected {intelData.techStack.technologies.length} core infrastructure components via passive header fingerprinting and DOM signature analysis.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-20 py-6 border border-dashed border-white/10 rounded">
                <Cpu size={24} className="mb-2 animate-pulse" />
                <div className="italic text-[10px]">
                  {intelData ? "TECH_STACK_INCOGNITO" : "Deconstructing Application Architecture..."}
                </div>
              </div>
            )}
          </IntelCard>

          {/* Card 4: HTTP Headers */}
          <IntelCard 
            index={3}
            title="HTTP_SECURITY_POLICIES" 
            icon={<Shield size={18} />} 
            loading={isScanning && (mode === 'DOMAIN' || isDemo)}
            status={isScanning && (mode === 'DOMAIN' || isDemo) ? 'SCANNING' : (intelData?.headers ? 'CLEAN' : (intelData ? 'WARNING' : 'CLEAN'))}
            raw={intelData?.headers}
          >
            {intelData?.headers ? (
              <div className="space-y-1.5">
                {['server', 'strict-transport-security', 'x-frame-options', 'content-security-policy'].map((h) => (
                  <div key={h} className="flex flex-col border-b border-white/5 pb-1">
                    <span className="opacity-40 uppercase text-[8px] font-bold">{h.replace(/-/g, '_')}:</span>
                    <span className={`truncate text-[9px] font-mono ${intelData.headers?.[h] ? 'text-hacker-cyan' : 'text-white/20 italic'}`}>
                      {intelData.headers?.[h] || 'NOT_DEFINED'}
                    </span>
                  </div>
                ))}
                <div className="mt-2 text-[8px] opacity-40 uppercase flex justify-between items-center">
                  <span>TOTAL_HEADERS:</span>
                  <span className="text-hacker-green font-bold">{Object.keys(intelData.headers).length}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 border border-dashed border-white/10 rounded h-full">
                <Shield size={24} className="mb-2 opacity-20 animate-pulse" />
                <p className="text-[9px] uppercase opacity-30 italic">Analyzing connection headers...</p>
              </div>
            )}
          </IntelCard>

          {/* Card 5: Infrastructure */}
          <IntelCard 
            index={4}
            title="GEO_SPATIAL_PROBE" 
            icon={<MapPin size={18} />} 
            loading={isScanning && (mode === 'DOMAIN' || isDemo)}
            status={isScanning && (mode === 'DOMAIN' || isDemo) ? 'SCANNING' : (intelData?.ipStats ? 'CLEAN' : (intelData ? 'WARNING' : 'CLEAN'))}
            raw={intelData?.ipStats}
          >
            {intelData?.ipStats ? (
              <div className="flex flex-col gap-2 h-full">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1.5 text-[10px]">
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="opacity-40 uppercase">ISP_NODE:</span> <span className="truncate ml-2 text-hacker-cyan/70 font-bold">{intelData.ipStats.isp}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="opacity-40 uppercase">ZONE:</span> <span className="text-white/80">{intelData.ipStats.city}, {intelData.ipStats.country}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="opacity-40 uppercase">AS_INT:</span> <span className="text-hacker-cyan font-bold">{intelData.ipStats.as}</span></div>
                  </div>
                  <div className="shrink-0 w-24">
                    <IntelMap lat={intelData.ipStats.lat} lon={intelData.ipStats.lon} city={intelData.ipStats.city} />
                  </div>
                </div>
                <div className="mt-auto flex gap-2">
                  <div className="flex-1 bg-black/40 p-1.5 border border-hacker-green/10 flex gap-2 items-center text-[9px] overflow-hidden">
                    <div className="w-1.5 h-1.5 rounded-full bg-hacker-green shadow-[0_0_5px_#00ff88]"></div>
                    <span className="opacity-60 font-bold uppercase tracking-widest truncate">Endpoint_IP: {intelData.ipStats.query}</span>
                  </div>
                  <a 
                    href={`https://www.shodan.io/host/${intelData.ipStats.query}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-hacker-cyan/10 border border-hacker-cyan/30 text-hacker-cyan hover:bg-hacker-cyan hover:text-black transition-all flex items-center justify-center shrink-0 group/shodan"
                    title="Shodan Lookup"
                  >
                    <ExternalLink size={12} className="group-hover/shodan:scale-110 transition-transform" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-20 py-4 border border-dashed border-white/10">
                <Activity size={24} className="mb-2 animate-pulse" />
                <div className="italic text-[10px]">Triangulating host coordinates...</div>
              </div>
            )}
          </IntelCard>

          {/* Card 6: Digital Footprint */}
          <IntelCard 
            index={5}
            title="NEURAL_FOOTPRINT_MAP" 
            icon={<Share2 size={18} />} 
            loading={isScanning && (mode === 'USERNAME' || mode === 'DOMAIN' || mode === 'EMAIL' || isDemo)}
            status={isScanning && (mode === 'USERNAME' || mode === 'DOMAIN' || mode === 'EMAIL' || isDemo) ? 'SCANNING' : (intelData?.socials && intelData.socials.some(s => s.exists === 'found') ? 'CLEAN' : (intelData ? 'WARNING' : 'CLEAN'))}
            raw={intelData?.socials}
          >
            {intelData?.socials ? (
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                {intelData.socials.map((s, i) => {
                  const Icon = s.platform === 'GitHub' ? Github :
                               s.platform === 'Twitter' ? Twitter :
                               s.platform === 'Instagram' ? Instagram :
                               s.platform === 'LinkedIn' ? Linkedin :
                               MessageSquare;
                  
                  return (
                    <div key={i} className={`flex items-center justify-between p-1.5 border transition-all ${
                      s.exists === 'found' 
                        ? 'bg-hacker-green/5 border-hacker-green/20 text-hacker-green hover:shadow-[0_0_10px_rgba(0,255,136,0.1)]' 
                        : 'bg-white/5 border-white/5 text-white/20 opacity-40 grayscale'
                    }`}>
                      <div className="flex items-center gap-2 truncate">
                        <div className={`p-1 rounded ${s.exists === 'found' ? 'bg-hacker-green/10' : 'bg-white/5'}`}>
                          <Icon size={10} className={s.exists === 'found' ? 'text-hacker-green' : 'text-white/40'} />
                        </div>
                        <span className={`truncate font-bold tracking-tight ${s.exists === 'found' ? 'text-white/90' : 'text-hacker-green/20'}`}>{s.platform}</span>
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        s.exists === 'found' ? 'bg-hacker-green shadow-[0_0_5px_#00ff88] animate-pulse' : 
                        'bg-white/10'
                      }`}></div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-20 text-center py-4 border border-dashed border-white/10">
                <Activity size={22} className="mb-2 animate-pulse" />
                <p className="text-[9px] uppercase tracking-widest font-bold">Scanning Social Layers...</p>
                <div className="mt-2 text-[7px] text-hacker-cyan italic">identity_matrix_probing</div>
              </div>
            )}
          </IntelCard>
        </div>

        {/* Terminal Logs & AI Analyst Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8 items-stretch">
          {/* AI Analyst Section */}
          <div className="flex-1">
            <AnimatePresence>
              {(intelData || isScanning) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card border-t-2 border-t-hacker-green p-4 flex flex-col md:flex-row gap-8 h-full"
                >
                  {/* Risk Meter Column */}
                  <RiskMeter 
                    score={aiAnalysis ? aiAnalysis.riskScore : (intelData ? quickScore : 0)} 
                    animate={!!aiAnalysis} 
                    level={aiAnalysis?.riskLevel || (isScanning ? 'SCANNING' : 'CALCULATING')} 
                  />

                  {/* Report Column */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-2">
                      <h3 className="text-[10px] font-bold flex items-center gap-2 text-hacker-cyan uppercase tracking-[0.2em]">
                        <Activity size={10} className="animate-pulse" /> Neural Analyst Advisory // SEC-LEVEL 4
                      </h3>
                      <button 
                        onClick={exportReport}
                        disabled={!intelData}
                        className="text-[8px] bg-white/5 hover:bg-hacker-green hover:text-black px-3 py-1 flex items-center gap-1.5 border border-white/10 transition-all font-bold uppercase tracking-widest disabled:opacity-20"
                      >
                        <Download size={10} /> Export Recon(json)
                      </button>
                    </div>

                    {!aiAnalysis ? (
                      <div className="flex-1 flex flex-col justify-center gap-2 py-4">
                        <div className="flex items-center gap-3 text-hacker-cyan/50 mb-2 font-mono text-[10px]">
                          <Loader2 size={14} className="animate-spin" />
                          <span className="uppercase tracking-widest animate-pulse">Processing Intel Through Neural Core...</span>
                        </div>
                        <div className="space-y-1 font-mono text-[8px] opacity-40 uppercase">
                          <div className="flex gap-2">
                            <span className="text-hacker-green">[OK]</span>
                            <span>Handshake protocol initialized...</span>
                          </div>
                          <div className="flex gap-2 animate-[pulse_1s_infinite_0.2s]">
                            <span className="text-hacker-green">[OK]</span>
                            <span>Probing domain infrastructure via Google DNS...</span>
                          </div>
                          <div className="flex gap-2 animate-[pulse_1s_infinite_0.4s]">
                            <span className="text-hacker-cyan">[WAIT]</span>
                            <span>Interrogating x509 certificate chain (crt.sh)...</span>
                          </div>
                          <div className="flex gap-2 animate-[pulse_1s_infinite_0.6s]">
                            <span className="text-hacker-red">[RECON]</span>
                            <span>Cross-referencing HIBP breach datasets...</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                        <div className="text-[11px] prose prose-invert max-w-none text-white/80 leading-relaxed font-mono">
                          <Markdown>{aiAnalysis.summary}</Markdown>
                        </div>
                        
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-hacker-green/5 border border-hacker-green/20 rounded-lg group hover:bg-hacker-green/10 transition-colors">
                            <h4 className="text-[9px] font-bold text-hacker-green uppercase mb-3 flex items-center gap-2">
                              <Shield size={10} /> Remediation Protocol
                            </h4>
                            <ul className="space-y-2">
                              {aiAnalysis.recommendations?.map((rec, i) => (
                                <li key={i} className="flex gap-2 text-[9px] text-white/70">
                                  <span className="text-hacker-green opacity-50 select-none">{">"}</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="p-3 bg-hacker-red/5 border border-hacker-red/20 rounded-lg group hover:bg-hacker-red/10 transition-colors">
                            <h4 className="text-[9px] font-bold text-hacker-red uppercase mb-3 flex items-center gap-2">
                              <AlertTriangle size={10} /> Critical Vulnerabilities
                            </h4>
                            <ul className="space-y-2">
                              {aiAnalysis.attackVectors?.map((vector, i) => (
                                <li key={i} className="flex gap-2 text-[9px] text-white/70">
                                  <span className="text-hacker-red opacity-50 select-none">!</span>
                                  <span>{vector}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Terminal Console */}
          <div className="w-full lg:w-80 glass-card p-3 border-hacker-cyan/20 flex flex-col h-[280px] lg:h-auto">
            <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-2">
              <span className="text-[9px] uppercase font-bold text-hacker-cyan flex items-center gap-2 tracking-[0.1em]">
                <Terminal size={10} /> Uplink_Console
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-hacker-green animate-pulse"></div>
            </div>
            <div className="flex-1 overflow-y-auto text-[9px] font-mono space-y-1 custom-scrollbar pr-1">
              {logs.length === 0 ? (
                <div className="text-white/10 italic">Initializing console environment...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex gap-2 text-hacker-green/60">
                    <span className="opacity-30 shrink-0 text-[7px] mt-0.5">{log.split(']')[0]}]</span>
                    <span className="break-all">{log.split(']')[1]}</span>
                  </div>
                ))
              )}
              {isScanning && (
                <div className="text-hacker-cyan animate-pulse">
                  {">"} ACCESSING_BUFFER... [{Math.floor(Math.random()*100)}%]
                </div>
              )}
            </div>
            <div className="mt-2 text-[7px] text-white/20 flex justify-between items-center opacity-40 uppercase tracking-tighter">
              <span>BUF_SIZE: 1024KB</span>
              <span>ENC: AES-256</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex justify-between items-center text-[9px] opacity-40 uppercase tracking-widest mt-4">
          <div className="flex items-center gap-4">
            <span>SESS_ID: {Math.random().toString(16).substring(2, 10).toUpperCase()} // AGENT_{user?.split('@')[0]}</span>
            <button onClick={handleLogout} className="text-hacker-red hover:underline font-bold transition-all">LOGOUT</button>
          </div>
          <div className="flex gap-6">
            <span className="hidden sm:inline">CPU_IDLE: 88%</span>
            <span className="hidden sm:inline">MEM_USE: 1.4GB</span>
            <span className="text-hacker-green font-bold">● CONNECTION_ESTABLISHED</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
