import Papa from 'papaparse';
import { cdenCSV } from './cden';
import { precursorasCSV } from './precursoras';
import { fomento2025CSV } from './fomento2025';
import { fomento2026CSV } from './fomento2026';
import { patrocinioCSV } from './patrocinio2025';
import { getRegionByState, getStateFullName } from './regions';

export interface EntidadeCDEN {
  Entidade: string;
  CNPJ: string;
}

export interface EntidadePrecursora {
  CNPJ: string;
  Entidade: string;
  Sigla: string;
  Crea: string;
  Fundação: string;
}



export interface EntidadeSelecionada {
  ENTIDADE: string;
  CNPJ: string;
  OBJETIVO: string;
  CATEGORIA: string;
  ESTADO: string;
  NOTA: number;
  VOTOS: number;
  VALOR_REPASSE: number;
  CONTROLE_ORCAMENTO?: number;
  VALOR_PROJETO?: number;
  CONTROLE_PROJETO?: number;
  AJUSTE_VALOR_CONCEDENTE?: string;
  TIPOENTIDADE?: string;
  REGIÃO: string;
  FISCAL: string;
  FISCAL_SUPLENTE: string;
  SEI: string;
  IsCDEN: boolean;
  IsPrecursora: boolean;
  tipoRepasse: 'Fomento' | 'Patrocínio';
  DATA_INICIO?: string;
  DATA_FIM?: string;
  MES?: string;
  OBJETIVO_COMPLETO?: string;
  AREA_ABRANGENCIA?: string;
  OBJETIVO_ESPECIFICO_COMPLETO?: string;
  PUBLICO_ALVO?: string;
  OBJETIVO_ESTRATEGICO?: string;
  TEXTO_NORM?: string;
  RANKING_ADERENCIA_INFRABR?: string;
  SCORES?: string;
  DIMENSAO_PRINCIPAL?: string;
  TERMOS_DETECTADOS?: string;
  DIMENSAO_1?: string;
  DIMENSAO_2?: string;
  DIMENSAO_3?: string;
  DIMENSAO_4?: string;
  DIMENSAO_5?: string;
}

// Utility to parse brazilian currency
const parseCurrency = (val: string) => {
  if (!val) return 0;
  const cleaned = val.replace(/R[\\\$\s]*/g, '').replace(/\./g, '').replace(',', '.').trim();
  return parseFloat(cleaned) || 0;
};

// Utility to parse brazilian numbers (e.g. 11,43)
const parseNumberBR = (val: string) => {
  if (!val) return 0;
  return parseFloat(val.replace(',', '.')) || 0;
};

export const parseData = () => {
  const cdenParsed = Papa.parse<EntidadeCDEN>(cdenCSV.trim(), { header: true, skipEmptyLines: true }).data;
  const precursorasParsed = Papa.parse<EntidadePrecursora>(precursorasCSV.trim(), { header: true, skipEmptyLines: true }).data;
  const fomentoRaw = Papa.parse<any>(fomento2025CSV.trim(), { header: true, skipEmptyLines: true }).data;
  const fomento2026Raw = Papa.parse<any>(fomento2026CSV.trim(), { header: true, skipEmptyLines: true }).data;
  const patrocinioRaw = Papa.parse<any>(patrocinioCSV.trim(), { header: true, skipEmptyLines: true }).data;

  const fomentoHistoricoParsed: EntidadeSelecionada[] = fomentoRaw.map((row: any) => {
    const isCDEN = cdenParsed.some(cden => cden.CNPJ === row.CNPJ);
    const isPrecursora = precursorasParsed.some(prec => prec.CNPJ === row.CNPJ);
    
    
    // Some headers contain newlines or trailing spaces in the Fomento2025 CSV
    const getField = (prefix: string) => {
      const key = Object.keys(row).find(k => k.startsWith(prefix));
      return key ? row[key] : '';
    };

    let linhaSolicitada = getField('Linha');
    // Mapeamento das linhas do Fomento
    if (linhaSolicitada === '1') linhaSolicitada = 'Atividade principal do Sistema Confea/Crea';
    else if (linhaSolicitada === '2') linhaSolicitada = 'Transparência, Legalidade e Legitimidade do Sistema Confea/Crea';
    else if (linhaSolicitada === '3') linhaSolicitada = 'Papel do Sistema Confea/Crea';
    else linhaSolicitada = 'erro';

    const razaoSocial = getField('Razão Social') || row.Sigla || '';

    return {
      ENTIDADE: razaoSocial,
      CNPJ: row.CNPJ || '',
      OBJETIVO: linhaSolicitada,
      CATEGORIA: linhaSolicitada,
      ESTADO: getStateFullName(row.Estado || row.ESTADO || ''),
      NOTA: parseNumberBR(row['Classificação']) || 0, // Using Classificação as a sort of number
      VOTOS: 0,
      VALOR_REPASSE: parseCurrency(row.Valor),
      CONTROLE_ORCAMENTO: 0,
      VALOR_PROJETO: parseCurrency(row.Valor),
      CONTROLE_PROJETO: 0,
      AJUSTE_VALOR_CONCEDENTE: '',
      TIPOENTIDADE: '',
      REGIÃO: getRegionByState(row.Estado || row.ESTADO || ''),
      FISCAL: row.FISCAL || '',
      FISCAL_SUPLENTE: '',
      SEI: getField('Processo SEI') || getField('ProcessoSEI') || '',
      IsCDEN: isCDEN,
      IsPrecursora: isPrecursora,
      tipoRepasse: 'Fomento' as const,
      DATA_INICIO: getField('DATA INÍCIO') || '',
      DATA_FIM: getField('DATA FIM') || '',
      MES: ''
    };
  });

  const fomento2026Parsed: EntidadeSelecionada[] = fomento2026Raw.map((row: any) => {
    const isCDEN = cdenParsed.some(cden => cden.CNPJ === row.CNPJ);
    const isPrecursora = precursorasParsed.some(prec => prec.CNPJ === row.CNPJ);
    
    return {
      ENTIDADE: row.ENTIDADE || '',
      CNPJ: row.CNPJ || '',
      OBJETIVO: row.OBJETIVO_ESTRATEGICO || row.OBJETIVO || '',
      CATEGORIA: row.OBJETIVO_ESTRATEGICO || row.CATEGORIA || row.OBJETIVO || '',
      ESTADO: getStateFullName(row.ESTADO || row.SIGLA_UF || ''),
      NOTA: parseNumberBR(row['MÉDIA']) || 0,
      VOTOS: parseInt(row['VOTOS'], 10) || 0,
      VALOR_REPASSE: parseCurrency(row['VALOR_CONCEDENTEAJUSTADO']),
      CONTROLE_ORCAMENTO: parseCurrency(row['CONTROLEORÇAMENTO']),
      VALOR_PROJETO: parseCurrency(row['VALORPROJETO']),
      CONTROLE_PROJETO: parseCurrency(row['CONTROLEPROJETO']),
      AJUSTE_VALOR_CONCEDENTE: row['AJUSTEVALORCONCEDENTE'] || '',
      TIPOENTIDADE: row.TIPOENTIDADE === '#ERROR!' ? 'Desconhecido' : row.TIPOENTIDADE,
      REGIÃO: row['REGIÃO'] || getRegionByState(row.ESTADO || row.SIGLA_UF || ''),
      FISCAL: row.FISCAL || '',
      FISCAL_SUPLENTE: '',
      SEI: row.SEI || '',
      IsCDEN: isCDEN,
      IsPrecursora: isPrecursora,
      tipoRepasse: 'Fomento' as const,
      OBJETIVO_COMPLETO: row.OBJETIVO_COMPLETO || '',
      AREA_ABRANGENCIA: row.AREA_ABRANGENCIA || '',
      OBJETIVO_ESPECIFICO_COMPLETO: row.OBJETIVO_ESPECIFICO || '',
      PUBLICO_ALVO: row.PUBLICO_ALVO || '',
      OBJETIVO_ESTRATEGICO: row.OBJETIVO_ESTRATEGICO || '',
      TEXTO_NORM: row.TEXTO_NORM || '',
      RANKING_ADERENCIA_INFRABR: row.RANKING_ADERENCIA_INFRABR || '',
      SCORES: row.SCORES || '',
      DIMENSAO_PRINCIPAL: row.DIMENSAO_PRINCIPAL || '',
      TERMOS_DETECTADOS: row.TERMOS_DETECTADOS || '',
      DIMENSAO_1: row.DIMENSAO_1 || '',
      DIMENSAO_2: row.DIMENSAO_2 || '',
      DIMENSAO_3: row.DIMENSAO_3 || '',
      DIMENSAO_4: row.DIMENSAO_4 || '',
      DIMENSAO_5: row.DIMENSAO_5 || ''
    };
  });

  const patrocinioParsed: EntidadeSelecionada[] = patrocinioRaw.map((row: any) => {
    const isCDEN = cdenParsed.some(cden => cden.CNPJ === row.CNPJ);
    const isPrecursora = precursorasParsed.some(prec => prec.CNPJ === row.CNPJ);
    
    const tipo = row['Tipo'] || '';
    const tipoPub = row['TipoPublicacao'] || '';
    const categoria = tipo === 'PUBLICAÇÃO' && tipoPub ? (tipoPub.charAt(0).toUpperCase() + tipoPub.slice(1).toLowerCase()) : (tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase());
    const projetoFull = row['Projeto'] || '';
    const objetivoTruncated = projetoFull.length > 35 ? projetoFull.substring(0, 35) + '...' : projetoFull;

    return {
      ENTIDADE: row.Entidade,
      CNPJ: row.CNPJ,
      OBJETIVO: objetivoTruncated || categoria,
      CATEGORIA: categoria,
      ESTADO: getStateFullName(row.Estado || ''),
      NOTA: parseNumberBR(row['Pontuação']),
      VOTOS: 0,
      VALOR_REPASSE: parseCurrency(row['Valor de Repasse']),
      REGIÃO: getRegionByState(row.Estado),
      FISCAL: row.Fiscal || '',
      FISCAL_SUPLENTE: row['Fiscal Suplente'] || '',
      SEI: row.SEI || '',
      IsCDEN: isCDEN,
      IsPrecursora: isPrecursora,
      tipoRepasse: 'Patrocínio' as const,
      DATA_INICIO: row['Data Início'] || '',
      DATA_FIM: row['Data Fim'] || '',
      MES: row['Mês'] || ''
    };
  });

  return {
    cden: cdenParsed,
    precursoras: precursorasParsed,
    fomento2026: fomento2026Parsed,
    fomentoHistorico: fomentoHistoricoParsed,
    patrocinioHistorico: patrocinioParsed
  };
};

export const appData = parseData();
