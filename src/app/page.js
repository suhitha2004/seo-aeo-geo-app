'use client';

import { useState, useEffect } from 'react';
import ScoreTrendChart from '@/components/ScoreTrendChart';
import {
  Search,
  MessageSquare,
  History,
  Swords,
  Layers,
  Map,
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
  if (weighted >= 90) return { score: weighted, grade: 'A+', label: 'AI & Search Leader', color: 'text-emerald-400 border-emerald-700/60 bg-emerald-950/40' };
  if (weighted >= 80) return { score: weighted, grade: 'A', label: 'Strong Readiness', color: 'text-emerald-300 border-emerald-800/60 bg-emerald-950/30' };
  if (weighted >= 65) return { score: weighted, grade: 'B', label: 'Moderate AI Visibility', color: 'text-sky-400 border-sky-800/60 bg-sky-950/30' };
  if (weighted >= 50) return { score: weighted, grade: 'C', label: 'Needs AEO / GEO Fixes', color: 'text-amber-400 border-amber-800/60 bg-amber-950/30' };
  return { score: weighted, grade: 'D', label: 'Critical AI Visibility Gaps', color: 'text-rose-400 border-rose-800/60 bg-rose-950/30' };
}

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
          `- **AI Provider:** ${c.llmProvider || 'Gemini 2.5 Flash-Lite'}`,
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
          modelUsed: data.modelUsed || data.geoCheck?.llmProvider || 'gemini-2.5-flash-lite',
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

  return (
    <main className="min-h-screen bg-[#060b19] text-slate-100 px-6 py-10 print:bg-white print:text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header & Navigation */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white print:text-slate-900">
              Unified SEO • AEO • GEO Command Center
            </h1>
            <p className="text-slate-400 text-sm mt-1 print:text-slate-600">
              Audit search readiness, inspect AI crawler views, explore sitemaps, duel competitors, and measure LLM Share of Voice.
            </p>
          </div>

          <div className="inline-flex flex-wrap bg-[#0f172a] p-1.5 rounded-xl border border-slate-800 gap-1 self-start print:hidden">
            <button
              onClick={() => {
                setActiveTab('audit');
                setError('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <Search className="w-4 h-4" />
              Site Audit
            </button>

            <button
              onClick={() => {
                setActiveTab('xray');
                setError('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'xray'
                ? 'bg-violet-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <Bot className="w-4 h-4" />
              AI Bot X-Ray
            </button>

            <button
              onClick={() => {
                setActiveTab('sitemap');
                setError('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'sitemap'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Sitemap Finder
            </button>

            <button
              onClick={() => {
                setActiveTab('battle');
                setError('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'battle'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <Swords className="w-4 h-4" />
              Competitor Duel
            </button>

            <button
              onClick={() => {
                setActiveTab('geo');
                setError('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'geo'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <MessageSquare className="w-4 h-4" />
              GEO Share of Voice
            </button>

            <button
              onClick={() => {
                setActiveTab('history');
                setError('');
                fetchHistory();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'history'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <History className="w-4 h-4" />
              History ({projects.length})
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-200 px-5 py-4 rounded-xl text-sm print:hidden">
            {error}
          </div>
        )}

        {/* ==================== MODULE 1: SITE AUDIT & FIXER ==================== */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <form
              onSubmit={handleRunAudit}
              className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-end print:hidden"
            >
              <div className="md:col-span-5">
                <label className="block text-xs text-slate-400 mb-2">Target Website URL</label>
                <input
                  type="text"
                  placeholder="https://3dots.co/"
                  value={auditUrl}
                  onChange={(e) => setAuditUrl(e.target.value)}
                  className="w-full bg-[#060b19] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs text-slate-400 mb-2">Brand Name (optional)</label>
                <input
                  type="text"
                  placeholder="3dots"
                  value={brandNameInput}
                  onChange={(e) => setBrandNameInput(e.target.value)}
                  className="w-full bg-[#060b19] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={auditLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition"
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
                  {/* Overall Trifecta Grade Banner + Print PDF Button */}
                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-bold ${trifecta.color}`}
                      >
                        <span className="text-xl leading-none">{trifecta.grade}</span>
                        <span className="text-[10px] mt-0.5">{trifecta.score}/100</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-indigo-400" />
                          <p className="text-xs font-medium text-slate-400">
                            Overall Trifecta Readiness Rating
                          </p>
                        </div>
                        <h2 className="text-lg font-bold text-white mt-0.5">
                          {trifecta.label} — {report.url || auditUrl}
                        </h2>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="bg-[#060b19] hover:bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-200 text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition self-start sm:self-auto print:hidden"
                    >
                      <Printer className="w-4 h-4 text-indigo-400" />
                      Print / Save PDF Report
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                      <p className="text-xs text-slate-400">Traditional SEO Score</p>
                      <p className="text-3xl font-bold text-indigo-400 mt-1">
                        {report.seoScore ?? 0}/100
                      </p>
                    </div>
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                      <p className="text-xs text-slate-400">AEO Readiness Score</p>
                      <p className="text-3xl font-bold text-sky-400 mt-1">
                        {report.aeoScore ?? 0}/100
                      </p>
                    </div>
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                      <p className="text-xs text-slate-400">GEO Authority Score</p>
                      <p className="text-3xl font-bold text-emerald-400 mt-1">
                        {report.geoScore ?? 0}/100
                      </p>
                    </div>
                  </div>

                  {/* Technical Badges + Multi-Page Crawl + Generate AI Fixes CTA */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                      {typeof report.hasLlmsTxt === 'boolean' && (
                        <span className="bg-[#0f172a] border border-slate-800 px-3 py-1.5 rounded-lg">
                          llms.txt: {report.hasLlmsTxt ? 'Detected' : 'Missing'}
                        </span>
                      )}
                      {Array.isArray(report.schemaTypes) && (
                        <span className="bg-[#0f172a] border border-slate-800 px-3 py-1.5 rounded-lg">
                          Schemas: {report.schemaTypes.length ? report.schemaTypes.join(', ') : 'None detected'}
                        </span>
                      )}
                      {typeof auditResult.wordCount === 'number' && (
                        <span className="bg-[#0f172a] border border-slate-800 px-3 py-1.5 rounded-lg">
                          SSR Text: {auditResult.wordCount} words
                        </span>
                      )}
                      {typeof auditResult.hasSitemap === 'boolean' && (
                        <span className="bg-[#0f172a] border border-slate-800 px-3 py-1.5 rounded-lg">
                          sitemap.xml:{' '}
                          {auditResult.hasSitemap
                            ? auditResult.sitemapUrlCount > 0
                              ? `Detected (${auditResult.sitemapUrlCount} URLs)`
                              : 'Detected'
                            : 'Missing'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                      {discoveredCount > 0 && (
                        <button
                          onClick={handleCrawlTopPages}
                          disabled={multiCrawlLoading}
                          className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium px-4 py-3 rounded-xl text-sm flex items-center gap-2 transition"
                        >
                          <Layers className="w-4 h-4" />
                          {multiCrawlLoading
                            ? `Crawling ${discoveredCount} Pages...`
                            : `Crawl Top ${discoveredCount} Pages`}
                        </button>
                      )}

                      <button
                        onClick={() => handleGenerateFixes()}
                        disabled={fixLoading}
                        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium px-5 py-3 rounded-xl text-sm flex items-center gap-2 transition"
                      >
                        <Sparkles className="w-4 h-4" />
                        {fixLoading ? 'Generating AEO/GEO Assets...' : 'Generate AI Fixes & JSON-LD Schema'}
                      </button>
                    </div>
                  </div>

                  {/* Multi-Page Site Health Matrix */}
                  {multiCrawlResults && (
                    <div className="bg-[#0f172a] border border-sky-800/50 rounded-2xl overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-sky-300">
                          Site-Wide Multi-Page Audit Matrix ({multiCrawlResults.length} Subpages)
                        </h3>
                        <span className="text-xs text-slate-400">
                          Discovered via {auditResult.hasSitemap ? 'sitemap.xml' : 'internal links'}
                        </span>
                      </div>

                      <div className="divide-y divide-slate-800/80">
                        {multiCrawlResults.map((pg, idx) => (
                          <div
                            key={idx}
                            className="px-5 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs"
                          >
                            <span className="font-medium text-slate-200 truncate max-w-md">
                              {pg.url}
                            </span>

                            {pg.error ? (
                              <span className="text-rose-400">{pg.error}</span>
                            ) : (
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="text-indigo-400 font-semibold">
                                  SEO: {pg.seoScore}/100
                                </span>
                                <span className="text-sky-400 font-semibold">
                                  AEO: {pg.aeoScore}/100
                                </span>
                                <span className="text-emerald-400 font-semibold">
                                  GEO: {pg.geoScore}/100
                                </span>
                                <span className="bg-[#060b19] border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                                  {pg.wordCount} words
                                </span>
                                <span className="bg-[#060b19] border border-slate-800 px-2 py-0.5 rounded text-slate-300">
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
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-slate-400 mr-1">
                        AI Search Crawlers (robots.txt):
                      </span>
                      {Object.entries(auditResult.botAccess).map(([bot, status]) => (
                        <span
                          key={bot}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${status === 'Allowed'
                              ? 'bg-emerald-950/50 border-emerald-800/70 text-emerald-300'
                              : 'bg-rose-950/50 border-rose-800/70 text-rose-300'
                            }`}
                        >
                          {bot}: {status}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
                    <h2 className="text-base font-semibold text-white mb-2">Diagnostic Findings</h2>
                    {findings.length === 0 ? (
                      <div className="flex items-center gap-2.5 bg-[#060b19] border border-slate-800/80 p-4 rounded-xl text-xs text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>All core SEO, AEO, and GEO checks passed for this URL.</span>
                      </div>
                    ) : (
                      findings.map((item, idx) => {
                        if (typeof item === 'string') {
                          return (
                            <div
                              key={idx}
                              className="flex items-start gap-3 bg-[#060b19] border border-slate-800/80 p-4 rounded-xl"
                            >
                              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                              <p className="text-sm text-slate-200">{item}</p>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-3 bg-[#060b19] border border-slate-800/80 p-4 rounded-xl"
                          >
                            {item.status === 'pass' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            ) : item.status === 'warn' ? (
                              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-slate-200">
                                {item.pillar ? `[${item.pillar}] ` : item.category ? `[${item.category}] ` : ''}
                                {item.check || item.title || item.message || item.issue || JSON.stringify(item)}
                              </p>
                              {(item.detail || item.description || item.recommendation) && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {item.detail || item.description || item.recommendation}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {generatedFixes && (
                    <div className="bg-[#0f172a] border border-purple-800/50 rounded-2xl p-6 space-y-5">
                      <h2 className="text-base font-semibold text-purple-300">
                        AI-Generated AEO & GEO Optimization Assets
                      </h2>

                      {generatedFixes.llmsTxt && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-slate-300">llms.txt Content</span>
                            <div className="flex items-center gap-3 print:hidden">
                              <button
                                onClick={() => handleDownloadFile('llms.txt', generatedFixes.llmsTxt, 'text/plain')}
                                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download llms.txt
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
                          <pre className="bg-[#060b19] border border-slate-800 rounded-xl p-4 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">
                            {generatedFixes.llmsTxt}
                          </pre>
                        </div>
                      )}

                      {generatedFixes.jsonLdSchema && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-slate-300">JSON-LD Structured Schema</span>
                            <div className="flex items-center gap-3 print:hidden">
                              <button
                                onClick={() => handleDownloadFile('schema.json', generatedFixes.jsonLdSchema, 'application/ld+json')}
                                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download schema.json
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
                          <pre className="bg-[#060b19] border border-slate-800 rounded-xl p-4 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">
                            {generatedFixes.jsonLdSchema}
                          </pre>
                        </div>
                      )}

                      {Array.isArray(generatedFixes.citabilitySnippets) &&
                        generatedFixes.citabilitySnippets.length > 0 && (
                          <div className="space-y-3">
                            <span className="text-xs font-medium text-emerald-300">
                              Answer-First Citability Paragraphs (Ready for Featured Snippets & LLMs)
                            </span>
                            <div className="space-y-3">
                              {generatedFixes.citabilitySnippets.map((snip, idx) => {
                                const snipKey = `snip-${idx}`;
                                const copyPayload = `${snip.questionHeading}\n${snip.answerFirstParagraph}`;

                                return (
                                  <div
                                    key={idx}
                                    className="bg-[#060b19] border border-slate-800 rounded-xl p-4 space-y-2"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-xs font-semibold text-sky-300">
                                        {snip.questionHeading}
                                      </p>
                                      <button
                                        onClick={() => handleCopy(copyPayload, snipKey)}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 print:hidden"
                                      >
                                        {copiedField === snipKey ? (
                                          <Check className="w-3.5 h-3.5" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                        {copiedField === snipKey ? 'Copied' : 'Copy Block'}
                                      </button>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">
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
                            <span className="text-xs font-medium text-slate-300">
                              Recommended AEO Question Headings (H2/H3)
                            </span>
                            <ul className="bg-[#060b19] border border-slate-800 rounded-xl p-4 space-y-1.5 text-xs text-sky-300 list-disc list-inside">
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
              className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
            >
              <div className="md:col-span-9">
                <label className="block text-xs text-slate-400 mb-2">
                  Target URL to Inspect Through Non-JS AI Crawler Lens
                </label>
                <input
                  type="text"
                  placeholder="https://3dots.co/ or https://www.infosys.com/"
                  value={xrayUrl}
                  onChange={(e) => setXrayUrl(e.target.value)}
                  className="w-full bg-[#060b19] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={xrayLoading}
                  className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition"
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
                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                    <p className="text-xs text-slate-400">Non-JS Visible Words</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {xrayResult.visibleWords}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {xrayResult.scriptCount} &lt;script&gt; tags stripped
                    </p>
                  </div>

                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                    <p className="text-xs text-slate-400">Text-to-HTML Ratio</p>
                    <p className="text-2xl font-bold text-violet-400 mt-1">
                      {xrayResult.textToHtmlRatio}%
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Signal vs markup density</p>
                  </div>

                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                    <p className="text-xs text-slate-400">JS-Dependency Risk</p>
                    <p
                      className={`text-2xl font-bold mt-1 ${xrayResult.jsRiskLevel === 'Low'
                          ? 'text-emerald-400'
                          : xrayResult.jsRiskLevel === 'Moderate'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                    >
                      {xrayResult.jsRiskLevel}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">SSR hydration check</p>
                  </div>

                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                    <p className="text-xs text-slate-400">/llms.txt Spec Status</p>
                    <p
                      className={`text-lg font-bold mt-1 ${xrayResult.hasLlmsTxt ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                    >
                      {xrayResult.llmsValidation.status}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      llms-full.txt: {xrayResult.hasLlmsFullTxt ? 'Detected' : 'Missing'}
                    </p>
                  </div>
                </div>

                {/* JS-Dependency Diagnosis Banner */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 flex items-start gap-3">
                  {xrayResult.jsRiskLevel === 'Low' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      AI Crawler Rendering Assessment
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {xrayResult.jsRiskSummary}
                    </p>
                  </div>
                </div>

                {/* /llms.txt Spec Checklist */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
                  <h3 className="text-sm font-semibold text-violet-300">
                    llmstxt.org Specification Audit ({xrayResult.origin}/llms.txt)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-[#060b19] border border-slate-800 p-3.5 rounded-xl flex items-center gap-2">
                      {xrayResult.llmsValidation.hasH1Title ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span># H1 Brand Title</span>
                    </div>
                    <div className="bg-[#060b19] border border-slate-800 p-3.5 rounded-xl flex items-center gap-2">
                      {xrayResult.llmsValidation.hasBlockquoteSummary ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>&gt; Blockquote Summary</span>
                    </div>
                    <div className="bg-[#060b19] border border-slate-800 p-3.5 rounded-xl flex items-center gap-2">
                      {xrayResult.llmsValidation.hasMarkdownLinks ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>[Page](URL) Markdown Links</span>
                    </div>
                  </div>

                  {xrayResult.llmsTxtContent && (
                    <pre className="bg-[#060b19] border border-slate-800 rounded-xl p-4 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-56 overflow-y-auto mt-2">
                      {xrayResult.llmsTxtContent}
                    </pre>
                  )}
                </div>

                {/* Structural Heading Outline + Raw Text View */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-white">
                      Extracted Heading Tree ({xrayResult.headingOutline.length})
                    </h3>
                    {xrayResult.headingOutline.length === 0 ? (
                      <p className="text-xs text-rose-400">
                        No H1–H3 headings visible without JavaScript!
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {xrayResult.headingOutline.map((h, idx) => (
                          <div
                            key={idx}
                            className="bg-[#060b19] border border-slate-800 px-3 py-2 rounded-lg text-xs flex items-start gap-2"
                          >
                            <span className="bg-violet-500/20 text-violet-300 font-mono px-1.5 py-0.5 rounded text-[10px] shrink-0">
                              {h.tag}
                            </span>
                            <span className="text-slate-200">{h.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">
                        Raw Text Extracted by LLM Scraper
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleCopy(xrayResult.rawCrawlerText, 'xray-text')}
                        className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                      >
                        {copiedField === 'xray-text' ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedField === 'xray-text' ? 'Copied' : 'Copy Raw Text'}
                      </button>
                    </div>
                    <pre className="bg-[#060b19] border border-slate-800 rounded-xl p-4 text-xs text-slate-300 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                      {xrayResult.rawCrawlerText || 'No readable text found in initial HTML response.'}
                    </pre>
                  </div>
                </div>

                {/* 1-Click robots.txt AI Policy Generator */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        1-Click AI Crawler robots.txt Policy Generator
                      </h3>
                      <p className="text-xs text-slate-400">
                        Choose whether to allow AI search citations only or allow full AI training + search
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRobotsPolicyMode('search-only')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${robotsPolicyMode === 'search-only'
                            ? 'bg-violet-600 border-violet-500 text-white'
                            : 'bg-[#060b19] border-slate-700 text-slate-300'
                          }`}
                      >
                        AI Search Only (Block Training)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRobotsPolicyMode('allow-all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${robotsPolicyMode === 'allow-all'
                            ? 'bg-violet-600 border-violet-500 text-white'
                            : 'bg-[#060b19] border-slate-700 text-slate-300'
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
                            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
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
                        <pre className="bg-[#060b19] border border-slate-800 rounded-xl p-4 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">
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
              className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
            >
              <div className="md:col-span-9">
                <label className="block text-xs text-slate-400 mb-2">
                  Domain or Website URL to Inspect Sitemaps
                </label>
                <input
                  type="text"
                  placeholder="https://app.gruha.ai/ or https://3dots.co/"
                  value={sitemapInputUrl}
                  onChange={(e) => setSitemapInputUrl(e.target.value)}
                  className="w-full bg-[#060b19] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={sitemapLoading}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition"
                >
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
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                      <p className="text-xs text-slate-400">XML Sitemap Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {sitemapResult.found ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span className="text-xl font-bold text-emerald-400">Detected</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-rose-400" />
                            <span className="text-xl font-bold text-rose-400">Not Found</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {sitemapResult.sitemapUrl || `Checked ${sitemapResult.origin}/sitemap.xml & robots.txt`}
                      </p>
                    </div>

                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                      <p className="text-xs text-slate-400">Sitemap Structure</p>
                      <p className="text-xl font-bold text-cyan-400 mt-1">
                        {sitemapResult.found
                          ? sitemapResult.isSitemapIndex
                            ? `Index (${sitemapResult.childSitemaps.length} sub-sitemaps)`
                            : 'Standard URLSet'
                          : 'Fallback Link Crawl'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {sitemapResult.found ? 'Verified XML schema' : 'Auto-discovered from HTML links'}
                      </p>
                    </div>

                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                      <p className="text-xs text-slate-400">Indexed Page URLs</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {sitemapResult.found
                          ? sitemapResult.totalUrls
                          : sitemapResult.discoveredInternalLinks?.length || 0}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {sitemapResult.found ? 'Listed in XML sitemap' : 'Internal routes ready for XML'}
                      </p>
                    </div>
                  </div>

                  {/* Child Sitemap Index Badges (if Sitemap Index) */}
                  {sitemapResult.isSitemapIndex && sitemapResult.childSitemaps?.length > 0 && (
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-2">
                      <p className="text-xs font-semibold text-cyan-300">
                        Child Sitemaps Inside Sitemap Index:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {sitemapResult.childSitemaps.map((child, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-[#060b19] border border-slate-700 text-slate-300 px-3 py-1 rounded-lg"
                          >
                            {child}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Discovered URL Directory Table (when Sitemap is Found) */}
                  {sitemapResult.found && sitemapResult.urls?.length > 0 && (
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden">
                      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            Discovered Sitemap URLs ({filteredUrls.length})
                          </h3>
                          <p className="text-xs text-slate-400">
                            Click &ldquo;Audit Page&rdquo; on any URL to run a full SEO • AEO • GEO check
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Filter URLs..."
                            value={sitemapSearchFilter}
                            onChange={(e) => setSitemapSearchFilter(e.target.value)}
                            className="bg-[#060b19] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
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
                            className="bg-[#060b19] hover:bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Export URLs
                          </button>
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/80">
                        {filteredUrls.map((item, idx) => (
                          <div
                            key={idx}
                            className="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs hover:bg-slate-900/40"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <a
                                href={item.loc}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-200 hover:text-cyan-300 font-medium flex items-center gap-1.5 truncate"
                              >
                                <span className="truncate">{item.loc}</span>
                                <ExternalLink className="w-3 h-3 shrink-0 text-slate-500" />
                              </a>
                              <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
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
                              className="bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 self-start sm:self-auto"
                            >
                              Audit Page
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Auto-Generated XML Sitemap (when Sitemap is Missing) */}
                  {!sitemapResult.found && sitemapResult.generatedXml && (
                    <div className="bg-[#0f172a] border border-cyan-800/50 rounded-2xl p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-cyan-300">
                            No /sitemap.xml Found — Ready-to-Upload XML Sitemap Generated
                          </h3>
                          <p className="text-xs text-slate-400">
                            Built from {sitemapResult.discoveredInternalLinks?.length || 0} internal routes crawled on {sitemapResult.origin}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleDownloadFile('sitemap.xml', sitemapResult.generatedXml, 'application/xml')
                            }
                            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
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

                      <pre className="bg-[#060b19] border border-slate-800 rounded-xl p-4 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-72 overflow-y-auto">
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
              className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-end print:hidden"
            >
              <div className="md:col-span-4">
                <label className="block text-xs text-slate-400 mb-2">Your Website URL</label>
                <input
                  type="text"
                  placeholder="https://3dots.co/"
                  value={myBattleUrl}
                  onChange={(e) => setMyBattleUrl(e.target.value)}
                  className="w-full bg-[#060b19] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="md:col-span-5">
                <label className="block text-xs text-slate-400 mb-2">Competitor Website URL</label>
                <input
                  type="text"
                  placeholder="https://vercel.com/"
                  value={rivalBattleUrl}
                  onChange={(e) => setRivalBattleUrl(e.target.value)}
                  className="w-full bg-[#060b19] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={battleLoading}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition"
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
                  <div className="bg-[#0f172a] border border-amber-700/50 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <Trophy className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Overall Search & AI Readiness Winner</p>
                        <h2 className="text-xl font-bold text-white">
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
                      className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition self-start sm:self-auto print:hidden"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate AI Fixes for {myDomain}
                    </button>
                  </div>

                  {/* Side-by-Side Comparison Table */}
                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-12 bg-[#060b19] border-b border-slate-800 px-5 py-3.5 text-xs font-semibold text-slate-400">
                      <div className="col-span-4">Audit Dimension</div>
                      <div className="col-span-4 text-indigo-300">{myDomain} (You)</div>
                      <div className="col-span-4 text-amber-300">{rivalDomain} (Competitor)</div>
                    </div>

                    <div className="divide-y divide-slate-800/80">
                      {rows.map((row, idx) => {
                        const myWins = row.myNum > row.rivalNum;
                        const rivalWins = row.rivalNum > row.myNum;

                        return (
                          <div
                            key={idx}
                            className="grid grid-cols-12 px-5 py-4 text-sm items-center gap-2"
                          >
                            <div className="col-span-4 text-xs font-medium text-slate-300">
                              {row.label}
                            </div>
                            <div
                              className={`col-span-4 font-semibold ${myWins ? 'text-emerald-400' : 'text-slate-200'
                                }`}
                            >
                              {row.mine} {myWins && '★'}
                            </div>
                            <div
                              className={`col-span-4 font-semibold ${rivalWins ? 'text-amber-400' : 'text-slate-200'
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
                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
                    <h3 className="text-sm font-semibold text-amber-400">
                      Competitive Gap Analysis
                    </h3>
                    {gaps.length === 0 ? (
                      <div className="flex items-center gap-2.5 bg-[#060b19] border border-slate-800 p-4 rounded-xl text-xs text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          {myDomain} matches or outperforms {rivalDomain} across all technical SEO, AEO, and GEO checks!
                        </span>
                      </div>
                    ) : (
                      gaps.map((gap, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 bg-[#060b19] border border-slate-800 p-4 rounded-xl text-xs text-slate-200"
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
              className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 print:hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Target Brand Name</label>
                  <input
                    type="text"
                    placeholder="3dots"
                    value={geoBrand}
                    onChange={(e) => setGeoBrand(e.target.value)}
                    className="w-full bg-[#060b19] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Brand Domain</label>
                  <input
                    type="text"
                    placeholder="3dots.co"
                    value={geoDomain}
                    onChange={(e) => setGeoDomain(e.target.value)}
                    className="w-full bg-[#060b19] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs text-slate-400">
                    Buyer-Intent AI Prompts (1 to 5 prompts, one per line)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setGeoPromptsInput(
                        `Best AI automation and custom software engineering companies in India\nTop MVP development agencies for startups\nLeading enterprise AI consulting firms`
                      )
                    }
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    + Fill 3 Sample Prompts
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder={`Best AI automation and custom software engineering companies in India\nTop MVP development agencies for startups\nLeading enterprise AI consulting firms`}
                  value={geoPromptsInput}
                  onChange={(e) => setGeoPromptsInput(e.target.value)}
                  className="w-full bg-[#060b19] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-400">
                  {geoProgress || 'Runs up to 5 prompts sequentially and calculates AI Share of Voice %.'}
                </span>
                <button
                  type="submit"
                  disabled={geoLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-xl text-sm flex items-center justify-center gap-2 transition shrink-0"
                >
                  <BarChart3 className="w-4 h-4" />
                  {geoLoading ? 'Running Batch...' : 'Measure AI Share of Voice'}
                </button>
              </div>
            </form>

            {geoBatchResult && (
              <div className="space-y-6">
                {/* Share of Voice Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#0f172a] border border-emerald-800/50 rounded-2xl p-5">
                    <p className="text-xs text-slate-400">AI Share of Voice</p>
                    <p className="text-3xl font-bold text-emerald-400 mt-1">
                      {geoBatchResult.shareOfVoice}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Cited in {geoBatchResult.mentionedCount} of {geoBatchResult.totalPrompts} prompts
                    </p>
                  </div>

                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                    <p className="text-xs text-slate-400">Average Rank Position</p>
                    <p className="text-3xl font-bold text-indigo-400 mt-1">
                      {geoBatchResult.avgRank ? `#${geoBatchResult.avgRank}` : 'Unranked'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Across ranked AI recommendations</p>
                  </div>

                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                    <p className="text-xs text-slate-400">Competing Brands Detected</p>
                    <p className="text-3xl font-bold text-amber-400 mt-1">
                      {geoBatchResult.topCompetitors.length}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Unique rivals cited by AI</p>
                  </div>
                </div>

                {/* Competitor Citation Leaderboard */}
                {geoBatchResult.topCompetitors.length > 0 && (
                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
                    <h3 className="text-sm font-semibold text-amber-400">
                      AI Competitor Citation Leaderboard
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {geoBatchResult.topCompetitors.map(([compName, count], idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-[#060b19] border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2"
                        >
                          <span className="font-medium">{compName}</span>
                          <span className="text-[11px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                            {count}x cited
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Per-Prompt Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">
                    Prompt-by-Prompt Visibility Breakdown
                  </h3>
                  {geoBatchResult.runs.map((run, idx) => {
                    const expandKey = `batch-${idx}`;
                    const isOpen = !!expandedItems[expandKey];

                    return (
                      <div
                        key={idx}
                        className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-100">
                            {idx + 1}. &ldquo;{run.prompt}&rdquo;
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${run.mentioned
                                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
                                }`}
                            >
                              {run.mentioned
                                ? run.rankPosition
                                  ? `Mentioned (#${run.rankPosition})`
                                  : 'Mentioned'
                                : 'Not Mentioned'}
                            </span>
                            <span className="text-xs bg-[#060b19] border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg capitalize">
                              {run.sentiment}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">{run.insight}</p>

                        <button
                          type="button"
                          onClick={() => toggleExpand(expandKey)}
                          className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 print:hidden"
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
                          <div className="bg-[#060b19] border border-slate-800 rounded-xl p-4 text-xs text-slate-300 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
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
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                <p className="text-xs text-slate-400">Tracked Projects</p>
                <p className="text-2xl font-bold text-white mt-1">{projects.length}</p>
              </div>
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                <p className="text-xs text-slate-400">Saved Site Audits</p>
                <p className="text-2xl font-bold text-indigo-400 mt-1">{totalAudits}</p>
              </div>
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                <p className="text-xs text-slate-400">GEO Citation Checks</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{totalGeoChecks}</p>
              </div>
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between print:hidden">
                <label className="text-xs text-slate-400 mb-1">Filter by Domain</label>
                <div className="flex gap-2">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-[#060b19] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
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
                    className="bg-[#060b19] border border-slate-700 hover:border-sky-500 p-2 rounded-lg text-slate-300"
                  >
                    <RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Project Cards */}
            {filteredProjects.length === 0 ? (
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-10 text-center space-y-2">
                <FolderKanban className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-medium text-slate-300">No saved records found yet</p>
                <p className="text-xs text-slate-500">
                  Run a Site Audit or GEO Citation Check to save records into Neon PostgreSQL.
                </p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-5"
                >
                  {/* Project Header + Export + Delete */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                        <Globe className="w-5 h-5 text-sky-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">{project.brandName}</h2>
                        <p className="text-xs text-slate-400">{project.domain}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                      <span className="text-xs text-slate-400 mr-1">
                        {project.audits.length} Audits • {project.geoChecks.length} GEO Checks
                      </span>
                      <button
                        onClick={() => handleExportProjectMarkdown(project)}
                        className="flex items-center gap-1.5 text-xs font-medium bg-[#060b19] hover:bg-slate-900 border border-slate-700 hover:border-sky-500 text-sky-300 px-3 py-1.5 rounded-lg transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export .md
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteRecord(project.id, 'project', `project "${project.brandName}"`)
                        }
                        disabled={deletingId === project.id}
                        title="Delete Project & All History"
                        className="flex items-center gap-1 text-xs font-medium bg-[#060b19] hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700 text-rose-400 px-2.5 py-1.5 rounded-lg transition disabled:opacity-50"
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
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                        Saved Site Audits (Click to Inspect)
                      </h3>
                      <div className="space-y-2">
                        {project.audits.map((audit) => {
                          const isOpen = !!expandedItems[audit.id];
                          const diagnostics = Array.isArray(audit.issues) ? audit.issues : [];

                          return (
                            <div
                              key={audit.id}
                              className="bg-[#060b19] border border-slate-800 rounded-xl overflow-hidden"
                            >
                              <div className="flex items-center justify-between pr-3">
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(audit.id)}
                                  className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-left hover:bg-slate-900/50 transition"
                                >
                                  <div className="space-y-1">
                                    <p className="text-xs text-slate-400">
                                      {audit.url} • {new Date(audit.createdAt).toLocaleString()}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
                                      <span className="text-indigo-400">SEO: {audit.seoScore}/100</span>
                                      <span className="text-sky-400">AEO: {audit.aeoScore}/100</span>
                                      <span className="text-emerald-400">GEO: {audit.geoScore}/100</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span>{isOpen ? 'Hide Details' : 'View Diagnostics'}</span>
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
                                  className="p-2 text-slate-500 hover:text-rose-400 transition disabled:opacity-50 print:hidden"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {isOpen && (
                                <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 space-y-3">
                                  <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                                    <span className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-md">
                                      llms.txt: {audit.hasLlmsTxt ? 'Detected' : 'Missing'}
                                    </span>
                                    <span className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-md">
                                      Schemas:{' '}
                                      {audit.schemaTypes?.length
                                        ? audit.schemaTypes.join(', ')
                                        : 'None detected'}
                                    </span>
                                  </div>

                                  {diagnostics.length > 0 && (
                                    <div className="space-y-2">
                                      {diagnostics.map((item, idx) => {
                                        if (typeof item === 'string') {
                                          return (
                                            <div
                                              key={idx}
                                              className="flex items-start gap-2.5 bg-[#0f172a] p-3 rounded-lg text-xs"
                                            >
                                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                              <p className="text-slate-200">{item}</p>
                                            </div>
                                          );
                                        }
                                        return (
                                          <div
                                            key={idx}
                                            className="flex items-start gap-2.5 bg-[#0f172a] p-3 rounded-lg text-xs"
                                          >
                                            {item.status === 'pass' ? (
                                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                            ) : item.status === 'warn' ? (
                                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                            ) : (
                                              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                              <p className="font-medium text-slate-200">
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
                                                  <p className="text-slate-400 mt-0.5">
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
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        GEO Citation History (Click to Inspect AI Response)
                      </h3>
                      <div className="space-y-2">
                        {project.geoChecks.map((check) => {
                          const isOpen = !!expandedItems[check.id];

                          return (
                            <div
                              key={check.id}
                              className="bg-[#060b19] border border-slate-800 rounded-xl overflow-hidden"
                            >
                              <div className="flex items-center justify-between pr-3">
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(check.id)}
                                  className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left hover:bg-slate-900/50 transition"
                                >
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-200">
                                      Prompt: &ldquo;{check.prompt}&rdquo;
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      Engine: {check.llmProvider || 'Gemini 2.5 Flash-Lite'} •{' '}
                                      {new Date(check.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span
                                      className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${check.brandMentioned
                                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                                        : 'bg-rose-950/60 border-rose-800 text-rose-300'
                                        }`}
                                    >
                                      {check.brandMentioned ? 'Mentioned' : 'Not Mentioned'}
                                    </span>
                                    <span className="text-xs bg-slate-900 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg capitalize">
                                      {check.sentiment || 'Neutral'}
                                    </span>
                                    {isOpen ? (
                                      <ChevronUp className="w-4 h-4 text-slate-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-slate-400" />
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
                                  className="p-2 text-slate-500 hover:text-rose-400 transition disabled:opacity-50 print:hidden"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {isOpen && (
                                <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 space-y-3">
                                  {check.citedUrls?.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                      <span className="text-slate-400">Cited URLs:</span>
                                      {check.citedUrls.map((u, idx) => (
                                        <span
                                          key={idx}
                                          className="bg-slate-900 border border-slate-700 text-sky-300 px-2.5 py-1 rounded-md"
                                        >
                                          {u}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-400">
                                      Saved AI Response:
                                    </p>
                                    <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3 text-xs text-slate-300 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
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
      </div>
    </main>
  );
}