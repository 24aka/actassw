/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Menu, X, RefreshCw, Moon, Sun, Table, Users, Trophy, 
  Calendar, Layers, FileSpreadsheet, Globe, ChevronRight 
} from 'lucide-react';
import { 
  fetchSheetData, 
  aggregatePlayerStats, 
  aggregateTeamStats, 
  calculateDashboardMetrics 
} from './services/sheetsService';
import { SheetRow, PlayerStats, FilterState, Language, Theme } from './types';
import { getTranslation } from './utils/locales';
import { CONFIG } from './config';

// Import UI components
import KPICards from './components/KPICards';
import FiltersBar from './components/FiltersBar';
import PlayerModal from './components/PlayerModal';
import PlayerStatsView from './components/PlayerStatsView';
import MatchesView from './components/MatchesView';
import FullTableView from './components/FullTableView';
import DashboardCharts from './components/DashboardCharts';

export default function App() {
  // --- States ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'players' | 'matches' | 'fulltable'>('dashboard');
  const [rawData, setRawData] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refresh & Sincronization indicators
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState<number>(0);
  
  // Translation & Theme
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('romo_lang');
    return (saved === 'en' || saved === 'es') ? (saved as Language) : 'es';
  });
  
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('romo_theme');
    return (saved === 'dark' || saved === 'light') ? (saved as Theme) : 'light';
  });

  // Filters State
  const [filters, setFilters] = useState<FilterState>(() => {
    try {
      const saved = localStorage.getItem('romo_db_filters');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      search: '',
      jugador: '',
      campo: '',
      competicion: '',
      resultadoFiltro: 'todos',
      fechaInicio: '',
      fechaFin: '',
    };
  });

  // Responsive Sidebar state (mobile drawer)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  // Selected Player detail Modal state
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);

  // --- HTML Localization Strings ---
  const t = getTranslation(lang);

  // --- Effects ---
  
  // Save language preference
  useEffect(() => {
    localStorage.setItem('romo_lang', lang);
  }, [lang]);

  // Save theme preference & toggle class
  useEffect(() => {
    localStorage.setItem('romo_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Save filters state in storage to satisfy Extra Requirement
  useEffect(() => {
    localStorage.setItem('romo_db_filters', JSON.stringify(filters));
  }, [filters]);

  // Fetch Excel sheet data on mount and set up auto-refresh
  useEffect(() => {
    loadData(true);

    // Auto-refresh every 5 minutes as requested
    const refreshTimer = setInterval(() => {
      loadData(false);
    }, CONFIG.REFRESH_INTERVAL);

    return () => {
      clearInterval(refreshTimer);
    };
  }, []);

  // Timer checking elapsed seconds since last sync
  useEffect(() => {
    setSecondsSinceUpdate(0);
    const elapsedTimer = setInterval(() => {
      setSecondsSinceUpdate(Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000));
    }, 1000);

    return () => {
      clearInterval(elapsedTimer);
    };
  }, [lastUpdated]);

  const loadData = async (isFirstTime = false) => {
    if (isFirstTime) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);
    try {
      const data = await fetchSheetData();
      setRawData(data);
      setLastUpdated(new Date());
      setSecondsSinceUpdate(0);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- Data Filter Logic ---
  const filteredRows = rawData.filter((row) => {
    // 1. Text Search matching columns mapping
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      const matchText = [
        row.jugador,
        row.campo,
        row.competicion,
        row.partido,
        row.jornada,
        row.resultado,
        row.equipoLocal,
        row.equipoVisitante,
        row.dorsal.toString()
      ].join(' ').toLowerCase();

      if (!matchText.includes(query)) return false;
    }

    // 2. Jugador Filter
    if (filters.jugador && row.jugador !== filters.jugador) {
      return false;
    }

    // 3. Competición Filter
    if (filters.competicion && row.competicion !== filters.competicion) {
      return false;
    }

    // 4. Campo Filter
    if (filters.campo && row.campo !== filters.campo) {
      return false;
    }

    // 5. Outcome outcome filter for Romo F.C.
    if (filters.resultadoFiltro !== 'todos') {
      const isLocalRomo = row.equipoLocal.toUpperCase().includes('ROMO');
      const isVisitanteRomo = row.equipoVisitante.toUpperCase().includes('ROMO');
      let goalsRomo = 0;
      let goalsOpponent = 0;

      if (isLocalRomo) {
        goalsRomo = row.golesLocal;
        goalsOpponent = row.golesVisitante;
      } else if (isVisitanteRomo) {
        goalsRomo = row.golesVisitante;
        goalsOpponent = row.golesLocal;
      } else {
        goalsRomo = row.golesLocal;
        goalsOpponent = row.golesVisitante;
      }

      const matchOutcome = goalsRomo > goalsOpponent ? 'victoria' : goalsRomo === goalsOpponent ? 'empate' : 'derrota';
      if (matchOutcome !== filters.resultadoFiltro) {
        return false;
      }
    }

    // 6. Date Range Filtering
    if (filters.fechaInicio) {
      const start = new Date(filters.fechaInicio).getTime();
      const rowDate = new Date(row.fecha).getTime();
      if (rowDate < start) return false;
    }

    if (filters.fechaFin) {
      const end = new Date(filters.fechaFin).getTime();
      const rowDate = new Date(row.fecha).getTime();
      if (rowDate > end) return false;
    }

    return true;
  });

  // --- Aggregate filtered datasets ---
  const aggregatedPlayers = aggregatePlayerStats(filteredRows);
  const teamStats = aggregateTeamStats(filteredRows);
  const dashboardKPIs = calculateDashboardMetrics(filteredRows, aggregatedPlayers);

  // Unique options for dropdown filters (precalculated from original unfiltered database to keep menus complete)
  const allUniquePlayers = Array.from(new Set(rawData.map((r) => r.jugador).filter(Boolean))) as string[];
  const allUniqueCompetitions = Array.from(new Set(rawData.map((r) => r.competicion).filter(Boolean))) as string[];
  const allUniquePitches = Array.from(new Set(rawData.map((r) => r.campo).filter(Boolean))) as string[];

  // Highlight active menu in Sidebar
  const linkClass = (tab: typeof activeTab) => {
    const base = "flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-150 capitalize ";
    if (activeTab === tab) {
      return base + "bg-indigo-600 text-white shadow-sm";
    }
    return base + "text-slate-400 hover:text-white hover:bg-slate-800/80";
  };

  // Humanize time calculations for header sync
  const formatSyncTime = () => {
    if (secondsSinceUpdate < 60) {
      return lang === 'es' ? 'hace unos instantes' : 'just now';
    }
    const mins = Math.floor(secondsSinceUpdate / 60);
    if (mins < 60) {
      return lang === 'es' ? `hace ${mins} ${mins === 1 ? 'min' : 'mins'}` : `${mins} ${mins === 1 ? 'min' : 'mins'} ago`;
    }
    return lastUpdated.toLocaleTimeString();
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-950 dark:text-zinc-50 font-sans overflow-hidden transition-colors duration-200">
      
      {/* 1. Mobile Sidebar Drawer Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-3xs md:hidden" 
          onClick={() => setSidebarOpen(false)}
          id="mobile-overlay"
        />
      )}

      {/* 2. Responsive Sidebar (Matching High Density palette and arrangements) */}
      <aside 
        className={`fixed md:relative inset-y-0 left-0 z-40 w-60 bg-slate-900/100 border-r border-slate-800 text-slate-300 flex flex-col justify-between transform transition-transform duration-200 md:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        id="app-sidebar"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Brand portion */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between" id="sidebar-brand-panel">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-extrabold text-sm tracking-tighter">RF</div>
              <span className="text-white font-extrabold text-base tracking-tight">Romo Analytics</span>
            </div>
            <button 
              className="md:hidden p-1 text-slate-400 hover:text-white focus:outline-none"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav menu links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" id="sidebar-nav-links">
            <span className="block text-4xs font-black uppercase tracking-widest text-slate-550 mb-2.5 px-3">
              {lang === 'es' ? 'Secciones' : 'Navigation'}
            </span>
            <button onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} className={linkClass('dashboard')}>
              <Layers className="w-4.5 h-4.5" />
              {t.tabDashboard}
            </button>
            <button onClick={() => { setActiveTab('players'); setSidebarOpen(false); }} className={linkClass('players')}>
              <Users className="w-4.5 h-4.5" />
              {t.tabPlayers}
            </button>
            <button onClick={() => { setActiveTab('matches'); setSidebarOpen(false); }} className={linkClass('matches')}>
              <Calendar className="w-4.5 h-4.5" />
              {t.tabMatches}
            </button>
            <button onClick={() => { setActiveTab('fulltable'); setSidebarOpen(false); }} className={linkClass('fulltable')}>
              <Table className="w-4.5 h-4.5" />
              {t.tabFullTable}
            </button>

            {/* Accent Section: Team Quick Metrics Record */}
            {rawData.length > 0 && (
              <div className="pt-6 mt-6 border-t border-slate-800/60" id="sidebar-quickstats-card">
                <span className="block text-4xs font-black uppercase tracking-widest text-slate-550 mb-3 px-3">
                  {lang === 'es' ? 'Récord de Equipo' : 'Team Record'}
                </span>
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 space-y-2 text-xs">
                  <div className="font-bold text-white text-center pb-1 border-b border-slate-800/50">
                    Romo F.C.
                  </div>
                  <div className="grid grid-cols-3 text-center gap-1 font-mono text-xs">
                    <div className="bg-emerald-500/10 p-1.5 rounded" title={t.wins}>
                      <span className="block text-emerald-500 font-extrabold text-[12px]">{teamStats.victorias}</span>
                      <span className="text-[9px] text-slate-400 capitalize">{t.wins.slice(0, 3)}</span>
                    </div>
                    <div className="bg-amber-500/10 p-1.5 rounded" title={t.draws}>
                      <span className="block text-amber-500 font-extrabold text-[12px]">{teamStats.empates}</span>
                      <span className="text-[9px] text-slate-400 capitalize">{t.draws.slice(0, 3)}</span>
                    </div>
                    <div className="bg-rose-500/10 p-1.5 rounded" title={t.losses}>
                      <span className="block text-rose-500 font-extrabold text-[12px]">{teamStats.derrotas}</span>
                      <span className="text-[9px] text-slate-400 capitalize">{t.losses.slice(0, 3)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-2xs px-1 text-slate-400 pt-1 border-t border-slate-800/40">
                    <span>{t.winRate}</span>
                    <strong className="text-white font-mono">
                      {teamStats.partidosJugados > 0 
                        ? `${Math.round((teamStats.victorias / teamStats.partidosJugados) * 100)}%`
                        : '0%'}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Configurations, language switches & theme controls footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 space-y-3" id="sidebar-footer">
          {/* Controls row */}
          <div className="flex items-center justify-between" id="locale-theme-panel">
            {/* Lang switch */}
            <button
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="px-2.5 py-1.5 text-3xs font-extrabold tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 uppercase select-none cursor-pointer transition"
              id="lang-toggle-button"
            >
              <Globe className="w-3 h-3 text-indigo-400 animate-spin-slow" />
              <span>{lang === 'es' ? 'ES' : 'EN'}</span>
            </button>

            {/* Theme switch */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg select-none cursor-pointer text-slate-200 transition"
              title={theme === 'light' ? t.themeDark : t.themeLight}
              id="theme-toggle-button"
            >
              {theme === 'light' ? (
                <span className="flex items-center gap-1.5 text-3xs uppercase font-extrabold tracking-wider"><Moon className="w-3 h-3 text-amber-400" /> {lang === 'es' ? 'Oscuro' : 'Dark'}</span>
              ) : (
                <span className="flex items-center gap-1.5 text-3xs uppercase font-extrabold tracking-wider"><Sun className="w-3 h-3 text-amber-400" /> {lang === 'es' ? 'Claro' : 'Light'}</span>
              )}
            </button>
          </div>

          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between truncate" id="sidebar-sheetid">
            <span>ID Sheet:</span>
            <a 
              href={CONFIG.SPREADSHEET_URL} 
              target="_blank" 
              rel="noreferrer" 
              className="text-indigo-400 hover:underline hover:text-indigo-300 transition shrink"
              title={t.sheetLink}
            >
              {CONFIG.SHEET_ID.slice(0, 8)}...
            </a>
          </div>
        </div>
      </aside>

      {/* 3. Main Content flow panel */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden" id="main-content-flow">
        {/* Dynamic header (Matching h-16 bg-white or bg-zinc-900 under theme setups) */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 flex items-center justify-between flex-shrink-0" id="header-panel">
          {/* Left panel */}
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 text-slate-500 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
              onClick={() => setSidebarOpen(true)}
              id="mobile-hamburger"
            >
              <Menu className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
            </button>
            <div className="min-w-0" id="header-titles">
              <h1 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white truncate tracking-tight uppercase leading-tight">
                {t.title}
              </h1>
              <p className="hidden sm:block text-3xs text-slate-400 font-medium truncate tracking-wide mt-0.5">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Right panel sync counters & refresh buttons */}
          <div className="flex items-center gap-3" id="header-sync-controls">
            {/* Sync Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider" id="sync-history-badge">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>{t.lastUpdated}: {formatSyncTime()}</span>
            </div>

            {/* Refresh btn */}
            <button
              onClick={() => loadData(false)}
              disabled={refreshing || loading}
              className="p-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-705 dark:text-zinc-200 border border-slate-200/50 dark:border-zinc-700 rounded-lg select-none cursor-pointer transition flex items-center justify-center gap-1.5 text-xs font-bold uppercase disabled:opacity-40 disabled:pointer-events-none"
              title={t.refreshBtn}
              id="sync-manual-refresh-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-3xs tracking-widest">{t.refreshBtn}</span>
            </button>
          </div>
        </header>

        {/* 4. Loader, Skeleton loading indicator overlay */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-zinc-950" id="overlay-full-loading">
            <div className="relative" id="loader-spinner-wrapper">
              <div className="w-12 h-12 border-4 border-slate-200 rounded-full animate-pulse" />
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-slate-500 dark:text-zinc-400 tracking-wider text-center uppercase">
                {t.loading}
              </p>
              <p className="text-2xs text-slate-400 mt-1 font-mono">{lang === 'es' ? 'Descargando formato CSV en vivo...' : 'Streaming spreadsheet data...'}</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 p-6 flex flex-col justify-center items-center text-center bg-slate-50 dark:bg-zinc-950" id="overlay-error-shield">
            <div className="max-w-md bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-950/40 p-6 rounded-2xl shadow-md space-y-4" id="error-card">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center text-red-500 text-2xl font-black mx-auto">!</div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{t.errorTitle}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {error}
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => loadData(true)}
                  className="w-full bg-slate-900 text-white rounded-xl py-2 px-4 shadow-sm hover:bg-slate-800 hover:scale-[1.01] transition font-semibold text-xs capitalize"
                >
                  {lang === 'es' ? 'Reintentar descargar' : 'Retry Refreshing'}
                </button>
                <a
                  href={CONFIG.SPREADSHEET_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-xs text-indigo-550 dark:text-indigo-400 hover:underline font-bold"
                >
                  {t.sheetLink}
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Live view components dashboard styling */
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" id="dashboard-scrolling-viewport">
            
            {/* Filters panel (Always visible so selections persist in state and works instantly across tabs) */}
            <FiltersBar
              filters={filters}
              setFilters={setFilters}
              playersList={allUniquePlayers}
              competitionsList={allUniqueCompetitions}
              pitchesList={allUniquePitches}
              lang={lang}
            />

            {/* KPI Cards panel */}
            <KPICards metrics={dashboardKPIs} lang={lang} />

            {/* Main content Tab switching view area with high density styled containers */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 md:p-5 shadow-xs transition" id="active-tab-container	">
              {activeTab === 'dashboard' && (
                <div className="space-y-6" id="charts-main-subpanel">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3" id="charts-main-subpanel-titlebar">
                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-650 dark:text-indigo-400">
                      {lang === 'es' ? 'Gráficos de Rendimiento' : 'Visual Standings Grid'}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                      {lang === 'es' ? 'Visualizaciones interactivas recharts' : 'Interactive recharts visualizations'}
                    </span>
                  </div>
                  <DashboardCharts
                    rows={filteredRows}
                    players={aggregatedPlayers}
                    teamStats={teamStats}
                    lang={lang}
                  />
                </div>
              )}
              
              {activeTab === 'players' && (
                <PlayerStatsView
                  players={aggregatedPlayers}
                  onSelectPlayer={(p) => setSelectedPlayer(p)}
                  lang={lang}
                />
              )}

              {activeTab === 'matches' && (
                <MatchesView
                  rows={filteredRows}
                  lang={lang}
                />
              )}

              {activeTab === 'fulltable' && (
                <FullTableView
                  rows={filteredRows}
                  lang={lang}
                />
              )}
            </div>

            {/* Quick reference guide (High density disclaimer indicator) */}
            <footer className="text-center text-4xs font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest py-4 border-t border-slate-200/55 dark:border-zinc-800/40" id="dashboard-footer-seal">
              Romo F.C. Analytics Dashboard • {lang === 'es' ? 'Actualizaciones en tiempo real cada 5 min' : 'Live updates synchronized every 5 min'} • {new Date().getFullYear()}
            </footer>
          </div>
        )}
      </main>

      {/* 5. Player Detailed Profile Technical-Sheet Modal */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          allMatchRows={rawData}
          lang={lang}
        />
      )}
    </div>
  );
}
