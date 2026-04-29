import React, { useMemo } from 'react';
import { appData } from '../data/parser';
import { ScatterChart as ScatterChartIcon } from 'lucide-react';
import { CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { getStateSigla } from '../data/regions';

const CustomScatterShape = (props: any) => {
  const { cx, cy, payload, maxTotal } = props;
  const uf = getStateSigla(payload.state).toLowerCase();
  
  // Calculate relative area size. Minimum radius 12, maximum radius 48.
  // Area proportional to Total: radius ratio is sqrt(Total/maxTotal).
  const ratio = Math.sqrt(payload.Total / (maxTotal || 1));
  const radius = Math.max(12, Math.min(48 * ratio, 48));
  
  return (
    <g transform={`translate(${cx},${cy})`}>
      <defs>
        <clipPath id={`clip-state-${payload.state}`}>
          <circle cx={0} cy={0} r={radius} />
        </clipPath>
      </defs>
      <circle cx={0} cy={0} r={radius} fill="#e2e8f0" stroke="#94a3b8" />
      <image
        x={-radius}
        y={-radius}
        width={radius * 2}
        height={radius * 2}
        href={`https://raw.githubusercontent.com/bgeneto/bandeiras-br/master/imagens/${uf.toUpperCase()}.png`}
        clipPath={`url(#clip-state-${payload.state})`}
        preserveAspectRatio="xMidYMid slice"
        onError={(e) => {
          (e.target as any).style.display = 'none';
        }}
      />
      <title>{payload.state}</title>
    </g>
  );
};

export function StateForceView() {
  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const stateForceArr = useMemo(() => {
    const allData = [...appData.fomento2026, ...appData.fomentoHistorico, ...appData.patrocinioHistorico];
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

    return Array.from(stateTotals.entries())
      .filter(([state, d]) => d.total > 0 && state !== 'NI')
      .map(([state, d]) => ({
        state,
        Fomento: d.fomento,
        Patrocínio: d.patrocinio,
        Total: d.total
      }))
      .sort((a, b) => b.Total - a.Total);
  }, []);

  const maxTotal = stateForceArr.length > 0 ? stateForceArr[0].Total : 1;

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4 shrink-0">
        <ScatterChartIcon className="text-emerald-500" size={32} />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Força por Estado</h2>
          <p className="text-slate-500">Comparativo do volume total de repasses: Fomento vs. Patrocínio.</p>
        </div>
      </div>

      <div className="bg-white p-6 border border-slate-200 shadow-sm relative overflow-hidden flex-1 min-h-[500px]">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
        <div className="w-full h-full pb-8">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 40, right: 40, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="Fomento" 
                type="number" 
                name="Fomento" 
                tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`} 
                tick={{ fontSize: 13, fill: '#64748b' }} 
                label={{ value: 'Repasse de Fomento', position: 'insideBottom', offset: -20, fontSize: 14, fill: '#64748b', fontWeight: 500 }} 
              />
              <YAxis 
                dataKey="Patrocínio" 
                type="number" 
                name="Patrocínio" 
                width={100}
                tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`} 
                tick={{ fontSize: 13, fill: '#64748b' }} 
                label={{ value: 'Repasse de Patrocínio', angle: -90, position: 'insideLeft', offset: -10, fontSize: 14, fill: '#64748b', fontWeight: 500 }} 
              />
              <ZAxis dataKey="Total" type="number" range={[400, 2500]} name="Volume Total" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                formatter={(val: number) => formatBRL(val)} 
                labelFormatter={() => ''} 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Scatter data={stateForceArr} fill="#8884d8" shape={(props) => <CustomScatterShape {...props} maxTotal={maxTotal} />} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
