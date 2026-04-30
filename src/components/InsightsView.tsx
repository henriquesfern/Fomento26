import React, { useMemo } from 'react';
import { appData } from '../data/parser';
import { Lightbulb, Users, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area } from 'recharts';

export function InsightsView() {
  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const insights = useMemo(() => {
    // Combine all data for global insights
    const allData = [...appData.fomento2026, ...appData.fomentoHistorico, ...appData.patrocinioHistorico];

    // 1. CDEN vs Precursoras Comparison (GLOBAL)
    let cdenCount = 0;
    let cdenGranted = 0;
    let precCount = 0;
    let precGranted = 0;

    // 2. Fomento vs Patrocinio (GLOBAL)
    let fomentoCount = 0;
    let fomentoTotal = 0;
    let patrocinioCount = 0;
    let patrocinioTotal = 0;

    allData.forEach(item => {
      // CDEN vs Precursora
      if (item.IsCDEN) {
        cdenCount++;
        cdenGranted += item.VALOR_REPASSE;
      } else if (item.IsPrecursora) {
        precCount++;
        precGranted += item.VALOR_REPASSE;
      }

      // Fomento vs Patrocínio
      if (item.tipoRepasse === 'Fomento') {
        fomentoTotal += item.VALOR_REPASSE;
        fomentoCount++;
      } else if (item.tipoRepasse === 'Patrocínio') {
        patrocinioTotal += item.VALOR_REPASSE;
        patrocinioCount++;
      }
    });

    // 3. Evolução Fomento/Patrocínio (2025 vs 2026)
    const fomento2025Total = appData.fomentoHistorico.reduce((acc, curr) => acc + curr.VALOR_REPASSE, 0);
    const fom2026Total = appData.fomento2026.reduce((acc, curr) => acc + curr.VALOR_REPASSE, 0);
    const patrocinio2025Total = appData.patrocinioHistorico.reduce((acc, curr) => acc + curr.VALOR_REPASSE, 0);

    // 4. State analysis for Fomento and Patrocínio
    const stateTotals = new Map<string, { fomento: number, patrocinio: number, total: number }>();
    
    allData.forEach(item => {
      const state = item.ESTADO || 'NI';
      if (!stateTotals.has(state)) {
        stateTotals.set(state, { fomento: 0, patrocinio: 0, total: 0 });
      }
      const st = stateTotals.get(state)!;
      if (item.tipoRepasse === 'Fomento') {
        st.fomento += item.VALOR_REPASSE;
      } else if (item.tipoRepasse === 'Patrocínio') {
        st.patrocinio += item.VALOR_REPASSE;
      }
      st.total += item.VALOR_REPASSE;
    });

    const stateForceArr = Array.from(stateTotals.entries())
      .filter(([state, d]) => d.total > 0 && state !== 'NI')
      .map(([state, d]) => ({
        state,
        Fomento: d.fomento,
        Patrocínio: d.patrocinio,
        Total: d.total
      }))
      .sort((a, b) => b.Total - a.Total);

    const cdenAvg = cdenCount > 0 ? cdenGranted / cdenCount : 0;
    const precAvg = precCount > 0 ? precGranted / precCount : 0;
    const fomAvg = fomentoCount > 0 ? fomentoTotal / fomentoCount : 0;
    const patAvg = patrocinioCount > 0 ? patrocinioTotal / patrocinioCount : 0;

    return {
      global: {
        cdenStats: { count: cdenCount, avg: cdenAvg, total: cdenGranted },
        precStats: { count: precCount, avg: precAvg, total: precGranted },
        fomentoStats: { count: fomentoCount, avg: fomAvg, total: fomentoTotal },
        patrocinioStats: { count: patrocinioCount, avg: patAvg, total: patrocinioTotal },
        fomento2025Total,
        fom2026Total,
        patrocinio2025Total,
        stateForceArr
      }
    };
  }, []);

  const entityData = [
    { name: 'CDEN', value: insights.global.cdenStats.total, count: insights.global.cdenStats.count },
    { name: 'Precursoras', value: insights.global.precStats.total, count: insights.global.precStats.count },
  ];
  const COLORS = ['#003865', '#008f4c'];

  const typeData = [
    { name: 'Fomento', value: insights.global.fomentoStats.total, count: insights.global.fomentoStats.count },
    { name: 'Patrocínio', value: insights.global.patrocinioStats.total, count: insights.global.patrocinioStats.count }
  ];
  const TYPE_COLORS = ['#3b82f6', '#f59e0b']; // Blue for Fomento, Amber for Patrocinio
  
  const evolucaoData = [
    { name: '2025', Fomento: insights.global.fomento2025Total, Patrocínio: insights.global.patrocinio2025Total },
    { name: '2026', Fomento: insights.global.fom2026Total, Patrocínio: 0 } // Patrocinio 2026 is currently 0
  ];

  return (
    <div className="space-y-8">

      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <Lightbulb className="text-[#008f4c]" size={32} />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Insights e Análises</h2>
          <p className="text-slate-500">Descobertas baseadas nos dados históricos e projeções atuais (2025-2026).</p>
        </div>
      </div>

      {/* SECTION: GLOBAL INSIGHTS */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Insight 1: Entities Comparison (Global) */}
          <div className="bg-white p-6 border border-[#003865]/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#003865]"></div>
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-blue-50 rounded-lg text-[#003865] shrink-0">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">CDEN vs. Precursoras</h3>
                <p className="text-sm text-slate-500 mt-1">Comparativo de representatividade no total de repasses históricos.</p>
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
                    <Tooltip 
                      formatter={(value: number) => formatBRL(value)}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                      itemStyle={{ color: '#f8fafc', fontWeight: 500 }}
                      labelStyle={{ color: '#f8fafc', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-[#003865] rounded shadow-sm text-center flex flex-col items-center justify-center">
                  <p className="text-xs text-blue-100 font-medium mb-0.5">CDEN ({insights.global.cdenStats.count})</p>
                  <p className="text-lg font-bold text-white leading-tight">{formatBRL(insights.global.cdenStats.total)}</p>
                  <div className="flex flex-wrap justify-center gap-1 md:gap-1.5 text-[11px] text-blue-200 mt-0.5">
                    <span>Média: {formatBRL(insights.global.cdenStats.avg)}</span>
                    <span className="hidden md:inline">•</span>
                    <span>
                      {((insights.global.cdenStats.total / (insights.global.cdenStats.total + insights.global.precStats.total || 1)) * 100).toFixed(1)}% do total
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-[#008f4c] rounded shadow-sm text-center flex flex-col items-center justify-center">
                  <p className="text-xs text-green-100 font-medium mb-0.5">Precursoras ({insights.global.precStats.count})</p>
                  <p className="text-lg font-bold text-white leading-tight">{formatBRL(insights.global.precStats.total)}</p>
                  <div className="flex flex-wrap justify-center gap-1 md:gap-1.5 text-[11px] text-green-200 mt-0.5">
                    <span>Média: {formatBRL(insights.global.precStats.avg)}</span>
                    <span className="hidden md:inline">•</span>
                    <span>
                      {((insights.global.precStats.total / (insights.global.cdenStats.total + insights.global.precStats.total || 1)) * 100).toFixed(1)}% do total
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insight 2: Fomento vs Patrocinio */}
          <div className="bg-white p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-amber-50 rounded-lg text-amber-500 shrink-0">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Fomento vs. Patrocínio</h3>
                <p className="text-sm text-slate-500 mt-1">Distribuição de valores concedidos historicamente.</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="h-64 w-full flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={105}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatBRL(value)}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                      itemStyle={{ color: '#f8fafc', fontWeight: 500 }}
                      labelStyle={{ color: '#f8fafc', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-blue-500 rounded shadow-sm text-center flex flex-col items-center justify-center">
                  <p className="text-xs text-blue-100 font-medium mb-0.5">Fomento ({insights.global.fomentoStats.count})</p>
                  <p className="text-lg font-bold text-white leading-tight">{formatBRL(insights.global.fomentoStats.total)}</p>
                  <div className="flex flex-wrap justify-center gap-1 md:gap-1.5 text-[11px] text-blue-200 mt-0.5">
                    <span>Média: {formatBRL(insights.global.fomentoStats.avg)}</span>
                    <span className="hidden md:inline">•</span>
                    <span>
                      {((insights.global.fomentoStats.total / (insights.global.fomentoStats.total + insights.global.patrocinioStats.total || 1)) * 100).toFixed(1)}% do total
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-amber-500 rounded shadow-sm text-center flex flex-col items-center justify-center">
                  <p className="text-xs text-amber-100 font-medium mb-0.5">Patrocínio ({insights.global.patrocinioStats.count})</p>
                  <p className="text-lg font-bold text-white leading-tight">{formatBRL(insights.global.patrocinioStats.total)}</p>
                  <div className="flex flex-wrap justify-center gap-1 md:gap-1.5 text-[11px] text-amber-200 mt-0.5">
                    <span>Média: {formatBRL(insights.global.patrocinioStats.avg)}</span>
                    <span className="hidden md:inline">•</span>
                    <span>
                      {((insights.global.patrocinioStats.total / (insights.global.fomentoStats.total + insights.global.patrocinioStats.total || 1)) * 100).toFixed(1)}% do total
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insight 4: Evolução de Orçamento (AreaChart) now full width */}
        <div className="bg-white p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-500 shrink-0">
              <LineChartIcon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Evolução de Orçamento</h3>
              <p className="text-sm text-slate-500 mt-1">Comparativo de total investido por frente (2025 x 2026).</p>
            </div>
          </div>
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolucaoData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFomento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPatrocinio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  formatter={(value: number) => formatBRL(value)}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 500 }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" name="Fomento" dataKey="Fomento" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorFomento)" />
                <Area type="monotone" name="Patrocínio" dataKey="Patrocínio" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorPatrocinio)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

    </div>
  );
}

