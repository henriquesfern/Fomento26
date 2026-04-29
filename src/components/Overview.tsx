import React, { useMemo, useState } from 'react';
import { Building2, CircleDollarSign } from 'lucide-react';
import { appData } from '../data/parser';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList, Cell, Tooltip } from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { geoMercator } from 'd3-geo';
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
  theme?: 'fomento' | 'patrocinio';
}

export function Overview({ data = appData.fomento2026, theme = 'fomento' }: OverviewProps) {
  const selecionados = data;
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [mapTooltip, setMapTooltip] = useState<{content: string, sub: string, sub2?: string, x: number, y: number} | null>(null);
  const [geoData, setGeoData] = useState<any>(null);

  React.useEffect(() => {
    fetch(geoUrl).then(res => res.json()).then(data => setGeoData(data));
  }, []);

  const tColorPrimary = theme === 'fomento' ? '#008f4c' : '#f59e0b';
  const tColorPrimaryHex = theme === 'fomento' ? '#008f4c' : '#f59e0b';
  const tColorSecondary = theme === 'fomento' ? '#006837' : '#d97706';
  const tColorSecondaryDark = theme === 'fomento' ? '#004d28' : '#b45309';
  
  const textPrimaryClass = theme === 'fomento' ? 'text-[#008f4c]' : 'text-amber-500';
  const textSecondaryClass = theme === 'fomento' ? 'text-[#006837]' : 'text-amber-600';
  const bgSecondaryClass = theme === 'fomento' ? 'bg-[#006837]' : 'bg-amber-600';

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

  const maxStateValue = useMemo(() => {
    return Math.max(...Array.from(stateData.values()), 1);
  }, [stateData]);

  const stateColorScale = useMemo(() => {
    return scaleLinear<string>().domain([0, maxStateValue]).range(["#e5e7eb", tColorPrimary]);
  }, [maxStateValue, tColorPrimary]);

  const getStateColor = (stateName: string) => {
    const value = stateData.get(stateName) || 0;
    if (value === 0) return "#f3f4f6"; // empty color
    return stateColorScale(value);
  };

  const categoriaData = useMemo(() => {
    const dataToUse = selectedState
      ? selecionados.filter(item => item.ESTADO === selectedState)
      : selecionados;

    const map = new Map<string, number>();
    dataToUse.forEach(item => {
      const obj = item.CATEGORIA || 'Indefinido';
      map.set(obj, (map.get(obj) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, Entidades: count })).sort((a,b) => b.Entidades - a.Entidades);
  }, [selecionados, selectedState]);

  const clearFilters = () => {
    setSelectedState(null);
    setSelectedCategoria(null);
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
            <Building2 className={`opacity-20 shrink-0 ${textPrimaryClass}`} size={64} />
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Entidades Selecionadas</p>
              <p className={`text-6xl font-black tracking-tight ${textSecondaryClass}`}>{kpis.total}</p>
            </div>
          </div>
          <div className={`p-8 text-white shadow-sm flex items-center justify-start gap-6 relative overflow-hidden ${bgSecondaryClass}`}>
             <div className="absolute -right-8 -top-12 opacity-10 pointer-events-none">
               <div className="w-48 h-48 rounded-full bg-white"></div>
             </div>
            <CircleDollarSign className={`opacity-50 z-10 relative shrink-0 ${textPrimaryClass}`} size={64} />
            <div className="z-10 relative">
              <p className={`text-sm font-semibold mb-2 uppercase tracking-wider ${textPrimaryClass}`}>Total de Repasse</p>
              <p className="text-5xl font-black tracking-tight">{kpis.totalFomentado}</p>
            </div>
          </div>
        </div>
      </div>

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
                    const formattedRegionSum = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(regionVal);
                    const formattedStateSum = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stateVal);

                    return (
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
                          setSelectedState(selectedState === stateName ? null : stateName);
                        }}
                        onMouseEnter={(e) => {
                          setMapTooltip({
                            content: `${stateName} (${ufSigla})`, 
                            sub: `Repasse no Estado: ${formattedStateSum}`,
                            sub2: `Região ${regionName}: ${formattedRegionSum}`, 
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
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
            
            {mapTooltip && (
              <div 
                className="fixed bg-white border border-slate-200 shadow-lg p-3 rounded-md text-sm z-50 pointer-events-none flex flex-col gap-1 min-w-[200px]"
                style={{ top: mapTooltip.y + 10, left: mapTooltip.x + 10 }}
              >
                <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">{mapTooltip.content}</div>
                <div className="text-slate-600 flex justify-between gap-4">
                  <span className="font-medium">Estado:</span> 
                  <span>{mapTooltip.sub.replace('Repasse no Estado: ', '')}</span>
                </div>
                <div className="text-slate-600 flex justify-between gap-4">
                  <span className="font-medium">Região:</span> 
                  <span>{mapTooltip.sub2?.split(': ')[1]}</span>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center shrink-0">Clique em um estado para filtrar os demais gráficos e focar na região.</p>
        </div>

        <div className="col-span-1 lg:col-span-1 p-6 bg-white border border-slate-200 shadow-sm relative flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-2 cursor-default flex justify-between items-center shrink-0">
            <span className="truncate" title="Projetos por Categoria">Projetos por Categoria</span>
            {selectedCategoria && <span className="text-[10px] font-normal text-slate-400 truncate max-w-[80px]" title={selectedCategoria}>Filtro</span>}
          </h3>
          <div className="flex-1 w-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoriaData} margin={{ top: 20, right: 5, left: -20, bottom: 90 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={90} 
                  interval={0}
                  tick={{ fontSize: 10, fill: "#64748b" }} 
                />
                <YAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar 
                  dataKey="Entidades" 
                  fill={tColorSecondary} 
                  radius={[4, 4, 0, 0]}
                  onClick={(data: any) => {
                    const key = data?.payload?.name || data?.name;
                    if (key) {
                      setSelectedCategoria(selectedCategoria === key ? null : key);
                    }
                  }}
                  cursor="pointer"
                >
                  {categoriaData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={tColorSecondary}
                      opacity={selectedCategoria && selectedCategoria !== entry.name ? 0.3 : 1}
                      style={{ outline: "none" }}
                      className="transition-opacity duration-200"
                    />
                  ))}
                  <LabelList dataKey="Entidades" position="top" fill={tColorSecondary} fontSize={11} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 text-center shrink-0">Clique na coluna para filtrar.</p>
        </div>
      </div>
    </div>
  );
}
