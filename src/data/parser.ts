import Papa from 'papaparse';
import { cdenCSV } from './cden';
import { precursorasCSV } from './precursoras';
import { fomento2025CSV } from './fomento2025';
import { fomento2026CSV } from './fomento2026';
import { fiscalCSV } from './fiscal';
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

export interface EntidadeFiscal {
  CNPJ: string;
  FISCAL: string;
  SEI: string;
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
}

// Utility to parse brazilian currency
const parseCurrency = (val: string) => {
  if (!val) return 0;
  const cleaned = val.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
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
  const fiscaisParsed = Papa.parse<EntidadeFiscal>(fiscalCSV.trim(), { header: true, skipEmptyLines: true }).data;
  const fomentoRaw = Papa.parse<any>(fomento2025CSV.trim(), { header: true, skipEmptyLines: true }).data;
  const fomento2026Raw = Papa.parse<any>(fomento2026CSV.trim(), { header: true, skipEmptyLines: true }).data;
  const patrocinioRaw = Papa.parse<any>(patrocinioCSV.trim(), { header: true, skipEmptyLines: true, delimiter: ';' }).data;

  const fomentoHistoricoParsed: EntidadeSelecionada[] = fomentoRaw.map((row: any) => {
    const isCDEN = cdenParsed.some(cden => cden.CNPJ === row.CNPJ);
    const isPrecursora = precursorasParsed.some(prec => prec.CNPJ === row.CNPJ);
    const fiscalInfo = fiscaisParsed.find(f => f.CNPJ === row.CNPJ);
    
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
      FISCAL: fiscalInfo ? fiscalInfo.FISCAL : '',
      FISCAL_SUPLENTE: '',
      SEI: fiscalInfo ? fiscalInfo.SEI : (getField('Processo SEI') || getField('ProcessoSEI') || ''),
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
    const fiscalInfo = fiscaisParsed.find(f => f.CNPJ === row.CNPJ);
    
    return {
      ENTIDADE: row.ENTIDADE || '',
      CNPJ: row.CNPJ || '',
      OBJETIVO: row.OBJETIVO || '',
      CATEGORIA: row.OBJETIVO || '',
      ESTADO: getStateFullName(row.ESTADO || ''),
      NOTA: parseNumberBR(row['MÉDIA']) || 0,
      VOTOS: parseInt(row['VOTOS'], 10) || 0,
      VALOR_REPASSE: parseCurrency(row['VALOR_CONCEDENTEAJUSTADO']),
      CONTROLE_ORCAMENTO: parseCurrency(row['CONTROLEORÇAMENTO']),
      VALOR_PROJETO: parseCurrency(row['VALORPROJETO']),
      CONTROLE_PROJETO: parseCurrency(row['CONTROLEPROJETO']),
      AJUSTE_VALOR_CONCEDENTE: row['AJUSTEVALORCONCEDENTE'] || '',
      TIPOENTIDADE: row.TIPOENTIDADE === '#ERROR!' ? 'Desconhecido' : row.TIPOENTIDADE,
      REGIÃO: row['REGIÃO'] || getRegionByState(row.ESTADO || ''),
      FISCAL: fiscalInfo ? fiscalInfo.FISCAL : (row.FISCAL || ''),
      FISCAL_SUPLENTE: '',
      SEI: fiscalInfo ? fiscalInfo.SEI : (row.SEI || ''),
      IsCDEN: isCDEN,
      IsPrecursora: isPrecursora,
      tipoRepasse: 'Fomento' as const
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
