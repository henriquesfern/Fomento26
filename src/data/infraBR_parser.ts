import Papa from 'papaparse';
import {
  InfraState,
  InfraMediaBR,
  InfraIndicador,
  InfraComponente,
  InfraDimensao,
  InfraDetalhamento
} from './infraBR_types';

import infraBRCsv from './infra-br.csv?raw';
import mediasBRCsv from './medias_BR.csv?raw';
import dimensoesCsv from './dimensoes_0100.csv?raw';
import componentesCsv from './componentes_0100.csv?raw';
import indicadoresCsv from './indicadores_0100.csv?raw';
import detalhamentoCsv from './detalhamentoindicadores.csv?raw';

// Utility to parse brazilian numbers (e.g. "11,43")
const parseNumberBR = (val: string) => {
  if (!val) return 0;
  return parseFloat(val.replace(',', '.')) || 0;
};

export const parseInfraBRData = () => {
  const parseConfig = { header: true, skipEmptyLines: true, delimiter: ',' };

  const infra_br_raw = Papa.parse<any>(infraBRCsv.trim(), parseConfig).data;
  const medias_BR_raw = Papa.parse<any>(mediasBRCsv.trim(), parseConfig).data;
  const dimensoes_raw = Papa.parse<any>(dimensoesCsv.trim(), parseConfig).data;
  const componentes_raw = Papa.parse<any>(componentesCsv.trim(), parseConfig).data;
  const indicadores_raw = Papa.parse<any>(indicadoresCsv.trim(), parseConfig).data;
  const detalhamento_raw = Papa.parse<any>(detalhamentoCsv.trim(), { header: true, skipEmptyLines: true, delimiter: ',' }).data;

  const infraEstados: InfraState[] = infra_br_raw
    .filter((row: any) => row.sigla_uf)
    .map((row: any) => ({
      sigla_uf: row.sigla_uf,
      infra_br: parseNumberBR(row.infra_br),
      state_id: parseInt(row.state_id, 10),
      rank: parseInt(row.rank, 10),
      color: parseInt(row.color, 10)
    }));

  const mediasBR: InfraMediaBR[] = medias_BR_raw
    .filter((row: any) => row['Dimensão'])
    .map((row: any) => ({
      dimensao: row['Dimensão'],
      media_pais_pct: parseNumberBR(row['Média do País']?.replace('%', ''))
    }));

  const dimensoes: InfraDimensao[] = dimensoes_raw
    .filter((row: any) => row.sigla_uf && row.dimension_id)
    .map((row: any) => ({
      value: parseNumberBR(row.value),
      rank: parseInt(row.rank, 10),
      color: parseInt(row.color, 10),
      sigla_uf: row.sigla_uf,
      state_id: parseInt(row.state_id, 10),
      dimension_id: row.dimension_id,
      dimension_name: row.dimension_name
    }));

  const componentes: InfraComponente[] = componentes_raw
    .filter((row: any) => row.sigla_uf && row.component_id)
    .map((row: any) => ({
      value: parseNumberBR(row.value),
      rank: parseInt(row.rank, 10),
      color: parseInt(row.color, 10),
      sigla_uf: row.sigla_uf,
      state_id: parseInt(row.state_id, 10),
      component_id: row.component_id,
      component_name: row.component_name,
      dimension_id: row.dimension_id,
      dimension_name: row.dimension_name
    }));

  const indicadores: InfraIndicador[] = indicadores_raw
    .filter((row: any) => row.sigla_uf && row.indicator_id)
    .map((row: any) => ({
      value: parseNumberBR(row.value),
      rank: parseInt(row.rank, 10),
      color: parseInt(row.color, 10),
      sigla_uf: row.sigla_uf,
      state_id: parseInt(row.state_id, 10),
      indicator_id: row.indicator_id,
      component_id: row.component_id,
      component_name: row.component_name,
      dimension_id: row.dimension_id,
      dimension_name: row.dimension_name,
      indicator_name: row.indicator_name,
      ano: parseInt(row.ano, 10) || 0,
      descricao: row.descricao || '',
      fonte: row.fonte || ''
    }));

  const detalhamento: InfraDetalhamento[] = detalhamento_raw.map((row: any) => ({
    DIMENSAO: row['DIMENSÃO'] || '',
    COMPONENTE: row['COMPONENTE'] || '',
    INDICADOR: row['INDICADOR'] || '',
    ID: row['ID'] || '',
    INDICADOR_NEGATIVADO: row['INDICADOR NEGATIVADO'] || '',
    ANO: row['ANO'] || '',
    FONTE: row['FONTE'] || '',
    DESCRICAO: row['DESCRIÇÃO / CÁLCULO'] || '',
    UNIDADE: row['UNIDADE'] || '',
    INTERPRETACAO: row['INTERPRETAÇÃO'] || ''
  }));

  return {
    infraEstados,
    mediasBR,
    dimensoes,
    componentes,
    indicadores,
    detalhamento
  };
};

export const infraData = parseInfraBRData();
