/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { SheetRow, PlayerStats, TeamStatsSummary, Language } from '../types';
import { getTranslation } from '../utils/locales';

interface DashboardChartsProps {
  rows: SheetRow[];
  players: PlayerStats[];
  teamStats: TeamStatsSummary;
  lang: Language;
}

export default function DashboardCharts({ rows, players, teamStats, lang }: DashboardChartsProps) {
  const t = getTranslation(lang);

  // 1. Bar Chart: Goals per Player (Top 8 of currently visible/filtered players)
  const barData = players
    .filter((p) => p.golesAnotados > 0)
    .slice(0, 8)
    .map((p) => ({
      name: p.jugador.split(',')[0] || p.jugador, // simplify name if last_name, first_name format
      [t.goalsLabel]: p.golesAnotados,
    }));

  // 2. Donut Chart: Match outcomes
  const donutData = [
    { name: t.wins, value: teamStats.victorias, color: '#10b981' }, // Emerald
    { name: t.draws, value: teamStats.empates, color: '#f59e0b' },  // Amber
    { name: t.losses, value: teamStats.derrotas, color: '#ef4444' }, // Rose
  ].filter((item) => item.value > 0);

  const totalMatches = donutData.reduce((sum, item) => sum + item.value, 0);

  // 3. Playtime Distribution Pie/Donut (Starter vs Sub)
  const totalStarterMins = rows.reduce((sum, r) => sum + (r.titular ? r.minutosJugados : 0), 0);
  const totalSubMins = rows.reduce((sum, r) => sum + (r.suplente ? r.minutosJugados : 0), 0);
  const playStyleData = [
    { name: t.statStarter, value: totalStarterMins, color: '#4f46e5' }, // Indigo-600
    { name: t.statSubstitute, value: totalSubMins, color: '#06b6d4' }, // Cyan
  ].filter((item) => item.value > 0);

  // 4. Line Chart: Timeline of Goals and Cards
  // Group by date, sum goals, yellow cards, red cards
  const datesMap = new Map<string, { dateStr: string; goals: number; cards: number }>();
  
  // Sort rows oldest FIRST for the chronological axis timeline
  const chronologicalRows = [...rows].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  chronologicalRows.forEach((row) => {
    if (!row.fecha) return;
    const existing = datesMap.get(row.fecha) || {
      dateStr: row.fecha,
      goals: 0,
      cards: 0,
    };
    existing.goals += row.golesAnotados;
    existing.cards += row.tarjetaAmarilla + row.tarjetaRoja + row.dobleAmarilla;
    datesMap.set(row.fecha, existing);
  });

  const timelineData = Array.from(datesMap.values()).slice(-10); // Keep last 10 dates for density and clean reading

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5" id="dashboard-charts-grid">
      {/* Chart 1: Bar Chart of Goals */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col shadow-xs" id="chart-goals-per-player">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-4 flex items-center justify-between">
          <span>{t.chartGoalsPerPlayer}</span>
          <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded-full uppercase tracking-normal">
            Top {barData.length}
          </span>
        </h4>
        <div className="h-60 w-full" id="chart1-container">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="105%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    borderColor: '#475569',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey={t.goalsLabel} fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
              No hay datos de goles en los filtros seleccionados
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Timeline of Events */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col shadow-xs" id="chart-timeline">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-4">
          {t.chartTimeline}
        </h4>
        <div className="h-60 w-full" id="chart2-container">
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="105%">
              <LineChart data={timelineData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="dateStr" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    borderColor: '#475569',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="goals" name={t.goalsLabel} stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="cards" name={t.cardsLabel} stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
              No hay suficientes fechas filtradas
            </div>
          )}
        </div>
      </div>

      {/* Chart 3: Match Outcomes (Donut) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col shadow-xs" id="chart-outcome-dist">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
          {t.chartOutcomeDistribution}
        </h4>
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-4 py-2" id="chart3-container">
          {donutData.length > 0 ? (
            <>
              <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0" id="outcome-donut-pie">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={50}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center" id="outcome-center-label">
                  <span className="block text-xl font-bold font-mono tracking-tight text-slate-800 dark:text-zinc-102">{totalMatches}</span>
                  <span className="block text-[8px] text-slate-400 uppercase tracking-widest">{lang === 'es' ? 'PARTIDOS' : 'MATCHES'}</span>
                </div>
              </div>

              <div className="space-y-2 flex-grow self-center max-w-xs w-full" id="outcome-legend">
                {donutData.map((item, idx) => {
                  const percent = totalMatches > 0 ? Math.round((item.value / totalMatches) * 100) : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs" id={`outcome-legend-row-${idx}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-slate-700 dark:text-zinc-200">{item.name}</span>
                      </div>
                      <span className="font-mono text-slate-500 dark:text-zinc-400">
                        {item.value} <span className="text-[10px] opacity-75">({percent}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-400 font-medium">No hay partidos para calcular distribución</div>
          )}
        </div>
      </div>

      {/* Chart 4: Starter vs Sub Playtime Share (Donut) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col shadow-xs" id="chart-starters-subs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
          {t.chartStarterSubDistribution}
        </h4>
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-4 py-2" id="chart4-container">
          {playStyleData.length > 0 ? (
            <>
              <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0" id="playstyle-donut-pie">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={playStyleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={50}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {playStyleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center" id="playstyle-center-label">
                  <span className="block text-xl font-bold font-mono tracking-tight text-slate-800 dark:text-zinc-102">
                    {(totalStarterMins + totalSubMins).toLocaleString()}
                  </span>
                  <span className="block text-[8px] text-slate-400 uppercase tracking-widest">{lang === 'es' ? 'MINUTOS' : 'MINUTES'}</span>
                </div>
              </div>

              <div className="space-y-2 flex-grow self-center max-w-xs w-full" id="playstyle-legend">
                {playStyleData.map((item, idx) => {
                  const totalSum = totalStarterMins + totalSubMins;
                  const percent = totalSum > 0 ? Math.round((item.value / totalSum) * 100) : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs" id={`playstyle-legend-row-${idx}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-slate-700 dark:text-zinc-200">{item.name}</span>
                      </div>
                      <span className="font-mono text-slate-500 dark:text-zinc-400">
                        {item.value.toLocaleString()} min <span className="text-[10px] opacity-75">({percent}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-400 font-medium">No hay minutos registrados</div>
          )}
        </div>
      </div>
    </div>
  );
}
