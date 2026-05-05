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
  const [cdenFilter, setCdenFilter] = useState('');
  const [precFilter, setPrecFilter] = useState('');

  const enrichedECGeral = useMemo(() => {
    const normalize = (str: string) => str ? str.toLowerCase().replace(/[^a-z0-9]/gi, '') : '';
    
    // Build a lookup array from all data sources
    const lookups: { name: string; sigla?: string; cnpj: string; isFom?: boolean; isPat?: boolean; isCden?: boolean; isPrec?: boolean; source: string }[] = [];

    appData.fomentoHistorico.forEach(item => lookups.push({ name: item.ENTIDADE, cnpj: item.CNPJ, isFom: true, isCden: item.IsCDEN, isPrec: item.IsPrecursora, source: 'Fomento2025' }));
    appData.fomento2026.forEach(item => lookups.push({ name: item.ENTIDADE, cnpj: item.CNPJ, isFom: true, isCden: item.IsCDEN, isPrec: item.IsPrecursora, source: 'Fomento2026' }));
    appData.patrocinioHistorico.forEach(item => lookups.push({ name: item.ENTIDADE, cnpj: item.CNPJ, isPat: true, isCden: item.IsCDEN, isPrec: item.IsPrecursora, source: 'Patrocínio2025' }));
    appData.cden.forEach(item => lookups.push({ name: item.Entidade, cnpj: item.CNPJ, isCden: true, source: 'CDEN' }));
    appData.precursoras.forEach(item => lookups.push({ name: item.Entidade, sigla: item.Sigla, cnpj: item.CNPJ, isPrec: true, source: 'Precursoras' }));

    const nameCounts = new Map<string, number>();
    ecGeralData.forEach(item => {
        const n = normalize(item.denominacao);
        if (n) nameCounts.set(n, (nameCounts.get(n) || 0) + 1);
    });

    return ecGeralData.map((ecItem, idx) => {
      const normDenom = normalize(ecItem.denominacao);
      const normSigla = normalize(ecItem.sigla);
      
      const cnpjs = new Set<string>();
      let isFomento = false;
      let isPatrocinio = false;
      let isCDEN = false;
      let isPrecursora = false;
      const obs = new Set<string>();

      const matchedLookups = lookups.filter(l => {
        const ln = normalize(l.name);
        const ls = l.sigla ? normalize(l.sigla) : null;
        // matching logic
        if (normDenom && ln && ln === normDenom) return true;
        if (normSigla && ln && ln === normSigla) return true;
        if (normDenom && ls && ls === normDenom) return true;
        if (normSigla && ls && ls === normSigla) return true;
        return false;
      });

      const cnpjMap = new Map<string, Set<string>>();

      matchedLookups.forEach(m => {
        const cleanedCnpj = m.cnpj ? m.cnpj.replace(/\D/g, '') : '';
        if (cleanedCnpj.length === 14) {
          if (!cnpjMap.has(cleanedCnpj)) cnpjMap.set(cleanedCnpj, new Set());
          cnpjMap.get(cleanedCnpj)!.add(m.source);
        }
        if (m.isFom) isFomento = true;
        if (m.isPat) isPatrocinio = true;
        if (m.isCden) isCDEN = true;
        if (m.isPrec) isPrecursora = true;
      });

      if (cnpjMap.size > 1) {
        obs.add('Divergência de CNPJ');
      }
      
      const formatCnpj = (cnpj: string) => {
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
      };

      const cnpjsDetails = Array.from(cnpjMap.entries()).map(([cnpj, sources]) => ({
        cnpj: formatCnpj(cnpj),
        raw: cnpj,
        sources: Array.from(sources)
      }));

      const displayCnpj = cnpjsDetails.map(d => d.cnpj).join(' | ');

      if (normDenom && (nameCounts.get(normDenom) || 0) > 1) {
          obs.add('Duplicidade no EC Geral');
      }

      return {
        ...ecItem,
        originalIndex: idx,
        cnpjsDetails,
        displayCnpj,
        isFomento,
        isPatrocinio,
        isCDEN,
        isPrecursora,
        obs: Array.from(obs).join(', ')
      };
    });
  }, []);

  const states = useMemo(() => {
    const s = new Set<string>();
    enrichedECGeral.forEach(item => {
      if (item.origem) {
        const state = item.origem.replace('Crea-', '').toUpperCase();
        if (state.length === 2) s.add(state);
      }
    });
    return Array.from(s).sort();
  }, [enrichedECGeral]);

  const types = useMemo(() => {
    const t = new Set<string>();
    enrichedECGeral.forEach(item => {
      if (item.tipo) t.add(item.tipo.trim());
    });
    return Array.from(t).filter(Boolean).sort();
  }, [enrichedECGeral]);

  const filteredData = useMemo(() => {
    return enrichedECGeral.filter(item => {
      const state = item.origem ? item.origem.replace('Crea-', '').toUpperCase() : '';
      const type = item.tipo ? item.tipo.trim() : '';

      const matchSearch = item.denominacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sigla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.displayCnpj?.includes(searchTerm);
      const matchState = stateFilter ? state === stateFilter : true;
      const matchType = typeFilter ? type === typeFilter : true;
      const matchCden = cdenFilter ? (cdenFilter === 'sim' ? item.isCDEN : !item.isCDEN) : true;
      const matchPrec = precFilter ? (precFilter === 'sim' ? item.isPrecursora : !item.isPrecursora) : true;

      let matchRepasse = true;
      if (repasseFilter === 'fomento') matchRepasse = item.isFomento;
      if (repasseFilter === 'patrocinio') matchRepasse = item.isPatrocinio;
      if (repasseFilter === 'ambos') matchRepasse = item.isFomento && item.isPatrocinio;
      if (repasseFilter === 'nenhum') matchRepasse = !item.isFomento && !item.isPatrocinio;

      return matchSearch && matchState && matchType && matchRepasse && matchCden && matchPrec;
    });
  }, [enrichedECGeral, searchTerm, stateFilter, typeFilter, repasseFilter, cdenFilter, precFilter]);

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
            <label className="block text-sm font-medium text-slate-500 mb-1">CDEN</label>
            <select
              className="w-full sm:w-28 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] bg-white text-slate-700"
              value={cdenFilter}
              onChange={(e) => setCdenFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Precursora</label>
            <select
              className="w-full sm:w-28 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] bg-white text-slate-700"
              value={precFilter}
              onChange={(e) => setPrecFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
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
                <th className="px-6 py-4 font-medium whitespace-nowrap">CNPJ</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap text-center">CDEN</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap text-center">Precursora</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">UF</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Tipo</th>
                <th className="px-6 py-4 font-medium">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item, idx) => {
                const state = item.origem ? item.origem.replace('Crea-', '').toUpperCase() : '-';
                
                const hasFomento = item.isFomento;
                const hasPatrocinio = item.isPatrocinio;

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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {item.cnpjsDetails && item.cnpjsDetails.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {item.cnpjsDetails.map((detail, i) => (
                            <div key={i} className="flex flex-col gap-1">
                              <span className="font-mono">{detail.cnpj}</span>
                              <div className="flex flex-wrap gap-1">
                                {detail.sources.map(source => {
                                  let colorClass = 'bg-slate-100 text-slate-600 border border-slate-200';
                                  if (source.includes('Fomento')) colorClass = 'bg-emerald-50 text-[#19904E] border border-[#19904E]/30';
                                  else if (source.includes('Patrocínio')) colorClass = 'bg-amber-50 text-[#F19D26] border border-[#F19D26]/30';
                                  else if (source === 'CDEN') colorClass = 'bg-blue-50 text-blue-700 border border-blue-700/30';
                                  else if (source === 'Precursoras') colorClass = 'bg-purple-50 text-purple-700 border border-purple-700/30';
                                  
                                  let label = source;
                                  if (source === 'Fomento2025') label = 'Fomento (2025)';
                                  if (source === 'Fomento2026') label = 'Fomento (2026)';
                                  if (source === 'Patrocínio2025') label = 'Patrocínio (2025)';

                                  return (
                                    <span key={source} className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${colorClass}`}>
                                      {label}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.isCDEN ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                          Sim
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.isPrecursora ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Sim
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
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
                    <td className="px-6 py-4 text-xs text-red-600 font-medium">
                      {item.obs}
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
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
