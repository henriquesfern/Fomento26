import React, { useMemo, useState } from 'react';
import { Building2, CircleDollarSign } from 'lucide-react';
import { appData } from '../data/parser';
import { infraData } from '../data/infraBR_parser';
import { getStateSigla } from '../data/regions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList, Cell, Tooltip, PieChart, Pie, AreaChart, Area, Legend } from 'recharts';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { geoMercator, geoCentroid } from 'd3-geo';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { EntidadeSelecionada } from '../data/parser';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const geoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

const UF_TO_REGION: Record<string, string> = {
  // Norte
  AC: 'Norte', AP: 'Norte', AM: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
  // Nordeste
  AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste', PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
  // Centro-Oeste
  GO: 'Centro-Oeste', MT: 'Centro-Oeste', MS: 'Centro-Oeste', DF: 'Centro-Oeste',
  // Sudeste
  ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste',
  // Sul
  PR: 'Sul', RS: 'Sul', SC: 'Sul'
};

const COLORS = ['#003865', '#008f4c', '#4A90E2', '#50E3C2', '#F5A623', '#D0021B'];

interface OverviewProps {
  data?: EntidadeSelecionada[];
  theme?: 'fomento' | 'patrocinio' | 'overview' | 'history';
  showEntityCount?: boolean;
}

const DIMENSION_COLORS: Record<string, string> = {
  'Mobilidade': '#9937A8',
  'Energia e Conectividade': '#C5741D',
  'Bem-Estar Social': '#A73756',
  'Cidadania': '#A73756',
  'Água': '#1F7F70',
  'Saneamento Básico': '#090076',
  'Meio Ambiente': '#4B7A0F',
  'Resiliência': '#4B7A0F'
};

const getDimensionColor = (name: string, fallback: string) => {
  for (const [key, color] of Object.entries(DIMENSION_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return fallback;
};

export function Overview({ data = appData.fomento2026, theme = 'overview', showEntityCount = false }: OverviewProps) {
  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  const selecionados = data;
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [selectedInfraDimension, setSelectedInfraDimension] = useState<string | null>(null);
  const [selectedInfraComponent, setSelectedInfraComponent] = useState<string | null>(null);
  const [mapTooltip, setMapTooltip] = useState<{content: string, rankRepasse?: string, rankInfraBR?: string, sub: string, sub2?: string, sub3?: string, fom?: string, pat?: string, stateProp?: string, regionProp?: string, x: number, y: number} | null>(null);
  const [geoData, setGeoData] = useState<any>(null);

  React.useEffect(() => {
    fetch(geoUrl).then(res => res.json()).then(data => setGeoData(data));
  }, []);

  const tColorPrimary = theme === 'fomento' ? '#19904E' : theme === 'patrocinio' ? '#F19D26' : '#215F9A';
  const tColorPrimaryHex = tColorPrimary;
  const tColorSecondary = theme === 'fomento' ? '#006837' : theme === 'patrocinio' ? '#b45309' : '#003865';
  const tColorSecondaryDark = theme === 'fomento' ? '#004d28' : theme === 'patrocinio' ? '#78350f' : '#00284a';
  
  const textPrimaryClass = theme === 'fomento' ? 'text-[#19904E]' : theme === 'patrocinio' ? 'text-[#F19D26]' : 'text-[#215F9A]';
  const textSecondaryClass = theme === 'fomento' ? 'text-[#006837]' : theme === 'patrocinio' ? 'text-[#b45309]' : 'text-[#003865]';
  const bgSecondaryClass = theme === 'fomento' ? 'bg-[#19904E]' : theme === 'patrocinio' ? 'bg-[#F19D26]' : 'bg-[#215F9A]';

  const colorScaleStart = theme === 'fomento' ? '#DCE4E5' : theme === 'patrocinio' ? '#E6E2DC' : '#9EC6EA';
  const colorScaleEnd = tColorPrimary;

  const filteredData = useMemo(() => {
    return selecionados.filter(item => {
      const matchState = !selectedState || item.ESTADO === selectedState;
      const matchCategoria = !selectedCategoria || item.CATEGORIA === selectedCategoria;
      return matchState && matchCategoria;
    });
  }, [selecionados, selectedState, selectedCategoria]);

  const kpis = useMemo(() => {
    const totalRepasse = filteredData.reduce((sum, item) => sum + item.VALOR_REPASSE, 0);

    return {
      total: filteredData.length,
      totalFomentado: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalRepasse),
    };
  }, [filteredData]);

  const regionData = useMemo(() => {
    const dataToUse = selectedCategoria 
      ? selecionados.filter(item => item.CATEGORIA === selectedCategoria)
      : selecionados;

    const map = new Map<string, number>();
    dataToUse.forEach(item => {
      const region = item.REGIÃO || 'Indefinida';
      map.set(region, (map.get(region) || 0) + item.VALOR_REPASSE);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [selecionados, selectedCategoria]);

  const stateData = useMemo(() => {
    const dataToUse = selectedCategoria 
      ? selecionados.filter(item => item.CATEGORIA === selectedCategoria)
      : selecionados;

    const map = new Map<string, number>();
    dataToUse.forEach(item => {
      const state = item.ESTADO || 'Indefinido';
      map.set(state, (map.get(state) || 0) + item.VALOR_REPASSE);
    });
    return map;
  }, [selecionados, selectedCategoria]);

  const stateBreakdownData = useMemo(() => {
    const dataToUse = selectedCategoria 
      ? selecionados.filter(item => item.CATEGORIA === selectedCategoria)
      : selecionados;

    const map = new Map<string, { fomento: number, patrocinio: number }>();
    dataToUse.forEach(item => {
      const state = item.ESTADO || 'Indefinido';
      const current = map.get(state) || { fomento: 0, patrocinio: 0 };
      if (item.tipoRepasse === 'Patrocínio' || ((item as any).NATUREZA || '').toLowerCase().includes('patrocínio')) {
        current.patrocinio += item.VALOR_REPASSE;
      } else {
        current.fomento += item.VALOR_REPASSE;
      }
      map.set(state, current);
    });
    return map;
  }, [selecionados, selectedCategoria]);

  const evolucaoData = useMemo(() => {
    if (theme !== 'history') return [];
    const fomento2025Total = appData.fomentoHistorico.reduce((acc, curr) => acc + curr.VALOR_REPASSE, 0);
    const fom2026Total = appData.fomento2026.reduce((acc, curr) => acc + curr.VALOR_REPASSE, 0);
    const patrocinio2025Total = appData.patrocinioHistorico.reduce((acc, curr) => acc + curr.VALOR_REPASSE, 0);

    return [
      { name: '2025', Fomento: fomento2025Total, Patrocínio: patrocinio2025Total },
      { name: '2026', Fomento: fom2026Total, Patrocínio: 0 }
    ];
  }, [theme]);

  const stateEntitiesCount = useMemo(() => {
    const dataToUse = selectedCategoria 
      ? selecionados.filter(item => item.CATEGORIA === selectedCategoria)
      : selecionados;

    const map = new Map<string, Set<string>>();
    dataToUse.forEach(item => {
      const state = item.ESTADO || 'Indefinido';
      if (!map.has(state)) map.set(state, new Set());
      map.get(state)!.add(item.CNPJ || item.ENTIDADE); // ensure distinct entities if possible
    });
    const counts = new Map<string, number>();
    map.forEach((set, state) => counts.set(state, set.size));
    return counts;
  }, [selecionados, selectedCategoria]);

  const sortedStateData = useMemo(() => {
    return Array.from(stateData.entries()).sort((a,b) => b[1] - a[1]);
  }, [stateData]);

  const totalGlobalRepasse = useMemo(() => {
    return Array.from(stateData.values()).reduce((sum, val) => sum + val, 0);
  }, [stateData]);

  const maxStateValue = useMemo(() => {
    return Math.max(...Array.from(stateData.values()), 1);
  }, [stateData]);

  const stateColorScale = useMemo(() => {
    return scaleLinear<string>().domain([0, maxStateValue]).range([colorScaleStart, colorScaleEnd]);
  }, [maxStateValue, colorScaleStart, colorScaleEnd]);

  const getStateColor = (stateName: string) => {
    const value = stateData.get(stateName) || 0;
    if (value === 0) return "#fff0f0"; // very light pastel red for states with 0 repasse
    return stateColorScale(value);
  };

  const infraChartData = useMemo(() => {
    if (!selectedState) {
      return infraData.mediasBR
        .filter(d => d.dimensao !== 'INFRA-BR')
        .map(d => ({
          name: d.dimensao,
          value: d.media_pais_pct,
          label: 'Média BR'
        }))
        .sort((a, b) => b.value - a.value);
    } else {
      const sigla = getStateSigla(selectedState);
      if (selectedInfraComponent) {
        return infraData.indicadores
          .filter(i => i.sigla_uf === sigla && i.component_name === selectedInfraComponent)
          .map(i => ({
            name: i.indicator_name,
            value: i.value,
            label: selectedState
          }))
          .sort((a, b) => b.value - a.value);
      }
      if (selectedInfraDimension) {
        return infraData.componentes
          .filter(c => c.sigla_uf === sigla && c.dimension_name === selectedInfraDimension)
          .map(c => ({
            name: c.component_name,
            value: c.value,
            label: selectedState
          }))
          .sort((a, b) => b.value - a.value);
      }
      return infraData.dimensoes
        .filter(d => d.sigla_uf === sigla)
        .map(d => ({
          name: d.dimension_name,
          value: d.value,
          label: selectedState
        }))
        .sort((a, b) => b.value - a.value);
    }
  }, [selectedState, selectedInfraDimension, selectedInfraComponent]);

  const grupoData = useMemo(() => {
    const dataToUse = selectedState
      ? selecionados.filter(item => item.ESTADO === selectedState)
      : selecionados;

    let cden = 0;
    let prec = 0;
    let fallback = 0;
    let cdenEntities = new Set<string>();
    let precEntities = new Set<string>();
    let fallbackEntities = new Set<string>();

    dataToUse.forEach(item => {
      const entityId = item.CNPJ || item.ENTIDADE;
      if (item.IsCDEN) {
        cden += item.VALOR_REPASSE;
        cdenEntities.add(entityId);
      } else if (item.IsPrecursora) {
        prec += item.VALOR_REPASSE;
        precEntities.add(entityId);
      } else {
        fallback += item.VALOR_REPASSE;
        fallbackEntities.add(entityId);
      }
    });

    const totalRepasse = cden + prec + fallback;

    return [
      { name: 'CDEN', value: cden, count: cdenEntities.size, total: totalRepasse, fill: '#1e40af' }, // blue-800
      { name: 'Precursoras', value: prec, count: precEntities.size, total: totalRepasse, fill: '#065f46' }, // emerald-800
      { name: 'Outras', value: fallback, count: fallbackEntities.size, total: totalRepasse, fill: '#475569' } // slate-600
    ].filter(d => d.value > 0);
  }, [selecionados, selectedState]);

  const clearFilters = () => {
    setSelectedState(null);
    setSelectedCategoria(null);
    setSelectedInfraDimension(null);
    setSelectedInfraComponent(null);
  };

  const mapProjection = useMemo(() => {
    const width = 800;
    const height = 500;
    const projection = geoMercator();
    if (!geoData) {
      return projection.scale(750).center([-54, -15]);
    }
    
    if (selectedState) {
      const feature = geoData.features.find((f: any) => f.properties.sigla === selectedState);
      if (feature) {
        return projection.fitSize([width, height], feature);
      }
    }
    
    return projection.fitSize([width, height], geoData);
  }, [geoData, selectedState]);

  const getComponentsForDimension = (dimensionName: string) => {
    if (!selectedState) return [];
    const sigla = getStateSigla(selectedState);
    return infraData.componentes
      .filter(c => c.sigla_uf === sigla && c.dimension_name === dimensionName)
      .map(c => ({ name: c.component_name, value: c.value }));
  };

  const getIndicatorsForComponent = (componentName: string) => {
    if (!selectedState) return [];
    const sigla = getStateSigla(selectedState);
    return infraData.indicadores
      .filter(i => i.sigla_uf === sigla && i.component_name === componentName)
      .map(i => ({ name: i.indicator_name, value: i.value }));
  };

  const getIndicatorDetails = (indicatorName: string) => {
    return infraData.detalhamento.find(d => d.INDICADOR.trim().toLowerCase() === indicatorName.trim().toLowerCase() || d.ID === indicatorName);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div></div>
        {(selectedState || selectedCategoria) && (
          <button 
            onClick={clearFilters}
            className="text-sm text-slate-500 hover:text-slate-800 underline transition-colors"
          >
            Limpar Filtros ({[selectedState, selectedCategoria].filter(Boolean).join(', ')})
          </button>
        )}
      </div>

      {/* KPIs Section */}
      <div className="flex flex-col gap-6 -mt-4">
        {/* Main KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-white shadow-sm flex items-center justify-start gap-6 border-l-8" style={{ borderLeftColor: tColorPrimaryHex }}>
            <Building2 className={`opacity-80 shrink-0 ${textPrimaryClass}`} size={64} />
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Entidades Selecionadas</p>
              <p className={`text-6xl font-black tracking-tight ${textSecondaryClass}`}>{kpis.total}</p>
            </div>
          </div>
          <div className={`p-8 text-white shadow-sm flex items-center justify-start gap-6 relative overflow-hidden ${bgSecondaryClass}`}>
             <div className="absolute -right-8 -top-12 opacity-10 pointer-events-none">
               <div className="w-48 h-48 rounded-full bg-white"></div>
             </div>
            <CircleDollarSign className="opacity-80 z-10 relative shrink-0 text-white" size={64} />
            <div className="z-10 relative">
              <p className="text-sm font-semibold mb-2 uppercase tracking-wider text-white/90">Total de Repasse</p>
              <p className="text-5xl font-black tracking-tight text-white">{kpis.totalFomentado}</p>
            </div>
          </div>
        </div>
      </div>

      {theme === 'history' && (
        <div className="bg-white p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <div className="flex items-start gap-4 mb-2">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Evolução de Orçamento</h3>
              <p className="text-sm text-slate-500 mt-1">Comparativo de total investido por frente (2025 x 2026).</p>
            </div>
          </div>
          <div className="h-[150px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolucaoData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`} tick={{fill: '#64748b', fontSize: 12}} width={80} />
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1 lg:col-span-3 p-6 bg-white border border-slate-200 shadow-sm relative flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-2 cursor-default flex justify-between items-center shrink-0">
            <span>Investimento por Estado</span>
            {selectedState && <span className="text-xs font-normal text-slate-400">Filtrado: {selectedState}</span>}
          </h3>
          <div className="flex-1 w-full relative min-h-[500px]">
            <ComposableMap
              projection={mapProjection as any}
              width={800}
              height={500}
              style={{ width: "100%", height: "100%" }}
            >
              <Geographies geography={geoData || geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const ufSigla = geo.properties.sigla;
                    const stateName = geo.properties.name;
                    const regionName = UF_TO_REGION[ufSigla];
                    
                    if (selectedState && stateName !== selectedState) return null;

                    const isSelected = selectedState === stateName;
                    const isFaded = selectedState && !isSelected;
                    
                    const regionVal = regionData.find(d => d.name === regionName)?.value || 0;
                    const stateVal = stateData.get(stateName) || 0;
                    const breakdown = stateBreakdownData.get(stateName) || { fomento: 0, patrocinio: 0 };
                    
                    const formattedRegionSum = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(regionVal);
                    const formattedStateSum = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stateVal);
                    const formattedFomento = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(breakdown.fomento);
                    const formattedPatrocinio = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(breakdown.patrocinio);
                    
                    const rankIndex = sortedStateData.findIndex(s => s[0] === stateName) + 1;
                    const infraState = infraData.infraEstados.find(s => s.sigla_uf === ufSigla);
                    
                    const stateProp = totalGlobalRepasse > 0 ? ((stateVal / totalGlobalRepasse) * 100).toFixed(1) + '%' : '0%';
                    const regionProp = totalGlobalRepasse > 0 ? ((regionVal / totalGlobalRepasse) * 100).toFixed(1) + '%' : '0%';

                    const centroid = geoCentroid(geo);
                    const entidadesSize = stateEntitiesCount.get(stateName) || 0;
                    const isDark = stateVal > maxStateValue * 0.35;
                    
                    let textColor = "#00284a";
                    let shadowText = "0px 1px 3px rgba(255,255,255,0.9), 0px 0px 2px rgba(255,255,255,1)";
                    
                    if (stateVal === 0) {
                      textColor = "#991b1b";
                      shadowText = "0px 1px 2px rgba(255,255,255,0.5)";
                    } else if (isDark) {
                      textColor = "#ffffff";
                      shadowText = "0px 1px 3px rgba(0,0,0,0.8)";
                    }

                    return (
                      <React.Fragment key={`${geo.rsmKey}-group`}>
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={getStateColor(stateName)}
                          stroke="#ffffff"
                          strokeWidth={0.5}
                          style={{
                            default: { 
                              outline: "none", 
                              opacity: isFaded ? 0.3 : 1,
                              transition: "all 250ms"
                            },
                            hover: { 
                              outline: "none", 
                              fill: tColorSecondary, 
                              opacity: 1,
                              transition: "all 250ms",
                              cursor: "pointer"
                            },
                            pressed: { outline: "none", fill: tColorSecondaryDark }
                          }}
                          onClick={() => {
                            const isSame = selectedState === stateName;
                            setSelectedState(isSame ? null : stateName);
                            if (!isSame) {
                              setSelectedInfraDimension(null);
                              setSelectedInfraComponent(null);
                            }
                          }}
                          onMouseEnter={(e) => {
                            setMapTooltip({
                              content: `${stateName} (${ufSigla})`, 
                              rankRepasse: rankIndex > 0 ? `${rankIndex}º` : undefined,
                              rankInfraBR: infraState ? `${infraState.rank}º` : undefined,
                              sub: showEntityCount ? `Estado: ${formattedStateSum}` : `Repasse no Estado: ${formattedStateSum}`,
                              sub2: showEntityCount ? `Região: ${formattedRegionSum}` : `Região ${regionName}: ${formattedRegionSum}`, 
                              sub3: (showEntityCount || theme === 'overview') ? `Total de Entidades: ${entidadesSize}` : undefined,
                              fom: (showEntityCount || theme === 'overview') ? formattedFomento : undefined,
                              pat: (showEntityCount || theme === 'overview') ? formattedPatrocinio : undefined,
                              stateProp,
                              regionProp,
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
                        />
                        {showEntityCount && !selectedState && (
                          <Marker key={`${geo.rsmKey}-marker`} coordinates={centroid}>
                            <text
                              textAnchor="middle"
                              y={4}
                              style={{
                                fontFamily: "system-ui",
                                fill: textColor,
                                fontSize: "12px",
                                fontWeight: 800,
                                pointerEvents: "none",
                                textShadow: shadowText
                              }}
                            >
                              {entidadesSize}
                            </text>
                          </Marker>
                        )}
                      </React.Fragment>
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
            
            {mapTooltip && (
              <div 
                className="fixed z-50 bg-slate-900 border border-slate-700 text-white p-4 rounded shadow-xl pointer-events-none min-w-[200px]"
                style={{ top: mapTooltip.y + 15, left: mapTooltip.x + 15, opacity: 0.95 }}
              >
                <div className="font-bold text-base mb-2 border-b border-slate-700 pb-1">
                  <span>{mapTooltip.content}</span>
                </div>
                {theme === 'history' && showEntityCount ? (
                  <div className="flex flex-col gap-1 text-sm">
                    {mapTooltip.rankRepasse && (
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400 font-medium">Posição em Repasse:</span>
                        <span className="text-[#F19D26] font-medium">{mapTooltip.rankRepasse}</span>
                      </div>
                    )}
                    {mapTooltip.rankInfraBR && (
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400 font-medium">Posição do Infra-BR:</span>
                        <span className="text-[#F19D26] font-medium">{mapTooltip.rankInfraBR}</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-4 mt-1 pt-1 border-t border-slate-700/50">
                      <span className="text-slate-400 font-medium">Estado:</span> 
                      <span className="font-semibold text-white">
                        {mapTooltip.sub.replace('Estado: ', '')}
                        {mapTooltip.stateProp && <span className="text-slate-400 text-xs ml-1 font-normal">({mapTooltip.stateProp})</span>}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 mt-1">
                      <span className="text-slate-400 font-medium">Região:</span> 
                      <span className="font-semibold text-white">
                        {mapTooltip.sub2?.replace('Região: ', '')}
                        {mapTooltip.regionProp && <span className="text-slate-400 text-xs ml-1 font-normal">({mapTooltip.regionProp})</span>}
                      </span>
                    </div>
                    {mapTooltip.sub3 && (
                      <div className="flex justify-between gap-4 mt-1">
                        <span className="text-slate-400 font-medium">Total de Entidades:</span> 
                        <span className="font-medium text-indigo-400">{mapTooltip.sub3.replace('Total de Entidades: ', '')}</span>
                      </div>
                    )}
                    {mapTooltip.fom && (
                      <div className="flex justify-between gap-4 border-t border-slate-700/50 mt-1 pt-1">
                        <span className="text-slate-400 font-medium">Fomento:</span> 
                        <span className="font-medium text-emerald-400">{mapTooltip.fom}</span>
                      </div>
                    )}
                    {mapTooltip.pat && (
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400 font-medium">Patrocínio:</span> 
                        <span className="font-medium text-amber-400">{mapTooltip.pat}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 text-sm">
                    {mapTooltip.rankRepasse && (
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400 font-medium">Posição em Repasse:</span>
                        <span className="text-[#F19D26] font-medium">{mapTooltip.rankRepasse}</span>
                      </div>
                    )}
                    {mapTooltip.rankInfraBR && (
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400 font-medium">Posição do Infra-BR:</span>
                        <span className="text-[#F19D26] font-medium">{mapTooltip.rankInfraBR}</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-4 mt-1 pt-1 border-t border-slate-700/50">
                      <span className="text-slate-400 font-medium">Estado:</span> 
                      <span className="font-semibold text-white">
                        {mapTooltip.sub.replace('Repasse no Estado: ', '')}
                        {mapTooltip.stateProp && <span className="text-slate-400 text-xs ml-1 font-normal">({mapTooltip.stateProp})</span>}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 mt-1">
                      <span className="text-slate-400 font-medium">Região:</span> 
                      <span className="font-semibold text-white">
                        {mapTooltip.sub2?.split(': ')[1]}
                        {mapTooltip.regionProp && <span className="text-slate-400 text-xs ml-1 font-normal">({mapTooltip.regionProp})</span>}
                      </span>
                    </div>
                    {mapTooltip.sub3 && (
                      <div className="flex justify-between gap-4 mt-1">
                        <span className="text-slate-400 font-medium">Total de Entidades:</span> 
                        <span className="font-medium text-indigo-400">{mapTooltip.sub3.replace('Total de Entidades: ', '')}</span>
                      </div>
                    )}
                    {mapTooltip.fom && (
                      <div className="flex justify-between gap-4 border-t border-slate-700/50 mt-1 pt-1">
                        <span className="text-slate-400 font-medium">Fomento:</span> 
                        <span className="font-medium text-emerald-400">{mapTooltip.fom}</span>
                      </div>
                    )}
                    {mapTooltip.pat && (
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400 font-medium">Patrocínio:</span> 
                        <span className="font-medium text-amber-400">{mapTooltip.pat}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center shrink-0">Clique em um estado para filtrar os demais gráficos e focar na região.</p>
        </div>

        <div className="col-span-1 lg:col-span-1 p-6 bg-white border border-slate-200 shadow-sm relative flex flex-col">
          {theme === 'history' ? (
            <>
              <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-2 cursor-default flex justify-between items-center shrink-0">
                <span className="truncate" title="Distribuição por Grupo">Distribuição por Grupo</span>
              </h3>
              <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[200px]">
                <div className="h-[250px] w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={grupoData}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="90%"
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {grupoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const percentage = ((data.value / data.total) * 100).toFixed(1);
                            const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(data.value);
                            return (
                              <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded shadow-xl">
                                <p className="font-bold text-sm mb-1" style={{ color: data.fill }}>{data.name}</p>
                                <p className="text-sm">Repasse: <span className="font-semibold">{formattedValue}</span></p>
                                <p className="text-sm">Proporção: <span className="font-semibold">{percentage}%</span></p>
                                <p className="text-sm">Entidades Atendidas: <span className="font-semibold">{data.count}</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full flex justify-center gap-4 text-xs font-medium mt-4">
                  <div className="flex items-center gap-1.5 text-[#1e40af]">
                    <div className="w-3 h-3 rounded-full bg-[#1e40af]"></div> CDEN
                  </div>
                  <div className="flex items-center gap-1.5 text-[#065f46]">
                    <div className="w-3 h-3 rounded-full bg-[#065f46]"></div> Precursoras
                  </div>
                  <div className="flex items-center gap-1.5 text-[#475569]">
                    <div className="w-3 h-3 rounded-full bg-[#475569]"></div> Outras
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-2 cursor-default flex justify-between items-center shrink-0">
                <span className="truncate" title="Desempenho Infra-BR">Desempenho Infra-BR</span>
                <span className="text-[10px] font-normal text-slate-400 truncate max-w-[120px]" title={selectedState ? selectedState : 'Média Nacional'}>
                  {selectedState ? `Estado: ${selectedState}` : 'Média Nacional'}
                </span>
              </h3>
              {selectedInfraComponent ? (
                <button
                  onClick={() => setSelectedInfraComponent(null)}
                  className="mb-4 text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-start"
                >
                  &larr; Voltar para Componentes
                </button>
              ) : selectedInfraDimension ? (
                <button
                  onClick={() => setSelectedInfraDimension(null)}
                  className="mb-4 text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-start"
                >
                  &larr; Voltar para Dimensões
                </button>
              ) : null}
              <div className="flex-1 w-full flex flex-col gap-3 overflow-y-auto pr-2 pb-2">
                {infraChartData.map((d, index) => {
                  const isDimension = !selectedInfraDimension;
                  const isComponent = !!selectedInfraDimension && !selectedInfraComponent;
                  const isIndicator = !!selectedInfraComponent;
                  
                  const tooltipItems = isDimension ? getComponentsForDimension(d.name)
                    : isComponent ? getIndicatorsForComponent(d.name)
                    : [];
                    
                  // get dimension color to pass down
                  // if we are indicating a component/indicator, we still want the original dimension color if possible
                  const currentColor = getDimensionColor(isIndicator ? selectedInfraDimension || d.name : isComponent ? selectedInfraDimension || d.name : d.name, tColorPrimary);
                  const indicatorDetails = isIndicator ? getIndicatorDetails(d.name) : null;
                    
                  return (
                    <RadixTooltip.Provider delayDuration={150} key={index}>
                      <RadixTooltip.Root>
                        <RadixTooltip.Trigger asChild>
                          <div 
                            className={`relative bg-white shadow-sm border-l-[6px] p-4 flex flex-col items-start transition-shadow hover:shadow-md shrink-0 ${(isDimension || isComponent) && selectedState ? 'cursor-pointer hover:bg-slate-50' : ''}`} 
                            style={{ borderLeftColor: currentColor }}
                            onClick={() => {
                              if (!selectedState) return;
                              if (isDimension) {
                                setSelectedInfraDimension(d.name);
                              } else if (isComponent) {
                                setSelectedInfraComponent(d.name);
                              }
                            }}
                          >
                            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 w-full text-left leading-tight break-words whitespace-normal">{d.name}</h4>
                            <div className="flex w-full justify-center mt-1">
                              <span className="text-3xl font-black tracking-tight text-slate-700">{d.value.toFixed(1)}</span>
                            </div>
                          </div>
                        </RadixTooltip.Trigger>
                        
                        {(tooltipItems.length > 0 || indicatorDetails) && (
                          <RadixTooltip.Portal>
                            <RadixTooltip.Content 
                              side="left" 
                              sideOffset={14}
                              align="center"
                              className="z-50 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl max-w-xs animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
                            >
                              {indicatorDetails ? (
                                <>
                                  <div className="font-semibold mb-2 pb-1 border-b border-slate-600 text-slate-200">
                                    Sobre o Indicador
                                  </div>
                                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                    {indicatorDetails.DESCRICAO && (
                                      <div>
                                        <div className="text-slate-400 mb-0.5">Descrição/Cálculo:</div>
                                        <div className="text-slate-200 leading-snug">{indicatorDetails.DESCRICAO}</div>
                                      </div>
                                    )}
                                    {indicatorDetails.UNIDADE && (
                                      <div>
                                        <div className="text-slate-400 mb-0.5">Unidade:</div>
                                        <div className="text-slate-200 leading-snug">{indicatorDetails.UNIDADE}</div>
                                      </div>
                                    )}
                                    {indicatorDetails.INTERPRETACAO && (
                                      <div>
                                        <div className="text-slate-400 mb-0.5">Interpretação:</div>
                                        <div className="text-slate-200 leading-snug">{indicatorDetails.INTERPRETACAO}</div>
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="font-semibold mb-2 pb-1 border-b border-slate-600 text-slate-200">
                                    {isComponent ? 'Indicadores' : 'Componentes'}
                                  </div>
                                  <ul className="list-disc pl-4 space-y-1 max-h-[300px] overflow-y-auto w-full pr-2">
                                    {tooltipItems.map((item, idx) => (
                                      <li key={idx} className="text-slate-300 leading-snug">
                                        {item.name}: <span className="font-semibold text-white">{item.value.toFixed(1)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}
                              <RadixTooltip.Arrow className="fill-slate-800" />
                            </RadixTooltip.Content>
                          </RadixTooltip.Portal>
                        )}
                      </RadixTooltip.Root>
                    </RadixTooltip.Provider>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 mt-4 text-center shrink-0">Dados dimensionais provenientes do Infra-BR.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
