/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Trophy, Clock, ShieldAlert, ChevronUp, ChevronDown, User, Search } from 'lucide-react';
import { PlayerStats, Language } from '../types';
import { getTranslation } from '../utils/locales';

interface PlayerStatsViewProps {
  players: PlayerStats[];
  onSelectPlayer: (player: PlayerStats) => void;
  lang: Language;
}

type SortField = 'jugador' | 'partidosJugados' | 'minutosJugados' | 'golesAnotados' | 'tarjetasTotales';
type SortOrder = 'asc' | 'desc';

export default function PlayerStatsView({ players, onSelectPlayer, lang }: PlayerStatsViewProps) {
  const t = getTranslation(lang);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('golesAnotados');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedPlayers = [...players]
    .filter((player) => player.jugador.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        return sortOrder === 'asc'
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      } else {
        return sortOrder === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    });

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 inline ml-1 text-blue-500" /> : <ChevronDown className="w-3.5 h-3.5 inline ml-1 text-blue-500" />;
  };

  return (
    <div className="space-y-4" id="players-tab-panel">
      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between" id="players-view-search-panel">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest leading-none self-start sm:self-center">
          {lang === 'es' ? 'Rendimiento Individual de Jugadores' : 'Individual Player Standings'}
        </h3>
        <div className="relative w-full sm:max-w-xs" id="players-search-input-wrapper">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'es' ? 'Buscar en plantilla...' : 'Search squad...'}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-zinc-805 dark:text-zinc-102 focus:outline-none focus:ring-1 focus:ring-blue-500 transition shadow-xs"
          />
        </div>
      </div>

      {/* Grid of cards on Mobile, Table on bigger screens */}
      <div className="hidden md:block overflow-x-auto border border-zinc-100 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-xs" id="players-desktop-table-container">
        <table className="w-full text-sm text-left border-collapse" id="players-roster-table">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-950/40 border-b border-zinc-100 dark:border-zinc-800 text-2xs font-extrabold text-zinc-400 uppercase tracking-wider">
              <th className="px-6 py-4 text-center w-16">Dorsal</th>
              <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('jugador')}>
                {t.colJugador} <SortIndicator field="jugador" />
              </th>
              <th className="px-6 py-4 text-center cursor-pointer select-none" onClick={() => handleSort('partidosJugados')}>
                Partidos <SortIndicator field="partidosJugados" />
              </th>
              <th className="px-6 py-4 text-center cursor-pointer select-none" onClick={() => handleSort('minutosJugados')}>
                {t.colMinutos} <SortIndicator field="minutosJugados" />
              </th>
              <th className="px-6 py-4 text-center cursor-pointer select-none" onClick={() => handleSort('golesAnotados')}>
                {t.colGoles} <SortIndicator field="golesAnotados" />
              </th>
              <th className="px-6 py-4 text-center cursor-pointer select-none" onClick={() => handleSort('tarjetasTotales')}>
                Tarjeta <SortIndicator field="tarjetasTotales" />
              </th>
              <th className="px-6 py-4 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-600 dark:text-zinc-300 font-medium">
            {sortedPlayers.map((player) => (
              <tr
                key={player.jugador}
                className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition duration-150 cursor-pointer"
                onClick={() => onSelectPlayer(player)}
                id={`player-row-${player.jugador.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <span className="inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-extrabold w-8 h-8 rounded-full text-xs">
                    {player.dorsal || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-zinc-800 dark:text-zinc-100">
                  {player.jugador}
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap font-mono text-zinc-700 dark:text-zinc-300">
                  {player.partidosJugados}
                  <span className="text-2xs text-zinc-400 dark:text-zinc-500 block">
                    {Math.round((player.titularidades / player.partidosJugados) * 100)}% starter
                  </span>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap font-mono text-zinc-750 dark:text-zinc-300">
                  {player.minutosJugados}
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  {player.golesAnotados > 0 ? (
                    <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/15 px-2.5 py-1 rounded-full text-xs font-bold font-mono">
                      <Trophy className="w-3.5 h-3.5" />
                      {player.golesAnotados}
                    </span>
                  ) : (
                    <span className="text-zinc-300 dark:text-zinc-700">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-0.5" title="Tarjetas amarillas">
                      <span className="w-2 h-3 bg-yellow-400 rounded-2xs inline-block" />
                      <span className="text-2xs font-mono text-zinc-500">{player.tarjetaAmarilla}</span>
                    </span>
                    <span className="inline-flex items-center gap-0.5" title="Tarjetas rojas">
                      <span className="w-2 h-3 bg-red-600 rounded-2xs inline-block" />
                      <span className="text-2xs font-mono text-zinc-500">{player.tarjetaRoja + player.dobleAmarilla}</span>
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlayer(player);
                    }}
                    className="text-xs px-3 py-1.5 font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-transparent hover:border-blue-200 dark:hover:border-blue-900/40 rounded-lg transition"
                  >
                    {lang === 'es' ? 'Ver Ficha' : 'View Profile'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards layout on mobile / adaptive screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-4" id="players-mobile-grid">
        {sortedPlayers.map((player) => (
          <div
            key={player.jugador}
            onClick={() => onSelectPlayer(player)}
            className="p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xs hover:shadow-sm active:bg-zinc-50/50 transition cursor-pointer flex flex-col justify-between"
            id={`player-card-${player.jugador.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3" id={`player-card-${player.jugador.replace(/\s+/g, '-').toLowerCase()}-header`}>
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center font-black text-sm text-zinc-800 dark:text-zinc-200 shadow-2xs flex-shrink-0">
                {player.dorsal || '#'}
              </div>
              <div className="min-w-0" id={`player-card-${player.jugador.replace(/\s+/g, '-').toLowerCase()}-title-panel`}>
                <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 truncate leading-tight">
                  {player.jugador}
                </h4>
                <p className="text-3xs font-mono font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                  {player.equipo}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center py-3" id={`player-card-${player.jugador.replace(/\s+/g, '-').toLowerCase()}-stats-grid`}>
              <div className="p-1 rounded bg-zinc-50/50 dark:bg-zinc-950/20" id={`player-card-${player.jugador.replace(/\s+/g, '-').toLowerCase()}-stat-partidos`}>
                <p className="text-3xs font-extrabold text-zinc-400 uppercase tracking-wide">P. Jugados</p>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{player.partidosJugados}</p>
              </div>
              <div className="p-1 rounded bg-zinc-50/50 dark:bg-zinc-950/20" id={`player-card-${player.jugador.replace(/\s+/g, '-').toLowerCase()}-stat-goles`}>
                <p className="text-3xs font-extrabold text-zinc-400 uppercase tracking-wide">Goles</p>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5 flex items-center justify-center gap-0.5">
                  <Trophy className="w-3 h-3 inline" /> {player.golesAnotados}
                </p>
              </div>
              <div className="p-1 rounded bg-zinc-50/50 dark:bg-zinc-950/20" id={`player-card-${player.jugador.replace(/\s+/g, '-').toLowerCase()}-stat-mins`}>
                <p className="text-3xs font-extrabold text-zinc-400 uppercase tracking-wide">Minutos</p>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 flex items-center justify-center gap-0.5">
                  <Clock className="w-3 h-3 inline text-zinc-400" /> {player.minutosJugados}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/40 pt-2.5 text-2xs" id={`player-card-${player.jugador.replace(/\s+/g, '-').toLowerCase()}-footer`}>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 font-mono text-zinc-500">
                  <span className="w-2.5 h-3.5 bg-yellow-400 rounded-3xs inline-block" />
                  {player.tarjetaAmarilla}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-zinc-500">
                  <span className="w-2.5 h-3.5 bg-red-600 rounded-3xs inline-block" />
                  {player.tarjetaRoja + player.dobleAmarilla}
                </span>
              </div>
              
              <span className="text-blue-500 font-bold flex items-center gap-0.5 hover:underline">
                {lang === 'es' ? 'Ficha técnica ›' : 'Full profile ›'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {sortedPlayers.length === 0 && (
        <div className="p-8 text-center text-zinc-400 border border-zinc-100 dark:border-zinc-800 border-dashed rounded-2xl" id="players-view-empty">
          <User className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
          <p className="text-sm font-medium">{t.noData}</p>
        </div>
      )}
    </div>
  );
}
