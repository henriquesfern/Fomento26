import React, { useMemo } from 'react';
import { appData } from '../data/parser';
import { Lightbulb, TrendingUp, AlertTriangle, Users, Target, BarChart3, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export function InsightsView() {
  const { selecionados } = appData;

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const insights = useMemo(() => {
    // 1. Efficiency by Region/State (highest approved / requested ratio)
    const stateAnalysis = new Map<string, { totalRequested: number, totalGranted: number, count: number }>();
    
    // 2. CDEN vs Precursoras Comparison
    let cdenCount = 0;
    let cdenGranted = 0;
    let precCount = 0;
    let precGranted = 0;

    // 3. Score (Média) correlation with success rate
    let highScores = { count: 0, requested: 0, granted: 0 };
    let lowScores = { count: 0, requested: 0, granted: 0 };

    selecionados.forEach(item => {
      // States
      const state = item.ESTADO || 'NI';
      if (!stateAnalysis.has(state)) {
        stateAnalysis.set(state, { totalRequested: 0, totalGranted: 0, count: 0 });
      }
      const st = stateAnalysis.get(state)!;
      st.totalRequested += item.VALOR_PROJETO;
      st.totalGranted += item.VALOR_CONCEDENTE;
      st.count += 1;

      // CDEN vs Precursora
      if (item.IsCDEN) {
        cdenCount++;
        cdenGranted += item.VALOR_CONCEDENTE;
      } else if (item.IsPrecursora) {
        precCount++;
        precGranted += item.VALOR_CONCEDENTE;
      }

      // Scores (cutoff 8.0)
      if (item.MÉDIA >= 8.0) {
        highScores.count++;
        highScores.requested += item.VALOR_PROJETO;
        highScores.granted += item.VALOR_CONCEDENTE;
      } else {
        lowScores.count++;
        lowScores.requested += item.VALOR_PROJETO;
        lowScores.granted += item.VALOR_CONCEDENTE;
      }
    });

    // Process State Efficiency
    const stateEfficiencyArr = Array.from(stateAnalysis.entries())
      .filter(([_, data]) => data.totalRequested > 0 && data.count >= 2) // only states with > 0 requested and multiple projects
      .map(([state, data]) => ({
        state,
        efficiency: (data.totalGranted / data.totalRequested) * 100,
        granted: data.totalGranted,
        requested: data.totalRequested
      }))
      .sort((a, b) => b.efficiency - a.efficiency);

    const topEfficientStates = stateEfficiencyArr.slice(0, 3);
    const bottomEfficientStates = stateEfficiencyArr.slice(-3).reverse();

    // CDEN vs Precursora
    const cdenAvg = cdenCount > 0 ? cdenGranted / cdenCount : 0;
    const precAvg = precCount > 0 ? precGranted / precCount : 0;

    // Score Efficiency
    const highScoreEfficiency = highScores.requested > 0 ? (highScores.granted / highScores.requested) * 100 : 0;
    const lowScoreEfficiency = lowScores.requested > 0 ? (lowScores.granted / lowScores.requested) * 100 : 0;

    return {
      topEfficientStates,
      bottomEfficientStates,
      cdenStats: { count: cdenCount, avg: cdenAvg, total: cdenGranted },
      precStats: { count: precCount, avg: precAvg, total: precGranted },
      scores: {
        high: { count: highScores.count, efficiency: highScoreEfficiency },
        low: { count: lowScores.count, efficiency: lowScoreEfficiency }
      }
    };
  }, [selecionados]);

  const scoreData = [
    { name: 'Projetos Nota ≥ 8.0', Aprovado: insights.scores.high.efficiency },
    { name: 'Projetos Nota < 8.0', Aprovado: insights.scores.low.efficiency },
  ];

  const entityData = [
    { name: 'CDEN', value: insights.cdenStats.total, count: insights.cdenStats.count },
    { name: 'Precursoras', value: insights.precStats.total, count: insights.precStats.count },
  ];
  const COLORS = ['#003865', '#008f4c'];

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
        <Lightbulb className="text-[#008f4c]" size={32} />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Principais Insights</h2>
          <p className="text-slate-500">Descobertas e análises baseadas nos dados consolidados das entidades.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Insight 1: Entities Comparison */}
        <div className="bg-white p-6 border border-[#003865]/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#003865]"></div>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-lg text-[#003865] shrink-0">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">CDEN vs. Precursoras</h3>
              <p className="text-sm text-slate-500 mt-1">Comparativo de representatividade no total concedido.</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="h-64 w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={entityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {entityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatBRL(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-[#003865] rounded shadow-sm text-center flex flex-col items-center justify-center">
                <p className="text-xs text-blue-100 font-medium mb-0.5">CDEN ({insights.cdenStats.count})</p>
                <p className="text-lg font-bold text-white leading-tight">{formatBRL(insights.cdenStats.total)}</p>
                <div className="flex flex-wrap justify-center gap-1 md:gap-1.5 text-[11px] text-blue-200 mt-0.5">
                  <span>Média: {formatBRL(insights.cdenStats.avg)}</span>
                  <span className="hidden md:inline">•</span>
                  <span>
                    {((insights.cdenStats.total / (insights.cdenStats.total + insights.precStats.total || 1)) * 100).toFixed(1)}% do total
                  </span>
                </div>
              </div>
              <div className="p-3 bg-[#008f4c] rounded shadow-sm text-center flex flex-col items-center justify-center">
                <p className="text-xs text-green-100 font-medium mb-0.5">Precursoras ({insights.precStats.count})</p>
                <p className="text-lg font-bold text-white leading-tight">{formatBRL(insights.precStats.total)}</p>
                <div className="flex flex-wrap justify-center gap-1 md:gap-1.5 text-[11px] text-green-200 mt-0.5">
                  <span>Média: {formatBRL(insights.precStats.avg)}</span>
                  <span className="hidden md:inline">•</span>
                  <span>
                    {((insights.precStats.total / (insights.cdenStats.total + insights.precStats.total || 1)) * 100).toFixed(1)}% do total
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insight 2: Score Impact */}
        <div className="bg-white p-6 border border-[#003865]/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#008f4c]"></div>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-green-50 rounded-lg text-[#008f4c] shrink-0">
              <Target size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Impacto da Nota (Média)</h3>
              <p className="text-sm text-slate-500 mt-1">Taxa de aprovação do valor solicitado baseada no desempenho.</p>
            </div>
          </div>

          <div className="h-48 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: number) => `${val.toFixed(1)}% aprovado`} />
                <Bar dataKey="Aprovado" fill="#008f4c" radius={[0, 4, 4, 0]} barSize={32}>
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#008f4c' : '#A0AAB2'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded">
            <strong>Descoberta:</strong> Projetos com nota acima de 8.0 têm uma taxa de retenção de valor de <strong>{insights.scores.high.efficiency.toFixed(1)}%</strong>, comparado a apenas <strong>{insights.scores.low.efficiency.toFixed(1)}%</strong> para notas menores.
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Insight 3: Efficient states */}
        <div className="bg-white p-6 border border-[#003865]/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-500 shrink-0">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Estados com Maior Eficiência</h3>
              <p className="text-sm text-slate-500 mt-1">Menor redução (corte) do valor solicitado.</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {insights.topEfficientStates.map((st, i) => (
              <div key={st.state} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white text-blue-600 font-bold flex items-center justify-center shadow-sm text-sm border border-slate-200">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">{st.state}</p>
                    <p className="text-xs text-slate-500">Concedido: {formatBRL(st.granted)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 bg-green-100 text-[#008f4c] font-semibold text-sm rounded">
                    {st.efficiency.toFixed(1)}% retido
                  </span>
                </div>
              </div>
            ))}
            {insights.topEfficientStates.length === 0 && <p className="text-sm text-slate-500">Análise insuficiente baseada nos dados.</p>}
          </div>
        </div>

        {/* Insight 4: Alert states */}
        <div className="bg-white p-6 border border-[#003865]/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-500 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Estados com Maior Corte</h3>
              <p className="text-sm text-slate-500 mt-1">Maior redução do valor solicitado vs. concedido.</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {insights.bottomEfficientStates.map((st, i) => (
              <div key={st.state} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white text-amber-600 font-bold flex items-center justify-center shadow-sm text-sm border border-slate-200">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">{st.state}</p>
                    <p className="text-xs text-slate-500">Solicitado: {formatBRL(st.requested)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 font-semibold text-sm rounded">
                    {st.efficiency.toFixed(1)}% retido
                  </span>
                </div>
              </div>
            ))}
            {insights.bottomEfficientStates.length === 0 && <p className="text-sm text-slate-500">Análise insuficiente baseada nos dados.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
