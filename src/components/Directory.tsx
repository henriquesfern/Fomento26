import React, { useState, useMemo } from 'react';
import { appData } from '../data/parser';
import { Search, Filter, Check, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Directory() {
  const { selecionados } = appData;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrupo, setFilterGrupo] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterRegiao, setFilterRegiao] = useState<string>('all');
  const [filterObjetivo, setFilterObjetivo] = useState<string>('all');
  const [filterFiscal, setFilterFiscal] = useState<string>('all');

  const dataWithGlobalRank = useMemo(() => {
    const sorted = [...selecionados].sort((a, b) => b.MÉDIA - a.MÉDIA);
    const total = sorted.length;
    return sorted.map((item, index) => ({
      ...item,
      globalRank: index + 1,
      totalEntities: total
    }));
  }, [selecionados]);

  const estados = useMemo(() => Array.from(new Set(dataWithGlobalRank.map(item => item.ESTADO).filter(Boolean))).sort(), [dataWithGlobalRank]);
  const regioes = useMemo(() => Array.from(new Set(dataWithGlobalRank.map(item => item.REGIÃO).filter(Boolean))).sort(), [dataWithGlobalRank]);
  const objetivos = useMemo(() => Array.from(new Set(dataWithGlobalRank.map(item => item.OBJETIVO).filter(Boolean))).sort(), [dataWithGlobalRank]);
  const fiscais = useMemo(() => Array.from(new Set(dataWithGlobalRank.map(item => item.FISCAL).filter(Boolean))).sort(), [dataWithGlobalRank]);

  const filteredData = useMemo(() => {
    return dataWithGlobalRank.filter(item => {
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
      
      let matchObjetivo = true;
      if (filterObjetivo === 'undefined_objective') {
        matchObjetivo = !item.OBJETIVO || item.OBJETIVO.trim() === '';
      } else if (filterObjetivo !== 'all') {
        matchObjetivo = item.OBJETIVO === filterObjetivo;
      }

      let matchFiscal = true;
      if (filterFiscal === 'undefined_fiscal') {
        matchFiscal = !item.FISCAL || item.FISCAL.trim() === '';
      } else if (filterFiscal !== 'all') {
        matchFiscal = item.FISCAL === filterFiscal;
      }
      
      return matchSearch && matchGrupo && matchEstado && matchRegiao && matchObjetivo && matchFiscal;
    });
  }, [selecionados, searchTerm, filterGrupo, filterEstado, filterRegiao, filterObjetivo, filterFiscal]);

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
              <span className="text-sm font-medium text-slate-600 flex items-center"><Filter size={16} className="mr-1"/> Objetivo:</span>
              <select 
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003865] bg-white max-w-[200px] truncate"
                value={filterObjetivo}
                onChange={(e) => setFilterObjetivo(e.target.value)}
                title={filterObjetivo === 'all' ? 'Todos' : filterObjetivo === 'undefined_objective' ? 'Objetivo não definido' : filterObjetivo}
              >
                <option value="all">Todos</option>
                <option value="undefined_objective">Objetivo não definido</option>
                {objetivos.map(o => (
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
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10">Entidade</th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10">CNPJ</th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10">Estado</th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 text-center">Grupo</th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 text-right">Valor Fomentado</th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 text-right">Nota Final</th>
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
                    <div className="mt-1 flex flex-col items-start gap-1">
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded text-xs font-medium truncate max-w-sm",
                        item.OBJETIVO === "Direcionamento Estratégico Local" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        item.OBJETIVO === "Identificação e Proposição de Soluções" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        item.OBJETIVO === "Mapeamento de Recursos" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-slate-100 text-slate-600 border border-slate-200"
                      )} title={item.OBJETIVO || "Não definido"}>
                        {item.OBJETIVO || "Objetivo não definido"}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200" title="Fiscal do Processo">
                        Fiscal: {item.FISCAL || "Não definido"}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200" title="Número SEI">
                        SEI: {item.SEI || "Não informado"}
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
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.VALOR_CONCEDENTE)}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="text-sm font-semibold text-slate-800">
                      {item.MÉDIA.toFixed(2).replace('.', ',')}
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
