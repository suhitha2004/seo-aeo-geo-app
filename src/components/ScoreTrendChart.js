'use client';

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from 'recharts';

export default function ScoreTrendChart({ audits }) {
    if (!Array.isArray(audits) || audits.length < 2) {
        return (
            <div className="bg-[#060b19] border border-slate-800/80 rounded-xl px-4 py-3 text-xs text-slate-400">
                Run at least 2 audits on this domain to unlock the historical SEO / AEO / GEO score trend chart.
            </div>
        );
    }

    // Reverse so oldest audit is on the left and newest audit is on the right
    const chartData = [...audits]
        .reverse()
        .map((audit, index) => ({
            run: `#${index + 1} (${new Date(audit.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            })})`,
            SEO: audit.seoScore,
            AEO: audit.aeoScore,
            GEO: audit.geoScore,
        }));

    return (
        <div className="bg-[#060b19] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                    Historical Score Trend ({audits.length} Audits)
                </h4>
                <span className="text-[11px] text-slate-500">Chronological progression</span>
            </div>

            <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                            dataKey="run"
                            stroke="#64748b"
                            fontSize={11}
                            tickLine={false}
                            axisLine={{ stroke: '#334155' }}
                        />
                        <YAxis
                            domain={[0, 100]}
                            stroke="#64748b"
                            fontSize={11}
                            tickLine={false}
                            axisLine={{ stroke: '#334155' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                borderColor: '#334155',
                                borderRadius: '0.75rem',
                                fontSize: '12px',
                                color: '#f8fafc',
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                        <Line
                            type="monotone"
                            dataKey="SEO"
                            stroke="#818cf8"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: '#818cf8' }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="AEO"
                            stroke="#38bdf8"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: '#38bdf8' }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="GEO"
                            stroke="#34d399"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: '#34d399' }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}