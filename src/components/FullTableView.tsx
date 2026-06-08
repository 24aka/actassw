/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Printer, Settings, Check, ChevronDown, ChevronUp, RefreshCw, EyeOff, Table } from 'lucide-react';
import { SheetRow, Language } from '../types';
import { getTranslation } from '../utils/locales';

interface FullTableViewProps {
  rows: SheetRow[];
  lang: Language;
}

type SortCol = keyof SheetRow;

export default function FullTableView({ rows, lang }: FullTableViewProps) {
  const t = getTranslation(lang);
  
  // States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortCol, setSortCol] = useState<SortCol>('fecha');
  const [sortAsc, setSortAsc] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Column Configurations: key and localized label
  const allColumns: { key: SortCol; label: string }[] = [
    { key: 'fecha', label: t.colFecha },
    { key: 'jornada', label: t.colJornada },
    { key: 'equipoLocal', label: t.colLocal },
    { key: 'resultado', label: t.colResultado },
    { key: 'equipoVisitante', label: t.colVisitante },
    { key: 'dorsal', label: t.colDorsal },
    { key: 'jugador', label: t.colJugador },
    { key: 'minutosJugados', label: t.colMinutos },
    { key: 'golesAnotados', label: t.colGoles },
    { key: 'tarjetaAmarilla', label: t.colAmarilla },
    { key: 'tarjetaRoja', label: t.colRoja },
    { key: 'campo', label: t.colCampo },
    { key: 'competicion', label: t.colCompeticion },
  ];

  // Load or default column visibility
  const [visibleKeys, setVisibleKeys] = useState<SortCol[]>(() => {
    try {
      const saved = localStorage.getItem('romo_visible_cols');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default: first 11 columns visible
    return ['fecha', 'jornada', 'equipoLocal', 'resultado', 'equipoVisitante', 'dorsal', 'jugador', 'minutosJugados', 'golesAnotados', 'tarjetaAmarilla', 'tarjetaRoja'];
  });

  const toggleColumn = (key: SortCol) => {
    let updated: SortCol[];
    if (visibleKeys.includes(key)) {
      if (visibleKeys.length <= 2) return; // keep at least 2 columns
      updated = visibleKeys.filter((k) => k !== key);
    } else {
      updated = [...visibleKeys, key];
    }
    setVisibleKeys(updated);
    localStorage.setItem('romo_visible_cols', JSON.stringify(updated));
  };

  const resetColumns = () => {
    const defaults: SortCol[] = ['fecha', 'jornada', 'equipoLocal', 'resultado', 'equipoVisitante', 'dorsal', 'jugador', 'minutosJugados', 'golesAnotados', 'tarjetaAmarilla', 'tarjetaRoja'];
    setVisibleKeys(defaults);
    localStorage.setItem('romo_visible_cols', JSON.stringify(defaults));
  };

  // Sorting
  const handleSort = (key: SortCol) => {
    if (sortCol === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(key);
      setSortAsc(true);
    }
    setCurrentPage(1);
  };

  const sortedRows = [...rows].sort((a, b) => {
    let valA = a[sortCol];
    let valB = b[sortCol];

    if (valA === undefined) return 1;
    if (valB === undefined) return -1;

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    }
  });

  // Pagination bounds
  const totalRows = sortedRows.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRows);
  const paginatedRows = sortedRows.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalRows / pageSize) || 1;

  // Exports Handlers
  const exportToCSV = () => {
    const headers = allColumns.map((col) => col.label);
    const content = [
      headers.join(','),
      ...rows.map((row) =>
        allColumns.map((col) => {
          let val = row[col.key];
          if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        }).join(',')
      )
    ].join('\r\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Romo_FC_Estadisticas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcelXML = () => {
    // Elegant XML Spreadsheet format which is real Excel compatible and preserves columns
    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Estadisticas Romo FC">
  <Table>
   <Row ss:FontWeight="Bold">
    ${allColumns.map((col) => `<Cell><Data ss:Type="String">${col.label}</Data></Cell>`).join('\n    ')}
   </Row>
   ${rows.map((row) => `   <Row>
    ${allColumns.map((col) => {
      const val = row[col.key];
      const isNum = typeof val === 'number';
      return `<Cell><Data ss:Type="${isNum ? 'Number' : 'String'}">${val}</Data></Cell>`;
    }).join('\n    ')}
   </Row>`).join('\n   ')}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Romo_FC_Estadisticas_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4" id="full-table-tab-panel">
      {/* Top action and utilities bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl" id="table-toolbar">
        <div className="flex items-center gap-2" id="table-toolbar-title">
          <Table className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            {t.tabFullTable}
          </h3>
          <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full text-2xs font-extrabold tracking-wide">
            {totalRows} {lang === 'es' ? 'registros' : 'rows'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2" id="table-toolbar-actions">
          {/* Column Visibility Selector dropdown */}
          <div className="relative inline-block" id="col-selector-dropdown-wrapper">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-xs px-3.5 py-2 inline-flex items-center gap-1.5 font-bold uppercase tracking-wider bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400" />
              {t.columnsSelector}
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xl p-3 z-20 space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <span className="text-2xs font-black uppercase text-zinc-400 tracking-widest">{t.columnsSelector}</span>
                    <button onClick={resetColumns} className="text-4xs text-blue-500 font-extrabold tracking-widest uppercase hover:underline">
                      {t.resetColumns}
                    </button>
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1" id="cols-dropdown-options">
                    {allColumns.map((col) => {
                      const isVisible = visibleKeys.includes(col.key);
                      return (
                        <button
                          key={col.key}
                          onClick={() => toggleColumn(col.key)}
                          className="w-full text-left rounded-lg text-xs font-semibold px-2.5 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-between"
                        >
                          <span>{col.label}</span>
                          {isVisible ? (
                            <Check className="w-3.5 h-3.5 text-blue-500 font-bold" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-zinc-300 dark:text-dark-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Export CSV button */}
          <button
            onClick={exportToCSV}
            className="text-xs px-3.5 py-2 inline-flex items-center gap-1.5 font-bold uppercase tracking-wider bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-2xs"
            title={t.exportCSV}
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            CSV
          </button>

          {/* Export Excel button */}
          <button
            onClick={exportToExcelXML}
            className="text-xs px-3.5 py-2 inline-flex items-center gap-1.5 font-bold uppercase tracking-wider bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-2xs"
            title={t.exportExcel}
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            Excel
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="text-xs px-3.5 py-2 inline-flex items-center gap-1.5 font-bold uppercase tracking-wider bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-2xs"
            title={t.exportPrint}
          >
            <Printer className="w-3.5 h-3.5 text-zinc-400" />
            PDF
          </button>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="overflow-x-auto border border-zinc-100 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xs" id="table-scroll-container">
        <table className="w-full text-sm text-left border-collapse" id="main-data-table-registry">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-950/40 border-b border-zinc-100 dark:border-zinc-800 text-2xs font-extrabold text-zinc-400 uppercase tracking-wider">
              {allColumns
                .filter((col) => visibleKeys.includes(col.key))
                .map((col) => {
                  const isCurrent = sortCol === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-5 py-3.5 font-extrabold cursor-pointer select-none border-zinc-100 dark:border-zinc-800"
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.label}</span>
                        {isCurrent ? (
                          sortAsc ? (
                            <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                          )
                        ) : (
                          <ChevronUp className="w-3 h-3 text-zinc-300 dark:text-zinc-700 opacity-60" />
                        )}
                      </div>
                    </th>
                  );
                })}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-110 dark:divide-zinc-801/60 text-zinc-650 dark:text-zinc-300 font-medium whitespace-nowrap">
            {paginatedRows.map((row, rIdx) => (
              <tr key={row.id || rIdx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition duration-100">
                {allColumns
                  .filter((col) => visibleKeys.includes(col.key))
                  .map((col) => {
                    let cellVal = row[col.key];
                    let renderContent: React.ReactNode = String(cellVal || '');

                    // Style specific column values
                    if (col.key === 'fecha') {
                      renderContent = <span className="font-mono text-2xs text-zinc-400">{String(cellVal)}</span>;
                    } else if (col.key === 'jugador') {
                      renderContent = <strong className="text-zinc-900 dark:text-zinc-50">{String(cellVal)}</strong>;
                    } else if (col.key === 'minutosJugados') {
                      renderContent = <span className="font-mono font-bold text-zinc-800 dark:text-zinc-300">{Number(cellVal)}</span>;
                    } else if (col.key === 'golesAnotados') {
                      renderContent = Number(cellVal) > 0 ? (
                        <span className="inline-flex items-center justify-center bg-amber-500 text-white font-extrabold w-5 h-5 rounded-full text-2xs leading-none">
                          {cellVal}
                        </span>
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-700">-</span>
                      );
                    } else if (col.key === 'tarjetaAmarilla' || col.key === 'tarjetaRoja') {
                      // cards visual
                      const val = Number(cellVal);
                      renderContent = val > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <span className={`w-2 h-3.5 rounded-3xs inline-block ${col.key === 'tarjetaAmarilla' ? 'bg-yellow-400' : 'bg-red-600'}`} />
                          <span className="text-2xs font-mono text-zinc-500">{val}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-305 dark:text-zinc-705">-</span>
                      );
                    } else if (col.key === 'resultado') {
                      renderContent = <span className="font-mono text-2xs uppercase bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-lg border border-zinc-200/40 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold">{String(cellVal)}</span>;
                    }

                    return (
                      <td key={col.key} className="px-5 py-3 text-xs">
                        {renderContent}
                      </td>
                    );
                  })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-2 text-xs text-zinc-500 dark:text-zinc-400" id="table-pagination">
        {/* Page size buttons */}
        <div className="flex items-center gap-2" id="pagination-pagesize-select">
          <span>{t.rowsPerPage}:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg p-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        {/* Index entries summary */}
        <div className="font-medium" id="pagination-entries-summary">
          {t.showing} <span className="font-semibold text-zinc-800 dark:text-zinc-200">{startIndex + 1}</span> {t.to} <span className="font-semibold text-zinc-800 dark:text-zinc-200">{endIndex}</span> {t.of} <span className="font-semibold text-zinc-800 dark:text-zinc-200">{totalRows}</span>
        </div>

        {/* Prev & Next arrows navigation */}
        <div className="inline-flex gap-1" id="pagination-nav-keypad">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg font-bold bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-804 text-zinc-600 disabled:opacity-40 select-none transition disabled:pointer-events-none"
          >
            ‹
          </button>
          
          <div className="flex items-center gap-1 px-1 font-semibold text-zinc-700 dark:text-zinc-300">
            <span>{currentPage}</span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span>{totalPages}</span>
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg font-bold bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-804 text-zinc-600 disabled:opacity-40 select-none transition disabled:pointer-events-none"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
