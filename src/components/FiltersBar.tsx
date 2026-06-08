/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Calendar, MapPin, Trophy, Users, CheckCircle, RefreshCcw, Filter } from 'lucide-react';
import { FilterState, Language } from '../types';
import { getTranslation } from '../utils/locales';

interface FiltersBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  playersList: string[];
  competitionsList: string[];
  pitchesList: string[];
  lang: Language;
}

export default function FiltersBar({
  filters,
  setFilters,
  playersList,
  competitionsList,
  pitchesList,
  lang,
}: FiltersBarProps) {
  const t = getTranslation(lang);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleSelectChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    const fresh: FilterState = {
      search: '',
      jugador: '',
      campo: '',
      competicion: '',
      resultadoFiltro: 'todos',
      fechaInicio: '',
      fechaFin: '',
    };
    setFilters(fresh);
    localStorage.removeItem('romo_db_filters');
  };

  return (
    <div
      className="p-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4"
      id="advanced-filters-panel"
    >
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3" id="filters-header">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-500" />
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            {t.filtersTitle}
          </h2>
        </div>
        <button
          onClick={clearAllFilters}
          className="text-xs px-3 py-1.5 rounded-lg font-medium bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition duration-150 inline-flex items-center gap-1.5"
          id="clear-filters-btn"
        >
          <RefreshCcw className="w-3 h-3" />
          {t.clearFilters}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="filters-grid">
        {/* Search Input */}
        <div className="relative" id="filter-wrapper-search">
          <label className="block text-2xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            Búsqueda General
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={filters.search}
              onChange={handleTextChange}
              placeholder={t.filterSearchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150"
            />
          </div>
        </div>

        {/* Player filter */}
        <div id="filter-wrapper-player">
          <label className="block text-2xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            {t.filterPlayer}
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select
              value={filters.jugador}
              onChange={(e) => handleSelectChange('jugador', e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 appearance-none"
            >
              <option value="">{t.allPlayers}</option>
              {playersList.map((player) => (
                <option key={player} value={player}>
                  {player}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Competition filter */}
        <div id="filter-wrapper-competition">
          <label className="block text-2xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            {t.filterCompetition}
          </label>
          <div className="relative">
            <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select
              value={filters.competicion}
              onChange={(e) => handleSelectChange('competicion', e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 appearance-none"
            >
              <option value="">{t.allCompetitions}</option>
              {competitionsList.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pitch filter */}
        <div id="filter-wrapper-pitch">
          <label className="block text-2xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            {t.filterPitch}
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select
              value={filters.campo}
              onChange={(e) => handleSelectChange('campo', e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 appearance-none"
            >
              <option value="">{t.allPitches}</option>
              {pitchesList.map((pitch) => (
                <option key={pitch} value={pitch}>
                  {pitch}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-100 dark:border-zinc-800/40 pt-4" id="filters-row-2">
        {/* Match Result filters */}
        <div className="md:col-span-1" id="filter-wrapper-result">
          <label className="block text-2xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            {t.filterResult}
          </label>
          <div className="relative">
            <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select
              value={filters.resultadoFiltro}
              onChange={(e) => handleSelectChange('resultadoFiltro', e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 appearance-none"
            >
              <option value="todos">{t.all}</option>
              <option value="victoria">{t.win}</option>
              <option value="empate">{t.draw}</option>
              <option value="derrota">{t.loss}</option>
            </select>
          </div>
        </div>

        {/* Date Filters */}
        <div id="filter-wrapper-startdate">
          <label className="block text-2xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            {t.filterStartDate}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="date"
              value={filters.fechaInicio}
              onChange={(e) => handleSelectChange('fechaInicio', e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150"
            />
          </div>
        </div>

        <div id="filter-wrapper-enddate">
          <label className="block text-2xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            {t.filterEndDate}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="date"
              value={filters.fechaFin}
              onChange={(e) => handleSelectChange('fechaFin', e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
