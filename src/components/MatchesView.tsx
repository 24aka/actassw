/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Shield, MapPin, Calendar, Clock, Trophy } from 'lucide-react';
import { SheetRow, Language } from '../types';
import { getTranslation } from '../utils/locales';

interface MatchesViewProps {
  rows: SheetRow[];
  lang: Language;
}

interface MatchAggregation {
  id: string;
  fecha: string;
  competicion: string;
  campo: string;
  equipoLocal: string;
  equipoVisitante: string;
  resultado: string;
  golesLocal: number;
  golesVisitante: number;
  jornada: string;
  goleadores: Set<string>;
}

export default function MatchesView({ rows, lang }: MatchesViewProps) {
  const t = getTranslation(lang);
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'win' | 'draw' | 'loss'>('all');

  // Group rows by match identifiers (fecha + partido)
  const matchesMap = new Map<string, MatchAggregation>();

  rows.forEach((row) => {
    if (!row.partido) return;
    const key = `${row.fecha}-${row.partido}`;
    
    const existing = matchesMap.get(key) || {
      id: key,
      fecha: row.fecha,
      competicion: row.competicion,
      campo: row.campo,
      equipoLocal: row.equipoLocal,
      equipoVisitante: row.equipoVisitante,
      resultado: row.resultado,
      golesLocal: row.golesLocal,
      golesVisitante: row.golesVisitante,
      jornada: row.jornada,
      goleadores: new Set<string>(),
    };

    if (row.golesAnotados > 0 && row.jugador) {
      existing.goleadores.add(`${row.jugador} (${row.golesAnotados})`);
    }

    matchesMap.set(key, existing);
  });

  const allMatches = Array.from(matchesMap.values()).sort((a, b) => {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  // Filter matches based on outcome for Romo F.C.
  const filteredMatches = allMatches.filter((match) => {
    const isLocalRomo = match.equipoLocal.toUpperCase().includes('ROMO');
    const isVisitanteRomo = match.equipoVisitante.toUpperCase().includes('ROMO');
    
    let scored = 0;
    let conceded = 0;

    if (isLocalRomo) {
      scored = match.golesLocal;
      conceded = match.golesVisitante;
    } else if (isVisitanteRomo) {
      scored = match.golesVisitante;
      conceded = match.golesLocal;
    } else {
      scored = match.golesLocal;
      conceded = match.golesVisitante;
    }

    const outcome = scored > conceded ? 'win' : scored === conceded ? 'draw' : 'loss';
    
    if (outcomeFilter === 'all') return true;
    return outcome === outcomeFilter;
  });

  // Helper to determine badge styling based on outcome
  const getOutcomeStyle = (match: MatchAggregation) => {
    const isLocalRomo = match.equipoLocal.toUpperCase().includes('ROMO');
    const isVisitanteRomo = match.equipoVisitante.toUpperCase().includes('ROMO');
    
    let scored = 0;
    let conceded = 0;

    if (isLocalRomo) {
      scored = match.golesLocal;
      conceded = match.golesVisitante;
    } else if (isVisitanteRomo) {
      scored = match.golesVisitante;
      conceded = match.golesLocal;
    }

    if (scored > conceded) {
      return {
        bg: 'bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/20 border border-emerald-500/15',
        dot: 'bg-emerald-500',
        label: lang === 'es' ? 'VICTORIA' : 'WIN'
      };
    } else if (scored === conceded) {
      return {
        bg: 'bg-yellow-500/10 text-yellow-700 dark:border-yellow-500/20 border border-yellow-500/15',
        dot: 'bg-yellow-500',
        label: lang === 'es' ? 'EMPATE' : 'DRAW'
      };
    } else {
      return {
        bg: 'bg-rose-500/10 text-rose-700 dark:border-rose-500/20 border border-rose-500/15',
        dot: 'bg-rose-500',
        label: lang === 'es' ? 'DERROTA' : 'DEFEAT'
      };
    }
  };

  return (
    <div className="space-y-4" id="matches-tab-panel">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between" id="matches-view-header">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest leading-none">
          {lang === 'es' ? 'Calendario Histórico de Partidos' : 'Season Match Fixtures'}
        </h3>
        
        {/* Outcome Toggle Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-850 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800" id="matches-outcome-filter-tabs">
          <button
            onClick={() => setOutcomeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-2xs font-bold uppercase tracking-wider transition ${
              outcomeFilter === 'all'
                ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-xs'
                : 'text-zinc-400'
            }`}
          >
            {t.all}
          </button>
          <button
            onClick={() => setOutcomeFilter('win')}
            className={`px-3 py-1.5 rounded-lg text-2xs font-bold uppercase tracking-wider transition ${
              outcomeFilter === 'win'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-zinc-405 dark:text-zinc-500 hover:text-emerald-500'
            }`}
          >
            {t.wins}
          </button>
          <button
            onClick={() => setOutcomeFilter('draw')}
            className={`px-3 py-1.5 rounded-lg text-2xs font-bold uppercase tracking-wider transition ${
              outcomeFilter === 'draw'
                ? 'bg-yellow-500 text-white shadow-xs'
                : 'text-zinc-405 dark:text-zinc-500 hover:text-yellow-500'
            }`}
          >
            {t.draws}
          </button>
          <button
            onClick={() => setOutcomeFilter('loss')}
            className={`px-3 py-1.5 rounded-lg text-2xs font-bold uppercase tracking-wider transition ${
              outcomeFilter === 'loss'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-zinc-405 dark:text-zinc-500 hover:text-rose-500'
            }`}
          >
            {t.losses}
          </button>
        </div>
      </div>

      {/* Grid of Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" id="matches-grid">
        {filteredMatches.map((match) => {
          const outcome = getOutcomeStyle(match);
          const isHomeRomo = match.equipoLocal.toUpperCase().includes('ROMO');
          
          return (
            <div
              key={match.id}
              className="p-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transitionduration-200 flex flex-col justify-between"
              id={`match-card-${match.id}`}
            >
              <div className="space-y-3" id={`match-${match.id}-body`}>
                {/* Meta details banner */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-2xs border-b border-zinc-100 dark:border-zinc-800 pb-3" id={`match-${match.id}-meta`}>
                  <div className="flex items-center gap-1.5 text-zinc-400 font-mono" id={`match-${match.id}-date-panel`}>
                    <Calendar className="w-3.5 h-3.5" />
                    {match.fecha}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold tracking-wider ${outcome.bg}`} id={`match-${match.id}-outcome-badge`}>
                    {outcome.dot && <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${outcome.dot}`} />}
                    {outcome.label}
                  </span>
                </div>

                {/* Score lines */}
                <div className="py-2 flex items-center justify-between" id={`match-${match.id}-vs-container`}>
                  {/* Home Team */}
                  <div className="flex-1 text-center pr-3 min-w-0" id={`match-${match.id}-local-panel`}>
                    <Shield className={`w-8 h-8 mx-auto mb-1.5 ${isHomeRomo ? 'text-blue-500' : 'text-zinc-300 dark:text-zinc-700'}`} />
                    <h4 className={`text-xs font-bold uppercase truncate tracking-wide ${isHomeRomo ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      {match.equipoLocal}
                    </h4>
                  </div>

                  {/* Scoreboard */}
                  <div className="flex-shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-2xs font-mono font-bold text-2xl text-zinc-900 dark:text-zinc-50" id={`match-${match.id}-scoreboard`}>
                    <span>{match.golesLocal}</span>
                    <span className="text-zinc-305 text-lg font-light">-</span>
                    <span>{match.golesVisitante}</span>
                  </div>

                  {/* Away Team */}
                  <div className="flex-1 text-center pl-3 min-w-0" id={`match-${match.id}-visitante-panel`}>
                    <Shield className={`w-8 h-8 mx-auto mb-1.5 ${!isHomeRomo ? 'text-blue-500' : 'text-zinc-300 dark:text-zinc-750'}`} />
                    <h4 className={`text-xs font-bold uppercase truncate tracking-wide ${!isHomeRomo ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      {match.equipoVisitante}
                    </h4>
                  </div>
                </div>

                {/* Competition + Field details */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/40 space-y-1.5 text-2xs" id={`match-${match.id}-venue`}>
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 truncate">
                    <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>
                      <strong className="text-zinc-402">{match.jornada || 'REGULAR'}</strong> — {match.competicion}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 truncate">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    <span>{match.campo}</span>
                  </div>
                </div>
              </div>

              {/* Goal scorers section */}
              {match.goleadores.size > 0 && (
                <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-zinc-103/30 dark:border-zinc-800/30 mt-4 text-xs" id={`match-${match.id}-scorers`}>
                  <span className="text-3xs font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-widest block mb-1">
                    Goleadores del Romo F.C.
                  </span>
                  <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex flex-wrap gap-x-3 gap-y-1">
                    {Array.from(match.goleadores).map((scorer) => (
                      <span key={scorer} className="inline-flex items-center gap-1 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/60 px-2 py-0.5 rounded-lg text-2xs font-mono font-bold text-zinc-805">
                        ⚽ {scorer}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredMatches.length === 0 && (
        <div className="p-8 text-center text-zinc-400 border border-zinc-100 dark:border-zinc-800 border-dashed rounded-2xl" id="matches-view-empty">
          <Clock className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
          <p className="text-sm font-medium">{t.noData}</p>
        </div>
      )}
    </div>
  );
}
