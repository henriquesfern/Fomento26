import React, { useState, useMemo } from 'react';
import { appData } from '../data/parser';
import { Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlobalDirectoryProps {
  // We can optionally pass data, but we can also just use appData directly
}

export function GlobalDirectory({}: GlobalDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterGrupo, setFilterGrupo] = useState<string>('all');

  type SortKey = 'ENTIDADE' | 'CNPJ' | 'ESTADO' | 'TOTAL_REPASSE' | 'PROP_FOMENTO' | 'PROP_PATROCINIO';
  const [sortConfig, setSortConfig] = useState<{ key: SortKey | null, direction: 'asc' | 'desc' }>({ 
    key: 'TOTAL_REPASSE', 
    direction: 'desc' 
  });

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const aggregatedData = useMemo(() => {
    // Combine all history data
    const allData = [...appData.fomentoHistorico, ...appData.patrocinioHistorico, ...appData.fomento2026];
    
    const map = new Map<string, any>();

    allData.forEach(item => {
      // Use CNPJ as primary key, fallback to ENTIDADE name if empty
      const key = item.CNPJ ? item.CNPJ : item.ENTIDADE;
      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          ENTIDADE: item.ENTIDADE,
          CNPJ: item.CNPJ || 'N/A',
          ESTADO: item.ESTADO,
          IsCDEN: item.IsCDEN,
          IsPrecursora: item.IsPrecursora,
          TOTAL_REPASSE: 0,
          TOTAL_FOMENTO: 0,
          TOTAL_PATROCINIO: 0,
        });
      }

      const entity = map.get(key)!;
      // In case we found an entity with a missing state previously, try to fill it
      if (!entity.ESTADO && item.ESTADO) entity.ESTADO = item.ESTADO;
      
      entity.TOTAL_REPASSE += item.VALOR_REPASSE;
      if (item.tipoRepasse === 'Fomento') {
        entity.TOTAL_FOMENTO += item.VALOR_REPASSE;
      } else if (item.tipoRepasse === 'Patrocínio') {
        entity.TOTAL_PATROCINIO += item.VALOR_REPASSE;
      }
    });

    return Array.from(map.values()).map(e => ({
      ...e,
      PROP_FOMENTO: e.TOTAL_REPASSE > 0 ? (e.TOTAL_FOMENTO / e.TOTAL_REPASSE) : 0,
      PROP_PATROCINIO: e.TOTAL_REPASSE > 0 ? (e.TOTAL_PATROCINIO / e.TOTAL_REPASSE) : 0,
    }));
  }, []);

  const estados = useMemo(() => Array.from(new Set(aggregatedData.map(item => item.ESTADO).filter(Boolean))).sort(), [aggregatedData]);

  const filteredData = useMemo(() => {
    let result = aggregatedData.filter(item => {
      const matchSearch = item.ENTIDADE.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.CNPJ.includes(searchTerm);
      
      const matchEstado = filterEstado === 'all' || item.ESTADO === filterEstado;

      let matchGrupo = true;
      if (filterGrupo === 'CDEN') {
        matchGrupo = item.IsCDEN;
      } else if (filterGrupo === 'PREC') {
        matchGrupo = item.IsPrecursora;
      } else if (filterGrupo === 'REG') {
        matchGrupo = !item.IsCDEN && !item.IsPrecursora;
      }
      
      return matchSearch && matchEstado && matchGrupo;
    });

    if (sortConfig.key) {
      result = result.sort((a, b) => {
        let aVal = a[sortConfig.key!];
        let bVal = b[sortConfig.key!];

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [aggregatedData, searchTerm, filterEstado, filterGrupo, sortConfig]);

  const renderSortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 inline-block text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="ml-1 inline-block text-[#003865]" /> : <ArrowDown size={14} className="ml-1 inline-block text-[#003865]" />;
  };

  return (
    <div className="bg-white border border-[#003865]/20 shadow-sm flex flex-col h-full rounded-none">
      <div className="p-6 border-b border-[#003865]/10">
        <h3 className="text-xl font-semibold text-slate-800 mb-6">Diretório Global de Entidades</h3>
        
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou CNPJ..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003865] focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600 flex items-center"><Filter size={16} className="mr-1"/> Estado:</span>
              <select 
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003865] bg-white"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="all">Todos</option>
                {estados.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600 flex items-center"><Filter size={16} className="mr-1"/> Grupo:</span>
              <select 
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003865] bg-white"
                value={filterGrupo}
                onChange={(e) => setFilterGrupo(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="CDEN">CDEN</option>
                <option value="PREC">Precursoras</option>
                <option value="REG">Outras</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('ENTIDADE')}>
                <div className="flex items-center">Entidade {renderSortIndicator('ENTIDADE')}</div>
              </th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('CNPJ')}>
                <div className="flex items-center">CNPJ {renderSortIndicator('CNPJ')}</div>
              </th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('ESTADO')}>
                <div className="flex items-center">Estado {renderSortIndicator('ESTADO')}</div>
              </th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 text-right cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('TOTAL_REPASSE')}>
                <div className="flex items-center justify-end">Repasse Total {renderSortIndicator('TOTAL_REPASSE')}</div>
              </th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 text-center cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('PROP_FOMENTO')}>
                <div className="flex items-center justify-center">% Fomento {renderSortIndicator('PROP_FOMENTO')}</div>
              </th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 text-center cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('PROP_PATROCINIO')}>
                <div className="flex items-center justify-center">% Patrocínio {renderSortIndicator('PROP_PATROCINIO')}</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">Nenhuma entidade encontrada.</td>
              </tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr key={item.CNPJ + idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-6">
                    <div className="font-medium text-slate-800 text-sm">{item.ENTIDADE}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.IsCDEN && item.IsPrecursora ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] leading-tight font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">CDEN/PREC</span>
                      ) : item.IsCDEN ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">CDEN</span>
                      ) : item.IsPrecursora ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">PREC</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-3 px-6 text-[11px] text-slate-600 font-mono whitespace-nowrap">{item.CNPJ}</td>
                  <td className="py-3 px-6">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                      {item.ESTADO || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm font-semibold text-slate-800 text-right whitespace-nowrap">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.TOTAL_REPASSE)}
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs font-medium text-[#008f4c]">
                          {(item.PROP_FOMENTO * 100).toFixed(1)}%
                        </span>
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden flex">
                          <div className="h-full bg-[#008f4c]" style={{ width: `${item.PROP_FOMENTO * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-[10px] uppercase text-slate-500 font-medium tracking-wider">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(item.TOTAL_FOMENTO)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs font-medium text-amber-500">
                          {(item.PROP_PATROCINIO * 100).toFixed(1)}%
                        </span>
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden flex">
                          <div className="h-full bg-amber-500" style={{ width: `${item.PROP_PATROCINIO * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-[10px] uppercase text-slate-500 font-medium tracking-wider">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(item.TOTAL_PATROCINIO)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-sm">
        <div className="text-slate-600 flex gap-4">
          <span>Total de Entidades: <strong className="text-slate-800">{filteredData.length}</strong></span>
          <span>Repasse Acumulado (Filtro): <strong className="text-[#003865]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(filteredData.reduce((acc, curr) => acc + curr.TOTAL_REPASSE, 0))}</strong></span>
        </div>
      </div>
    </div>
  );
}
