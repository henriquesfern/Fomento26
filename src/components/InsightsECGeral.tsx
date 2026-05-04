import React, { useMemo } from 'react';
import { ecGeralData, ECGeralType } from '../data/ECGeral';
import { appData } from '../data/parser';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const COLORS = ['#008f4c', '#003865', '#d4a017', '#e2e8f0', '#0284c7'];

const normalizeString = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/gi, '');

export function InsightsECGeral() {
  const stats = useMemo(() => {
    const allRepasses = [...appData.fomentoHistorico, ...appData.patrocinioHistorico];
    const repassesSet = new Set(allRepasses.map(r => normalizeString(r.ENTIDADE)));
    
    // We can also try matching sigla if present
    
    let receivedAny = 0;
    let notReceived = 0;

    const byState = new Map<string, { total: number, received: number }>();

    for (const ec of ecGeralData) {
      if (!ec.origem) continue;
      
      const estado = ec.origem.replace('Crea-', '').toUpperCase();
      if (!byState.has(estado)) {
        byState.set(estado, { total: 0, received: 0 });
      }
      
      const stateObj = byState.get(estado)!;
      stateObj.total++;

      const isMatch = repassesSet.has(normalizeString(ec.denominacao)) || 
                      (ec.sigla && repassesSet.has(normalizeString(ec.sigla)));

      if (isMatch) {
        receivedAny++;
        stateObj.received++;
      } else {
        notReceived++;
      }
    }

    const stateData = Array.from(byState.entries())
      .map(([state, data]) => ({
        state,
        total: data.total,
        received: data.received,
        notReceived: data.total - data.received,
        percent: data.total > 0 ? (data.received / data.total) * 100 : 0
      }))
      .filter(s => s.state && s.state.length === 2) // only valid state
      .sort((a, b) => b.total - a.total);

    const typeCount = new Map<string, number>();
    for (const ec of ecGeralData) {
      if (ec.tipo) {
        const t = ec.tipo.trim();
        typeCount.set(t, (typeCount.get(t) || 0) + 1);
      }
    }

    const typeData = Array.from(typeCount.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      total: ecGeralData.length,
      receivedAny,
      notReceived,
      stateData,
      typeData
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[#003865]">Análise: Base EC Geral</h2>
          <p className="text-slate-500 mt-1">Comparativo de entidades registradas (EC Geral) com o histórico de repasses (Fomento e Patrocínio).</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center">
          <h3 className="text-slate-500 font-medium text-sm mb-2">Total de Registros (EC Geral)</h3>
          <p className="text-4xl font-bold text-[#003865]">{stats.total}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center border-b-4 border-b-[#d4a017]">
          <h3 className="text-slate-500 font-medium text-sm mb-2">Sem Histórico de Repasse</h3>
          <p className="text-4xl font-bold text-[#d4a017]">{stats.notReceived}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center border-b-4 border-b-[#008f4c]">
          <h3 className="text-slate-500 font-medium text-sm mb-2">Com Histórico de Repasse</h3>
          <p className="text-4xl font-bold text-[#008f4c]">{stats.receivedAny}</p>
        </div>
      </div>

      {/* Graficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#003865] mb-6">Cobertura por Estado (Top 10)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.stateData.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="state" type="category" width={40} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend />
                <Bar dataKey="received" stackId="a" name="Com Repasse" fill="#008f4c" radius={[0, 0, 0, 0]} />
                <Bar dataKey="notReceived" stackId="a" name="Sem Repasse" fill="#d4a017" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#003865] mb-6">Proporção Geral: Receberam vs Não Receberam</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Receberam Repasse', value: stats.receivedAny },
                    { name: 'Sem Repasse', value: stats.notReceived }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#008f4c" />
                  <Cell fill="#d4a017" />
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number, name: string) => [`${value} entidades (${((value/stats.total)*100).toFixed(1)}%)`, name]}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-[#003865] mb-6">Tipos de Registros na Base (EC Geral)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.typeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" name="Quantidade" fill="#003865" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
