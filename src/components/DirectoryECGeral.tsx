import React, { useState, useMemo } from 'react';
import { ecGeralData } from '../data/ECGeral';
import { appData } from '../data/parser';
import { Search, Star, Building2, Filter } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const normalizeString = (str: string) => str ? str.toLowerCase().replace(/[^a-z0-9]/gi, '') : '';

export function DirectoryECGeral() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [repasseFilter, setRepasseFilter] = useState('');

  const states = useMemo(() => {
    const s = new Set<string>();
    ecGeralData.forEach(item => {
      if (item.origem) {
        const state = item.origem.replace('Crea-', '').toUpperCase();
        if (state.length === 2) s.add(state);
      }
    });
    return Array.from(s).sort();
  }, []);

  const types = useMemo(() => {
    const t = new Set<string>();
    ecGeralData.forEach(item => {
      if (item.tipo) t.add(item.tipo.trim());
    });
    return Array.from(t).filter(Boolean).sort();
  }, []);

  const fomentoEntities = useMemo(() => {
    const set = new Set<string>();
    appData.fomentoHistorico.forEach(item => {
      set.add(normalizeString(item.ENTIDADE));
    });
    return set;
  }, []);

  const patrocinioEntities = useMemo(() => {
    const set = new Set<string>();
    appData.patrocinioHistorico.forEach(item => {
      set.add(normalizeString(item.ENTIDADE));
    });
    return set;
  }, []);

  const filteredData = useMemo(() => {
    return ecGeralData.filter(item => {
      const state = item.origem ? item.origem.replace('Crea-', '').toUpperCase() : '';
      const type = item.tipo ? item.tipo.trim() : '';

      const matchSearch = item.denominacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sigla?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchState = stateFilter ? state === stateFilter : true;
      const matchType = typeFilter ? type === typeFilter : true;

      const normDenom = normalizeString(item.denominacao);
      const normSigla = normalizeString(item.sigla);
      
      const hasFomento = fomentoEntities.has(normDenom) || (normSigla && fomentoEntities.has(normSigla));
      const hasPatrocinio = patrocinioEntities.has(normDenom) || (normSigla && patrocinioEntities.has(normSigla));

      let matchRepasse = true;
      if (repasseFilter === 'fomento') matchRepasse = hasFomento;
      if (repasseFilter === 'patrocinio') matchRepasse = hasPatrocinio;
      if (repasseFilter === 'ambos') matchRepasse = hasFomento && hasPatrocinio;
      if (repasseFilter === 'nenhum') matchRepasse = !hasFomento && !hasPatrocinio;

      return matchSearch && matchState && matchType && matchRepasse;
    });
  }, [searchTerm, stateFilter, typeFilter, repasseFilter, fomentoEntities, patrocinioEntities]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-white shadow-sm flex items-center justify-start gap-6 border-l-8" style={{ borderLeftColor: '#003865' }}>
            <Building2 className="opacity-80 shrink-0 text-[#215F9A]" size={64} />
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Total de Entidades</p>
              <p className="text-6xl font-black tracking-tight text-[#003865]">{ecGeralData.length}</p>
            </div>
          </div>
          
          <div className="p-8 bg-white shadow-sm flex items-center justify-start gap-6 border-l-8" style={{ borderLeftColor: '#3b82f6' }}>
            <Filter className="opacity-80 shrink-0 text-[#3b82f6]" size={64} />
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Entidades Filtradas</p>
              <div className="flex items-baseline gap-3">
                <p className="text-6xl font-black tracking-tight text-[#1e3a8a]">{filteredData.length}</p>
                <span className="text-xl font-medium text-slate-400">
                  ({ecGeralData.length > 0 ? ((filteredData.length / ecGeralData.length) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 w-full max-w-md">
          <label className="block text-sm font-medium text-slate-500 mb-1">Buscar Entidade</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Nome ou Sigla..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4 w-full sm:w-auto">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Estado</label>
            <select
              className="w-full sm:w-32 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] bg-white text-slate-700"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="">Todos</option>
              {states.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Repasse</label>
            <select
              className="w-full sm:w-36 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] bg-white text-slate-700"
              value={repasseFilter}
              onChange={(e) => setRepasseFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="fomento">Fomento</option>
              <option value="patrocinio">Patrocínio</option>
              <option value="ambos">Ambos</option>
              <option value="nenhum">Nenhum</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Tipo</label>
            <select
              className="w-full sm:w-40 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] bg-white text-slate-700"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Todos</option>
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 text-sm font-medium text-slate-500 flex justify-between items-center">
          <span>{filteredData.length} registros encontrados</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-6 py-4 font-medium whitespace-nowrap w-24">Repasse</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Sigla</th>
                <th className="px-6 py-4 font-medium">Nome (Denominação)</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">UF</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item, idx) => {
                const state = item.origem ? item.origem.replace('Crea-', '').toUpperCase() : '-';
                
                const normDenom = normalizeString(item.denominacao);
                const normSigla = normalizeString(item.sigla);
                
                const hasFomento = fomentoEntities.has(normDenom) || (normSigla && fomentoEntities.has(normSigla));
                const hasPatrocinio = patrocinioEntities.has(normDenom) || (normSigla && patrocinioEntities.has(normSigla));

                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {hasFomento && (
                          <div title="Fomento" className="p-1 rounded bg-[#008f4c]/10 text-[#008f4c]">
                            <Star size={16} className="fill-current" />
                          </div>
                        )}
                        {hasPatrocinio && (
                          <div title="Patrocínio" className="p-1 rounded bg-[#d4a017]/10 text-[#d4a017]">
                            <Star size={16} className="fill-current" />
                          </div>
                        )}
                        {!hasFomento && !hasPatrocinio && (
                          <span className="text-slate-300">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                      {item.sigla || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {item.denominacao}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#003865]/10 text-[#003865]">
                        {state}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {item.tipo || '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Nenhuma entidade encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
