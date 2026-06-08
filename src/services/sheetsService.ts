/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Papa from 'papaparse';
import { getCSVUrl } from '../config';
import { SheetRow, PlayerStats, DashboardMetrics, TeamStatsSummary } from '../types';

export async function fetchSheetData(): Promise<SheetRow[]> {
  const url = getCSVUrl();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error al obtener los datos de Google Sheets (HTTP ${response.status})`);
  }
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse<any>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows: SheetRow[] = results.data.map((row, index) => {
            // Clean up backslashes/quotes in player names, matches, and team names
            const cleanStr = (val: string) => {
              if (!val) return '';
              let s = val.trim();
              if (s.startsWith('"') && s.endsWith('"')) {
                s = s.slice(1, -1);
              }
              return s;
            };

            return {
              id: `${cleanStr(row['Jugador'] || 'player')}-${cleanStr(row['Fecha'] || 'date')}-${index}`,
              temporada: cleanStr(row['Temporada']),
              fecha: cleanStr(row['Fecha']),
              competicion: cleanStr(row['Competición'] || row['Competicion']),
              campo: cleanStr(row['Campo']),
              equipoLocal: cleanStr(row['Equipo Local']),
              equipoVisitante: cleanStr(row['Equipo Visitante']),
              jornada: cleanStr(row['Jornada']),
              partido: cleanStr(row['Partido']),
              golesLocal: Number(row['Goles Local']) || 0,
              golesVisitante: Number(row['Goles Visitante']) || 0,
              resultado: cleanStr(row['Resultado']),
              equipo: cleanStr(row['Equipo']),
              dorsal: Number(row['Dorsal']) || 0,
              jugador: cleanStr(row['Jugador']),
              titular: Number(row['Titular']) === 1 || String(row['Titular']).toLowerCase() === 'true',
              suplente: Number(row['Suplente']) === 1 || String(row['Suplente']).toLowerCase() === 'true',
              minutosJugados: Number(row['Minutos Jugados']) || 0,
              golesAnotados: Number(row['Goles Anotados']) || 0,
              tarjetaAmarilla: Number(row['Tarjeta Amarilla']) || 0,
              dobleAmarilla: Number(row['Doble Amarilla']) || 0,
              tarjetaRoja: Number(row['Tarjeta Roja']) || 0,
            };
          });

          // Sort by date descending by default
          rows.sort((a, b) => {
            const dateA = new Date(a.fecha).getTime();
            const dateB = new Date(b.fecha).getTime();
            return dateB - dateA;
          });

          resolve(rows);
        } catch (error) {
          reject(new Error(`Error parsing spreadsheet data: ${(error as Error).message}`));
        }
      },
      error: (error) => {
        reject(new Error(`PapaParse failed: ${error.message}`));
      },
    });
  });
}

/**
 * Aggregates player stats from the raw match rows.
 */
export function aggregatePlayerStats(rows: SheetRow[]): PlayerStats[] {
  const playersMap = new Map<string, PlayerStats>();

  rows.forEach((row) => {
    const name = row.jugador;
    if (!name) return;

    const current = playersMap.get(name) || {
      jugador: name,
      dorsal: row.dorsal || 0,
      equipo: row.equipo || 'Romo F.C.',
      partidosJugados: 0,
      titularidades: 0,
      suplencias: 0,
      minutosJugados: 0,
      golesAnotados: 0,
      tarjetaAmarilla: 0,
      dobleAmarilla: 0,
      tarjetaRoja: 0,
      tarjetasTotales: 0,
    };

    // Update dorsal if we found a non-zero one
    if (row.dorsal && !current.dorsal) {
      current.dorsal = row.dorsal;
    }

    // A player participated in the match if they played > 0 mins or was listed as general starter/sub
    // Let's count row participation as a match played since each row is a player's entry for that match.
    current.partidosJugados += 1;
    if (row.titular) current.titularidades += 1;
    if (row.suplente) current.suplencias += 1;
    
    current.minutosJugados += row.minutosJugados;
    current.golesAnotados += row.golesAnotados;
    current.tarjetaAmarilla += row.tarjetaAmarilla;
    current.dobleAmarilla += row.dobleAmarilla;
    current.tarjetaRoja += row.tarjetaRoja;
    current.tarjetasTotales += row.tarjetaAmarilla + row.dobleAmarilla + row.tarjetaRoja;

    playersMap.set(name, current);
  });

  return Array.from(playersMap.values()).sort((a, b) => b.golesAnotados - a.golesAnotados || b.minutosJugados - a.minutosJugados);
}

/**
 * Calculate match outcomes for the team (Romo F.C.)
 * Since we know Romo F.C. is our main team (often Equipo Local or Equipo Visitante).
 */
export function aggregateTeamStats(rows: SheetRow[]): TeamStatsSummary {
  const uniqueMatches = new Map<string, { local: string; visitante: string; golesLocal: number; golesVisitante: number }>();
  
  rows.forEach((row) => {
    const key = `${row.fecha}-${row.partido}`;
    if (!uniqueMatches.has(key) && row.partido) {
      uniqueMatches.set(key, {
        local: row.equipoLocal,
        visitante: row.equipoVisitante,
        golesLocal: row.golesLocal,
        golesVisitante: row.golesVisitante
      });
    }
  });

  let partidosJugados = 0;
  let victorias = 0;
  let empates = 0;
  let derrotas = 0;
  let golesAnotados = 0;
  let golesEncajados = 0;

  uniqueMatches.forEach((m) => {
    partidosJugados++;
    const isLocalRomo = m.local.toUpperCase().includes('ROMO');
    const isVisitanteRomo = m.visitante.toUpperCase().includes('ROMO');
    
    let scored = 0;
    let conceded = 0;

    if (isLocalRomo) {
      scored = m.golesLocal;
      conceded = m.golesVisitante;
    } else if (isVisitanteRomo) {
      scored = m.golesVisitante;
      conceded = m.golesLocal;
    } else {
      // fallback
      scored = m.golesLocal;
      conceded = m.golesVisitante;
    }

    golesAnotados += scored;
    golesEncajados += conceded;

    if (scored > conceded) {
      victorias++;
    } else if (scored === conceded) {
      empates++;
    } else {
      derrotas++;
    }
  });

  return {
    partidosJugados,
    victorias,
    empates,
    derrotas,
    golesAnotados,
    golesEncajados
  };
}

/**
 * Generates overall KPI metrics from rows and aggregated structures.
 */
export function calculateDashboardMetrics(rows: SheetRow[], players: PlayerStats[]): DashboardMetrics {
  const totalRegistros = rows.length;
  const totalGolesAnotados = rows.reduce((sum, row) => sum + row.golesAnotados, 0);
  const totalJugadores = players.length;
  
  // Count unique match listings
  const matchSet = new Set<string>();
  rows.forEach(r => {
    if (r.partido) matchSet.add(`${r.fecha}-${r.partido}`);
  });
  const totalPartidosListados = matchSet.size;

  const totalMinutosJugados = rows.reduce((sum, row) => sum + row.minutosJugados, 0);
  const totalTarjetasAmarillas = rows.reduce((sum, row) => sum + row.tarjetaAmarilla, 0);
  const totalTarjetasRojas = rows.reduce((sum, row) => sum + row.tarjetaRoja + row.dobleAmarilla, 0);
  
  const playersWithMinutes = players.filter(p => p.minutosJugados > 0);
  const promedioMinutosPorJugador = playersWithMinutes.length > 0 
    ? Math.round(playersWithMinutes.reduce((sum, p) => sum + p.minutosJugados, 0) / playersWithMinutes.length)
    : 0;

  return {
    totalRegistros,
    totalGolesAnotados,
    totalJugadores,
    totalPartidosListados,
    totalMinutosJugados,
    totalTarjetasAmarillas,
    totalTarjetasRojas,
    promedioMinutosPorJugador
  };
}
