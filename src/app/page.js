'use client';

import { useState, useEffect } from 'react';
import ScoreTrendChart from '@/components/ScoreTrendChart';
import {
  Search, MessageSquare, History, Swords, Layers, Network, Bot, Wrench, Code2,
  CheckCircle2, XCircle, AlertTriangle, Sparkles, Trophy, Copy, Check, Globe,
  RefreshCw, FolderKanban, ChevronDown, ChevronUp, Download, Trash2, BarChart3,
  Printer, Award, ExternalLink, Zap, Shield, TrendingUp, Target, Gauge,
  ArrowUpRight, CircleDot, FileCode2, Rocket, Eye, Fingerprint, Activity,
} from 'lucide-react';

// ==================== UTILS ====================

function getTrifectaGrade(seo = 0, aeo = 0, geo = 0) {
  const weighted = Math.round(seo * 0.3 + aeo * 0.35 + geo * 0.35);
  if (weighted >= 90) return { score: weighted, grade: 'A+', label: 'AI & Search Leader', tone: 'emerald' };
  if (weighted >= 80) return { score: weighted, grade: 'A', label: 'Strong Readiness', tone: 'emerald' };
  if (weighted >= 65) return { score: weighted, grade: 'B', label: 'Moderate AI Visibility', tone: 'sky' };
  if (weighted >= 50) return { score: weighted, grade: 'C', label: 'Needs AEO / GEO Fixes', tone: 'amber' };
  return { score: weighted, grade: 'D', label: 'Critical AI Visibility Gaps', tone: 'rose' };
}

const TONES = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500', soft: 'bg-emerald-500/10', border: 'border-emerald-500/25', ring: 'ring-emerald-500/20', grad: 'from-emerald-500 to-teal-500', hex: '#10b981' },
  sky: { text: 'text-sky-400', bg: 'bg-sky-500', soft: 'bg-sky-500/10', border: 'border-sky-500/25', ring: 'ring-sky-500/20', grad: 'from-sky-500 to-blue-500', hex: '#0ea5e9' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500', soft: 'bg-amber-500/10', border: 'border-amber-500/25', ring: 'ring-amber-500/20', grad: 'from-amber-500 to-orange-500', hex: '#f59e0b' },
  rose: { text: 'text-rose-400', bg: 'bg-rose-500', soft: 'bg-rose-500/10', border: 'border-rose-500/25', ring: 'ring-rose-500/20', grad: 'from-rose-500 to-red-500', hex: '#f43f5e' },
  indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500', soft: 'bg-indigo-500/10', border: 'border-indigo-500/25', ring: 'ring-indigo-500/20', grad: 'from-indigo-500 to-purple-500', hex: '#6366f1' },
};

const NAV_GROUPS = [
  {
    label: 'Diagnostics',
    items: [
      { id: 'audit', label: 'Site Audit', icon: Search, accent: 'indigo' },
      { id: 'fixer', label: 'Auto Tech Fixer', icon: Wrench, accent: 'emerald' },
      { id: 'xray', label: 'AI Bot X-Ray', icon: Bot, accent: 'sky' },
      { id: 'sitemap', label: 'Sitemap Finder', icon: Network, accent: 'amber' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'battle', label: 'Competitor Duel', icon: Swords, accent: 'rose' },
      { id: 'geo', label: 'GEO Share of Voice', icon: MessageSquare, accent: 'indigo' },
      { id: 'history', label: 'History', icon: History, accent: 'sky' },
    ],
  },
];

// ==================== COMPONENTS ====================

function ScoreRing({ score, size = 80, thickness = 7, tone = 'indigo', showLabel = true }) {
  const t = TONES[tone];
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={thickness} fill="none" className="text-zinc-800/80" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={t.hex} strokeWidth={thickness} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-lg font-black tabular-nums ${t.text}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {score}
          </span>
        </div>
      )}
    </div>
  );
}

function Card({ children, className = '', hover = false }) {
  return (
    <div className={`relative bg-zinc-900/40 border border-zinc-800/70 rounded-2xl backdrop-blur-sm ${hover ? 'hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all duration-300' : ''} ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, tone = 'zinc', className = '' }) {
  const tones = {
    zinc: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const variants = {
    primary: 'bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30',
    secondary: 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/60',
    ghost: 'hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200',
    danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25',
  };
  const sizes = { sm: 'h-8 px-3 text-xs rounded-lg', md: 'h-10 px-4 text-sm rounded-xl', icon: 'h-9 w-9 rounded-lg p-0' };
  return (
    <button className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Input({ label, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-zinc-400 mb-2">{label}</label>}
      <input className="w-full h-11 bg-zinc-950/60 border border-zinc-800/80 rounded-xl px-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15 transition-all" {...props} />
    </div>
  );
}

function CodeBlock({ code, language, onCopy, onDownload, filename, copied, maxH = 'max-h-80' }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Badge tone="indigo">{language}</Badge>
        <div className="flex gap-3 print:hidden">
          {onDownload && (
            <button onClick={() => onDownload(filename, code)} className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1 transition">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          )}
          {onCopy && (
            <button onClick={() => onCopy(code)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>
      <pre className={`bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 text-xs font-mono text-zinc-300 overflow-auto whitespace-pre-wrap ${maxH} scrollbar-thin scrollbar-thumb-zinc-700/80`}>
        {code}
      </pre>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 border border-zinc-800 flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-6 h-6 text-zinc-500" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      <p className="text-xs text-zinc-500 mt-1.5 max-w-sm leading-relaxed">{description}</p>
    </div>
  );
}

function MetricCard({ label, value, suffix, icon: Icon, tone = 'zinc', subtitle }) {
  const t = TONES[tone] || TONES.indigo;
  return (
    <Card className="p-5" hover>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className={`text-3xl font-black tabular-nums ${tone === 'zinc' ? 'text-zinc-100' : t.text}`}>{value}</span>
            {suffix && <span className="text-xs font-mono text-zinc-600">{suffix}</span>}
          </div>
          {subtitle && <p className="text-[11px] text-zinc-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg ${t.soft} border ${t.border}`}>
          <Icon className={`w-4 h-4 ${t.text}`} />
        </div>
      </div>
    </Card>
  );
}

// ==================== MAIN ====================

export default function Home() {
  const [activeTab, setActiveTab] = useState('audit');
  const [error, setError] = useState('');

  // Module 1
  const [auditUrl, setAuditUrl] = useState('');
  const [brandNameInput, setBrandNameInput] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [multiCrawlLoading, setMultiCrawlLoading] = useState(false);
  const [multiCrawlResults, setMultiCrawlResults] = useState(null);
  const [fixLoading, setFixLoading] = useState(false);
  const [generatedFixes, setGeneratedFixes] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  // Module 1B
  const [fixerUrl, setFixerUrl] = useState('');
  const [fixerBrand, setFixerBrand] = useState('');
  const [fixerRepo, setFixerRepo] = useState('');
  const [fixerToken, setFixerToken] = useState('');
  const [fixerLoading, setFixerLoading] = useState(false);
  const [fixerResult, setFixerResult] = useState(null);
  const [fixerCodeMode, setFixerCodeMode] = useState('html');
  const [deployLoading, setDeployLoading] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [deployError, setDeployError] = useState('');

  // Module 2
  const [xrayUrl, setXrayUrl] = useState('');
  const [xrayLoading, setXrayLoading] = useState(false);
  const [xrayResult, setXrayResult] = useState(null);
  const [robotsPolicyMode, setRobotsPolicyMode] = useState('search-only');

  // Module 3
  const [sitemapInputUrl, setSitemapInputUrl] = useState('');
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [sitemapResult, setSitemapResult] = useState(null);
  const [sitemapSearchFilter, setSitemapSearchFilter] = useState('');
  const [sitemapSourceFilter, setSitemapSourceFilter] = useState('all');

  // Module 4
  const [myBattleUrl, setMyBattleUrl] = useState('');
  const [rivalBattleUrl, setRivalBattleUrl] = useState('');
  const [battleLoading, setBattleLoading] = useState(false);
  const [battleResult, setBattleResult] = useState(null);

  // Module 5
  const [geoBrand, setGeoBrand] = useState('');
  const [geoDomain, setGeoDomain] = useState('');
  const [geoPromptsInput, setGeoPromptsInput] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoProgress, setGeoProgress] = useState('');
  const [geoBatchResult, setGeoBatchResult] = useState(null);

  // Module 6
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [deletingId, setDeletingId] = useState('');

  // Handlers
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (res.ok && data.projects) setProjects(data.projects);
    } catch (err) { console.error(err); }
    finally { setHistoryLoading(false); }
  };

  useEffect(() => { const t = setTimeout(fetchHistory, 0); return () => clearTimeout(t); }, []);

  const toggleExpand = (id) => setExpandedItems((p) => ({ ...p, [id]: !p[id] }));

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleDownloadFile = (filename, content, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteRecord = async (id, type, label) => {
    if (!window.confirm(`Delete this ${label} permanently?`)) return;
    setDeletingId(id); setError('');
    try {
      const res = await fetch(`/api/history/${id}?type=${type}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      if (type === 'project' && selectedProjectId === id) setSelectedProjectId('all');
      await fetchHistory();
    } catch (err) { setError(err.message); }
    finally { setDeletingId(''); }
  };

  const handleExportProjectMarkdown = (project) => {
    const lines = [
      `# SEO • AEO • GEO Report: ${project.brandName}`,
      `- **Domain:** ${project.domain}`,
      `- **Generated:** ${new Date().toLocaleString()}`,
      '',
      `## Saved Site Audits (${project.audits.length})`,
    ];
    if (project.audits.length === 0) lines.push('_No site audits recorded yet._');
    else project.audits.forEach((a, idx) => {
      lines.push(
        `### ${idx + 1}. ${a.url} (${new Date(a.createdAt).toLocaleDateString()})`,
        `- **SEO:** ${a.seoScore}/100 | **AEO:** ${a.aeoScore}/100 | **GEO:** ${a.geoScore}/100`,
        `- **llms.txt:** ${a.hasLlmsTxt ? 'Yes' : 'No'}`,
        `- **Schemas:** ${a.schemaTypes?.length ? a.schemaTypes.join(', ') : 'None'}`,
        ''
      );
      if (Array.isArray(a.issues) && a.issues.length > 0) {
        lines.push('**Diagnostics:**');
        a.issues.forEach((iss) => {
          if (typeof iss === 'string') lines.push(`- ${iss}`);
          else lines.push(`- [${(iss.status || iss.severity || 'info').toUpperCase()}] **${iss.check || iss.title || iss.message || 'Check'}**: ${iss.detail || iss.description || ''}`);
        });
        lines.push('');
      }
    });
    lines.push(`## GEO Citation Checks (${project.geoChecks.length})`);
    if (project.geoChecks.length === 0) lines.push('_No GEO citation checks recorded yet._');
    else project.geoChecks.forEach((c, idx) => {
      lines.push(
        `### ${idx + 1}. Prompt: "${c.prompt}"`,
        `- **Date:** ${new Date(c.createdAt).toLocaleString()}`,
        `- **Provider:** ${c.llmProvider || 'Gemini 3.8 Flash'}`,
        `- **Brand Mentioned:** ${c.brandMentioned ? 'Yes' : 'No'}`,
        `- **Sentiment:** ${c.sentiment || 'Neutral'}`,
        c.citedUrls?.length ? `- **Cited URLs:** ${c.citedUrls.join(', ')}` : '',
        '', '**Raw Response:**', '```text', c.rawResponse || '', '```', ''
      );
    });
    handleDownloadFile(`${project.domain.replace(/[^a-z0-9.-]/gi, '_')}-report.md`, lines.filter(Boolean).join('\n'), 'text/markdown');
  };

  const runAuditForUrl = async (targetUrl, brand = '') => {
    setError(''); setAuditLoading(true); setAuditResult(null);
    setMultiCrawlResults(null); setGeneratedFixes(null);
    const normalizedUrl = /^https?:\/\//i.test(targetUrl.trim()) ? targetUrl.trim() : `https://${targetUrl.trim()}`;
    try {
      const res = await fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: normalizedUrl, brandName: brand }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit failed');
      setAuditResult(data); fetchHistory();
    } catch (err) { setError(err.message); }
    finally { setAuditLoading(false); }
  };

  const handleRunAudit = async (e) => { e.preventDefault(); if (!auditUrl.trim()) return; await runAuditForUrl(auditUrl, brandNameInput); };

  const handleRunTechFixer = async (e) => {
    e.preventDefault(); if (!fixerUrl.trim()) return;
    setError(''); setDeployError(''); setDeployResult(null); setFixerLoading(true); setFixerResult(null);
    try {
      const res = await fetch('/api/tech-fixer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: fixerUrl.trim(),
          brandName: fixerBrand.trim(),
          githubRepo: fixerRepo.trim(),
          githubToken: fixerToken.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auto Tech Fixer failed');
      setFixerResult(data);
    } catch (err) { setError(err.message); }
    finally { setFixerLoading(false); }
  };

  const handleDeployPr = async () => {
    if (!fixerResult?.prNumber || !fixerRepo.trim()) return;
    setDeployLoading(true);
    setDeployError('');
    try {
      const res = await fetch('/api/tech-fixer/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubRepo: fixerRepo.trim(),
          githubToken: fixerToken.trim(),
          prNumber: fixerResult.prNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deployment merge failed');
      setDeployResult(data);
    } catch (err) { setDeployError(err.message); }
    finally { setDeployLoading(false); }
  };

  const handleCrawlTopPages = async () => {
    const urlsToCrawl = auditResult?.discoveredUrls || [];
    if (urlsToCrawl.length === 0) return;
    setError(''); setMultiCrawlLoading(true); setMultiCrawlResults(null);
    try {
      const responses = await Promise.allSettled(urlsToCrawl.map((pageUrl) => fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: pageUrl, skipSave: true }) }).then((r) => r.json())));
      const pageRows = responses.map((res, idx) => res.status === 'fulfilled' && res.value?.report ? { url: urlsToCrawl[idx], ...res.value.report, wordCount: res.value.wordCount ?? 0 } : { url: urlsToCrawl[idx], error: 'Could not reach page' });
      setMultiCrawlResults(pageRows);
    } catch (err) { setError(err.message || 'Multi-page crawl failed'); }
    finally { setMultiCrawlLoading(false); }
  };

  const handleGenerateFixes = async (targetOverrideUrl = '') => {
    const rawTarget = (targetOverrideUrl || auditUrl).trim();
    if (!rawTarget) return;
    setError(''); setFixLoading(true);
    const normalizedUrl = /^https?:\/\//i.test(rawTarget) ? rawTarget : `https://${rawTarget}`;
    try {
      const res = await fetch('/api/generate-fixes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: normalizedUrl, brandName: brandNameInput }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate fixes');
      setGeneratedFixes(data.fixes);
    } catch (err) { setError(err.message); }
    finally { setFixLoading(false); }
  };

  const handleRunXray = async (e) => {
    e.preventDefault(); if (!xrayUrl.trim()) return;
    setError(''); setXrayLoading(true); setXrayResult(null);
    try {
      const res = await fetch('/api/bot-xray', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: xrayUrl.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI Bot X-Ray failed');
      setXrayResult(data);
    } catch (err) { setError(err.message); }
    finally { setXrayLoading(false); }
  };

  const handleFindSitemap = async (e) => {
    e.preventDefault(); if (!sitemapInputUrl.trim()) return;
    setError(''); setSitemapLoading(true); setSitemapResult(null); setSitemapSearchFilter(''); setSitemapSourceFilter('all');
    try {
      const res = await fetch('/api/sitemap', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: sitemapInputUrl.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sitemap lookup failed');
      setSitemapResult(data);
    } catch (err) { setError(err.message); }
    finally { setSitemapLoading(false); }
  };

  const handleRunBattle = async (e) => {
    e.preventDefault();
    if (!myBattleUrl.trim() || !rivalBattleUrl.trim()) return;
    setError(''); setBattleLoading(true); setBattleResult(null);
    const normalize = (u) => (/^https?:\/\//i.test(u.trim()) ? u.trim() : `https://${u.trim()}`);
    try {
      const [myRes, rivalRes] = await Promise.all([
        fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: normalize(myBattleUrl) }) }),
        fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: normalize(rivalBattleUrl) }) }),
      ]);
      const [myData, rivalData] = await Promise.all([myRes.json(), rivalRes.json()]);
      if (!myRes.ok) throw new Error(myData.error);
      if (!rivalRes.ok) throw new Error(rivalData.error);
      setBattleResult({ myData, rivalData, myUrl: normalize(myBattleUrl), rivalUrl: normalize(rivalBattleUrl) });
      fetchHistory();
    } catch (err) { setError(err.message); }
    finally { setBattleLoading(false); }
  };

  const handleRunGeoBatch = async (e) => {
    e.preventDefault();
    const prompts = geoPromptsInput.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 5);
    if (!geoBrand.trim() || !geoDomain.trim() || prompts.length === 0) return;
    setError(''); setGeoLoading(true); setGeoBatchResult(null);
    const runs = []; const competitorCounts = {};
    try {
      for (let i = 0; i < prompts.length; i++) {
        setGeoProgress(`Analyzing prompt ${i + 1} of ${prompts.length}...`);
        const res = await fetch('/api/geo-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brandName: geoBrand, domain: geoDomain, prompt: prompts[i] }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Prompt ${i + 1} failed`);
        const evalData = data.analysis || data.geoCheck || data;
        const mentioned = Boolean(evalData.brandMentioned ?? evalData.mentioned);
        (evalData.competitorsMentioned || []).forEach((comp) => { const c = comp.trim(); if (c) competitorCounts[c] = (competitorCounts[c] || 0) + 1; });
        runs.push({
          prompt: prompts[i], mentioned,
          sentiment: evalData.sentiment || 'neutral',
          rankPosition: evalData.rankPosition ?? evalData.position ?? null,
          insight: evalData.visibilityInsight || evalData.reasoning || (mentioned ? `${geoBrand} was cited in the AI response.` : `${geoBrand} was not mentioned.`),
          competitors: evalData.competitorsMentioned || [],
          rawResponse: data.geoCheck?.rawResponse || data.rawResponse || '',
          modelUsed: data.modelUsed || data.geoCheck?.llmProvider || 'gemini-3.8-flash',
        });
        if (i < prompts.length - 1) await new Promise((r) => setTimeout(r, 1200));
      }
      const mentionedCount = runs.filter((r) => r.mentioned).length;
      const shareOfVoice = Math.round((mentionedCount / runs.length) * 100);
      const ranked = runs.filter((r) => typeof r.rankPosition === 'number');
      const avgRank = ranked.length > 0 ? (ranked.reduce((s, r) => s + r.rankPosition, 0) / ranked.length).toFixed(1) : null;
      setGeoBatchResult({ brandName: geoBrand, totalPrompts: runs.length, mentionedCount, shareOfVoice, avgRank, topCompetitors: Object.entries(competitorCounts).sort((a, b) => b[1] - a[1]).slice(0, 8), runs });
      fetchHistory();
    } catch (err) { setError(err.message); }
    finally { setGeoLoading(false); setGeoProgress(''); }
  };

  const filteredProjects = selectedProjectId === 'all' ? projects : projects.filter((p) => p.id === selectedProjectId);
  const totalAudits = projects.reduce((s, p) => s + p.audits.length, 0);
  const totalGeoChecks = projects.reduce((s, p) => s + p.geoChecks.length, 0);
  const activeMeta = NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeTab);

  const switchTab = (tabId) => { setActiveTab(tabId); setError(''); if (tabId === 'history') fetchHistory(); };

  return (
    <div className="min-h-screen flex bg-[#09090B] text-zinc-100 print:bg-white print:text-zinc-900 selection:bg-indigo-500/30">
      {/* Ambient gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden print:hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* ==================== SIDEBAR ==================== */}
      <aside className="relative w-64 shrink-0 border-r border-zinc-800/60 bg-[#0C0C0E] hidden lg:flex flex-col justify-between print:hidden">
        <div>
          <div className="h-16 px-5 flex items-center gap-3 border-b border-zinc-800/60">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-zinc-100">Trifecta</p>
              <p className="text-[10px] font-mono text-zinc-500 tracking-widest">SEO • AEO • GEO</p>
            </div>
          </div>

          <nav className="p-3 space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const t = TONES[item.accent];
                    return (
                      <button key={item.id} onClick={() => switchTab(item.id)}
                        className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? `${t.soft} ${t.text} border ${t.border}` : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'}`}>
                        <Icon className={`w-4 h-4 shrink-0 transition ${isActive ? t.text : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.id === 'history' && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 tabular-nums">{projects.length}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800/60 space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>PostgreSQL Connected</span>
          </div>
          <p className="text-[10px] font-mono text-zinc-600">gemini-3.8-flash</p>
        </div>
      </aside>

      {/* ==================== MAIN ==================== */}
      <div className="relative flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 px-6 border-b border-zinc-800/60 bg-[#09090B]/80 backdrop-blur-xl flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500 hidden sm:inline">Command Center</span>
            <span className="text-zinc-700 hidden sm:inline">/</span>
            <span className="font-semibold text-zinc-100">{activeMeta?.label || 'Site Audit'}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export PDF</span>
          </Button>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden px-6 pt-4 print:hidden">
          <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => switchTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-zinc-400 hover:text-zinc-200'}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {item.id === 'history' ? `History (${projects.length})` : item.label}
                </button>
              );
            })}
          </div>
        </div>

        <main className="flex-1 px-6 py-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-zinc-800/60 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100 print:text-zinc-900">
                Unified <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">SEO • AEO • GEO</span> Command Center
              </h1>
              <p className="text-zinc-500 text-sm mt-2 max-w-2xl print:text-zinc-600">
                Audit search readiness, auto-patch technical SEO defects, inspect AI crawler views, duel competitors, and measure LLM Share of Voice.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/5 border border-rose-500/25 text-rose-200 px-5 py-4 rounded-2xl text-sm flex items-start gap-3 print:hidden">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-300">Diagnostic Error</p>
                <p className="text-rose-200/70 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* ==================== AUDIT ==================== */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <Card className="p-5 print:hidden">
                <form onSubmit={handleRunAudit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <Input label="Target Website URL" placeholder="https://example.com" value={auditUrl} onChange={(e) => setAuditUrl(e.target.value)} className="md:col-span-5" required />
                  <Input label="Brand Name (optional)" placeholder="Your Brand" value={brandNameInput} onChange={(e) => setBrandNameInput(e.target.value)} className="md:col-span-4" />
                  <div className="md:col-span-3">
                    <Button type="submit" disabled={auditLoading} className="w-full">
                      <Search className="w-4 h-4" /> {auditLoading ? 'Auditing...' : 'Run Full Audit'}
                    </Button>
                  </div>
                </form>
              </Card>

              {auditResult && (() => {
                const report = auditResult.report || auditResult.scores || auditResult;
                const findings = Array.isArray(report.issues) ? report.issues : Array.isArray(auditResult.diagnostics) ? auditResult.diagnostics : [];
                const discoveredCount = auditResult.discoveredUrls?.length || 0;
                const trifecta = getTrifectaGrade(report.seoScore ?? 0, report.aeoScore ?? 0, report.geoScore ?? 0);
                const t = TONES[trifecta.tone];

                return (
                  <div className="space-y-6">
                    {/* Grade hero */}
                    <Card className="p-6 relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${t.grad} opacity-[0.08]`} />
                      <div className={`absolute top-0 right-0 w-64 h-64 ${t.bg} opacity-10 rounded-full blur-3xl`} />
                      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${t.grad} flex flex-col items-center justify-center shadow-xl`}>
                            <span className="text-2xl font-black text-white leading-none">{trifecta.grade}</span>
                            <span className="text-[10px] font-mono text-white/90 mt-1">{trifecta.score}/100</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                              <Award className="w-3.5 h-3.5" /> Overall Trifecta Readiness
                            </div>
                            <h2 className="text-xl font-bold text-zinc-100 mt-1">{trifecta.label}</h2>
                            <p className="text-sm font-mono text-zinc-400 mt-0.5 truncate">{report.url || auditUrl}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 print:hidden">
                          <Button variant="secondary" size="sm" onClick={() => { setFixerUrl(report.url || auditUrl); setFixerBrand(brandNameInput); switchTab('fixer'); }}>
                            <Wrench className="w-3.5 h-3.5" /> Auto-Fix
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => window.print()}>
                            <Printer className="w-3.5 h-3.5" /> Print PDF
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* 3 pillar cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Traditional SEO', score: report.seoScore ?? 0, tone: 'indigo' },
                        { label: 'AEO Readiness', score: report.aeoScore ?? 0, tone: 'sky' },
                        { label: 'GEO Authority', score: report.geoScore ?? 0, tone: 'emerald' },
                      ].map((item) => {
                        const tone = TONES[item.tone];
                        return (
                          <Card key={item.label} className="p-5" hover>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium text-zinc-500">{item.label}</p>
                                <div className="flex items-baseline gap-1 mt-2">
                                  <span className={`text-3xl font-black tabular-nums ${tone.text}`}>{item.score}</span>
                                  <span className="text-xs font-mono text-zinc-600">/100</span>
                                </div>
                              </div>
                              <ScoreRing score={item.score} size={68} thickness={6} tone={item.tone} />
                            </div>
                            <div className="mt-4 h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                              <div className={`h-full ${tone.bg} rounded-full transition-all duration-1000`} style={{ width: `${item.score}%` }} />
                            </div>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Technical signals bar */}
                    <Card className="p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          {typeof report.hasLlmsTxt === 'boolean' && (
                            <Badge tone={report.hasLlmsTxt ? 'emerald' : 'rose'}>
                              <CircleDot className="w-3 h-3" /> llms.txt: {report.hasLlmsTxt ? 'Detected' : 'Missing'}
                            </Badge>
                          )}
                          {Array.isArray(report.schemaTypes) && (
                            <Badge tone="zinc"><FileCode2 className="w-3 h-3" /> Schemas: {report.schemaTypes.length ? report.schemaTypes.join(', ') : 'None'}</Badge>
                          )}
                          {typeof auditResult.wordCount === 'number' && <Badge tone="sky"><Eye className="w-3 h-3" /> SSR: {auditResult.wordCount} words</Badge>}
                          {typeof auditResult.hasSitemap === 'boolean' && (
                            <Badge tone={auditResult.hasSitemap ? 'emerald' : 'rose'}>
                              <Network className="w-3 h-3" /> sitemap.xml: {auditResult.hasSitemap ? `Detected (${auditResult.sitemapUrlCount || 0})` : 'Missing'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 print:hidden">
                          {discoveredCount > 0 && (
                            <Button variant="secondary" size="sm" onClick={handleCrawlTopPages} disabled={multiCrawlLoading}>
                              <Layers className="w-3.5 h-3.5" /> {multiCrawlLoading ? `Crawling...` : `Crawl ${discoveredCount} Pages`}
                            </Button>
                          )}
                          <Button variant="primary" size="sm" onClick={() => handleGenerateFixes()} disabled={fixLoading}>
                            <Sparkles className="w-3.5 h-3.5" /> {fixLoading ? 'Generating...' : 'Generate AI Fixes'}
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Multi-page matrix */}
                    {multiCrawlResults && (
                      <Card className="overflow-hidden">
                        <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2"><Layers className="w-4 h-4 text-sky-400" /> Multi-Page Audit Matrix</h3>
                          <Badge tone="sky">{multiCrawlResults.length} Pages</Badge>
                        </div>
                        <div className="divide-y divide-zinc-800/40">
                          {multiCrawlResults.map((pg, idx) => (
                            <div key={idx} className="px-5 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs hover:bg-zinc-900/30 transition">
                              <span className="font-mono text-zinc-300 truncate max-w-md">{pg.url}</span>
                              {pg.error ? <span className="text-rose-400">{pg.error}</span> : (
                                <div className="flex flex-wrap items-center gap-2 tabular-nums">
                                  <Badge tone="indigo">SEO {pg.seoScore}</Badge>
                                  <Badge tone="sky">AEO {pg.aeoScore}</Badge>
                                  <Badge tone="emerald">GEO {pg.geoScore}</Badge>
                                  <Badge tone="zinc">{pg.wordCount}w</Badge>
                                  <Badge tone="zinc">{pg.schemaTypes?.length || 0} schemas</Badge>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Bot access */}
                    {auditResult.botAccess && (
                      <Card className="p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mr-2">AI Crawlers:</span>
                          {Object.entries(auditResult.botAccess).map(([bot, status]) => (
                            <Badge key={bot} tone={status === 'Allowed' ? 'emerald' : 'rose'}><Bot className="w-3 h-3" /> {bot}: {status}</Badge>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Findings */}
                    <Card className="p-6 space-y-3">
                      <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-400" /> Diagnostic Findings</h2>
                      {findings.length === 0 ? (
                        <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/25 p-4 rounded-xl text-sm text-emerald-400">
                          <CheckCircle2 className="w-5 h-5 shrink-0" /> <span>All core SEO, AEO, and GEO checks passed.</span>
                        </div>
                      ) : findings.map((item, idx) => {
                        const isStr = typeof item === 'string';
                        const status = isStr ? 'warn' : item.status;
                        const Icon = status === 'pass' ? CheckCircle2 : status === 'warn' ? AlertTriangle : XCircle;
                        const tone = status === 'pass' ? 'emerald' : status === 'warn' ? 'amber' : 'rose';
                        const t = TONES[tone];
                        return (
                          <div key={idx} className={`flex items-start gap-3 ${t.soft} border ${t.border} p-4 rounded-xl`}>
                            <Icon className={`w-4 h-4 ${t.text} shrink-0 mt-0.5`} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-zinc-200">
                                {!isStr && item.pillar ? `[${item.pillar}] ` : ''}
                                {isStr ? item : (item.check || item.title || item.message || item.issue || JSON.stringify(item))}
                              </p>
                              {!isStr && (item.detail || item.description || item.recommendation) && (
                                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.detail || item.description || item.recommendation}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </Card>

                    {/* Generated fixes */}
                    {generatedFixes && (
                      <Card className="p-6 space-y-5 border-indigo-500/25">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25"><Sparkles className="w-4 h-4 text-indigo-400" /></div>
                          <h2 className="text-sm font-semibold text-zinc-100">AI-Generated Assets</h2>
                        </div>
                        {generatedFixes.llmsTxt && <CodeBlock code={generatedFixes.llmsTxt} language="llms.txt" filename="llms.txt" onDownload={handleDownloadFile} onCopy={(c) => handleCopy(c, 'llms')} copied={copiedField === 'llms'} />}
                        {generatedFixes.jsonLdSchema && <CodeBlock code={generatedFixes.jsonLdSchema} language="JSON-LD" filename="schema.json" onDownload={handleDownloadFile} onCopy={(c) => handleCopy(c, 'schema')} copied={copiedField === 'schema'} />}
                        {Array.isArray(generatedFixes.citabilitySnippets) && generatedFixes.citabilitySnippets.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Citability Snippets</h3>
                            <div className="space-y-2.5">
                              {generatedFixes.citabilitySnippets.map((snip, idx) => {
                                const key = `snip-${idx}`;
                                return (
                                  <div key={idx} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-xs font-semibold text-indigo-300">{snip.questionHeading}</p>
                                      <button onClick={() => handleCopy(`${snip.questionHeading}\n${snip.answerFirstParagraph}`, key)} className="text-zinc-400 hover:text-white shrink-0 print:hidden">
                                        {copiedField === key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                    <p className="text-xs text-zinc-300 leading-relaxed mt-2">{snip.answerFirstParagraph}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </Card>
                    )}
                  </div>
                );
              })()}

              {!auditResult && (
                <Card><EmptyState icon={Search} title="No audit results yet" description="Enter a URL above and click 'Run Full Audit' to analyze SEO, AEO, and GEO readiness." /></Card>
              )}
            </div>
          )}

          {/* ==================== FIXER ==================== */}
          {activeTab === 'fixer' && (
            <div className="space-y-6">
              <Card className="p-5 print:hidden">
                <form onSubmit={handleRunTechFixer} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <Input
                      label="Target Website URL"
                      placeholder="https://example.com"
                      value={fixerUrl}
                      onChange={(e) => setFixerUrl(e.target.value)}
                      className="md:col-span-4"
                      required
                    />
                    <Input
                      label="Brand Name (optional)"
                      placeholder="Your Brand"
                      value={fixerBrand}
                      onChange={(e) => setFixerBrand(e.target.value)}
                      className="md:col-span-3"
                    />
                    <Input
                      label="GitHub Repository (owner/repo)"
                      placeholder="suhitha2004/seo-aeo-geo-app"
                      value={fixerRepo}
                      onChange={(e) => setFixerRepo(e.target.value)}
                      className="md:col-span-3"
                    />
                    <Input
                      label="GitHub Token (optional if in .env)"
                      type="password"
                      placeholder="ghp_... (or leave blank)"
                      value={fixerToken}
                      onChange={(e) => setFixerToken(e.target.value)}
                      className="md:col-span-2"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-zinc-800/60">
                    <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Autonomous AI developer crawls the site, generates fixes, and opens a pending PR. Deployment requires explicit human approval.</span>
                    </p>
                    <Button type="submit" disabled={fixerLoading} className="shrink-0">
                      <Wrench className="w-4 h-4" />
                      {fixerLoading ? 'Deep Crawling & Staging PR...' : 'Auto-Fix Site & Stage PR'}
                    </Button>
                  </div>
                </form>
              </Card>

              {fixerResult ? (
                <div className="space-y-6">
                  {/* Human-in-the-Loop Permission Gate Card (Prominently displayed when PR is created) */}
                  {fixerResult.prUrl && (
                    <Card
                      className={`p-6 border-2 relative overflow-hidden transition-all duration-300 ${
                        deployResult?.merged
                          ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/25 to-zinc-900/60'
                          : 'border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-zinc-900/60 shadow-lg shadow-amber-500/5'
                      }`}
                    >
                      {deployResult?.merged ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge tone="emerald">
                              <CheckCircle2 className="w-3.5 h-3.5" /> DEPLOYED LIVE TO PRODUCTION
                            </Badge>
                            <span className="text-xs font-mono text-zinc-400">PR #{deployResult.prNumber} Merged</span>
                          </div>
                          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                            <Rocket className="w-5 h-5 text-emerald-400" />
                            Production Deployment Approved & Merged!
                          </h3>
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            {deployResult.message || `Pull request #${deployResult.prNumber} has been merged into main. Vercel is now deploying production updates live.`}
                          </p>
                          {deployResult.sha && (
                            <p className="text-xs font-mono text-zinc-500">
                              Commit SHA: <span className="text-zinc-300 font-bold">{deployResult.sha.slice(0, 7)}</span> • Repository: <span className="text-emerald-400 font-semibold">{deployResult.repo || fixerRepo} (main)</span>
                            </p>
                          )}
                          <div className="pt-1">
                            <a
                              href={fixerResult.prUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                            >
                              View Merged Pull Request on GitHub <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge tone="amber">
                                <AlertTriangle className="w-3.5 h-3.5" /> MANDATORY HUMAN PERMISSION GATE
                              </Badge>
                              <span className="text-xs font-mono text-zinc-400">Pull Request #{fixerResult.prNumber} Pending Review</span>
                            </div>
                            <a
                              href={fixerResult.prUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
                            >
                              Inspect PR on GitHub <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-zinc-100">
                              Human Approval Required Before Deployment
                            </h3>
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                              An isolated staging branch (<code className="text-indigo-300 font-mono">{fixerResult.branchName}</code>) and a pending Pull Request have been generated without merging. Review the proposed diffs below before deploying fixes live to production.
                            </p>
                          </div>

                          {/* Staged files inventory */}
                          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-2">
                            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                              Committed Staging Files:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(fixerResult.filesChanged || []).map((file, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-900 border border-zinc-700/60 text-zinc-200"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                  {file}
                                </span>
                              ))}
                            </div>
                          </div>

                          {deployError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                              <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                              <span>{deployError}</span>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                if (window.confirm('Cancel and dismiss this deployment gate?')) {
                                  setFixerResult(null);
                                }
                              }}
                              disabled={deployLoading}
                              className="text-zinc-400 hover:text-rose-300"
                            >
                              Reject / Cancel
                            </Button>
                            <Button
                              variant="primary"
                              onClick={handleDeployPr}
                              disabled={deployLoading}
                              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20"
                            >
                              <Rocket className="w-4 h-4" />
                              {deployLoading ? 'Merging & Deploying Live...' : 'Approve & Deploy Fixes Live'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Executive Summary & Crawl Overview */}
                  <Card className="p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-indigo-500/5" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                          <Zap className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Badge tone="emerald">
                              <TrendingUp className="w-3 h-3" /> +{fixerResult.estimatedScoreBoost} pts Est. Gain
                            </Badge>
                            <Badge tone="indigo">{fixerResult.patches?.length || 0} Patches Generated</Badge>
                            {fixerResult.snapshot && (
                              <Badge tone="zinc">
                                {fixerResult.snapshot.totalDiscoveredPages || 1} Pages Discovered
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                            {fixerResult.summary}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        onClick={() =>
                          handleDownloadFile(
                            'seo-patches-bundle.html',
                            `<!-- HEAD PATCH -->\n${fixerResult.headPatchBlock}\n\n<!-- NEXT.JS -->\n${fixerResult.nextjsMetadataPatch}\n\n<!-- LLMS.TXT -->\n${fixerResult.llmsTxtContent}\n\n<!-- ROBOTS.TXT -->\n${fixerResult.robotsTxtContent}\n\n<!-- SITEMAP.XML -->\n${fixerResult.sitemapXmlContent}\n\n<!-- SEO SCHEMA -->\n${fixerResult.seoSchemaJsonContent}`,
                            'text/html'
                          )
                        }
                        className="shrink-0"
                      >
                        <Download className="w-4 h-4" /> Download All Patches
                      </Button>
                    </div>
                  </Card>

                  {/* Production Drop-In Code Switcher (6 files) */}
                  <Card className="p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-semibold text-zinc-100">Production Drop-In Patch Files</h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-zinc-950 border border-zinc-800/60">
                        {[
                          { id: 'html', label: 'HTML <head>' },
                          { id: 'nextjs', label: 'Next.js' },
                          { id: 'llms', label: 'llms.txt' },
                          { id: 'robots', label: 'robots.txt' },
                          { id: 'sitemap', label: 'sitemap.xml' },
                          { id: 'schema', label: 'schema.json' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFixerCodeMode(tab.id)}
                            className={`px-3 py-1.5 rounded-md text-xs font-mono transition ${
                              fixerCodeMode === tab.id
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {(() => {
                      const map = {
                        html: { code: fixerResult.headPatchBlock, file: 'head-patch.html', lang: 'html' },
                        nextjs: { code: fixerResult.nextjsMetadataPatch, file: 'metadata.js', lang: 'javascript' },
                        llms: { code: fixerResult.llmsTxtContent, file: 'llms.txt', lang: 'text' },
                        robots: { code: fixerResult.robotsTxtContent, file: 'robots.txt', lang: 'text' },
                        sitemap: { code: fixerResult.sitemapXmlContent || '', file: 'sitemap.xml', lang: 'xml' },
                        schema: { code: fixerResult.seoSchemaJsonContent || '', file: 'seo-schema.json', lang: 'json' },
                      };
                      const a = map[fixerCodeMode] || map.html;
                      return (
                        <CodeBlock
                          code={a.code}
                          language={a.lang}
                          filename={a.file}
                          onDownload={handleDownloadFile}
                          onCopy={(c) => handleCopy(c, `fixer-${fixerCodeMode}`)}
                          copied={copiedField === `fixer-${fixerCodeMode}`}
                        />
                      );
                    })()}
                  </Card>

                  {/* Issue-by-Issue Before vs After Patches */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      Issue-by-Issue Defects & Proposed Fixes ({fixerResult.patches?.length || 0})
                    </h3>
                    {fixerResult.patches?.map((patch, idx) => (
                      <Card key={patch.id || idx} className="p-5 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              tone={
                                patch.severity === 'critical'
                                  ? 'rose'
                                  : patch.severity === 'warning'
                                    ? 'amber'
                                    : 'sky'
                              }
                            >
                              {patch.severity}
                            </Badge>
                            <span className="text-xs font-mono text-zinc-500">{patch.category}</span>
                            <span className="text-sm font-semibold text-zinc-100">{patch.issueTitle}</span>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500">→ {patch.targetLocation}</span>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed">{patch.explanation}</p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-mono text-rose-400 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> − Current (Before)
                            </span>
                            <pre className="bg-rose-500/5 border border-rose-500/25 rounded-lg p-3 text-xs font-mono text-rose-200/80 overflow-x-auto whitespace-pre-wrap">
                              {patch.currentSnippet}
                            </pre>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> + Proposed Solution (After)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(patch.fixedSnippet, `patch-${idx}`)}
                                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                              >
                                {copiedField === `patch-${idx}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" /> Copy Patch
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="bg-emerald-500/5 border border-emerald-500/25 rounded-lg p-3 text-xs font-mono text-emerald-200 overflow-x-auto whitespace-pre-wrap">
                              {patch.fixedSnippet}
                            </pre>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card>
                  <EmptyState
                    icon={Wrench}
                    title="No auto-fix scan yet"
                    description="Enter a website URL above to deep-crawl the site, generate technical SEO/AEO/GEO fixes, and stage a GitHub Pull Request with mandatory human approval."
                  />
                </Card>
              )}
            </div>
          )}

          {/* ==================== XRAY ==================== */}
          {activeTab === 'xray' && (
            <div className="space-y-6">
              <Card className="p-5">
                <form onSubmit={handleRunXray} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <Input label="Target URL to Inspect" placeholder="https://example.com" value={xrayUrl} onChange={(e) => setXrayUrl(e.target.value)} className="md:col-span-9" required />
                  <div className="md:col-span-3"><Button type="submit" disabled={xrayLoading} className="w-full"><Bot className="w-4 h-4" /> {xrayLoading ? 'Scanning...' : 'Run X-Ray'}</Button></div>
                </form>
              </Card>

              {xrayResult ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard label="Visible Words" value={xrayResult.visibleWords} icon={Gauge} tone="indigo" subtitle={`${xrayResult.scriptCount} scripts stripped`} />
                    <MetricCard label="Text/HTML" value={`${xrayResult.textToHtmlRatio}%`} icon={BarChart3} tone="sky" subtitle="Signal density" />
                    <MetricCard label="JS Risk" value={xrayResult.jsRiskLevel} icon={Shield} tone={xrayResult.jsRiskLevel === 'Low' ? 'emerald' : xrayResult.jsRiskLevel === 'Moderate' ? 'amber' : 'rose'} subtitle="SSR hydration" />
                    <MetricCard label="llms.txt" value={xrayResult.hasLlmsTxt ? 'Valid' : 'Missing'} icon={CheckCircle2} tone={xrayResult.hasLlmsTxt ? 'emerald' : 'rose'} subtitle={`llms-full: ${xrayResult.hasLlmsFullTxt ? 'Yes' : 'No'}`} />
                  </div>

                  <Card className="p-5">
                    <div className="flex items-start gap-3">
                      {xrayResult.jsRiskLevel === 'Low' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">AI Crawler Rendering Assessment</p>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{xrayResult.jsRiskSummary}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-100">llmstxt.org Spec Audit</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'H1 Title', pass: xrayResult.llmsValidation.hasH1Title },
                        { label: 'Blockquote Summary', pass: xrayResult.llmsValidation.hasBlockquoteSummary },
                        { label: 'Markdown Links', pass: xrayResult.llmsValidation.hasMarkdownLinks },
                      ].map((item) => (
                        <div key={item.label} className={`bg-zinc-950 border ${item.pass ? 'border-emerald-500/25' : 'border-rose-500/25'} p-3.5 rounded-xl flex items-center gap-2 text-xs font-mono`}>
                          {item.pass ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                          <span className="text-zinc-300">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <Card className="lg:col-span-5 p-5 space-y-3">
                      <h3 className="text-sm font-semibold text-zinc-100">Heading Tree ({xrayResult.headingOutline.length})</h3>
                      <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
                        {xrayResult.headingOutline.map((h, idx) => (
                          <div key={idx} className="bg-zinc-950 border border-zinc-800/80 px-3 py-2 rounded-lg text-xs flex items-start gap-2">
                            <Badge tone="indigo">{h.tag}</Badge>
                            <span className="text-zinc-200">{h.text}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                    <Card className="lg:col-span-7 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-zinc-100">Raw Crawler Text</h3>
                        <button onClick={() => handleCopy(xrayResult.rawCrawlerText, 'xray-text')} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                          {copiedField === 'xray-text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copiedField === 'xray-text' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 text-xs font-mono text-zinc-300 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700">{xrayResult.rawCrawlerText || 'No readable text found.'}</pre>
                    </Card>
                  </div>

                  <Card className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-100">robots.txt AI Policy Generator</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Choose AI search-only or allow all AI bots</p>
                      </div>
                      <div className="flex gap-1.5 p-1 rounded-lg bg-zinc-950 border border-zinc-800/60">
                        {[{ id: 'search-only', label: 'Search Only' }, { id: 'allow-all', label: 'Allow All' }].map((m) => (
                          <button key={m.id} onClick={() => setRobotsPolicyMode(m.id)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${robotsPolicyMode === m.id ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-zinc-400 hover:text-zinc-200 border border-transparent'}`}>{m.label}</button>
                        ))}
                      </div>
                    </div>
                    {(() => {
                      const content = robotsPolicyMode === 'search-only' ? xrayResult.recommendedSearchFirstRobots : xrayResult.recommendedOpenAiRobots;
                      return <CodeBlock code={content} language="robots.txt" filename="robots.txt" onDownload={handleDownloadFile} onCopy={(c) => handleCopy(c, 'robots-policy')} copied={copiedField === 'robots-policy'} />;
                    })()}
                  </Card>
                </div>
              ) : (
                <Card><EmptyState icon={Bot} title="No X-Ray scan yet" description="Enter a URL above to see how AI crawlers view your page without JavaScript." /></Card>
              )}
            </div>
          )}

          {/* ==================== SITEMAP FINDER & FULL SITE CRAWLER ==================== */}
          {activeTab === 'sitemap' && (
            <div className="space-y-6">
              <Card className="p-5">
                <form onSubmit={handleFindSitemap} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <Input
                    label="Domain or Website URL for Deep Crawl & Sitemap Discovery"
                    placeholder="https://example.com"
                    value={sitemapInputUrl}
                    onChange={(e) => setSitemapInputUrl(e.target.value)}
                    className="md:col-span-9"
                    required
                  />
                  <div className="md:col-span-3">
                    <Button type="submit" disabled={sitemapLoading} className="w-full">
                      <Network className="w-4 h-4" /> {sitemapLoading ? 'Deep Crawling Site...' : 'Deep Crawl & Find Sitemaps'}
                    </Button>
                  </div>
                </form>
              </Card>

              {sitemapResult ? (() => {
                const totalFound = sitemapResult.totalDiscoveredPages || sitemapResult.urls?.length || 0;
                const sitemapCount = sitemapResult.sitemapUrlCount ?? (sitemapResult.found ? sitemapResult.totalUrls : 0);
                const crawledCount = sitemapResult.crawledPagesCount ?? 0;

                const filteredUrls = (sitemapResult.urls || []).filter((item) => {
                  const query = sitemapSearchFilter.toLowerCase();
                  const matchesSearch = item.loc.toLowerCase().includes(query) ||
                    (item.title && item.title.toLowerCase().includes(query));
                  const matchesSource = sitemapSourceFilter === 'all' || item.source === sitemapSourceFilter;
                  return matchesSearch && matchesSource;
                });

                return (
                  <div className="space-y-6">
                    {/* Top 4 Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Prominent Card: Total Website Pages Found */}
                      <Card className="p-5 border-indigo-500/40 bg-gradient-to-b from-indigo-950/30 to-zinc-900/50" hover>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
                            Total Website Pages Found
                          </p>
                          <Badge tone="indigo">True Total</Badge>
                        </div>
                        <p className="text-3xl sm:text-4xl font-black text-indigo-400 mt-2.5 tabular-nums">
                          {totalFound}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>Deduplicated sitemaps & deep spider</span>
                        </p>
                      </Card>

                      {/* XML Sitemap Detection Card */}
                      <Card className="p-5" hover>
                        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                          XML Sitemap Status
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {sitemapResult.found ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                              <span className="text-xl font-bold text-emerald-400">Detected</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-amber-400 shrink-0" />
                              <span className="text-xl font-bold text-amber-400">Not Found</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs font-mono text-zinc-500 mt-2 truncate">
                          {sitemapCount} URLs from XML {sitemapResult.isSitemapIndex ? 'Index' : 'Sitemap'}
                        </p>
                      </Card>

                      {/* Deep Link Spider Card */}
                      <Card className="p-5" hover>
                        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                          Deep Spider Crawl
                        </p>
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span className="text-3xl font-black text-sky-400 tabular-nums">
                            {crawledCount}
                          </span>
                          <span className="text-xs text-zinc-500">pages reachable</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1.5 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>Depth 4 BFS Internal Spider</span>
                        </p>
                      </Card>

                      {/* Sitemap Structure Card */}
                      <Card className="p-5" hover>
                        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                          Sitemap Architecture
                        </p>
                        <p className="text-xl font-bold text-zinc-100 mt-2 truncate">
                          {sitemapResult.isSitemapIndex
                            ? `Index (${sitemapResult.childSitemaps?.length || 0} sub-maps)`
                            : sitemapResult.found
                              ? 'Single URLSet'
                              : 'Spider Discovered Only'}
                        </p>
                        <p className="text-xs font-mono text-zinc-500 mt-2 truncate">
                          {sitemapResult.sitemapUrl || sitemapResult.origin}
                        </p>
                      </Card>
                    </div>

                    {/* Child Sitemaps (if Sitemap Index found) */}
                    {sitemapResult.isSitemapIndex && sitemapResult.childSitemaps?.length > 0 && (
                      <Card className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                            <FolderKanban className="w-4 h-4 text-indigo-400" />
                            Child Sitemaps Parsed Recursively ({sitemapResult.childSitemaps.length})
                          </p>
                          <span className="text-xs font-mono text-zinc-500">
                            All children resolved & deduplicated
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
                          {sitemapResult.childSitemaps.map((child, idx) => (
                            <a
                              key={idx}
                              href={child}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition"
                            >
                              <span className="truncate max-w-xs">{child}</span>
                              <ExternalLink className="w-3 h-3 text-zinc-500 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Complete Searchable Directory Table of Discovered Pages (ALWAYS shown if urls exist!) */}
                    {sitemapResult.urls?.length > 0 && (
                      <Card className="overflow-hidden">
                        <div className="p-4 border-b border-zinc-800/60 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-zinc-100">
                                Discovered Website Pages Directory ({filteredUrls.length} of {totalFound})
                              </h3>
                              <Badge tone="emerald">{totalFound} Pages Total</Badge>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              Searchable index of all pages discovered via recursive sitemaps and BFS link spider
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            {/* Source filter tabs */}
                            <div className="inline-flex rounded-lg bg-zinc-950 border border-zinc-800 p-0.5 text-xs font-mono">
                              {[
                                { id: 'all', label: `All (${totalFound})` },
                                { id: 'both', label: 'Both' },
                                { id: 'sitemap', label: 'Sitemap' },
                                { id: 'crawl', label: 'Spider' },
                              ].map((tab) => (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => setSitemapSourceFilter(tab.id)}
                                  className={`px-2.5 py-1 rounded-md transition ${sitemapSourceFilter === tab.id
                                    ? 'bg-zinc-800 text-white font-medium'
                                    : 'text-zinc-400 hover:text-zinc-200'
                                  }`}
                                >
                                  {tab.label}
                                </button>
                              ))}
                            </div>

                            {/* Search filter input */}
                            <input
                              type="text"
                              placeholder="Filter by path / title..."
                              value={sitemapSearchFilter}
                              onChange={(e) => setSitemapSearchFilter(e.target.value)}
                              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 w-44"
                            />

                            {/* Export URL list */}
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                let host = 'site';
                                try { host = new URL(sitemapResult.origin).hostname; } catch { }
                                handleDownloadFile(
                                  `${host}-all-discovered-urls.txt`,
                                  filteredUrls.map((u) => u.loc).join('\n')
                                );
                              }}
                            >
                              <Download className="w-3.5 h-3.5" /> Export URLs
                            </Button>

                            {/* Download complete XML sitemap */}
                            {sitemapResult.generatedXml && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  handleDownloadFile(
                                    'sitemap.xml',
                                    sitemapResult.generatedXml,
                                    'application/xml'
                                  )
                                }
                              >
                                <FileCode2 className="w-3.5 h-3.5 text-indigo-400" /> Download XML
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* URLs List */}
                        <div className="max-h-[30rem] overflow-y-auto divide-y divide-zinc-800/40 scrollbar-thin scrollbar-thumb-zinc-700">
                          {filteredUrls.length === 0 ? (
                            <div className="p-8 text-center text-xs text-zinc-500">
                              No pages matching &quot;{sitemapSearchFilter}&quot;
                            </div>
                          ) : (
                            filteredUrls.map((item, idx) => (
                              <div
                                key={idx}
                                className="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs hover:bg-zinc-900/30 transition"
                              >
                                <div className="min-w-0 space-y-1">
                                  <div className="flex items-center gap-2">
                                    {item.source === 'both' ? (
                                      <Badge tone="emerald">Sitemap + Spider</Badge>
                                    ) : item.source === 'sitemap' ? (
                                      <Badge tone="indigo">In Sitemap</Badge>
                                    ) : (
                                      <Badge tone="sky">Spider Crawled</Badge>
                                    )}
                                    <a
                                      href={item.loc}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-zinc-200 hover:text-indigo-400 font-mono flex items-center gap-1.5 truncate"
                                    >
                                      <span className="truncate">{item.loc}</span>
                                      <ExternalLink className="w-3 h-3 shrink-0 text-zinc-500" />
                                    </a>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-500">
                                    {item.title && (
                                      <span className="text-zinc-400 truncate max-w-xs">
                                        Title: {item.title}
                                      </span>
                                    )}
                                    {typeof item.depth === 'number' && (
                                      <span>Depth: {item.depth}</span>
                                    )}
                                    {item.lastmod && <span>Modified: {item.lastmod}</span>}
                                    {item.changefreq && <span>Freq: {item.changefreq}</span>}
                                    {item.priority && <span>Priority: {item.priority}</span>}
                                  </div>
                                </div>

                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setAuditUrl(item.loc);
                                    setActiveTab('audit');
                                    runAuditForUrl(item.loc);
                                  }}
                                  className="shrink-0 self-start sm:self-auto"
                                >
                                  Audit Page
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </Card>
                    )}

                    {/* Complete Generated XML Sitemap */}
                    {sitemapResult.generatedXml && (
                      <Card className="p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <FileCode2 className="w-4 h-4 text-indigo-400" />
                              <h3 className="text-sm font-semibold text-zinc-100">
                                Complete XML Sitemap ({totalFound} Pages)
                              </h3>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              Production-ready XML sitemap combining all recursive child sitemaps and deep crawler findings
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                handleDownloadFile(
                                  'sitemap.xml',
                                  sitemapResult.generatedXml,
                                  'application/xml'
                                )
                              }
                            >
                              <Download className="w-3.5 h-3.5" /> Download sitemap.xml
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleCopy(sitemapResult.generatedXml, 'gen-sitemap')}
                            >
                              {copiedField === 'gen-sitemap' ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied XML
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copy XML
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        <pre className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
                          {sitemapResult.generatedXml}
                        </pre>
                      </Card>
                    )}
                  </div>
                );
              })() : (
                <Card>
                  <EmptyState
                    icon={Network}
                    title="No sitemap scan yet"
                    description="Enter a domain above to perform a deep recursive crawl, discover all child sitemaps, and find the true total page count."
                  />
                </Card>
              )}
            </div>
          )}

          {/* ==================== BATTLE ==================== */}
          {activeTab === 'battle' && (
            <div className="space-y-6">
              <Card className="p-5 print:hidden">
                <form onSubmit={handleRunBattle} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <Input label="Your Website URL" placeholder="https://yoursite.com" value={myBattleUrl} onChange={(e) => setMyBattleUrl(e.target.value)} className="md:col-span-4" required />
                  <Input label="Competitor URL" placeholder="https://competitor.com" value={rivalBattleUrl} onChange={(e) => setRivalBattleUrl(e.target.value)} className="md:col-span-5" required />
                  <div className="md:col-span-3"><Button type="submit" disabled={battleLoading} className="w-full"><Swords className="w-4 h-4" /> {battleLoading ? 'Comparing...' : 'Run Duel'}</Button></div>
                </form>
              </Card>

              {battleResult ? (() => {
                const myRep = battleResult.myData.report;
                const rivalRep = battleResult.rivalData.report;
                const myDomain = battleResult.myData.project.domain;
                const rivalDomain = battleResult.rivalData.project.domain;
                const myTotal = myRep.seoScore + myRep.aeoScore + myRep.geoScore;
                const rivalTotal = rivalRep.seoScore + rivalRep.aeoScore + rivalRep.geoScore;
                const iWin = myTotal > rivalTotal;
                const theyWin = rivalTotal > myTotal;

                const rows = [
                  { label: 'SEO Score', mine: myRep.seoScore, theirs: rivalRep.seoScore, suffix: '/100' },
                  { label: 'AEO Score', mine: myRep.aeoScore, theirs: rivalRep.aeoScore, suffix: '/100' },
                  { label: 'GEO Score', mine: myRep.geoScore, theirs: rivalRep.geoScore, suffix: '/100' },
                  { label: 'llms.txt', mine: myRep.hasLlmsTxt ? 1 : 0, theirs: rivalRep.hasLlmsTxt ? 1 : 0, bool: true },
                  { label: 'Schemas', mine: myRep.schemaTypes?.length || 0, theirs: rivalRep.schemaTypes?.length || 0 },
                  { label: 'Sitemap', mine: battleResult.myData.hasSitemap ? 1 : 0, theirs: battleResult.rivalData.hasSitemap ? 1 : 0, bool: true },
                  { label: 'SSR Words', mine: battleResult.myData.wordCount ?? 0, theirs: battleResult.rivalData.wordCount ?? 0 },
                ];

                const gaps = [];
                if (!myRep.hasLlmsTxt && rivalRep.hasLlmsTxt) gaps.push(`${rivalDomain} publishes /llms.txt — your site is missing one.`);
                if ((myRep.schemaTypes?.length || 0) < (rivalRep.schemaTypes?.length || 0)) gaps.push(`${rivalDomain} has richer structured schemas.`);
                if (!battleResult.myData.hasSitemap && battleResult.rivalData.hasSitemap) gaps.push(`${rivalDomain} exposes a valid /sitemap.xml.`);
                if (myRep.geoScore < rivalRep.geoScore) gaps.push(`${rivalDomain} leads in GEO by +${rivalRep.geoScore - myRep.geoScore} points.`);

                return (
                  <div className="space-y-6">
                    <Card className="p-6 relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-r ${iWin ? 'from-emerald-500/10 via-emerald-500/5 to-transparent' : theyWin ? 'from-rose-500/10 via-rose-500/5 to-transparent' : 'from-amber-500/10 to-transparent'}`} />
                      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${iWin ? 'bg-emerald-500/15 border-emerald-500/30' : theyWin ? 'bg-rose-500/15 border-rose-500/30' : 'bg-amber-500/15 border-amber-500/30'} border`}>
                            <Trophy className={`w-6 h-6 ${iWin ? 'text-emerald-400' : theyWin ? 'text-rose-400' : 'text-amber-400'}`} />
                          </div>
                          <div>
                            <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Overall Winner</p>
                            <h2 className="text-xl font-bold text-zinc-100">{iWin ? `${myDomain} Wins!` : theyWin ? `${rivalDomain} Leads` : 'Tie Game'}</h2>
                            <p className="text-sm font-mono text-zinc-400 mt-0.5">{myTotal} vs {rivalTotal} points</p>
                          </div>
                        </div>
                        <Button variant="primary" size="sm" onClick={() => { setAuditUrl(battleResult.myUrl); setBrandNameInput(myDomain); setActiveTab('audit'); handleGenerateFixes(battleResult.myUrl); }}>
                          <Sparkles className="w-3.5 h-3.5" /> Generate Fixes
                        </Button>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="grid grid-cols-12 bg-zinc-950/60 border-b border-zinc-800/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider">
                        <div className="col-span-4 text-zinc-500">Dimension</div>
                        <div className="col-span-4 text-indigo-400">{myDomain}</div>
                        <div className="col-span-4 text-amber-400">{rivalDomain}</div>
                      </div>
                      <div className="divide-y divide-zinc-800/40">
                        {rows.map((row, idx) => {
                          const myW = row.mine > row.theirs;
                          const rW = row.theirs > row.mine;
                          return (
                            <div key={idx} className="grid grid-cols-12 px-5 py-3.5 text-sm items-center gap-2 tabular-nums hover:bg-zinc-900/20 transition">
                              <div className="col-span-4 text-xs font-medium text-zinc-400">{row.label}</div>
                              <div className={`col-span-4 text-xs font-mono font-semibold flex items-center gap-1 ${myW ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                {row.bool ? (row.mine ? 'Yes' : 'No') : row.mine}{row.suffix || ''}{myW && <Trophy className="w-3 h-3" />}
                              </div>
                              <div className={`col-span-4 text-xs font-mono font-semibold flex items-center gap-1 ${rW ? 'text-amber-400' : 'text-zinc-300'}`}>
                                {row.bool ? (row.theirs ? 'Yes' : 'No') : row.theirs}{row.suffix || ''}{rW && <Trophy className="w-3 h-3" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    <Card className="p-6 space-y-3">
                      <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2"><Target className="w-4 h-4 text-amber-400" /> Competitive Gap Analysis</h3>
                      {gaps.length === 0 ? (
                        <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/25 p-4 rounded-xl text-sm text-emerald-400"><CheckCircle2 className="w-5 h-5 shrink-0" /><span>{myDomain} matches or outperforms {rivalDomain} across all checks.</span></div>
                      ) : gaps.map((gap, i) => (
                        <div key={i} className="flex items-start gap-3 bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl text-sm text-zinc-300">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> <span>{gap}</span>
                        </div>
                      ))}
                    </Card>
                  </div>
                );
              })() : (
                <Card><EmptyState icon={Swords} title="No duel yet" description="Enter your URL and a competitor URL to run a head-to-head comparison." /></Card>
              )}
            </div>
          )}

          {/* ==================== GEO ==================== */}
          {activeTab === 'geo' && (
            <div className="space-y-6">
              <Card className="p-5 print:hidden">
                <form onSubmit={handleRunGeoBatch} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Target Brand Name" placeholder="Your Brand" value={geoBrand} onChange={(e) => setGeoBrand(e.target.value)} required />
                    <Input label="Brand Domain" placeholder="yoursite.com" value={geoDomain} onChange={(e) => setGeoDomain(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-zinc-400">Buyer-Intent AI Prompts (1-5)</label>
                      <button type="button" onClick={() => setGeoPromptsInput(`Best AI automation companies in India\nTop MVP development agencies for startups\nLeading enterprise AI consulting firms`)} className="text-xs text-indigo-400 hover:text-indigo-300">+ Fill Samples</button>
                    </div>
                    <textarea rows={4} placeholder="One prompt per line..." value={geoPromptsInput} onChange={(e) => setGeoPromptsInput(e.target.value)} className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15 leading-relaxed transition-all" required />
                  </div>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <span className="text-xs text-zinc-500 flex items-center gap-1.5">{geoProgress && <span className="animate-pulse h-2 w-2 rounded-full bg-indigo-400" />}{geoProgress || 'Runs up to 5 prompts and calculates AI Share of Voice.'}</span>
                    <Button type="submit" disabled={geoLoading} className="shrink-0"><BarChart3 className="w-4 h-4" /> {geoLoading ? 'Running...' : 'Measure Share of Voice'}</Button>
                  </div>
                </form>
              </Card>

              {geoBatchResult ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard label="Share of Voice" value={`${geoBatchResult.shareOfVoice}%`} icon={BarChart3} tone="emerald" subtitle={`${geoBatchResult.mentionedCount}/${geoBatchResult.totalPrompts} prompts`} />
                    <MetricCard label="Avg Rank" value={geoBatchResult.avgRank ? `#${geoBatchResult.avgRank}` : '—'} icon={TrendingUp} tone="indigo" subtitle="Across ranked recs" />
                    <MetricCard label="Competitors" value={geoBatchResult.topCompetitors.length} icon={Target} tone="amber" subtitle="Unique rivals cited" />
                  </div>

                  {geoBatchResult.topCompetitors.length > 0 && (
                    <Card className="p-5 space-y-3">
                      <h3 className="text-sm font-semibold text-zinc-100">Citation Leaderboard</h3>
                      <div className="flex flex-wrap gap-2">
                        {geoBatchResult.topCompetitors.map(([name, count], idx) => (
                          <Badge key={idx} tone="amber"><span className="font-semibold">{name}</span><span className="ml-1 text-amber-300">{count}x</span></Badge>
                        ))}
                      </div>
                    </Card>
                  )}

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-100">Prompt Breakdown</h3>
                    {geoBatchResult.runs.map((run, idx) => {
                      const key = `batch-${idx}`;
                      const isOpen = !!expandedItems[key];
                      return (
                        <Card key={idx} className="p-5 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <p className="text-sm font-medium text-zinc-100">{idx + 1}. &quot;{run.prompt}&quot;</p>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge tone={run.mentioned ? 'emerald' : 'rose'}>{run.mentioned ? (run.rankPosition ? `#${run.rankPosition}` : 'Mentioned') : 'Not Mentioned'}</Badge>
                              <Badge tone="zinc">{run.sentiment}</Badge>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">{run.insight}</p>
                          <button onClick={() => toggleExpand(key)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 print:hidden">
                            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />} {isOpen ? 'Hide' : 'View'} Raw Answer ({run.modelUsed})
                          </button>
                          {isOpen && <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 text-xs font-mono text-zinc-300 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700">{run.rawResponse}</div>}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Card><EmptyState icon={MessageSquare} title="No GEO analysis yet" description="Enter your brand and buyer-intent prompts to measure your AI Share of Voice." /></Card>
              )}
            </div>
          )}

          {/* ==================== HISTORY ==================== */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Projects" value={projects.length} icon={FolderKanban} tone="indigo" />
                <MetricCard label="Site Audits" value={totalAudits} icon={Search} tone="sky" />
                <MetricCard label="GEO Checks" value={totalGeoChecks} icon={MessageSquare} tone="emerald" />
                <Card className="p-4 flex items-center print:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/60">
                      <option value="all">All ({projects.length})</option>
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.brandName}</option>)}
                    </select>
                    <Button variant="secondary" size="icon" onClick={fetchHistory} disabled={historyLoading} title="Refresh"><RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} /></Button>
                  </div>
                </Card>
              </div>

              {filteredProjects.length === 0 ? (
                <Card><EmptyState icon={FolderKanban} title="No saved records" description="Run a Site Audit or GEO Citation Check to save records into PostgreSQL." /></Card>
              ) : filteredProjects.map((project) => (
                <Card key={project.id} className="p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25"><Globe className="w-4 h-4 text-indigo-400" /></div>
                      <div>
                        <h2 className="text-base font-semibold text-zinc-100">{project.brandName}</h2>
                        <p className="text-xs font-mono text-zinc-500">{project.domain}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                      <Badge tone="zinc">{project.audits.length} Audits • {project.geoChecks.length} GEO</Badge>
                      <Button variant="secondary" size="sm" onClick={() => handleExportProjectMarkdown(project)}><Download className="w-3.5 h-3.5" /> Export</Button>
                      <Button variant="danger" size="icon" onClick={() => handleDeleteRecord(project.id, 'project', `project "${project.brandName}"`)} disabled={deletingId === project.id}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>

                  <ScoreTrendChart audits={project.audits} />

                  {project.audits.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Saved Audits</h3>
                      <div className="space-y-2">
                        {project.audits.map((audit) => {
                          const isOpen = !!expandedItems[audit.id];
                          const diagnostics = Array.isArray(audit.issues) ? audit.issues : [];
                          return (
                            <div key={audit.id} className="bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-hidden">
                              <div className="flex items-center justify-between pr-3">
                                <button onClick={() => toggleExpand(audit.id)} className="flex-1 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-left hover:bg-zinc-900/30 transition">
                                  <div className="space-y-1 min-w-0">
                                    <p className="text-xs font-mono text-zinc-400 truncate">{audit.url} • {new Date(audit.createdAt).toLocaleString()}</p>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge tone="indigo">SEO {audit.seoScore}</Badge>
                                      <Badge tone="sky">AEO {audit.aeoScore}</Badge>
                                      <Badge tone="emerald">GEO {audit.geoScore}</Badge>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
                                    <span>{isOpen ? 'Hide' : 'Details'}</span>
                                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </div>
                                </button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteRecord(audit.id, 'audit', 'site audit')} disabled={deletingId === audit.id} className="text-zinc-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></Button>
                              </div>
                              {isOpen && (
                                <div className="px-4 pb-4 pt-3 border-t border-zinc-800/60 space-y-3">
                                  <div className="flex flex-wrap gap-2">
                                    <Badge tone={audit.hasLlmsTxt ? 'emerald' : 'rose'}>llms.txt: {audit.hasLlmsTxt ? 'Yes' : 'No'}</Badge>
                                    <Badge tone="zinc">Schemas: {audit.schemaTypes?.length ? audit.schemaTypes.join(', ') : 'None'}</Badge>
                                  </div>
                                  {diagnostics.length > 0 && (
                                    <div className="space-y-2">
                                      {diagnostics.map((item, idx) => {
                                        const isStr = typeof item === 'string';
                                        const status = isStr ? 'warn' : item.status;
                                        const Icon = status === 'pass' ? CheckCircle2 : status === 'warn' ? AlertTriangle : XCircle;
                                        const tone = status === 'pass' ? 'emerald' : status === 'warn' ? 'amber' : 'rose';
                                        const t = TONES[tone];
                                        return (
                                          <div key={idx} className={`flex items-start gap-2.5 ${t.soft} border ${t.border} p-3 rounded-lg text-xs`}>
                                            <Icon className={`w-4 h-4 ${t.text} shrink-0 mt-0.5`} />
                                            <div className="min-w-0">
                                              <p className="font-medium text-zinc-200">{!isStr && item.pillar ? `[${item.pillar}] ` : ''}{isStr ? item : (item.check || item.title || item.message || item.issue || item.name)}</p>
                                              {!isStr && (item.detail || item.description || item.recommendation) && <p className="text-zinc-400 mt-0.5">{item.detail || item.description || item.recommendation}</p>}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {project.geoChecks.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">GEO Citation History</h3>
                      <div className="space-y-2">
                        {project.geoChecks.map((check) => {
                          const isOpen = !!expandedItems[check.id];
                          return (
                            <div key={check.id} className="bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-hidden">
                              <div className="flex items-center justify-between pr-3">
                                <button onClick={() => toggleExpand(check.id)} className="flex-1 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left hover:bg-zinc-900/30 transition">
                                  <div className="space-y-1 min-w-0">
                                    <p className="text-xs text-zinc-200 truncate">&quot;{check.prompt}&quot;</p>
                                    <p className="text-[11px] font-mono text-zinc-500">{new Date(check.createdAt).toLocaleString()}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Badge tone={check.brandMentioned ? 'emerald' : 'rose'}>{check.brandMentioned ? 'Cited' : 'Not Cited'}</Badge>
                                    <Badge tone="zinc">{check.sentiment || 'neutral'}</Badge>
                                  </div>
                                </button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteRecord(check.id, 'geo', 'GEO check')} disabled={deletingId === check.id} className="text-zinc-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></Button>
                              </div>
                              {isOpen && check.rawResponse && (
                                <div className="px-4 pb-4 pt-3 border-t border-zinc-800/60">
                                  <pre className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700">{check.rawResponse}</pre>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}