import React, { useMemo } from 'react';
import { appData } from '../data/parser';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, Area } from 'recharts';
import { ClipboardList, CheckCircle, TrendingDown } from 'lucide-react';
import type { EntidadeSelecionada } from '../data/parser';

interface FinancialPanelProps {
  data?: EntidadeSelecionada[];
  theme?: 'fomento' | 'patrocinio';
}

export function FinancialPanel({ data = appData.fomento2026, theme = 'fomento' }: FinancialPanelProps) {
  const selecionados = data;

  const summary = useMemo(() => {
    let totalProp = 0;
    let totalConc = 0;
    
    // Some values might be missing or parsed as 0
    selecionados.forEach(item => {
      totalProp += item.VALOR_PROJETO || 0;
      totalConc += item.VALOR_REPASSE || 0;
    });

    return {
      totalProjeto: totalProp,
      totalConcedido: totalConc,
      economia: totalProp - totalConc
    };
  }, [selecionados]);

  const regionFinancial = useMemo(() => {
    const map = new Map<string, { name: string; Projeto: number; Concedido: number }>();
    selecionados.forEach(item => {
      const reg = item.REGIÃO || 'Indefinida';
      if (!map.has(reg)) {
        map.set(reg, { name: reg, Projeto: 0, Concedido: 0 });
      }
      const data = map.get(reg)!;
      data.Projeto += item.VALOR_PROJETO || 0;
      data.Concedido += item.VALOR_REPASSE || 0;
    });
    return Array.from(map.values()).sort((a,b) => b.Projeto - a.Projeto);
  }, [selecionados]);

  // Adjustments count (Ajustes de Valor Concedente = 'sim' or boolean based on CSV)
  const ajusteStats = useMemo(() => {
    let comAjuste = 0;
    let semAjuste = 0;
    selecionados.forEach(item => {
      if (item.AJUSTE_VALOR_CONCEDENTE && item.AJUSTE_VALOR_CONCEDENTE.trim().toLowerCase() === 'sim') {
        comAjuste++;
      } else {
        semAjuste++;
      }
    });
    return [
      { name: 'Mantido (Sem Ajuste)', items: semAjuste },
      { name: 'Com Ajuste Cortado', items: comAjuste },
    ];
  }, [selecionados]);

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const ORCAMENTO_TOTAL = 10000000;

  const tColorPrimary = theme === 'fomento' ? '#008f4c' : '#f59e0b';
  const tColorSecondary = theme === 'fomento' ? '#006837' : '#d97706';
  const textPrimaryClass = theme === 'fomento' ? 'text-[#008f4c]' : 'text-amber-500';
  const bgIconClass = theme === 'fomento' ? 'bg-green-50' : 'bg-amber-50';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-slate-200 shadow-sm relative overflow-hidden flex items-center justify-start gap-5">
          <div className="absolute top-0 right-0 w-2 h-full z-20" style={{ backgroundColor: tColorPrimary }}></div>
          <div className={`p-4 rounded-lg shrink-0 relative z-10 w-[64px] h-[64px] flex items-center justify-center ${bgIconClass}`}>
            <CheckCircle className={textPrimaryClass} size={32} />
          </div>
          <div className="relative z-10">
            <p className={`text-sm font-medium mb-1 ${textPrimaryClass}`}>Total de Repasse (Total Aprovado)</p>
            <div className="flex items-center gap-3 mb-1">
              <p className="text-3xl font-bold text-[#003865]">{formatBRL(summary.totalConcedido)}</p>
              <span className="flex items-center text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                {((summary.totalConcedido / ORCAMENTO_TOTAL) * 100).toFixed(1)}% do orçamento
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Orçamento: <span className="font-semibold text-slate-700">{formatBRL(ORCAMENTO_TOTAL)}</span>
            </p>
          </div>
        </div>
        
        <div className="p-6 bg-white border border-slate-200 shadow-sm flex items-center justify-start gap-5">
          <div className="p-4 bg-slate-50 rounded-lg shrink-0 flex items-center justify-center w-[64px] h-[64px]">
            <TrendingDown className="text-slate-500" size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Diferença / Ajustes</p>
            <p className="text-3xl font-bold text-slate-800">{formatBRL(summary.economia)}</p>
            <p className="text-xs text-slate-400 mt-1">Projeto vs Limite Concedente</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 p-6 bg-white border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-2">Comparativo Solicitado vs. Repassado (Por Região)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionFinancial} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  formatter={(val: number) => formatBRL(val)}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 500 }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}
                />
                <Legend />
                <Bar dataKey="Projeto" fill="#A0AAB2" name="Valor Solicitado" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Concedido" fill={tColorSecondary} name="Valor de Repasse" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-2">Funil de Ajustes</h3>
          <p className="text-sm text-slate-600 mb-4">
            Proporção de projetos que tiveram o valor de repasse ajustado em relação à proposta original (identificado por 'sim' na coluna).
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ajusteStats} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={110} tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 500 }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}
                />
                <Bar dataKey="items" fill={tColorPrimary} name="Qtd. Entidades" radius={[0, 4, 4, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
