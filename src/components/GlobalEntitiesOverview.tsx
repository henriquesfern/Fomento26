import React, { useMemo, useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { geoMercator, geoCentroid } from 'd3-geo';
import { scaleLinear } from 'd3-scale';
import { appData } from '../data/parser';
import { infraData } from '../data/infraBR_parser';

const geoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

const UF_TO_REGION: Record<string, string> = {
  AC: 'Norte', AP: 'Norte', AM: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
  AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste', PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
  GO: 'Centro-Oeste', MT: 'Centro-Oeste', MS: 'Centro-Oeste', DF: 'Centro-Oeste',
  ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste',
  PR: 'Sul', RS: 'Sul', SC: 'Sul'
};

export function GlobalEntitiesOverview() {
  const [geoData, setGeoData] = useState<any>(null);
  const [tooltip, setTooltip] = useState<{
    content: string;
    rankRepasse?: string;
    rankInfraBR?: string;
    sub: string;
    sub2?: string;
    sub3?: string;
    fom?: string;
    pat?: string;
    stateProp?: string;
    regionProp?: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    fetch(geoUrl).then(res => res.json()).then(data => setGeoData(data));
  }, []);

  const aggregatedData = useMemo(() => {
    const allData = [...appData.fomentoHistorico, ...appData.patrocinioHistorico, ...appData.fomento2026];
    
    const map = new Map<string, { TOTAL: number, FOMENTO: number, PATROCINIO: number, ENTIDADES: Set<string> }>();

    allData.forEach(item => {
      const state = item.ESTADO;
      if (!state) return;

      if (!map.has(state)) {
        map.set(state, { TOTAL: 0, FOMENTO: 0, PATROCINIO: 0, ENTIDADES: new Set() });
      }

      const entry = map.get(state)!;
      entry.TOTAL += item.VALOR_REPASSE;
      if (item.CNPJ) {
        entry.ENTIDADES.add(item.CNPJ);
      } else if (item.ENTIDADE) {
        entry.ENTIDADES.add(item.ENTIDADE);
      }

      if (item.tipoRepasse === 'Fomento') {
        entry.FOMENTO += item.VALOR_REPASSE;
      } else if (item.tipoRepasse === 'Patrocínio') {
        entry.PATROCINIO += item.VALOR_REPASSE;
      }
    });

    return map;
  }, []);

  const sortedStateData = useMemo(() => {
    return Array.from(aggregatedData.entries()).sort((a,b) => b[1].TOTAL - a[1].TOTAL);
  }, [aggregatedData]);

  const totalGlobalRepasse = useMemo(() => {
    return Array.from(aggregatedData.values()).reduce((sum, val) => sum + val.TOTAL, 0);
  }, [aggregatedData]);

  const regionData = useMemo(() => {
    const allData = [...appData.fomentoHistorico, ...appData.patrocinioHistorico, ...appData.fomento2026];
    const map = new Map<string, number>();
    allData.forEach(item => {
      const region = item.REGIÃO || 'Indefinida';
      map.set(region, (map.get(region) || 0) + item.VALOR_REPASSE);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, []);

  const maxTotal = useMemo(() => Math.max(...Array.from(aggregatedData.values()).map(d => d.TOTAL), 1), [aggregatedData]);

  const colorScaleTotal = scaleLinear<string>().domain([0, maxTotal]).range(["#E0E3E8", "#0A3864"]);

  const mapProjection = useMemo(() => {
    const projection = geoMercator();
    if (!geoData) {
      return projection.scale(900).center([-54, -15]);
    }
    return projection.fitSize([1000, 1000], geoData);
  }, [geoData]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative p-4">
      <div className="bg-white border border-slate-200 shadow-sm p-4 flex flex-col h-full relative">
        <h3 className="text-xl font-semibold text-slate-800 mb-4 border-b pb-2 cursor-default flex justify-between items-center shrink-0">
          Repasse Total Histórico
        </h3>
        <div className="flex-1 w-full relative min-h-0 flex justify-center items-center">
          <ComposableMap
            projection={mapProjection as any}
            width={1000}
            height={1000}
            style={{ width: "100%", height: "100%", maxHeight: "100%" }}
          >
            <Geographies geography={geoData || geoUrl}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const ufSigla = geo.properties.sigla;
                  const stateName = geo.properties.name;
                  const regionName = UF_TO_REGION[ufSigla];
                  const stateData = aggregatedData.get(stateName);
                  const val = stateData ? stateData.TOTAL : 0;
                  
                  const regionVal = regionData.find(d => d.name === regionName)?.value || 0;
                  const formattedRegionSum = formatCurrency(regionVal);
                  const formattedStateSum = formatCurrency(val);
                  const formattedFomento = formatCurrency(stateData?.FOMENTO || 0);
                  const formattedPatrocinio = formatCurrency(stateData?.PATROCINIO || 0);
                  const entidadesSize = stateData?.ENTIDADES?.size || 0;
                  
                  const rankIndex = sortedStateData.findIndex(s => s[0] === stateName) + 1;
                  const infraState = infraData.infraEstados.find(s => s.sigla_uf === ufSigla);
                  
                  const stateProp = totalGlobalRepasse > 0 ? ((val / totalGlobalRepasse) * 100).toFixed(1) + '%' : '0%';
                  const regionProp = totalGlobalRepasse > 0 ? ((regionVal / totalGlobalRepasse) * 100).toFixed(1) + '%' : '0%';

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={val > 0 ? colorScaleTotal(val) : "#FFF0F0"}
                      stroke="#ffffff"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", transition: "all 250ms" },
                        hover: { outline: "none", fill: "#00284a", transition: "all 250ms", cursor: "pointer" },
                        pressed: { outline: "none" }
                      }}
                      onMouseEnter={(e) => {
                        setTooltip({
                          content: `${stateName} (${ufSigla})`, 
                          rankRepasse: rankIndex > 0 ? `${rankIndex}º` : undefined,
                          rankInfraBR: infraState ? `${infraState.rank}º` : undefined,
                          sub: `Estado: ${formattedStateSum}`,
                          sub2: `Região ${regionName}: ${formattedRegionSum}`,
                          sub3: `Total de Entidades: ${entidadesSize}`,
                          fom: formattedFomento,
                          pat: formattedPatrocinio,
                          stateProp,
                          regionProp,
                          x: e.clientX, 
                          y: e.clientY
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      onMouseMove={(e) => {
                        setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                      }}
                    />
                  );
                })
              }
            </Geographies>
            {geoData && (
              <Geographies geography={geoData}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const stateName = geo.properties.name;
                    const stateData = aggregatedData.get(stateName);
                    
                    const centroid = geoCentroid(geo);
                    const val = stateData ? stateData.TOTAL : 0;
                    const entidadesSize = stateData ? stateData.ENTIDADES.size : 0;
                    const isDark = val > maxTotal * 0.35;
                    
                    let textColor = "#00284a";
                    let shadowText = "0px 1px 3px rgba(255,255,255,0.9), 0px 0px 2px rgba(255,255,255,1)";
                    
                    if (val === 0) {
                      textColor = "#991b1b"; // darker red for pastel red background
                      shadowText = "0px 1px 2px rgba(255,255,255,0.5)";
                    } else if (isDark) {
                      textColor = "#ffffff";
                      shadowText = "0px 1px 3px rgba(0,0,0,0.8)";
                    }

                    return (
                      <Marker key={`${geo.rsmKey}-marker`} coordinates={centroid}>
                        <text
                          textAnchor="middle"
                          y={4}
                          style={{
                            fontFamily: "system-ui",
                            fill: textColor,
                            fontSize: "16px",
                            fontWeight: 800,
                            pointerEvents: "none",
                            textShadow: shadowText
                          }}
                        >
                          {entidadesSize}
                        </text>
                      </Marker>
                    );
                  })
                }
              </Geographies>
            )}
          </ComposableMap>
        </div>
      </div>

      {tooltip && (
        <div 
          className="fixed z-50 bg-slate-900 border border-slate-700 text-white p-4 rounded shadow-xl pointer-events-none min-w-[200px]"
          style={{ 
            left: tooltip.x + 15, 
            top: tooltip.y + 15,
            opacity: 0.95
          }}
        >
          <div className="font-bold text-base mb-2 border-b border-slate-700 pb-1 flex justify-between items-center gap-4">
            <span>{tooltip.content}</span>
          </div>
          <div className="flex flex-col gap-1 text-sm">
            {tooltip.rankRepasse && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-400 font-medium">Posição em Repasse:</span>
                <span className="text-[#F19D26] font-medium">{tooltip.rankRepasse}</span>
              </div>
            )}
            {tooltip.rankInfraBR && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-400 font-medium">Posição do Infra-BR:</span>
                <span className="text-[#F19D26] font-medium">{tooltip.rankInfraBR}</span>
              </div>
            )}
            <div className="flex justify-between gap-4 mt-1 pt-1 border-t border-slate-700/50">
              <span className="text-slate-400 font-medium">Estado:</span> 
              <span className="font-semibold text-white">
                {tooltip.sub.replace('Estado: ', '')}
                {tooltip.stateProp && <span className="text-slate-400 text-xs ml-1 font-normal">({tooltip.stateProp})</span>}
              </span>
            </div>
            <div className="flex justify-between gap-4 mt-1">
              <span className="text-slate-400 font-medium">Região:</span> 
              <span className="font-semibold text-white">
                {tooltip.sub2?.split(': ')[1]}
                {tooltip.regionProp && <span className="text-slate-400 text-xs ml-1 font-normal">({tooltip.regionProp})</span>}
              </span>
            </div>
            {tooltip.sub3 && (
              <div className="flex justify-between gap-4 mt-1">
                <span className="text-slate-400 font-medium">Total de Entidades:</span> 
                <span className="font-medium text-indigo-400">{tooltip.sub3.replace('Total de Entidades: ', '')}</span>
              </div>
            )}
            {tooltip.fom && (
              <div className="flex justify-between gap-4 border-t border-slate-700/50 mt-1 pt-1">
                <span className="text-slate-400 font-medium">Fomento:</span> 
                <span className="font-medium text-emerald-400">{tooltip.fom}</span>
              </div>
            )}
            {tooltip.pat && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-400 font-medium">Patrocínio:</span> 
                <span className="font-medium text-amber-400">{tooltip.pat}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
