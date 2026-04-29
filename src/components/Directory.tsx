import React, { useState, useMemo } from 'react';
import { appData } from '../data/parser';
import { Search, Filter, Check, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { EntidadeSelecionada } from '../data/parser';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DirectoryProps {
  data?: EntidadeSelecionada[];
}

export function Directory({ data = appData.fomento2026 }: DirectoryProps) {
  const selecionados = data;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrupo, setFilterGrupo] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterRegiao, setFilterRegiao] = useState<string>('all');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [filterFiscal, setFilterFiscal] = useState<string>('all');
  const [filterRepasse, setFilterRepasse] = useState<string>('all');

  type SortKey = 'ENTIDADE' | 'CNPJ' | 'ESTADO' | 'IsCDEN' | 'VALOR_REPASSE' | 'NOTA' | 'tipoRepasse';
  const [sortConfig, setSortConfig] = useState<{ key: SortKey | null, direction: 'asc' | 'desc' }>({ 
    key: null, 
    direction: 'asc' 
  });

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const dataWithGlobalRank = useMemo(() => {
    const sorted = [...selecionados].sort((a, b) => b.NOTA - a.NOTA);
    const total = sorted.length;
    return sorted.map((item, index) => {
      // Como os dados atuais são todos do processo seletivo de fomento 2026:
      const tipoRepasse: 'Fomento' | 'Patrocínio' = (item as any).tipoRepasse || 'Fomento';

      return {
        ...item,
        globalRank: index + 1,
        totalEntities: total,
        tipoRepasse
      };
    });
  }, [selecionados]);

  const estados = useMemo(() => Array.from(new Set(dataWithGlobalRank.map(item => item.ESTADO).filter(Boolean))).sort(), [dataWithGlobalRank]);
  const regioes = useMemo(() => Array.from(new Set(dataWithGlobalRank.map(item => item.REGIÃO).filter(Boolean))).sort(), [dataWithGlobalRank]);
  const categorias = useMemo(() => Array.from(new Set(dataWithGlobalRank.map(item => item.CATEGORIA).filter(Boolean))).sort(), [dataWithGlobalRank]);
  const fiscais = useMemo(() => Array.from(new Set(dataWithGlobalRank.map(item => item.FISCAL).filter(Boolean))).sort(), [dataWithGlobalRank]);

  const filteredData = useMemo(() => {
    let result = dataWithGlobalRank.filter(item => {
      const matchSearch = item.ENTIDADE.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.CNPJ.includes(searchTerm);
      
      let matchGrupo = true;
      if (filterGrupo === 'CDEN') {
        matchGrupo = item.IsCDEN;
      } else if (filterGrupo === 'PREC') {
        matchGrupo = item.IsPrecursora;
      } else if (filterGrupo === 'REG') {
        matchGrupo = !item.IsCDEN && !item.IsPrecursora;
      }
      
      const matchEstado = filterEstado === 'all' || item.ESTADO === filterEstado;
      const matchRegiao = filterRegiao === 'all' || item.REGIÃO === filterRegiao;
      
      let matchCategoria = true;
      if (filterCategoria === 'undefined_category') {
        matchCategoria = !item.CATEGORIA || item.CATEGORIA.trim() === '';
      } else if (filterCategoria !== 'all') {
        matchCategoria = item.CATEGORIA === filterCategoria;
      }

      let matchFiscal = true;
      if (filterFiscal === 'undefined_fiscal') {
        matchFiscal = !item.FISCAL || item.FISCAL.trim() === '';
      } else if (filterFiscal !== 'all') {
        matchFiscal = item.FISCAL === filterFiscal;
      }
      
      const matchRepasse = filterRepasse === 'all' || item.tipoRepasse === filterRepasse;
      
      return matchSearch && matchGrupo && matchEstado && matchRegiao && matchCategoria && matchFiscal && matchRepasse;
    });

    if (sortConfig.key) {
      result = result.sort((a, b) => {
        let aVal: any = a[sortConfig.key!];
        let bVal: any = b[sortConfig.key!];

        if (sortConfig.key === 'IsCDEN') {
          // Compare groups logic (CDEN, Precursora, Regular)
          const getGroupValue = (item: any) => {
            if (item.IsCDEN) return 3;
            if (item.IsPrecursora) return 2;
            return 1;
          };
          aVal = getGroupValue(a);
          bVal = getGroupValue(b);
        } else if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [dataWithGlobalRank, searchTerm, filterGrupo, filterEstado, filterRegiao, filterCategoria, filterFiscal, filterRepasse, sortConfig]);

  const renderSortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 inline-block text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="ml-1 inline-block text-[#003865]" /> : <ArrowDown size={14} className="ml-1 inline-block text-[#003865]" />;
  };

  return (
    <div className="bg-white border border-[#003865]/20 shadow-sm flex flex-col h-full rounded-none">
      <div className="p-6 border-b border-[#003865]/10">
        <h3 className="text-xl font-semibold text-slate-800 mb-6">Diretório de Entidades Selecionadas</h3>
        
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
              <span className="text-sm font-medium text-slate-600 flex items-center"><Filter size={16} className="mr-1"/> Repasse:</span>
              <select 
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003865] bg-white"
                value={filterRepasse}
                onChange={(e) => setFilterRepasse(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="Fomento">Fomento</option>
                <option value="Patrocínio">Patrocínio</option>
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

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600 flex items-center"><Filter size={16} className="mr-1"/> Região:</span>
              <select 
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003865] bg-white"
                value={filterRegiao}
                onChange={(e) => setFilterRegiao(e.target.value)}
              >
                <option value="all">Todas</option>
                {regioes.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

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
              <span className="text-sm font-medium text-slate-600 flex items-center"><Filter size={16} className="mr-1"/> Categoria:</span>
              <select 
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003865] bg-white max-w-[200px] truncate"
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                title={filterCategoria === 'all' ? 'Todas' : filterCategoria === 'undefined_category' ? 'Categoria não definida' : filterCategoria}
              >
                <option value="all">Todas</option>
                <option value="undefined_category">Sem categoria</option>
                {categorias.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600 flex items-center"><Filter size={16} className="mr-1"/> Fiscal:</span>
              <select 
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003865] bg-white max-w-[200px] truncate"
                value={filterFiscal}
                onChange={(e) => setFilterFiscal(e.target.value)}
                title={filterFiscal === 'all' ? 'Todos' : filterFiscal === 'undefined_fiscal' ? 'Fiscal não definido' : filterFiscal}
              >
                <option value="all">Todos</option>
                <option value="undefined_fiscal">Fiscal não definido</option>
                {fiscais.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
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
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 text-center cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('IsCDEN')}>
                <div className="flex items-center justify-center">Grupo {renderSortIndicator('IsCDEN')}</div>
              </th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 text-right cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('VALOR_REPASSE')}>
                <div className="flex items-center justify-end">Valor do Repasse {renderSortIndicator('VALOR_REPASSE')}</div>
              </th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 text-right cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('NOTA')}>
                <div className="flex items-center justify-end">Nota Final {renderSortIndicator('NOTA')}</div>
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
                    <div className="mt-2 flex flex-wrap items-start gap-1">
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap",
                        item.CATEGORIA === "Direcionamento Estratégico Local" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        item.CATEGORIA === "Identificação e Proposição de Soluções" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        item.CATEGORIA === "Mapeamento de Recursos" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        item.CATEGORIA === "Evento" ? "bg-purple-50 text-purple-700 border-purple-200" :
                        item.CATEGORIA === "Revista" ? "bg-pink-50 text-pink-700 border-pink-200" :
                        item.CATEGORIA === "Livro" ? "bg-cyan-50 text-cyan-700 border-cyan-200" :
                        "bg-slate-100 text-slate-600 border-slate-200"
                      )} title={item.CATEGORIA || "Não definido"}>
                        {item.OBJETIVO || "Não definido"}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap" title="Fiscal do Processo">
                        Fiscal: {item.FISCAL || "Não definido"}
                      </span>
                      {item.FISCAL_SUPLENTE && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap" title="Fiscal Suplente">
                          Suplente: {item.FISCAL_SUPLENTE}
                        </span>
                      )}
                      {item.DATA_INICIO && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap" title="Período">
                          {item.DATA_INICIO} {item.DATA_FIM && ` a ${item.DATA_FIM}`}
                        </span>
                      )}
                      {item.MES && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap" title="Mês">
                          {item.MES}
                        </span>
                      )}
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap" title="Número SEI">
                        SEI: {item.SEI || "Não informado"}
                      </span>
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap",
                        item.tipoRepasse === 'Fomento' ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
                        "bg-orange-500/10 text-orange-700 border-orange-500/20"
                      )} title="Tipo de Repasse">
                        {item.tipoRepasse}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-[10px] text-slate-600 font-mono whitespace-nowrap">{item.CNPJ}</td>
                  <td className="py-3 px-6">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                      {item.ESTADO}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    {item.IsCDEN && item.IsPrecursora ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] leading-tight font-bold bg-indigo-100 text-indigo-800 border border-indigo-200" title="CDEN e Precursora">CDEN/PREC</span>
                    ) : item.IsCDEN ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200" title="CDEN">CDEN</span>
                    ) : item.IsPrecursora ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200" title="Precursora">PREC</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200" title="Regular">REG</span>
                    )}
                  </td>
                  <td className="py-3 px-6 text-sm font-semibold text-slate-800 text-right whitespace-nowrap">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.VALOR_REPASSE)}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="text-sm font-semibold text-slate-800">
                      {item.NOTA.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 whitespace-nowrap">
                      {item.globalRank}º/{item.totalEntities}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-600 text-right font-medium">
        Total exibido: {filteredData.length}
      </div>
    </div>
  );
}
