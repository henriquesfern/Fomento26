import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { geoMercator } from 'd3-geo';
import { infraData } from '../data/infraBR_parser';
import { appData } from '../data/parser';

const geoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

export function InfraBRInsights() {
  const [selectedState, setSelectedState] = useState<string>('SP');
  const [selectedDimension, setSelectedDimension] = useState<string>('SANEAMENTO BÁSICO');

  // Calculate total repasse per state
  const stateRepasse = useMemo(() => {
    const map = new Map<string, number>();
    const allData = [...appData.fomentoHistorico, ...appData.patrocinioHistorico, ...appData.fomento2026];
    
    allData.forEach(item => {
      if (!item.ESTADO) return;
      map.set(item.ESTADO, (map.get(item.ESTADO) || 0) + item.VALOR_REPASSE);
    });
    return map;
  }, []);

  const stateSiglaToName: Record<string, string> = {
    'AC': 'Acre', 'AL': 'Alagoas', 'AM': 'Amazonas', 'AP': 'Amapá', 'BA': 'Bahia', 'CE': 'Ceará',
    'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás', 'MA': 'Maranhão', 'MG': 'Minas Gerais',
    'MS': 'Mato Grosso do Sul', 'MT': 'Mato Grosso', 'PA': 'Pará', 'PB': 'Paraíba', 'PE': 'Pernambuco',
    'PI': 'Piauí', 'PR': 'Paraná', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RO': 'Rondônia',
    'RR': 'Roraima', 'RS': 'Rio Grande do Sul', 'SC': 'Santa Catarina', 'SE': 'Sergipe', 'SP': 'São Paulo',
    'TO': 'Tocantins'
  };

  const nameToSigla = Object.fromEntries(Object.entries(stateSiglaToName).map(([k, v]) => [v, k]));

  const [geoData, setGeoData] = useState<any>(null);
  const [mapTooltip, setMapTooltip] = useState<{content: string, infraBr?: number, rank?: number, totalRepasse?: number, fomento26?: number, fomento25?: number, patrocinio25?: number, x: number, y: number} | null>(null);

  useEffect(() => {
    fetch(geoUrl).then(res => res.json()).then(data => setGeoData(data));
  }, []);

  const mapProjection = useMemo(() => {
    const projection = geoMercator();
    if (!geoData) return projection.scale(750).center([-54, -15]);
    return projection.fitSize([800, 500], geoData);
  }, [geoData]);

  // Breakdown Repasse
  const stateRepasseBreakdown = useMemo(() => {
    const map = new Map<string, { fomento26: number, fomento25: number, patrocinio25: number }>();
    
    appData.fomento2026.forEach(item => {
      if (!item.ESTADO) return;
      const current = map.get(item.ESTADO) || { fomento26: 0, fomento25: 0, patrocinio25: 0 };
      current.fomento26 += item.VALOR_REPASSE;
      map.set(item.ESTADO, current);
    });

    appData.fomentoHistorico.forEach(item => {
      if (!item.ESTADO) return;
      const current = map.get(item.ESTADO) || { fomento26: 0, fomento25: 0, patrocinio25: 0 };
      current.fomento25 += item.VALOR_REPASSE;
      map.set(item.ESTADO, current);
    });

    appData.patrocinioHistorico.forEach(item => {
      if (!item.ESTADO) return;
      const current = map.get(item.ESTADO) || { fomento26: 0, fomento25: 0, patrocinio25: 0 };
      current.patrocinio25 += item.VALOR_REPASSE;
      map.set(item.ESTADO, current);
    });

    return map;
  }, []);

  const minInfra = Math.min(...infraData.infraEstados.map(s => s.infra_br));
  const maxInfra = Math.max(...infraData.infraEstados.map(s => s.infra_br));
  const colorScale = scaleLinear<string>().domain([minInfra, maxInfra]).range(["#e0f2fe", "#0284c7"]);

  // Correlation Data (Repasse vs Infra)
  const correlationData = useMemo(() => {
    return infraData.infraEstados.map(state => {
      const stateFullName = stateSiglaToName[state.sigla_uf] || state.sigla_uf;
      const repasse = stateRepasse.get(stateFullName) || 0;
      return {
        uf: state.sigla_uf,
        name: stateFullName,
        infra_br: state.infra_br,
        repasse: repasse,
        rank: state.rank,
        sizeScore: repasse > 0 ? (repasse / state.rank) : 0, // Razão entre repasse e rank (quanto maior repasse e melhor rank, maior a bolha)
      };
    }).sort((a, b) => b.repasse - a.repasse);
  }, [stateRepasse]);

  const avgInfraBR = useMemo(() => {
    if (correlationData.length === 0) return 0;
    return correlationData.reduce((sum, item) => sum + item.infra_br, 0) / correlationData.length;
  }, [correlationData]);

  const avgRepasse = useMemo(() => {
    if (correlationData.length === 0) return 0;
    return correlationData.reduce((sum, item) => sum + item.repasse, 0) / correlationData.length;
  }, [correlationData]);

  // Dimensions for Radar
  const radarData = useMemo(() => {
    // Get state dimensions
    const stateDims = infraData.dimensoes.filter(d => d.sigla_uf === selectedState);
    
    return stateDims.map(d => {
      // Find national average
      const media = infraData.mediasBR.find(m => m.dimensao === d.dimension_name)?.media_pais_pct || 0;
      return {
        dimensao: d.dimension_name,
        estado: d.value,
        mediaBR: media,
        fullMark: 100
      };
    });
  }, [selectedState]);

  // Components for bar chart
  const componentData = useMemo(() => {
    return infraData.componentes
      .filter(c => c.sigla_uf === selectedState && c.dimension_name === selectedDimension)
      .map(c => ({
        name: c.component_name,
        value: c.value
      }))
      .sort((a,b) => b.value - a.value); // Sort descending
  }, [selectedState, selectedDimension]);

  // Get available dimensions
  const availableDimensions = useMemo(() => {
    return Array.from(new Set(infraData.dimensoes.map(d => d.dimension_name))).sort();
  }, []);

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Relação Repasse vs InfraBR */}
        <div className="bg-white p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
            Relação Repasse Financeiro vs Nota Infra-BR
          </h3>
          <p className="text-xs text-slate-500 mb-4 h-12 overflow-hidden">
            Compara o volume total de repasse financeiro direcionado a cada UF com sua respectiva nota no índice geral do Infra-BR. Tamanho do círculo influenciado pelo repasse x rank Infra-BR.
          </p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                <XAxis 
                  type="number" 
                  dataKey="infra_br" 
                  name="Nota Infra-BR" 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="repasse" 
                  name="Repasse" 
                  tickFormatter={(v) => `R$ ${(v/1000000).toFixed(0)}M`}
                  tick={{ fill: '#64748b' }}
                />
                <ZAxis 
                  type="number" 
                  dataKey="sizeScore" 
                  range={[100, 1500]} 
                  name="Repasse / Rank" 
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded shadow-xl text-sm">
                          <p className="font-bold border-b border-slate-700 pb-1 mb-2">{data.name} ({data.uf})</p>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Nota Infra-BR:</span>
                            <span className="text-blue-400 font-semibold">{data.infra_br.toFixed(2)} (Rank: {data.rank}º)</span>
                          </div>
                          <div className="flex justify-between gap-4 mt-1">
                            <span className="text-slate-400">Total Repassado:</span>
                            <span className="text-emerald-400 font-semibold">{formatBRL(data.repasse)}</span>
                          </div>
                          <div className="flex justify-between gap-4 mt-1 pt-1 border-t border-slate-700/50">
                            <span className="text-slate-400 text-xs italic">Razão Repasse/Rank (Tamanho):</span>
                            <span className="text-indigo-400 font-semibold text-xs">{data.sizeScore > 0 ? (data.sizeScore / 1000000).toFixed(2) + 'k' : '-'}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Estados" data={correlationData} fill="#0ea5e9" shape="circle" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Matriz de Quadrantes */}
        <div className="bg-white p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
            Matriz de Quadrantes: Desvio da Média
          </h3>
          <p className="text-xs text-slate-500 mb-4 h-12 overflow-hidden">
            Classifica os estados em quadrantes através das médias do repasse histórico financeiro e nota Infra-BR. Permite rápido diagnóstico (Ex: "Alto Repasse, Baixa Infra").
          </p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  type="number" 
                  dataKey="infra_br" 
                  name="Nota Infra-BR" 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="repasse" 
                  name="Repasse" 
                  tickFormatter={(v) => `R$ ${(v/1000000).toFixed(0)}M`}
                  tick={{ fill: '#64748b' }}
                />
                <ZAxis 
                  type="number" 
                  dataKey="sizeScore" 
                  range={[100, 1500]} 
                  name="Repasse / Rank" 
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      let quadrante = "";
                      if (data.repasse > avgRepasse && data.infra_br > avgInfraBR) quadrante = "Alto Repasse / Alta Infra";
                      else if (data.repasse > avgRepasse && data.infra_br <= avgInfraBR) quadrante = "Alto Repasse / Baixa Infra";
                      else if (data.repasse <= avgRepasse && data.infra_br > avgInfraBR) quadrante = "Baixo Repasse / Alta Infra";
                      else quadrante = "Baixo Repasse / Baixa Infra";

                      return (
                        <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded shadow-xl text-sm">
                          <p className="font-bold border-b border-slate-700 pb-1 mb-2">{data.name} ({data.uf})</p>
                          <div className="flex justify-between gap-4 mb-2 border-b border-slate-700/50 pb-2">
                            <span className="text-slate-400">Quadrante:</span>
                            <span className="text-amber-400 font-semibold">{quadrante}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Nota Infra-BR:</span>
                            <span className="text-blue-400 font-semibold">{data.infra_br.toFixed(2)} (Rank: {data.rank}º)</span>
                          </div>
                          <div className="flex justify-between gap-4 mt-1">
                            <span className="text-slate-400">Total Repassado:</span>
                            <span className="text-emerald-400 font-semibold">{formatBRL(data.repasse)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x={avgInfraBR} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: 'Média Infra', fill: '#f59e0b', fontSize: 12 }} />
                <ReferenceLine y={avgRepasse} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Média Repasse', fill: '#f59e0b', fontSize: 12 }} />
                <Scatter name="Estados" data={correlationData} fill="#8b5cf6" shape="circle" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mapa Coroplético (Infra-BR) */}
        <div className="bg-white p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-2 relative">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
            Distribuição Geográfica da Nota Infra-BR
          </h3>
          <p className="text-sm text-slate-500 mb-4 h-6">
            Intensidade da cor reflete a Nota Infra-BR. O tooltip exibe adicionalmente a divisão de repasses (Fomento e Patrocínio).
          </p>
          <div className="w-full relative min-h-[500px] flex justify-center bg-slate-50 border border-slate-100 rounded-lg">
            <ComposableMap
              projection={mapProjection as any}
              width={800}
              height={500}
              style={{ width: "100%", height: "100%", maxWidth: "800px" }}
            >
              <Geographies geography={geoData || geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const ufSigla = geo.properties.sigla;
                    const stateName = geo.properties.name;
                    
                    const infraState = infraData.infraEstados.find(s => s.sigla_uf === ufSigla);
                    const infraScore = infraState?.infra_br || 0;
                    
                    const repasse = stateRepasse.get(stateName) || 0;
                    const breakdown = stateRepasseBreakdown.get(stateName) || { fomento26: 0, fomento25: 0, patrocinio25: 0 };
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={infraScore > 0 ? colorScale(infraScore) : "#f1f5f9"}
                        stroke="#ffffff"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { fill: "#f59e0b", outline: "none", cursor: "pointer", transition: "all 250ms" },
                          pressed: { outline: "none" }
                        }}
                        onMouseEnter={(e) => {
                          setMapTooltip({
                            content: `${stateName} (${ufSigla})`,
                            infraBr: infraScore,
                            rank: infraState?.rank,
                            totalRepasse: repasse,
                            fomento26: breakdown.fomento26,
                            fomento25: breakdown.fomento25,
                            patrocinio25: breakdown.patrocinio25,
                            x: e.clientX,
                            y: e.clientY
                          });
                        }}
                        onMouseMove={(e) => {
                          setMapTooltip(prev => prev ? {...prev, x: e.clientX, y: e.clientY} : prev);
                        }}
                        onMouseLeave={() => {
                          setMapTooltip(null);
                        }}
                        onClick={() => {
                          setSelectedState(ufSigla);
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>

            {/* Tooltip customizado */}
            {mapTooltip && (
              <div 
                className="fixed z-50 bg-slate-900 border border-slate-700 text-white p-4 rounded shadow-xl pointer-events-none min-w-[200px]"
                style={{ top: mapTooltip.y + 15, left: mapTooltip.x + 15, opacity: 0.95 }}
              >
                <div className="font-bold text-base mb-2 border-b border-slate-700 pb-1">
                  <span>{mapTooltip.content}</span>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 font-medium">Nota Infra-BR:</span>
                    <span className="text-blue-400 font-medium">{mapTooltip.infraBr?.toFixed(2) || '-'} <span className="text-slate-500 font-normal text-xs">(Rank: {mapTooltip.rank}º)</span></span>
                  </div>
                  
                  <div className="flex justify-between gap-4 border-t border-slate-700/50 mt-1 pt-1">
                    <span className="text-slate-400 font-medium">Total Repassado:</span>
                    <span className="font-medium text-white">{formatBRL(mapTooltip.totalRepasse || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between gap-4 border-t border-slate-700/50 mt-1 pt-1">
                    <span className="text-slate-400 font-medium">Fomento (Atual/2026):</span>
                    <span className="font-medium text-emerald-400">{formatBRL(mapTooltip.fomento26 || 0)}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-slate-700/50 mt-1 pt-1">
                    <span className="text-slate-400 font-medium">Fomento (Hist/2025):</span>
                    <span className="font-medium text-emerald-400 opacity-80">{formatBRL(mapTooltip.fomento25 || 0)}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-slate-700/50 mt-1 pt-1">
                    <span className="text-slate-400 font-medium">Patrocínio (Hist/2025):</span>
                    <span className="font-medium text-amber-400">{formatBRL(mapTooltip.patrocinio25 || 0)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Legenda de cor inferior */}
            <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded border border-slate-200 shadow-sm backdrop-blur-sm pointer-events-none">
              <div className="text-xs font-semibold text-slate-700 mb-2">Nota Infra-BR</div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 w-8 text-right">{minInfra.toFixed(0)}</span>
                <div className="w-32 h-3 rounded bg-gradient-to-r from-[#e0f2fe] to-[#0284c7]"></div>
                <span className="text-[10px] text-slate-500 w-8">{maxInfra.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seleção do Estado */}
        <div className="bg-white p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-2 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Detalhes por Estado
            </h3>
            <p className="text-sm text-slate-500">Selecione uma UF para analisar suas dimensões e componentes no Infra-BR vs Média Nacional.</p>
          </div>
          <div className="w-48 ml-4 shrink-0">
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] bg-white text-slate-700 font-medium"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              {infraData.infraEstados.slice().sort((a, b) => a.sigla_uf.localeCompare(b.sigla_uf)).map(state => (
                <option key={state.sigla_uf} value={state.sigla_uf}>{state.sigla_uf} - {stateSiglaToName[state.sigla_uf] || state.sigla_uf}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dimensões Radar */}
        <div className="bg-white p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2 text-center">
            {selectedState} vs Média Brasil (Dimensões)
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid opacity={0.3} />
                <PolarAngleAxis dataKey="dimensao" tick={{ fill: '#475569', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name={selectedState} dataKey="estado" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
                <Radar name="Média BR" dataKey="mediaBR" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 500, fontSize: '13px' }}
                  formatter={(val: number) => val.toFixed(2)}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Componentes Bar */}
        <div className="bg-white p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b pb-2 gap-4">
            <h3 className="text-lg font-semibold text-slate-800 shrink-0">
              Componentes Infra-BR ({selectedState})
            </h3>
            <select
              className="w-48 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] bg-white text-slate-700"
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value)}
            >
              {availableDimensions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={componentData} layout="vertical" margin={{ top: 10, right: 20, left: 110, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 11 }} width={100} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 500 }}
                  formatter={(val: number) => val.toFixed(2)}
                />
                <Bar dataKey="value" name="Nota do Componente" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Indicadores Detalhados (O que compõe a dimensão selecionada) */}
        <div className="bg-white p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
            Detalhamento de Indicadores - {selectedDimension} ({selectedState})
          </h3>
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 font-semibold text-slate-700">Componente</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Indicador</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 w-24">Valor</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 w-24">Rank UF</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 w-20">Ano</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {infraData.indicadores
                  .filter(i => i.sigla_uf === selectedState && i.dimension_name === selectedDimension)
                  .sort((a,b) => a.component_name.localeCompare(b.component_name) || b.value - a.value)
                  .map((ind, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600 font-medium">{ind.component_name}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {ind.indicator_name}
                        {ind.descricao && <p className="text-xs text-slate-400 mt-0.5">{ind.descricao}</p>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-blue-600">{ind.value.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-600">{ind.rank}º</td>
                      <td className="px-4 py-3 text-slate-500">{ind.ano}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
