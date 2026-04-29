export const stateToRegion: Record<string, string> = {
  'Acre': 'Norte', 'Alagoas': 'Nordeste', 'Amapá': 'Norte', 'Amazonas': 'Norte',
  'Bahia': 'Nordeste', 'Ceará': 'Nordeste', 'Distrito Federal': 'Centro-Oeste',
  'Espírito Santo': 'Sudeste', 'Goiás': 'Centro-Oeste', 'Maranhão': 'Nordeste',
  'Mato Grosso': 'Centro-Oeste', 'Mato Grosso do Sul': 'Centro-Oeste',
  'Minas Gerais': 'Sudeste', 'Pará': 'Norte', 'Paraíba': 'Nordeste',
  'Paraná': 'Sul', 'Pernambuco': 'Nordeste', 'Piauí': 'Nordeste',
  'Rio de Janeiro': 'Sudeste', 'Rio Grande do Norte': 'Nordeste',
  'Rio Grande do Sul': 'Sul', 'Rondônia': 'Norte', 'Roraima': 'Norte',
  'Santa Catarina': 'Sul', 'São Paulo': 'Sudeste', 'Sergipe': 'Nordeste',
  'Tocantins': 'Norte',
  'AC': 'Norte', 'AL': 'Nordeste', 'AM': 'Norte', 'AP': 'Norte',
  'BA': 'Nordeste', 'CE': 'Nordeste', 'DF': 'Centro-Oeste', 'ES': 'Sudeste',
  'GO': 'Centro-Oeste', 'MA': 'Nordeste', 'MG': 'Sudeste', 'MS': 'Centro-Oeste',
  'MT': 'Centro-Oeste', 'PA': 'Norte', 'PB': 'Nordeste', 'PE': 'Nordeste',
  'PI': 'Nordeste', 'PR': 'Sul', 'RJ': 'Sudeste', 'RN': 'Nordeste',
  'RO': 'Norte', 'RR': 'Norte', 'RS': 'Sul', 'SC': 'Sul', 'SE': 'Nordeste',
  'SP': 'Sudeste', 'TO': 'Norte'
};

export const fullNameToSigla: Record<string, string> = {
  'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
  'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF',
  'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA',
  'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB',
  'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI',
  'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR',
  'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE',
  'Tocantins': 'TO'
};

export const getRegionByState = (state: string) => {
  if (!state) return 'Desconhecido';
  const trimmed = state.trim();
  return stateToRegion[trimmed] || 'Desconhecido';
};

export const siglaToFullName: Record<string, string> = {
  'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
  'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal',
  'ES': 'Espírito Santo', 'GO': 'Goiás', 'MA': 'Maranhão',
  'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba',
  'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
  'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima',
  'SC': 'Santa Catarina', 'SP': 'São Paulo', 'SE': 'Sergipe',
  'TO': 'Tocantins'
};

export const getStateFullName = (state: string) => {
  if (!state) return '';
  const trimmed = state.trim();
  if (trimmed.length === 2) {
    const upper = trimmed.toUpperCase();
    return siglaToFullName[upper] || upper;
  }
  return trimmed;
};

export const getStateSigla = (state: string) => {
  if (!state) return '';
  const trimmed = state.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return fullNameToSigla[trimmed] || trimmed;
};
