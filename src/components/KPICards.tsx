/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users, Trophy, UserCheck, CalendarDays, Clock, ShieldAlert, Award, Timer } from 'lucide-react';
import { DashboardMetrics, Language } from '../types';
import { getTranslation } from '../utils/locales';

interface KPICardsProps {
  metrics: DashboardMetrics;
  lang: Language;
}

export default function KPICards({ metrics, lang }: KPICardsProps) {
  const t = getTranslation(lang);

  const cardData = [
    {
      id: 'kpi-registros',
      title: t.kpiTotalRows,
      value: metrics.totalRegistros,
      icon: Users,
      bgColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30',
      description: 'Filas procesadas'
    },
    {
      id: 'kpi-goles',
      title: t.kpiTotalGoals,
      value: metrics.totalGolesAnotados,
      icon: Trophy,
      bgColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30',
      description: 'Líderes de ataque'
    },
    {
      id: 'kpi-jugadores',
      title: t.kpiTotalPlayers,
      value: metrics.totalJugadores,
      icon: UserCheck,
      bgColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30',
      description: 'Plantilla disponible'
    },
    {
      id: 'kpi-partidos',
      title: t.kpiTotalMatches,
      value: metrics.totalPartidosListados,
      icon: CalendarDays,
      bgColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30',
      description: 'Encuentros'
    },
    {
      id: 'kpi-minutos',
      title: t.kpiTotalMinutes,
      value: metrics.totalMinutosJugados.toLocaleString(),
      icon: Clock,
      bgColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/30',
      description: 'Tiempo total'
    },
    {
      id: 'kpi-amarillas',
      title: t.kpiYellowCards,
      value: metrics.totalTarjetasAmarillas,
      icon: ShieldAlert,
      bgColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30',
      description: 'Apercibidos'
    },
    {
      id: 'kpi-rojas',
      title: t.kpiRedCards,
      value: metrics.totalTarjetasRojas,
      icon: Award,
      bgColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30',
      description: 'Espulsiones'
    },
    {
      id: 'kpi-promedio',
      title: t.kpiAvgMintues,
      value: `${metrics.promedioMinutosPorJugador} min`,
      icon: Timer,
      bgColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/30',
      description: 'Por jugador'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards-grid">
      {cardData.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-start gap-4 transition-all duration-250 hover:shadow-md hover:scale-[1.01]"
          >
            <div className={`p-3 rounded-xl border ${card.bgColor}`} id={`${card.id}-icon`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0" id={`${card.id}-content`}>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider truncate mb-1">
                {card.title}
              </p>
              <h3 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight leading-none mb-1">
                {card.value}
              </h3>
              <p className="text-2xs text-zinc-400 dark:text-zinc-500 font-medium">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
