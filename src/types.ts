/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SheetRow {
  temporada: string;
  fecha: string;
  competicion: string;
  campo: string;
  equipoLocal: string;
  equipoVisitante: string;
  jornada: string;
  partido: string;
  golesLocal: number;
  golesVisitante: number;
  resultado: string;
  equipo: string;
  dorsal: number;
  jugador: string;
  titular: boolean;
  suplente: boolean;
  minutosJugados: number;
  golesAnotados: number;
  tarjetaAmarilla: number;
  dobleAmarilla: number;
  tarjetaRoja: number;
  id: string; // generated client-side for stable table rows
}

export interface PlayerStats {
  jugador: string;
  dorsal: number;
  equipo: string;
  partidosJugados: number;
  titularidades: number;
  suplencias: number;
  minutosJugados: number;
  golesAnotados: number;
  tarjetaAmarilla: number;
  dobleAmarilla: number;
  tarjetaRoja: number;
  tarjetasTotales: number;
}

export interface TeamStatsSummary {
  partidosJugados: number;
  victorias: number;
  empates: number;
  derrotas: number;
  golesAnotados: number;
  golesEncajados: number;
}

export interface DashboardMetrics {
  totalRegistros: number;
  totalGolesAnotados: number;
  totalJugadores: number;
  totalPartidosListados: number;
  totalMinutosJugados: number;
  totalTarjetasAmarillas: number;
  totalTarjetasRojas: number;
  promedioMinutosPorJugador: number;
}

export type Language = 'es' | 'en';
export type Theme = 'light' | 'dark';

export interface FilterState {
  search: string;
  jugador: string;
  campo: string;
  competicion: string;
  resultadoFiltro: 'todos' | 'victoria' | 'empate' | 'derrota';
  fechaInicio: string;
  fechaFin: string;
}
