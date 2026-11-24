'use client';

import { useState, useEffect } from 'react';
import ScoreTrendChart from '@/components/ScoreTrendChart';
import {
  Search,
  MessageSquare,
  History,
  Swords,
  Layers,
  Network,
  Bot,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Trophy,
  Copy,
  Check,
  Globe,
  RefreshCw,
  FolderKanban,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  BarChart3,
  Printer,
  Award,
  ExternalLink,
} from 'lucide-react';

function getTrifectaGrade(seo = 0, aeo = 0, geo = 0) {
  const weighted = Math.round(seo * 0.3 + aeo * 0.35 + geo * 0.35);
  if (weighted >= 90)
    return {
      score: weighted,
      grade: 'A+',
      label: 'AI & Search Leader',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    };
  if (weighted >= 80)
    return {
      score: weighted,
      grade: 'A',
      label: 'Strong Readiness',
      color: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
    };
  if (weighted >= 65)
    return {
      score: weighted,
      grade: 'B',
      label: 'Moderate AI Visibility',
      color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    };
  if (weighted >= 50)
    return {
      score: weighted,
      grade: 'C',
      label: 'Needs AEO / GEO Fixes',
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    };
  return {
    score: weighted,
    grade: 'D',
    label: 'Critical AI Visibility Gaps',
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  };
}

const NAV_GROUPS = [
  {
    label: 'Diagnostics',
    items: [
      { id: 'audit', label: 'Site Audit', icon: Search },
      { id: 'xray', label: 'AI Bot X-Ray', icon: Bot },
      { id: 'sitemap', label: 'Sitemap Finder', icon: Network },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'battle', label: 'Competitor Duel', icon: Swords },
      { id: 'geo', label: 'GEO Share of Voice', icon: MessageSquare },
      { id: 'history', label: 'History', icon: History },
    ],
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'xray' | 'sitemap' | 'battle' | 'geo' | 'history'

  // Module 1: Site Audit, Multi-Page Crawler & Fixer State
  const [auditUrl, setAuditUrl] = useState('');
  const [brandNameInput, setBrandNameInput] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [multiCrawlLoading, setMultiCrawlLoading] = useState(false);
  const [multiCrawlResults, setMultiCrawlResults] = useState(null);
  const [fixLoading, setFixLoading] = useState(false);
  const [generatedFixes, setGeneratedFixes] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  // Module 2: AI Bot X-Ray (llms.txt & Crawler Simulator) State
  const [xrayUrl, setXrayUrl] = useState('');
  const [xrayLoading, setXrayLoading] = useState(false);
  const [xrayResult, setXrayResult] = useState(null);
  const [robotsPolicyMode, setRobotsPolicyMode] = useState('search-only'); // 'search-only' | 'allow-all'

  // Module 3: Standalone Sitemap Finder & Generator State
  const [sitemapInputUrl, setSitemapInputUrl] = useState('');
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [sitemapResult, setSitemapResult] = useState(null);
  const [sitemapSearchFilter, setSitemapSearchFilter] = useState('');

  // Module 4: Competitor Battleground State
  const [myBattleUrl, setMyBattleUrl] = useState('');
  const [rivalBattleUrl, setRivalBattleUrl] = useState('');
  const [battleLoading, setBattleLoading] = useState(false);
  const [battleResult, setBattleResult] = useState(null);

  // Module 5: Multi-Prompt GEO Share of Voice & Citation Tracker State
  const [geoBrand, setGeoBrand] = useState('');
  const [geoDomain, setGeoDomain] = useState('');
  const [geoPromptsInput, setGeoPromptsInput] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoProgress, setGeoProgress] = useState('');
  const [geoBatchResult, setGeoBatchResult] = useState(null);

  // Module 6: Persistent History & Expandable Details State
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [deletingId, setDeletingId] = useState('');

  // Shared Error State
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (res.ok && data.projects) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleDownloadFile = (filename, content, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteRecord = async (id, type, label) => {
    if (!window.confirm(`Delete this ${label} permanently from Neon PostgreSQL?`)) return;

    setDeletingId(id);
    setError('');
    try {
      const res = await fetch(`/api/history/${id}?type=${type}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      if (type === 'project' && selectedProjectId === id) {
        setSelectedProjectId('all');
      }
      await fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId('');
    }
  };

  const handleExportProjectMarkdown = (project) => {
    const lines = [
      `# Unified SEO • AEO • GEO Report: ${project.brandName}`,
      `- **Domain:** ${project.domain}`,
      `- **Generated:** ${new Date().toLocaleString()}`,
      '',
      `## Saved Site Audits (${project.audits.length})`,
    ];

    if (project.audits.length === 0) {
      lines.push('_No site audits recorded yet._');
    } else {
      project.audits.forEach((a, idx) => {
        lines.push(
          `### ${idx + 1}. ${a.url} (${new Date(a.createdAt).toLocaleDateString()})`,
          `- **SEO Score:** ${a.seoScore}/100 | **AEO Score:** ${a.aeoScore}/100 | **GEO Score:** ${a.geoScore}/100`,
          `- **llms.txt Present:** ${a.hasLlmsTxt ? 'Yes' : 'No'}`,
          `- **Detected Schemas:** ${a.schemaTypes?.length ? a.schemaTypes.join(', ') : 'None'}`,
          ''
        );
        if (Array.isArray(a.issues) && a.issues.length > 0) {
          lines.push('**Diagnostics:**');
          a.issues.forEach((iss) => {
            if (typeof iss === 'string') {
              lines.push(`- ${iss}`);
            } else {
              lines.push(
                `- [${(iss.status || iss.severity || 'info').toUpperCase()}] **${iss.check || iss.title || iss.message || 'Check'}**: ${iss.detail || iss.description || ''}`
              );
            }
          });
          lines.push('');
        }
      });
    }

    lines.push(`## GEO Citation Checks (${project.geoChecks.length})`);
    if (project.geoChecks.length === 0) {
      lines.push('_No GEO citation checks recorded yet._');
    } else {
      project.geoChecks.forEach((c, idx) => {
        lines.push(
          `### ${idx + 1}. Prompt: "${c.prompt}"`,
          `- **Date:** ${new Date(c.createdAt).toLocaleString()}`,
          `- **AI Provider:** ${c.llmProvider || 'Gemini 3.8 Flash'}`,
          `- **Brand Mentioned:** ${c.brandMentioned ? 'Yes' : 'No'}`,
          `- **Sentiment:** ${c.sentiment || 'Neutral'}`,
          c.citedUrls?.length ? `- **Cited URLs:** ${c.citedUrls.join(', ')}` : '',
          '',
          '**Raw AI Response:**',
          '```text',
          c.rawResponse || '',
          '```',
          ''
        );
      });
    }

    const blob = new Blob([lines.filter(Boolean).join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.domain.replace(/[^a-z0-9.-]/gi, '_')}-seo-aeo-geo-report.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Module 1 Handler: Single-Page Audit
  const runAuditForUrl = async (targetUrl, brand = '') => {
    setError('');
    setAuditLoading(true);
    setAuditResult(null);
    setMultiCrawlResults(null);
    setGeneratedFixes(null);

    const normalizedUrl = /^https?:\/\//i.test(targetUrl.trim())
      ? targetUrl.trim()
      : `https://${targetUrl.trim()}`;

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl, brandName: brand }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit failed');
      setAuditResult(data);
      fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleRunAudit = async (e) => {
    e.preventDefault();
    if (!auditUrl.trim()) return;
    await runAuditForUrl(auditUrl, brandNameInput);
  };

  // Module 1B Handler: Crawl Top 5 Sitemap / Internal Pages
  const handleCrawlTopPages = async () => {
    const urlsToCrawl = auditResult?.discoveredUrls || [];
    if (urlsToCrawl.length === 0) return;

    setError('');
    setMultiCrawlLoading(true);
    setMultiCrawlResults(null);

    try {
      const responses = await Promise.allSettled(
        urlsToCrawl.map((pageUrl) =>
          fetch('/api/audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: pageUrl, skipSave: true }),
          }).then((r) => r.json())
        )
      );

      const pageRows = responses.map((res, idx) => {
        if (res.status === 'fulfilled' && res.value?.report) {
          return {
            url: urlsToCrawl[idx],
            ...res.value.report,
            wordCount: res.value.wordCount ?? 0,
          };
        }
        return {
          url: urlsToCrawl[idx],
          error: 'Could not reach page',
        };
      });

      setMultiCrawlResults(pageRows);
    } catch (err) {
      setError(err.message || 'Multi-page crawl failed');
    } finally {
      setMultiCrawlLoading(false);
    }
  };

  const handleGenerateFixes = async (targetOverrideUrl = '') => {
    const rawTarget = (targetOverrideUrl || auditUrl).trim();
    if (!rawTarget) return;

    setError('');
    setFixLoading(true);

    const normalizedUrl = /^https?:\/\//i.test(rawTarget)
      ? rawTarget
      : `https://${rawTarget}`;

    try {
      const res = await fetch('/api/generate-fixes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl, brandName: brandNameInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate fixes');
      setGeneratedFixes(data.fixes);
    } catch (err) {
      setError(err.message);
    } finally {
      setFixLoading(false);
    }
  };

  // Module 2 Handler: AI Bot X-Ray
  const handleRunXray = async (e) => {
    e.preventDefault();
    if (!xrayUrl.trim()) return;

    setError('');
    setXrayLoading(true);
    setXrayResult(null);

    try {
      const res = await fetch('/api/bot-xray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: xrayUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI Bot X-Ray failed');
      setXrayResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setXrayLoading(false);
    }
  };

  // Module 3 Handler: Standalone Sitemap Finder & Generator
  const handleFindSitemap = async (e) => {
    e.preventDefault();
    if (!sitemapInputUrl.trim()) return;

    setError('');
    setSitemapLoading(true);
    setSitemapResult(null);
    setSitemapSearchFilter('');

    try {
      const res = await fetch('/api/sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sitemapInputUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sitemap lookup failed');
      setSitemapResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSitemapLoading(false);
    }
  };

  // Module 4 Handler: Head-to-Head Competitor Battleground
  const handleRunBattle = async (e) => {
    e.preventDefault();
    if (!myBattleUrl.trim() || !rivalBattleUrl.trim()) return;

    setError('');
    setBattleLoading(true);
    setBattleResult(null);

    const normalize = (u) => (/^https?:\/\//i.test(u.trim()) ? u.trim() : `https://${u.trim()}`);
    const myUrl = normalize(myBattleUrl);
    const rivalUrl = normalize(rivalBattleUrl);

    try {
      const [myRes, rivalRes] = await Promise.all([
        fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: myUrl }),
        }),
        fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: rivalUrl }),
        }),
      ]);

      const [myData, rivalData] = await Promise.all([myRes.json(), rivalRes.json()]);
      if (!myRes.ok) throw new Error(myData.error || `Failed to audit ${myUrl}`);
      if (!rivalRes.ok) throw new Error(rivalData.error || `Failed to audit ${rivalUrl}`);

      setBattleResult({ myData, rivalData, myUrl, rivalUrl });
      fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setBattleLoading(false);
    }
  };

  // Module 5 Handler: Multi-Prompt Batch Runner & AI Share of Voice (%)
  const handleRunGeoBatch = async (e) => {
    e.preventDefault();
    const prompts = geoPromptsInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 5);

    if (!geoBrand.trim() || !geoDomain.trim() || prompts.length === 0) return;

    setError('');
    setGeoLoading(true);
    setGeoBatchResult(null);

    const runs = [];
    const competitorCounts = {};

    try {
      for (let i = 0; i < prompts.length; i++) {
        const currentPrompt = prompts[i];
        setGeoProgress(`Simulating prompt ${i + 1} of ${prompts.length}...`);

        const res = await fetch('/api/geo-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandName: geoBrand,
            domain: geoDomain,
            prompt: currentPrompt,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Prompt ${i + 1} failed`);

        const evalData = data.analysis || data.geoCheck || data;
        const mentioned = Boolean(evalData.brandMentioned ?? evalData.mentioned);
        const competitors = evalData.competitorsMentioned || [];

        competitors.forEach((comp) => {
          const cleanComp = comp.trim();
          if (cleanComp) {
            competitorCounts[cleanComp] = (competitorCounts[cleanComp] || 0) + 1;
          }
        });

        runs.push({
          prompt: currentPrompt,
          mentioned,
          sentiment: evalData.sentiment || 'neutral',
          rankPosition: evalData.rankPosition ?? evalData.position ?? null,
          insight:
            evalData.visibilityInsight ||
            evalData.reasoning ||
            (mentioned
              ? `${geoBrand} was cited directly in the AI response.`
              : `${geoBrand} was not mentioned in the AI response.`),
          competitors,
          rawResponse: data.geoCheck?.rawResponse || data.rawResponse || '',
          modelUsed: data.modelUsed || data.geoCheck?.llmProvider || 'gemini-3.8-flash',
        });

        if (i < prompts.length - 1) {
          await new Promise((r) => setTimeout(r, 1200));
        }
      }

      const mentionedCount = runs.filter((r) => r.mentioned).length;
      const shareOfVoice = Math.round((mentionedCount / runs.length) * 100);
      const rankedRuns = runs.filter((r) => typeof r.rankPosition === 'number');
      const avgRank =
        rankedRuns.length > 0
          ? (
            rankedRuns.reduce((sum, r) => sum + r.rankPosition, 0) / rankedRuns.length
          ).toFixed(1)
          : null;

      const topCompetitors = Object.entries(competitorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

      setGeoBatchResult({
        brandName: geoBrand,
        totalPrompts: runs.length,
        mentionedCount,
        shareOfVoice,
        avgRank,
        topCompetitors,
        runs,
      });

      fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setGeoLoading(false);
      setGeoProgress('');
    }
  };

  const filteredProjects =
    selectedProjectId === 'all'
      ? projects
      : projects.filter((p) => p.id === selectedProjectId);

  const totalAudits = projects.reduce((sum, p) => sum + p.audits.length, 0);
  const totalGeoChecks = projects.reduce((sum, p) => sum + p.geoChecks.length, 0);

  const activeNavMeta = NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeTab);

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    setError('');
    if (tabId === 'history') fetchHistory();
  };

  return (
    <div className="min-h-screen flex bg-[#09090B] text-zinc-100 print:bg-white print:text-zinc-900">
      {/* ==================== DESKTOP WORKSPACE SIDEBAR ==================== */}
      <aside className="w-64 shrink-0 border-r border-zinc-800/80 bg-[#0C0C0E] hidden lg:flex flex-col justify-between print:hidden">
        <div>
          {/* Workspace Brand Identity */}
          <div className="h-16 px-5 flex items-center gap-3 border-b border-zinc-800/80">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center">
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-zinc-100">
                Trifecta Command
              </p>
              <p className="text-[11px] font-mono text-zinc-500">SEO • AEO • GEO</p>
            </div>
          </div>

          {/* Grouped Navigation */}
          <nav className="p-3 space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-3 mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => switchTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                            ? 'bg-zinc-800/90 text-white border border-zinc-700/70'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/70 border border-transparent'
                          }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-zinc-500'
                              }`}
                          />
                          {item.label}
                        </span>
                        {item.id === 'history' && (
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 tabular-nums">
                            {projects.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* System Status Footer */}
        <div className="p-4 border-t border-zinc-800/80 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Neon PostgreSQL Online</span>
          </div>
          <p className="text-[11px] font-mono text-zinc-500">Engine: gemini-3.8-flash</p>
        </div>
      </aside>

      {/* ==================== MAIN WORKSPACE SHELL ==================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Command Bar */}
        <header className="sticky top-0 z-20 h-16 px-6 border-b border-zinc-800/80 bg-[#09090B]/85 backdrop-blur-md flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500 hidden sm:inline">Command Center</span>
            <span className="text-zinc-700 hidden sm:inline">/</span>
            <span className="font-semibold text-zinc-100">
              {activeNavMeta?.label || 'Site Audit'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-400" />
              Export PDF
            </button>
          </div>
        </header>

        {/* Mobile / Tablet Compact Navigation Strip */}
        <div className="lg:hidden px-6 pt-4 print:hidden">
          <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-[#111113] border border-zinc-800">
            {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${isActive
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.id === 'history' ? `History (${projects.length})` : item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Canvas */}
        <main className="flex-1 px-6 py-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Page Header */}
          <div className="border-b border-zinc-800/80 pb-5">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 print:text-zinc-900">
              Unified SEO • AEO • GEO Command Center
            </h1>
            <p className="text-zinc-400 text-sm mt-1 print:text-zinc-600">
              Audit search readiness, inspect AI crawler views, explore sitemaps, duel competitors, and measure LLM Share of Voice.
            </p>
          </div>

          {/* Global Error Banner */}
          {error && (
            <div className="bg-rose-950/30 border border-rose-500/30 text-rose-200 px-5 py-4 rounded-xl text-sm flex items-start gap-3 print:hidden">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-rose-300">Diagnostic Error</p>
                <p className="text-rose-200/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* ==================== MODULE 1: SITE AUDIT & FIXER ==================== */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <form
                onSubmit={handleRunAudit}
                className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end print:hidden"
              >
                <div className="md:col-span-5">
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Target Website URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://3dots.co/"
                    value={auditUrl}
                    onChange={(e) => setAuditUrl(e.target.value)}
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Brand Name (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="3dots"
                    value={brandNameInput}
                    onChange={(e) => setBrandNameInput(e.target.value)}
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={auditLoading}
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    {auditLoading ? 'Auditing...' : 'Run Full Audit'}
                  </button>
                </div>
              </form>

              {auditResult && (() => {
                const report = auditResult.report || auditResult.scores || auditResult;
                const findings = Array.isArray(report.issues)
                  ? report.issues
                  : Array.isArray(auditResult.diagnostics)
                    ? auditResult.diagnostics
                    : [];
                const discoveredCount = auditResult.discoveredUrls?.length || 0;
                const trifecta = getTrifectaGrade(
                  report.seoScore ?? 0,
                  report.aeoScore ?? 0,
                  report.geoScore ?? 0
                );

                return (
                  <div className="space-y-6">
                    {/* Overall Trifecta Grade Banner */}
                    <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center font-bold tabular-nums ${trifecta.color}`}
                        >
                          <span className="text-xl leading-none">{trifecta.grade}</span>
                          <span className="text-[10px] font-mono mt-1">{trifecta.score}/100</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-indigo-400" />
                            <p className="text-xs font-medium text-zinc-400">
                              Overall Trifecta Readiness Rating
                            </p>
                          </div>
                          <h2 className="text-base font-semibold text-zinc-100 mt-0.5">
                            {trifecta.label} —{' '}
                            <span className="font-mono text-sm text-zinc-300">
                              {report.url || auditUrl}
                            </span>
                          </h2>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium px-3.5 py-2 rounded-lg flex items-center gap-2 transition self-start sm:self-auto print:hidden"
                      >
                        <Printer className="w-3.5 h-3.5 text-zinc-400" />
                        Print / Save PDF
                      </button>
                    </div>

                    {/* 3-Pillar Score Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                        <p className="text-xs font-medium text-zinc-400">Traditional SEO Score</p>
                        <div className="mt-3 flex items-baseline gap-1.5 tabular-nums">
                          <span className="text-3xl font-semibold text-indigo-400">
                            {report.seoScore ?? 0}
                          </span>
                          <span className="text-xs font-mono text-zinc-500">/ 100</span>
                        </div>
                      </div>
                      <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                        <p className="text-xs font-medium text-zinc-400">AEO Readiness Score</p>
                        <div className="mt-3 flex items-baseline gap-1.5 tabular-nums">
                          <span className="text-3xl font-semibold text-sky-400">
                            {report.aeoScore ?? 0}
                          </span>
                          <span className="text-xs font-mono text-zinc-500">/ 100</span>
                        </div>
                      </div>
                      <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                        <p className="text-xs font-medium text-zinc-400">GEO Authority Score</p>
                        <div className="mt-3 flex items-baseline gap-1.5 tabular-nums">
                          <span className="text-3xl font-semibold text-emerald-400">
                            {report.geoScore ?? 0}
                          </span>
                          <span className="text-xs font-mono text-zinc-500">/ 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Technical Signals & Action Bar */}
                    <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2 text-xs font-mono text-zinc-300">
                        {typeof report.hasLlmsTxt === 'boolean' && (
                          <span className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg">
                            llms.txt:{' '}
                            <strong className={report.hasLlmsTxt ? 'text-emerald-400' : 'text-rose-400'}>
                              {report.hasLlmsTxt ? 'Detected' : 'Missing'}
                            </strong>
                          </span>
                        )}
                        {Array.isArray(report.schemaTypes) && (
                          <span className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg">
                            Schemas:{' '}
                            <strong className="text-zinc-100">
                              {report.schemaTypes.length ? report.schemaTypes.join(', ') : 'None'}
                            </strong>
                          </span>
                        )}
                        {typeof auditResult.wordCount === 'number' && (
                          <span className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg tabular-nums">
                            SSR Text: <strong className="text-zinc-100">{auditResult.wordCount} words</strong>
                          </span>
                        )}
                        {typeof auditResult.hasSitemap === 'boolean' && (
                          <span className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg">
                            sitemap.xml:{' '}
                            <strong className={auditResult.hasSitemap ? 'text-emerald-400' : 'text-rose-400'}>
                              {auditResult.hasSitemap
                                ? auditResult.sitemapUrlCount > 0
                                  ? `Detected (${auditResult.sitemapUrlCount})`
                                  : 'Detected'
                                : 'Missing'}
                            </strong>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 print:hidden">
                        {discoveredCount > 0 && (
                          <button
                            onClick={handleCrawlTopPages}
                            disabled={multiCrawlLoading}
                            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 disabled:opacity-50 text-zinc-200 font-medium px-3.5 py-2 rounded-lg text-xs flex items-center gap-2 transition"
                          >
                            <Layers className="w-3.5 h-3.5 text-sky-400" />
                            {multiCrawlLoading
                              ? `Crawling ${discoveredCount} Pages...`
                              : `Crawl Top ${discoveredCount} Pages`}
                          </button>
                        )}

                        <button
                          onClick={() => handleGenerateFixes()}
                          disabled={fixLoading}
                          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {fixLoading ? 'Generating Fixes...' : 'Generate AI Fixes & Schema'}
                        </button>
                      </div>
                    </div>

                    {/* Multi-Page Site Health Matrix */}
                    {multiCrawlResults && (
                      <div className="bg-[#111113] border border-zinc-800/90 rounded-xl overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
                          <h3 className="text-sm font-medium text-zinc-100">
                            Site-Wide Multi-Page Audit Matrix ({multiCrawlResults.length} Subpages)
                          </h3>
                          <span className="text-xs font-mono text-zinc-500">
                            Source: {auditResult.hasSitemap ? 'sitemap.xml' : 'internal links'}
                          </span>
                        </div>

                        <div className="divide-y divide-zinc-800/80">
                          {multiCrawlResults.map((pg, idx) => (
                            <div
                              key={idx}
                              className="px-5 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs"
                            >
                              <span className="font-mono text-zinc-300 truncate max-w-md">
                                {pg.url}
                              </span>

                              {pg.error ? (
                                <span className="text-rose-400">{pg.error}</span>
                              ) : (
                                <div className="flex flex-wrap items-center gap-3 tabular-nums">
                                  <span className="text-indigo-400 font-medium">
                                    SEO: {pg.seoScore}/100
                                  </span>
                                  <span className="text-sky-400 font-medium">
                                    AEO: {pg.aeoScore}/100
                                  </span>
                                  <span className="text-emerald-400 font-medium">
                                    GEO: {pg.geoScore}/100
                                  </span>
                                  <span className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded font-mono text-zinc-400">
                                    {pg.wordCount}w
                                  </span>
                                  <span className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded font-mono text-zinc-400">
                                    Schemas: {pg.schemaTypes?.length || 0}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Crawler Access Status (robots.txt) */}
                    {auditResult.botAccess && (
                      <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-zinc-400 mr-1">
                          AI Search Crawlers (robots.txt):
                        </span>
                        {Object.entries(auditResult.botAccess).map(([bot, status]) => (
                          <span
                            key={bot}
                            className={`px-2.5 py-1 rounded-md text-xs font-mono border ${status === 'Allowed'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              }`}
                          >
                            {bot}: {status}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Diagnostic Findings */}
                    <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-6 space-y-3">
                      <h2 className="text-sm font-semibold text-zinc-100 mb-2">
                        Diagnostic Findings
                      </h2>
                      {findings.length === 0 ? (
                        <div className="flex items-center gap-2.5 bg-zinc-950 border border-zinc-800 p-4 rounded-lg text-xs text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>All core SEO, AEO, and GEO checks passed for this URL.</span>
                        </div>
                      ) : (
                        findings.map((item, idx) => {
                          if (typeof item === 'string') {
                            return (
                              <div
                                key={idx}
                                className="flex items-start gap-3 bg-zinc-950 border border-zinc-800/90 p-3.5 rounded-lg"
                              >
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-zinc-200">{item}</p>
                              </div>
                            );
                          }
                          return (
                            <div
                              key={idx}
                              className="flex items-start gap-3 bg-zinc-950 border border-zinc-800/90 p-3.5 rounded-lg"
                            >
                              {item.status === 'pass' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              ) : item.status === 'warn' ? (
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-zinc-200">
                                  {item.pillar ? `[${item.pillar}] ` : item.category ? `[${item.category}] ` : ''}
                                  {item.check || item.title || item.message || item.issue || JSON.stringify(item)}
                                </p>
                                {(item.detail || item.description || item.recommendation) && (
                                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                                    {item.detail || item.description || item.recommendation}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Generated Fixes */}
                    {generatedFixes && (
                      <div className="bg-[#111113] border border-indigo-500/30 rounded-xl p-6 space-y-5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <h2 className="text-sm font-semibold text-zinc-100">
                            AI-Generated AEO & GEO Optimization Assets
                          </h2>
                        </div>

                        {generatedFixes.llmsTxt && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-mono text-zinc-400">llms.txt</span>
                              <div className="flex items-center gap-3 print:hidden">
                                <button
                                  onClick={() => handleDownloadFile('llms.txt', generatedFixes.llmsTxt, 'text/plain')}
                                  className="text-xs text-zinc-300 hover:text-white flex items-center gap-1"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download
                                </button>
                                <button
                                  onClick={() => handleCopy(generatedFixes.llmsTxt, 'llms')}
                                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                >
                                  {copiedField === 'llms' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                  {copiedField === 'llms' ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                            </div>
                            <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                              {generatedFixes.llmsTxt}
                            </pre>
                          </div>
                        )}

                        {generatedFixes.jsonLdSchema && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-mono text-zinc-400">schema.json (JSON-LD)</span>
                              <div className="flex items-center gap-3 print:hidden">
                                <button
                                  onClick={() => handleDownloadFile('schema.json', generatedFixes.jsonLdSchema, 'application/ld+json')}
                                  className="text-xs text-zinc-300 hover:text-white flex items-center gap-1"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download
                                </button>
                                <button
                                  onClick={() => handleCopy(generatedFixes.jsonLdSchema, 'schema')}
                                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                >
                                  {copiedField === 'schema' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                  {copiedField === 'schema' ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                            </div>
                            <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                              {generatedFixes.jsonLdSchema}
                            </pre>
                          </div>
                        )}

                        {Array.isArray(generatedFixes.citabilitySnippets) &&
                          generatedFixes.citabilitySnippets.length > 0 && (
                            <div className="space-y-3">
                              <span className="text-xs font-medium text-zinc-300">
                                Answer-First Citability Paragraphs
                              </span>
                              <div className="space-y-2.5">
                                {generatedFixes.citabilitySnippets.map((snip, idx) => {
                                  const snipKey = `snip-${idx}`;
                                  const copyPayload = `${snip.questionHeading}\n${snip.answerFirstParagraph}`;

                                  return (
                                    <div
                                      key={idx}
                                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-1.5"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-semibold text-indigo-300">
                                          {snip.questionHeading}
                                        </p>
                                        <button
                                          onClick={() => handleCopy(copyPayload, snipKey)}
                                          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 shrink-0 print:hidden"
                                        >
                                          {copiedField === snipKey ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                          ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                          )}
                                          {copiedField === snipKey ? 'Copied' : 'Copy'}
                                        </button>
                                      </div>
                                      <p className="text-xs text-zinc-300 leading-relaxed">
                                        {snip.answerFirstParagraph}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        {Array.isArray(generatedFixes.suggestedFaqHeadings) &&
                          generatedFixes.suggestedFaqHeadings.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-xs font-medium text-zinc-300">
                                Recommended AEO Question Headings (H2/H3)
                              </span>
                              <ul className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-1.5 text-xs text-zinc-300 list-disc list-inside">
                                {generatedFixes.suggestedFaqHeadings.map((heading, idx) => (
                                  <li key={idx}>{heading}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ==================== MODULE 2: AI BOT X-RAY ==================== */}
          {activeTab === 'xray' && (
            <div className="space-y-6">
              <form
                onSubmit={handleRunXray}
                className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
              >
                <div className="md:col-span-9">
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Target URL to Inspect Through Non-JS AI Crawler Lens
                  </label>
                  <input
                    type="text"
                    placeholder="https://3dots.co/ or https://www.infosys.com/"
                    value={xrayUrl}
                    onChange={(e) => setXrayUrl(e.target.value)}
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={xrayLoading}
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                  >
                    <Bot className="w-4 h-4" />
                    {xrayLoading ? 'Scanning...' : 'Run Bot X-Ray'}
                  </button>
                </div>
              </form>

              {xrayResult && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                      <p className="text-xs font-medium text-zinc-400">Non-JS Visible Words</p>
                      <p className="text-2xl font-semibold text-zinc-100 mt-2 tabular-nums">
                        {xrayResult.visibleWords}
                      </p>
                      <p className="text-[11px] font-mono text-zinc-500 mt-1">
                        {xrayResult.scriptCount} &lt;script&gt; tags stripped
                      </p>
                    </div>

                    <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                      <p className="text-xs font-medium text-zinc-400">Text-to-HTML Ratio</p>
                      <p className="text-2xl font-semibold text-indigo-400 mt-2 tabular-nums">
                        {xrayResult.textToHtmlRatio}%
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1">Signal vs markup density</p>
                    </div>

                    <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                      <p className="text-xs font-medium text-zinc-400">JS-Dependency Risk</p>
                      <p
                        className={`text-2xl font-semibold mt-2 ${xrayResult.jsRiskLevel === 'Low'
                            ? 'text-emerald-400'
                            : xrayResult.jsRiskLevel === 'Moderate'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                      >
                        {xrayResult.jsRiskLevel}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1">SSR hydration check</p>
                    </div>

                    <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                      <p className="text-xs font-medium text-zinc-400">/llms.txt Spec Status</p>
                      <p
                        className={`text-lg font-semibold mt-2 ${xrayResult.hasLlmsTxt ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                      >
                        {xrayResult.llmsValidation.status}
                      </p>
                      <p className="text-[11px] font-mono text-zinc-500 mt-1">
                        llms-full.txt: {xrayResult.hasLlmsFullTxt ? 'Detected' : 'Missing'}
                      </p>
                    </div>
                  </div>

                  {/* JS-Dependency Diagnosis Banner */}
                  <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5 flex items-start gap-3">
                    {xrayResult.jsRiskLevel === 'Low' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-zinc-100">
                        AI Crawler Rendering Assessment
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {xrayResult.jsRiskSummary}
                      </p>
                    </div>
                  </div>

                  {/* /llms.txt Spec Checklist */}
                  <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-6 space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      llmstxt.org Specification Audit ({xrayResult.origin}/llms.txt)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                      <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg flex items-center gap-2">
                        {xrayResult.llmsValidation.hasH1Title ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span># H1 Brand Title</span>
                      </div>
                      <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg flex items-center gap-2">
                        {xrayResult.llmsValidation.hasBlockquoteSummary ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span>&gt; Blockquote Summary</span>
                      </div>
                      <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg flex items-center gap-2">
                        {xrayResult.llmsValidation.hasMarkdownLinks ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span>[Page](URL) Markdown Links</span>
                      </div>
                    </div>

                    {xrayResult.llmsTxtContent && (
                      <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap max-h-56 overflow-y-auto mt-2">
                        {xrayResult.llmsTxtContent}
                      </pre>
                    )}
                  </div>

                  {/* Structural Heading Outline + Raw Text View */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 bg-[#111113] border border-zinc-800/90 rounded-xl p-5 space-y-3">
                      <h3 className="text-sm font-semibold text-zinc-100">
                        Extracted Heading Tree ({xrayResult.headingOutline.length})
                      </h3>
                      {xrayResult.headingOutline.length === 0 ? (
                        <p className="text-xs text-rose-400">
                          No H1–H3 headings visible without JavaScript.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                          {xrayResult.headingOutline.map((h, idx) => (
                            <div
                              key={idx}
                              className="bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs flex items-start gap-2"
                            >
                              <span className="bg-zinc-800 text-indigo-300 font-mono px-1.5 py-0.5 rounded text-[10px] shrink-0">
                                {h.tag}
                              </span>
                              <span className="text-zinc-200">{h.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-7 bg-[#111113] border border-zinc-800/90 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-zinc-100">
                          Raw Text Extracted by LLM Scraper
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleCopy(xrayResult.rawCrawlerText, 'xray-text')}
                          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          {copiedField === 'xray-text' ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copiedField === 'xray-text' ? 'Copied' : 'Copy Raw Text'}
                        </button>
                      </div>
                      <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                        {xrayResult.rawCrawlerText || 'No readable text found in initial HTML response.'}
                      </pre>
                    </div>
                  </div>

                  {/* 1-Click robots.txt AI Policy Generator */}
                  <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-100">
                          1-Click AI Crawler robots.txt Policy Generator
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Choose whether to allow AI search citations only or allow full AI training + search
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRobotsPolicyMode('search-only')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${robotsPolicyMode === 'search-only'
                              ? 'bg-zinc-800 border-zinc-600 text-white'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                          AI Search Only
                        </button>
                        <button
                          type="button"
                          onClick={() => setRobotsPolicyMode('allow-all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${robotsPolicyMode === 'allow-all'
                              ? 'bg-zinc-800 border-zinc-600 text-white'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                          Allow All AI Bots
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const activeRobotsContent =
                        robotsPolicyMode === 'search-only'
                          ? xrayResult.recommendedSearchFirstRobots
                          : xrayResult.recommendedOpenAiRobots;

                      return (
                        <div className="space-y-2">
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadFile('robots.txt', activeRobotsContent, 'text/plain')
                              }
                              className="text-xs text-zinc-300 hover:text-white flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download robots.txt
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(activeRobotsContent, 'robots-policy')}
                              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                              {copiedField === 'robots-policy' ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              {copiedField === 'robots-policy' ? 'Copied' : 'Copy Policy'}
                            </button>
                          </div>
                          <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                            {activeRobotsContent}
                          </pre>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== MODULE 3: STANDALONE SITEMAP FINDER ==================== */}
          {activeTab === 'sitemap' && (
            <div className="space-y-6">
              <form
                onSubmit={handleFindSitemap}
                className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
              >
                <div className="md:col-span-9">
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Domain or Website URL to Inspect Sitemaps
                  </label>
                  <input
                    type="text"
                    placeholder="https://app.gruha.ai/ or https://3dots.co/"
                    value={sitemapInputUrl}
                    onChange={(e) => setSitemapInputUrl(e.target.value)}
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={sitemapLoading}
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                  >
                    <Network className="w-4 h-4" />
                    {sitemapLoading ? 'Scanning...' : 'Find Sitemap'}
                  </button>
                </div>
              </form>

              {sitemapResult && (() => {
                const filteredUrls = (sitemapResult.urls || []).filter((item) =>
                  item.loc.toLowerCase().includes(sitemapSearchFilter.toLowerCase())
                );

                return (
                  <div className="space-y-6">
                    {/* Status Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                        <p className="text-xs font-medium text-zinc-400">XML Sitemap Status</p>
                        <div className="flex items-center gap-2 mt-2">
                          {sitemapResult.found ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              <span className="text-xl font-semibold text-emerald-400">Detected</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-rose-400" />
                              <span className="text-xl font-semibold text-rose-400">Not Found</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs font-mono text-zinc-500 mt-1.5 truncate">
                          {sitemapResult.sitemapUrl || `Checked ${sitemapResult.origin}/sitemap.xml & robots.txt`}
                        </p>
                      </div>

                      <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                        <p className="text-xs font-medium text-zinc-400">Sitemap Structure</p>
                        <p className="text-xl font-semibold text-zinc-100 mt-2">
                          {sitemapResult.found
                            ? sitemapResult.isSitemapIndex
                              ? `Index (${sitemapResult.childSitemaps.length} sub-sitemaps)`
                              : 'Standard URLSet'
                            : 'Fallback Link Crawl'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1.5">
                          {sitemapResult.found ? 'Verified XML schema' : 'Auto-discovered from HTML links'}
                        </p>
                      </div>

                      <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                        <p className="text-xs font-medium text-zinc-400">Indexed Page URLs</p>
                        <p className="text-3xl font-semibold text-zinc-100 mt-2 tabular-nums">
                          {sitemapResult.found
                            ? sitemapResult.totalUrls
                            : sitemapResult.discoveredInternalLinks?.length || 0}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {sitemapResult.found ? 'Listed in XML sitemap' : 'Internal routes ready for XML'}
                        </p>
                      </div>
                    </div>

                    {/* Child Sitemap Index Badges */}
                    {sitemapResult.isSitemapIndex && sitemapResult.childSitemaps?.length > 0 && (
                      <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5 space-y-2.5">
                        <p className="text-xs font-medium text-zinc-300">
                          Child Sitemaps Inside Sitemap Index
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sitemapResult.childSitemaps.map((child, idx) => (
                            <span
                              key={idx}
                              className="text-xs font-mono bg-zinc-950 border border-zinc-800 text-zinc-300 px-3 py-1 rounded-md"
                            >
                              {child}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Discovered URL Directory Table */}
                    {sitemapResult.found && sitemapResult.urls?.length > 0 && (
                      <div className="bg-[#111113] border border-zinc-800/90 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-zinc-100">
                              Discovered Sitemap URLs ({filteredUrls.length})
                            </h3>
                            <p className="text-xs text-zinc-400">
                              Click &ldquo;Audit Page&rdquo; on any URL to run a full SEO • AEO • GEO check
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Filter URLs..."
                              value={sitemapSearchFilter}
                              onChange={(e) => setSitemapSearchFilter(e.target.value)}
                              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadFile(
                                  'discovered-urls.txt',
                                  filteredUrls.map((u) => u.loc).join('\n'),
                                  'text/plain'
                                )
                              }
                              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Export
                            </button>
                          </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto divide-y divide-zinc-800/80">
                          {filteredUrls.map((item, idx) => (
                            <div
                              key={idx}
                              className="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs hover:bg-zinc-900/50"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <a
                                  href={item.loc}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-zinc-200 hover:text-indigo-400 font-mono flex items-center gap-1.5 truncate"
                                >
                                  <span className="truncate">{item.loc}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0 text-zinc-500" />
                                </a>
                                <div className="flex flex-wrap gap-3 text-[11px] font-mono text-zinc-500">
                                  {item.lastmod && <span>Last Mod: {item.lastmod}</span>}
                                  {item.changefreq && <span>Freq: {item.changefreq}</span>}
                                  {item.priority && <span>Priority: {item.priority}</span>}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setAuditUrl(item.loc);
                                  setActiveTab('audit');
                                  runAuditForUrl(item.loc);
                                }}
                                className="bg-zinc-900 hover:bg-indigo-600 border border-zinc-700 hover:border-indigo-500 text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 self-start sm:self-auto"
                              >
                                Audit Page
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Auto-Generated XML Sitemap */}
                    {!sitemapResult.found && sitemapResult.generatedXml && (
                      <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-semibold text-zinc-100">
                              No /sitemap.xml Found — Ready-to-Upload XML Sitemap Generated
                            </h3>
                            <p className="text-xs text-zinc-400">
                              Built from {sitemapResult.discoveredInternalLinks?.length || 0} internal routes crawled on {sitemapResult.origin}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                handleDownloadFile('sitemap.xml', sitemapResult.generatedXml, 'application/xml')
                              }
                              className="text-xs text-zinc-300 hover:text-white flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download sitemap.xml
                            </button>
                            <button
                              onClick={() => handleCopy(sitemapResult.generatedXml, 'gen-sitemap')}
                              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                              {copiedField === 'gen-sitemap' ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              {copiedField === 'gen-sitemap' ? 'Copied' : 'Copy XML'}
                            </button>
                          </div>
                        </div>

                        <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap max-h-72 overflow-y-auto">
                          {sitemapResult.generatedXml}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ==================== MODULE 4: COMPETITOR BATTLEGROUND ==================== */}
          {activeTab === 'battle' && (
            <div className="space-y-6">
              <form
                onSubmit={handleRunBattle}
                className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end print:hidden"
              >
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Your Website URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://3dots.co/"
                    value={myBattleUrl}
                    onChange={(e) => setMyBattleUrl(e.target.value)}
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div className="md:col-span-5">
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Competitor Website URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://vercel.com/"
                    value={rivalBattleUrl}
                    onChange={(e) => setRivalBattleUrl(e.target.value)}
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={battleLoading}
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                  >
                    <Swords className="w-4 h-4" />
                    {battleLoading ? 'Comparing...' : 'Run Duel'}
                  </button>
                </div>
              </form>

              {battleResult && (() => {
                const myRep = battleResult.myData.report;
                const rivalRep = battleResult.rivalData.report;
                const myDomain = battleResult.myData.project.domain;
                const rivalDomain = battleResult.rivalData.project.domain;

                const myTotal = myRep.seoScore + myRep.aeoScore + myRep.geoScore;
                const rivalTotal = rivalRep.seoScore + rivalRep.aeoScore + rivalRep.geoScore;

                const rows = [
                  {
                    label: 'Traditional SEO Score',
                    mine: `${myRep.seoScore}/100`,
                    theirs: `${rivalRep.seoScore}/100`,
                    myNum: myRep.seoScore,
                    rivalNum: rivalRep.seoScore,
                  },
                  {
                    label: 'AEO Readiness Score',
                    mine: `${myRep.aeoScore}/100`,
                    theirs: `${rivalRep.aeoScore}/100`,
                    myNum: myRep.aeoScore,
                    rivalNum: rivalRep.aeoScore,
                  },
                  {
                    label: 'GEO Authority Score',
                    mine: `${myRep.geoScore}/100`,
                    theirs: `${rivalRep.geoScore}/100`,
                    myNum: myRep.geoScore,
                    rivalNum: rivalRep.geoScore,
                  },
                  {
                    label: '/llms.txt AI Guide',
                    mine: myRep.hasLlmsTxt ? 'Detected' : 'Missing',
                    theirs: rivalRep.hasLlmsTxt ? 'Detected' : 'Missing',
                    myNum: myRep.hasLlmsTxt ? 1 : 0,
                    rivalNum: rivalRep.hasLlmsTxt ? 1 : 0,
                  },
                  {
                    label: 'JSON-LD Schemas',
                    mine: myRep.schemaTypes?.length ? myRep.schemaTypes.join(', ') : 'None',
                    theirs: rivalRep.schemaTypes?.length ? rivalRep.schemaTypes.join(', ') : 'None',
                    myNum: myRep.schemaTypes?.length || 0,
                    rivalNum: rivalRep.schemaTypes?.length || 0,
                  },
                  {
                    label: 'XML Sitemap',
                    mine: battleResult.myData.hasSitemap ? 'Detected' : 'Missing',
                    theirs: battleResult.rivalData.hasSitemap ? 'Detected' : 'Missing',
                    myNum: battleResult.myData.hasSitemap ? 1 : 0,
                    rivalNum: battleResult.rivalData.hasSitemap ? 1 : 0,
                  },
                  {
                    label: 'SSR Readable Words',
                    mine: `${battleResult.myData.wordCount ?? 0} words`,
                    theirs: `${battleResult.rivalData.wordCount ?? 0} words`,
                    myNum: battleResult.myData.wordCount ?? 0,
                    rivalNum: battleResult.rivalData.wordCount ?? 0,
                  },
                ];

                const gaps = [];
                if (!myRep.hasLlmsTxt && rivalRep.hasLlmsTxt) {
                  gaps.push(`${rivalDomain} publishes an /llms.txt file to guide ChatGPT, Claude, and Perplexity—your site is missing one.`);
                }
                if ((myRep.schemaTypes?.length || 0) < (rivalRep.schemaTypes?.length || 0)) {
                  gaps.push(`${rivalDomain} implements richer structured schemas (${rivalRep.schemaTypes.join(', ')}) for Featured Snippets & AEO.`);
                }
                if (!battleResult.myData.hasSitemap && battleResult.rivalData.hasSitemap) {
                  gaps.push(`${rivalDomain} exposes a valid /sitemap.xml for faster full-site indexing.`);
                }
                if (myRep.geoScore < rivalRep.geoScore) {
                  gaps.push(`${rivalDomain} leads in GEO Authority by +${rivalRep.geoScore - myRep.geoScore} points.`);
                }

                return (
                  <div className="space-y-6">
                    {/* Overall Winner Banner */}
                    <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <Trophy className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">Overall Search & AI Readiness Winner</p>
                          <h2 className="text-lg font-semibold text-zinc-100 tabular-nums">
                            {myTotal > rivalTotal
                              ? `${myDomain} Wins (${myTotal} vs ${rivalTotal} pts)`
                              : rivalTotal > myTotal
                                ? `${rivalDomain} Leads (${rivalTotal} vs ${myTotal} pts)`
                                : `Tie Game (${myTotal} pts each)`}
                          </h2>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setAuditUrl(battleResult.myUrl);
                          setBrandNameInput(myDomain);
                          setActiveTab('audit');
                          handleGenerateFixes(battleResult.myUrl);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition self-start sm:self-auto print:hidden"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate Fixes for {myDomain}
                      </button>
                    </div>

                    {/* Side-by-Side Comparison Table */}
                    <div className="bg-[#111113] border border-zinc-800/90 rounded-xl overflow-hidden">
                      <div className="grid grid-cols-12 bg-zinc-950 border-b border-zinc-800 px-5 py-3 text-xs font-medium text-zinc-400">
                        <div className="col-span-4">Audit Dimension</div>
                        <div className="col-span-4 text-zinc-200">{myDomain} (You)</div>
                        <div className="col-span-4 text-zinc-200">{rivalDomain} (Competitor)</div>
                      </div>

                      <div className="divide-y divide-zinc-800/80">
                        {rows.map((row, idx) => {
                          const myWins = row.myNum > row.rivalNum;
                          const rivalWins = row.rivalNum > row.myNum;

                          return (
                            <div
                              key={idx}
                              className="grid grid-cols-12 px-5 py-3.5 text-sm items-center gap-2 tabular-nums"
                            >
                              <div className="col-span-4 text-xs font-medium text-zinc-400">
                                {row.label}
                              </div>
                              <div
                                className={`col-span-4 text-xs font-mono font-medium ${myWins ? 'text-emerald-400' : 'text-zinc-200'
                                  }`}
                              >
                                {row.mine} {myWins && '★'}
                              </div>
                              <div
                                className={`col-span-4 text-xs font-mono font-medium ${rivalWins ? 'text-amber-400' : 'text-zinc-200'
                                  }`}
                              >
                                {row.theirs} {rivalWins && '★'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Competitive Gap Takeaways */}
                    <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-6 space-y-3">
                      <h3 className="text-sm font-semibold text-zinc-100">
                        Competitive Gap Analysis
                      </h3>
                      {gaps.length === 0 ? (
                        <div className="flex items-center gap-2.5 bg-zinc-950 border border-zinc-800 p-4 rounded-lg text-xs text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>
                            {myDomain} matches or outperforms {rivalDomain} across all technical SEO, AEO, and GEO checks.
                          </span>
                        </div>
                      ) : (
                        gaps.map((gap, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2.5 bg-zinc-950 border border-zinc-800 p-4 rounded-lg text-xs text-zinc-300"
                          >
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{gap}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ==================== MODULE 5: MULTI-PROMPT GEO SHARE OF VOICE ==================== */}
          {activeTab === 'geo' && (
            <div className="space-y-6">
              <form
                onSubmit={handleRunGeoBatch}
                className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5 space-y-4 print:hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Target Brand Name
                    </label>
                    <input
                      type="text"
                      placeholder="3dots"
                      value={geoBrand}
                      onChange={(e) => setGeoBrand(e.target.value)}
                      className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Brand Domain
                    </label>
                    <input
                      type="text"
                      placeholder="3dots.co"
                      value={geoDomain}
                      onChange={(e) => setGeoDomain(e.target.value)}
                      className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-zinc-400">
                      Buyer-Intent AI Prompts (1 to 5 prompts, one per line)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setGeoPromptsInput(
                          `Best AI automation and custom software engineering companies in India\nTop MVP development agencies for startups\nLeading enterprise AI consulting firms`
                        )
                      }
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      + Fill 3 Sample Prompts
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    placeholder={`Best AI automation and custom software engineering companies in India\nTop MVP development agencies for startups\nLeading enterprise AI consulting firms`}
                    value={geoPromptsInput}
                    onChange={(e) => setGeoPromptsInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
                    required
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-zinc-500">
                    {geoProgress || 'Runs up to 5 prompts sequentially and calculates AI Share of Voice %.'}
                  </span>
                  <button
                    type="submit"
                    disabled={geoLoading}
                    className="h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-5 rounded-lg text-sm flex items-center justify-center gap-2 transition shrink-0"
                  >
                    <BarChart3 className="w-4 h-4" />
                    {geoLoading ? 'Running Batch...' : 'Measure Share of Voice'}
                  </button>
                </div>
              </form>

              {geoBatchResult && (
                <div className="space-y-6">
                  {/* Share of Voice Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                      <p className="text-xs font-medium text-zinc-400">AI Share of Voice</p>
                      <p className="text-3xl font-semibold text-emerald-400 mt-2 tabular-nums">
                        {geoBatchResult.shareOfVoice}%
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Cited in {geoBatchResult.mentionedCount} of {geoBatchResult.totalPrompts} prompts
                      </p>
                    </div>

                    <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                      <p className="text-xs font-medium text-zinc-400">Average Rank Position</p>
                      <p className="text-3xl font-semibold text-indigo-400 mt-2 tabular-nums">
                        {geoBatchResult.avgRank ? `#${geoBatchResult.avgRank}` : 'Unranked'}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">Across ranked AI recommendations</p>
                    </div>

                    <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                      <p className="text-xs font-medium text-zinc-400">Competing Brands Detected</p>
                      <p className="text-3xl font-semibold text-amber-400 mt-2 tabular-nums">
                        {geoBatchResult.topCompetitors.length}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">Unique rivals cited by AI</p>
                    </div>
                  </div>

                  {/* Competitor Citation Leaderboard */}
                  {geoBatchResult.topCompetitors.length > 0 && (
                    <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5 space-y-3">
                      <h3 className="text-sm font-semibold text-zinc-100">
                        AI Competitor Citation Leaderboard
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {geoBatchResult.topCompetitors.map(([compName, count], idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg flex items-center gap-2"
                          >
                            <span className="font-medium">{compName}</span>
                            <span className="text-[11px] font-mono bg-zinc-800 text-amber-300 px-1.5 py-0.5 rounded tabular-nums">
                              {count}x
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Per-Prompt Breakdown */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      Prompt-by-Prompt Visibility Breakdown
                    </h3>
                    {geoBatchResult.runs.map((run, idx) => {
                      const expandKey = `batch-${idx}`;
                      const isOpen = !!expandedItems[expandKey];

                      return (
                        <div
                          key={idx}
                          className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <p className="text-sm font-medium text-zinc-100">
                              {idx + 1}. &ldquo;{run.prompt}&rdquo;
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-xs font-mono px-2.5 py-1 rounded-md border ${run.mentioned
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                  }`}
                              >
                                {run.mentioned
                                  ? run.rankPosition
                                    ? `Mentioned (#${run.rankPosition})`
                                    : 'Mentioned'
                                  : 'Not Mentioned'}
                              </span>
                              <span className="text-xs font-mono bg-zinc-950 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md capitalize">
                                {run.sentiment}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-zinc-400 leading-relaxed">{run.insight}</p>

                          <button
                            type="button"
                            onClick={() => toggleExpand(expandKey)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 print:hidden"
                          >
                            {isOpen ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5" /> Hide Raw AI Answer ({run.modelUsed})
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5" /> View Raw AI Answer ({run.modelUsed})
                              </>
                            )}
                          </button>

                          {isOpen && (
                            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                              {run.rawResponse}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== MODULE 6: SAVED HISTORY & TRENDS ==================== */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Summary Metrics & Filter Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                  <p className="text-xs font-medium text-zinc-400">Tracked Projects</p>
                  <p className="text-2xl font-semibold text-zinc-100 mt-2 tabular-nums">
                    {projects.length}
                  </p>
                </div>
                <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                  <p className="text-xs font-medium text-zinc-400">Saved Site Audits</p>
                  <p className="text-2xl font-semibold text-indigo-400 mt-2 tabular-nums">
                    {totalAudits}
                  </p>
                </div>
                <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5">
                  <p className="text-xs font-medium text-zinc-400">GEO Citation Checks</p>
                  <p className="text-2xl font-semibold text-emerald-400 mt-2 tabular-nums">
                    {totalGeoChecks}
                  </p>
                </div>
                <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-5 flex flex-col justify-between print:hidden">
                  <label className="text-xs font-medium text-zinc-400 mb-1.5">
                    Filter by Domain
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">All Projects ({projects.length})</option>
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.brandName} ({proj.domain})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={fetchHistory}
                      disabled={historyLoading}
                      title="Refresh from Neon PostgreSQL"
                      className="bg-zinc-950 border border-zinc-800 hover:border-zinc-600 p-2 rounded-lg text-zinc-300"
                    >
                      <RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Project Cards */}
              {filteredProjects.length === 0 ? (
                <div className="bg-[#111113] border border-zinc-800/90 rounded-xl p-10 text-center space-y-2">
                  <FolderKanban className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-sm font-medium text-zinc-300">No saved records found yet</p>
                  <p className="text-xs text-zinc-500">
                    Run a Site Audit or GEO Citation Check to save records into Neon PostgreSQL.
                  </p>
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-[#111113] border border-zinc-800/90 rounded-xl p-6 space-y-5"
                  >
                    {/* Project Header + Export + Delete */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                          <Globe className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-zinc-100">
                            {project.brandName}
                          </h2>
                          <p className="text-xs font-mono text-zinc-400">{project.domain}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 print:hidden">
                        <span className="text-xs font-mono text-zinc-500 mr-1">
                          {project.audits.length} Audits • {project.geoChecks.length} GEO
                        </span>
                        <button
                          onClick={() => handleExportProjectMarkdown(project)}
                          className="flex items-center gap-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg transition"
                        >
                          <Download className="w-3.5 h-3.5 text-zinc-400" />
                          Export .md
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteRecord(project.id, 'project', `project "${project.brandName}"`)
                          }
                          disabled={deletingId === project.id}
                          title="Delete Project & All History"
                          className="flex items-center gap-1 text-xs font-medium bg-zinc-900 hover:bg-rose-950/50 border border-zinc-800 hover:border-rose-500/30 text-rose-400 px-2.5 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Score Trend Visualization */}
                    <ScoreTrendChart audits={project.audits} />

                    {/* Expandable Site Audits */}
                    {project.audits.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Saved Site Audits
                        </h3>
                        <div className="space-y-2">
                          {project.audits.map((audit) => {
                            const isOpen = !!expandedItems[audit.id];
                            const diagnostics = Array.isArray(audit.issues) ? audit.issues : [];

                            return (
                              <div
                                key={audit.id}
                                className="bg-zinc-950 border border-zinc-800/90 rounded-lg overflow-hidden"
                              >
                                <div className="flex items-center justify-between pr-3">
                                  <button
                                    type="button"
                                    onClick={() => toggleExpand(audit.id)}
                                    className="flex-1 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-left hover:bg-zinc-900/50 transition"
                                  >
                                    <div className="space-y-1">
                                      <p className="text-xs font-mono text-zinc-400">
                                        {audit.url} • {new Date(audit.createdAt).toLocaleString()}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-medium tabular-nums">
                                        <span className="text-indigo-400">SEO: {audit.seoScore}/100</span>
                                        <span className="text-sky-400">AEO: {audit.aeoScore}/100</span>
                                        <span className="text-emerald-400">GEO: {audit.geoScore}/100</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                      <span>{isOpen ? 'Hide' : 'Diagnostics'}</span>
                                      {isOpen ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteRecord(audit.id, 'audit', 'site audit')
                                    }
                                    disabled={deletingId === audit.id}
                                    title="Delete Audit"
                                    className="p-2 text-zinc-500 hover:text-rose-400 transition disabled:opacity-50 print:hidden"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                {isOpen && (
                                  <div className="px-4 pb-4 pt-3 border-t border-zinc-800/80 space-y-3">
                                    <div className="flex flex-wrap gap-2 text-xs font-mono text-zinc-300">
                                      <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded">
                                        llms.txt: {audit.hasLlmsTxt ? 'Detected' : 'Missing'}
                                      </span>
                                      <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded">
                                        Schemas:{' '}
                                        {audit.schemaTypes?.length
                                          ? audit.schemaTypes.join(', ')
                                          : 'None'}
                                      </span>
                                    </div>

                                    {diagnostics.length > 0 && (
                                      <div className="space-y-2">
                                        {diagnostics.map((item, idx) => {
                                          if (typeof item === 'string') {
                                            return (
                                              <div
                                                key={idx}
                                                className="flex items-start gap-2.5 bg-[#111113] border border-zinc-800 p-3 rounded-lg text-xs"
                                              >
                                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                                <p className="text-zinc-200">{item}</p>
                                              </div>
                                            );
                                          }
                                          return (
                                            <div
                                              key={idx}
                                              className="flex items-start gap-2.5 bg-[#111113] border border-zinc-800 p-3 rounded-lg text-xs"
                                            >
                                              {item.status === 'pass' ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                              ) : item.status === 'warn' ? (
                                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                              ) : (
                                                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                              )}
                                              <div>
                                                <p className="font-medium text-zinc-200">
                                                  {item.pillar ? `[${item.pillar}] ` : item.category ? `[${item.category}] ` : ''}
                                                  {item.check ||
                                                    item.title ||
                                                    item.message ||
                                                    item.issue ||
                                                    item.name ||
                                                    JSON.stringify(item)}
                                                </p>
                                                {(item.detail ||
                                                  item.description ||
                                                  item.recommendation) && (
                                                    <p className="text-zinc-400 mt-0.5">
                                                      {item.detail ||
                                                        item.description ||
                                                        item.recommendation}
                                                    </p>
                                                  )}
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

                    {/* Expandable GEO Citation Checks */}
                    {project.geoChecks.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                          GEO Citation History
                        </h3>
                        <div className="space-y-2">
                          {project.geoChecks.map((check) => {
                            const isOpen = !!expandedItems[check.id];

                            return (
                              <div
                                key={check.id}
                                className="bg-zinc-950 border border-zinc-800/90 rounded-lg overflow-hidden"
                              >
                                <div className="flex items-center justify-between pr-3">
                                  <button
                                    type="button"
                                    onClick={() => toggleExpand(check.id)}
                                    className="flex-1 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left hover:bg-zinc-900/50 transition"
                                  >
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium text-zinc-200">
                                        &ldquo;{check.prompt}&rdquo;
                                      </p>
                                      <p className="text-xs font-mono text-zinc-500">
                                        Engine: {check.llmProvider || 'Gemini 3.8 Flash'} •{' '}
                                        {new Date(check.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span
                                        className={`text-xs font-mono px-2.5 py-1 rounded border ${check.brandMentioned
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                          }`}
                                      >
                                        {check.brandMentioned ? 'Mentioned' : 'Not Mentioned'}
                                      </span>
                                      <span className="text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded capitalize">
                                        {check.sentiment || 'Neutral'}
                                      </span>
                                      {isOpen ? (
                                        <ChevronUp className="w-4 h-4 text-zinc-400" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                                      )}
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteRecord(check.id, 'geocheck', 'GEO citation check')
                                    }
                                    disabled={deletingId === check.id}
                                    title="Delete GEO Check"
                                    className="p-2 text-zinc-500 hover:text-rose-400 transition disabled:opacity-50 print:hidden"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                {isOpen && (
                                  <div className="px-4 pb-4 pt-3 border-t border-zinc-800/80 space-y-3">
                                    {check.citedUrls?.length > 0 && (
                                      <div className="flex flex-wrap items-center gap-2 text-xs">
                                        <span className="text-zinc-400">Cited URLs:</span>
                                        {check.citedUrls.map((u, idx) => (
                                          <span
                                            key={idx}
                                            className="bg-zinc-900 border border-zinc-800 font-mono text-indigo-300 px-2.5 py-1 rounded"
                                          >
                                            {u}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    <div className="space-y-1">
                                      <p className="text-xs font-medium text-zinc-400">
                                        Saved AI Response:
                                      </p>
                                      <div className="bg-[#111113] border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-300 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
                                        {check.rawResponse || 'No raw response recorded.'}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}