/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Trophy, Clock, ShieldAlert, Award, Calendar, UserCheck, Shield } from 'lucide-react';
import { PlayerStats, SheetRow, Language } from '../types';
import { getTranslation } from '../utils/locales';

interface PlayerModalProps {
  player: PlayerStats | null;
  onClose: () => void;
  allMatchRows: SheetRow[];
  lang: Language;
}

export default function PlayerModal({ player, onClose, allMatchRows, lang }: PlayerModalProps) {
  if (!player) return null;
  const t = getTranslation(lang);

  // Filter match historical records for this player
  const playerMatches = allMatchRows
    .filter((row) => row.jugador.toLowerCase() === player.jugador.toLowerCase())
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // Calculate stats
  const starterPercent = player.partidosJugados > 0 
    ? Math.round((player.titularidades / player.partidosJugados) * 100)
    : 0;
  
  const minPerMatch = player.partidosJugados > 0
    ? Math.round(player.minutosJugados / player.partidosJugados)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" id="player-modal-backdrop">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200" 
        onClick={onClose}
        id="player-modal-overlay"
      />

      <div className="flex min-h-screen items-center justify-center p-4" id="player-modal-container">
        <div 
          className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden focus:outline-none"
          id="player-modal-card"
        >
          {/* Header Banner */}
          <div className="bg-zinc-950 dark:bg-black p-6 relative overflow-hidden text-white flex flex-col md:flex-row items-center gap-6" id="player-modal-banner">
            {/* Subtle soccer field background lines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none border-b border-white" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-white rounded-full w-48 h-48 opacity-10 pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/75 hover:text-white hover:bg-white/10 rounded-full transition"
              id="player-modal-close-btn"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Jersey circle icon */}
            <div className="relative flex-shrink-0" id="player-modal-jersey">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-extrabold tracking-tighter border-4 border-zinc-900 text-white shadow-lg">
                {player.dorsal || 'N/A'}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-zinc-800 border border-zinc-700 p-1.5 rounded-full text-zinc-300">
                <Shield className="w-4 h-4" />
              </div>
            </div>

            <div className="text-center md:text-left flex-1" id="player-modal-name-panel">
              <span className="text-2xs font-extrabold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                {player.equipo}
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-2 leading-none">
                {player.jugador}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 font-mono tracking-wider">
                {lang === 'es' ? 'Ficha de Estadísticas Integradas' : 'Integrated Performance Profile'}
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6" id="player-modal-body">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="player-modal-stats-grid">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/60" id="player-stat-partidos">
                <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-2xs font-bold uppercase tracking-wider mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  {lang === 'es' ? 'Partidos / Titular' : 'Matches / Starter'}
                </div>
                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {player.partidosJugados} <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">({starterPercent}% Titular)</span>
                </div>
                <p className="text-2xs text-zinc-400 mt-1 font-mono">{player.titularidades} titular / {player.suplencias} suplente</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/60" id="player-stat-minutos">
                <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-2xs font-bold uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  {lang === 'es' ? 'Minutos Jugados' : 'Minutes Played'}
                </div>
                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {player.minutosJugados}
                </div>
                <p className="text-2xs text-zinc-400 mt-1 font-mono">{minPerMatch} min / {lang === 'es' ? 'partido' : 'match'}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/60" id="player-stat-goles">
                <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-2xs font-bold uppercase tracking-wider mb-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  {lang === 'es' ? 'Goles Marcados' : 'Goals Scored'}
                </div>
                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {player.golesAnotados}
                </div>
                <p className="text-2xs text-zinc-400 mt-1 font-mono">
                  {player.golesAnotados > 0 
                    ? `${Math.round((player.minutosJugados / player.golesAnotados) * 10) / 10} min / gol`
                    : 'Sin goles'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/60" id="player-stat-tarjetas">
                <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-2xs font-bold uppercase tracking-wider mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  {lang === 'es' ? 'Tarjetas' : 'Disciplines'}
                </div>
                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-3.5 bg-yellow-400 rounded-2xs inline-block" />
                    {player.tarjetaAmarilla}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-3.5 bg-red-600 rounded-2xs inline-block" />
                    {player.tarjetaRoja + player.dobleAmarilla}
                  </span>
                </div>
                <p className="text-2xs text-zinc-400 mt-1 font-mono">
                  {player.dobleAmarilla > 0 ? `${player.dobleAmarilla} doble amarilla` : '0 doble tarjeta'}
                </p>
              </div>
            </div>

            {/* Appearances Table */}
            <div className="space-y-3" id="player-appearance-section">
              <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                {t.playerMatchHistory}
              </h4>
              
              <div className="overflow-x-auto border border-zinc-100 dark:border-zinc-800 rounded-xl" id="modal-table-scroll">
                <table className="w-full text-sm text-left border-collapse" id="modal-history-table">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950/40 border-b border-zinc-100 dark:border-zinc-800 text-2xs font-bold text-zinc-400 uppercase tracking-wide">
                      <th className="px-4 py-2.5">{t.colFecha}</th>
                      <th className="px-4 py-2.5">{lang === 'es' ? 'Rival' : 'Opponent'}</th>
                      <th className="px-4 py-2.5 text-center">{lang === 'es' ? 'Rol' : 'Role'}</th>
                      <th className="px-4 py-2.5 text-center">{t.colMinutos}</th>
                      <th className="px-4 py-2.5 text-center">{t.colGoles}</th>
                      <th className="px-4 py-2.5 text-center">{lang === 'es' ? 'Tarjetas' : 'Cards'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                    {playerMatches.map((match) => {
                      const isLocalRomo = match.equipoLocal.toUpperCase().includes('ROMO');
                      const opponent = isLocalRomo ? match.equipoVisitante : match.equipoLocal;
                      
                      return (
                        <tr key={match.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 text-xs text-zinc-650 dark:text-zinc-300">
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-2xs text-zinc-400">
                            {match.fecha}
                          </td>
                          <td className="px-4 py-3 truncate max-w-[200px] font-semibold text-zinc-800 dark:text-zinc-200">
                            <span className="text-2xs text-zinc-400 dark:text-zinc-500 mr-1">
                              {isLocalRomo ? 'vs' : '@'}
                            </span>
                            {opponent}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {match.titular ? (
                              <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {t.statStarter}
                              </span>
                            ) : match.suplente ? (
                              <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                {t.statSubstitute}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-2xs text-zinc-400 font-normal">
                                N/A
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold font-mono text-zinc-800 dark:text-zinc-200">
                            {match.minutosJugados}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {match.golesAnotados > 0 ? (
                              <span className="inline-flex items-center justify-center bg-amber-500 text-white font-extrabold w-5 h-5 rounded-full text-2xs leading-none">
                                {match.golesAnotados}
                              </span>
                            ) : (
                              <span className="text-zinc-300 dark:text-zinc-700">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              {match.tarjetaAmarilla > 0 && (
                                <span className="w-2.5 h-3.5 bg-yellow-400 rounded-2xs inline-block" title="Amarilla" />
                              )}
                              {match.dobleAmarilla > 0 && (
                                <span className="w-2.5 h-3.5 bg-yellow-400 rounded-2xs inline-block border-r border-red-600" title="Doble Amarilla" />
                              )}
                              {match.tarjetaRoja > 0 && (
                                <span className="w-2.5 h-3.5 bg-red-600 rounded-2xs inline-block" title="Roja" />
                              )}
                              {!match.tarjetaAmarilla && !match.dobleAmarilla && !match.tarjetaRoja && (
                                <span className="text-zinc-300 dark:text-zinc-700">-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
