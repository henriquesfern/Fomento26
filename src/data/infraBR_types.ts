export interface InfraState {
  sigla_uf: string;
  infra_br: number;
  state_id: number;
  rank: number;
  color: number;
}

export interface InfraMediaBR {
  dimensao: string;
  media_pais_pct: number;
}

export interface InfraIndicador {
  value: number;
  rank: number;
  color: number;
  sigla_uf: string;
  state_id: number;
  indicator_id: string;
  component_id: string;
  component_name: string;
  dimension_id: string;
  dimension_name: string;
  indicator_name: string;
  ano: number;
  descricao: string;
  fonte: string;
}

export interface InfraComponente {
  value: number;
  rank: number;
  color: number;
  sigla_uf: string;
  state_id: number;
  component_id: string;
  component_name: string;
  dimension_id: string;
  dimension_name: string;
}

export interface InfraDimensao {
  value: number;
  rank: number;
  color: number;
  sigla_uf: string;
  state_id: number;
  dimension_id: string;
  dimension_name: string;
}

export interface InfraDetalhamento {
  DIMENSAO: string;
  COMPONENTE: string;
  INDICADOR: string;
  ID: string;
  INDICADOR_NEGATIVADO: string;
  ANO: string;
  FONTE: string;
  DESCRICAO: string;
  UNIDADE: string;
  INTERPRETACAO: string;
}

// Funções de parsing serão feitas aqui para ler os arquivos CSV!
