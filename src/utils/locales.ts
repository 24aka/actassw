/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types';

export const translations = {
  es: {
    // Nav & Header
    title: "Panel de Datos Romo F.C.",
    subtitle: "Consulte, filtre y analice las estadísticas de la temporada actual",
    lastUpdated: "Última actualización",
    refreshBtn: "Actualizar",
    loading: "Cargando datos...",
    errorTitle: "Hubo un problema",
    sheetLink: "Ver en Google Sheets",
    
    // Tabs
    tabDashboard: "Tablero Principal",
    tabPlayers: "Fichas de Jugadores",
    tabMatches: "Lista de Partidos",
    tabFullTable: "Modo Tabla",

    // Themes
    themeLight: "Modo Claro",
    themeDark: "Modo Oscuro",

    // KPI Cards
    kpiTotalRows: "Registros en Hoja",
    kpiTotalGoals: "Goles Anotados",
    kpiTotalPlayers: "Plantilla Activa",
    kpiTotalMatches: "Partidos Disputados",
    kpiTotalMinutes: "Minutos de Juego",
    kpiYellowCards: "Tarjetas Amarillas",
    kpiRedCards: "Tarjetas Rojas",
    kpiAvgMintues: "Minutos Promedio",

    // Team Record
    teamRecord: "Rendimiento del Romo F.C.",
    wins: "Victorias",
    draws: "Empates",
    losses: "Derrotas",
    goalsScored: "Goles a Favor",
    goalsConceded: "Goles en Contra",
    winRate: "Tasa de Victorias",

    // Filters
    filtersTitle: "Filtros Avanzados",
    filterSearchPlaceholder: "Buscar jugador, campo, competición, partido...",
    filterPlayer: "Filtrar por Jugador",
    filterCompetition: "Filtrar por Competición",
    filterPitch: "Filtrar por Campo",
    filterResult: "Filtrar por Resultado",
    filterStartDate: "Fecha de Inicio",
    filterEndDate: "Fecha de Fin",
    clearFilters: "Limpiar Filtros",
    all: "Todos",
    allPlayers: "Todos los jugadores",
    allCompetitions: "Todas las competiciones",
    allPitches: "Todos los campos",
    win: "Victoria Romo",
    draw: "Empate",
    loss: "Derrota Romo",
    savedFiltersLoaded: "Filtros anteriores cargados desde el navegador",

    // Columns Visibility Selector
    columnsSelector: "Columnas Visibles",
    resetColumns: "Restablecer Columnas",

    // Export Options
    exportTitle: "Exportar Datos",
    exportCSV: "Exportar a CSV",
    exportExcel: "Exportar a Excel (XML)",
    exportPrint: "Imprimir / Guardar PDF",
    exportSuccess: "Datos exportados correctamente",

    // Table Common
    rowsPerPage: "Filas por página",
    showing: "Mostrando",
    to: "a",
    of: "de",
    noData: "No se encontraron registros que coincidan con los filtros seleccionados.",
    actions: "Acciones",

    // Chart Titles
    chartGoalsPerPlayer: "Goles Anotados por Jugador",
    chartMinutesStats: "Distribución de Minutos Jugados (Top 8)",
    chartTimeline: "Evolución de Goles y Tarjetas por Fecha",
    chartOutcomeDistribution: "Distribución de Resultados de Partidos",
    chartStarterSubDistribution: "Porcentaje de Titularidad",
    goalsLabel: "Goles",
    minutesLabel: "Minutos",
    cardsLabel: "Tarjetas",

    // Player Details Dialog
    playerDetailTitle: "Ficha Técnica de Jugador",
    playerMatchHistory: "Historial de Partidos de la Temporada",
    statStarter: "Titular",
    statSubstitute: "Suplente",
    statMinutes: "Minutos",
    statGoals: "Goles",
    statYellow: "Amarilla",
    statDoubleYellow: "Doble Amarilla",
    statRed: "Roja",
    
    // Column Headers (raw table)
    colTemporada: "Temporada",
    colFecha: "Fecha",
    colCompeticion: "Competición",
    colCampo: "Campo",
    colLocal: "Local",
    colVisitante: "Visitante",
    colJornada: "Jornada",
    colResultado: "Resultado",
    colDorsal: "Dorsal",
    colJugador: "Jugador",
    colMinutos: "Minutos",
    colGoles: "Goles",
    colAmarilla: "Amarilla",
    colRoja: "Roja"
  },
  en: {
    // Nav & Header
    title: "Romo F.C. Analytics Dashboard",
    subtitle: "Query, filter, and analyze current season player statistics",
    lastUpdated: "Last updated",
    refreshBtn: "Refresh",
    loading: "Loading data...",
    errorTitle: "An error occurred",
    sheetLink: "View in Google Sheets",
    
    // Tabs
    tabDashboard: "Dashboard",
    tabPlayers: "Players Stats",
    tabMatches: "Matches List",
    tabFullTable: "Table Mode",

    // Themes
    themeLight: "Light Mode",
    themeDark: "Dark Mode",

    // KPI Cards
    kpiTotalRows: "Registry Rows",
    kpiTotalGoals: "Goals Scored",
    kpiTotalPlayers: "Active Squad",
    kpiTotalMatches: "Matches Played",
    kpiTotalMinutes: "Minutes Played",
    kpiYellowCards: "Yellow Cards",
    kpiRedCards: "Red Cards",
    kpiAvgMintues: "Average Playtime",

    // Team Record
    teamRecord: "Romo F.C. Season Record",
    wins: "Wins",
    draws: "Draws",
    losses: "Losses",
    goalsScored: "Goals For",
    goalsConceded: "Goals Against",
    winRate: "Win Rate",

    // Filters
    filtersTitle: "Advanced Filters",
    filterSearchPlaceholder: "Search player, pitch, competition, match...",
    filterPlayer: "Filter by Player",
    filterCompetition: "Filter by Competition",
    filterPitch: "Filter by Pitch/Field",
    filterResult: "Filter by Outcome",
    filterStartDate: "Start Date",
    filterEndDate: "End Date",
    clearFilters: "Clear Filters",
    all: "All",
    allPlayers: "All players",
    allCompetitions: "All competitions",
    allPitches: "All pitches",
    win: "Romo Win",
    draw: "Draw",
    loss: "Romo Loss",
    savedFiltersLoaded: "Previous filters loaded from local storage",

    // Columns Visibility Selector
    columnsSelector: "Visible Columns",
    resetColumns: "Reset Columns",

    // Export Options
    exportTitle: "Export Data",
    exportCSV: "Export to CSV",
    exportExcel: "Export as Excel (XML)",
    exportPrint: "Print / Save PDF",
    exportSuccess: "Data exported successfully",

    // Table Common
    rowsPerPage: "Rows per page",
    showing: "Showing",
    to: "to",
    of: "of",
    noData: "No records found matching the selected filters.",
    actions: "Actions",

    // Chart Titles
    chartGoalsPerPlayer: "Goals Scored by Player",
    chartMinutesStats: "Minutes Played Distribution (Top 8)",
    chartTimeline: "Timeline of Goals and Cards",
    chartOutcomeDistribution: "Match Outcome Distribution",
    chartStarterSubDistribution: "Starter vs Substitute Share",
    goalsLabel: "Goals",
    minutesLabel: "Minutes",
    cardsLabel: "Cards",

    // Player Details Dialog
    playerDetailTitle: "Player Technical Sheet",
    playerMatchHistory: "Season Match Records",
    statStarter: "Starter",
    statSubstitute: "Substitute",
    statMinutes: "Minutes",
    statGoals: "Goals",
    statYellow: "Yellow",
    statDoubleYellow: "Double Yellow",
    statRed: "Red",

    // Column Headers (raw table)
    colTemporada: "Season",
    colFecha: "Date",
    colCompeticion: "Competition",
    colCampo: "Pitch",
    colLocal: "Home",
    colVisitante: "Away",
    colJornada: "Matchday",
    colResultado: "Result",
    colDorsal: "Dorsal",
    colJugador: "Player",
    colMinutos: "Minutes",
    colGoles: "Goals",
    colAmarilla: "Yellow",
    colRoja: "Red"
  }
};

export const getTranslation = (lang: Language) => translations[lang];
