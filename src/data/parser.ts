import Papa from 'papaparse';
import { cdenCSV } from './cden';
import { precursorasCSV } from './precursoras';
import { selecionadosCSV } from './selecionados';
import { fiscalCSV } from './fiscal';

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
  ESTADO: string;
  MÉDIA: number;
  VOTOS: number;
  VALOR_CONCEDENTE: number;
  CONTROLE_ORCAMENTO: number;
  VALOR_PROJETO: number;
  CONTROLE_PROJETO: number;
  AJUSTE_VALOR_CONCEDENTE: string;
  TIPOENTIDADE: string;
  REGIÃO: string;
  FISCAL: string;
  SEI: string;
  IsCDEN: boolean;
  IsPrecursora: boolean;
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
  const selecionadosRaw = Papa.parse<any>(selecionadosCSV.trim(), { header: true, skipEmptyLines: true }).data;

  const selecionadosParsed: EntidadeSelecionada[] = selecionadosRaw.map((row: any) => {
    // Identify if CDEN or Precursora
    const isCDEN = cdenParsed.some(cden => cden.CNPJ === row.CNPJ);
    const isPrecursora = precursorasParsed.some(prec => prec.CNPJ === row.CNPJ);
    const fiscalInfo = fiscaisParsed.find(f => f.CNPJ === row.CNPJ);

    return {
      ENTIDADE: row.ENTIDADE,
      CNPJ: row.CNPJ,
      OBJETIVO: row.OBJETIVO,
      ESTADO: row.ESTADO,
      MÉDIA: parseNumberBR(row['MÉDIA']),
      VOTOS: parseInt(row['VOTOS'], 10) || 0,
      VALOR_CONCEDENTE: parseCurrency(row['VALOR_CONCEDENTEAJUSTADO']),
      CONTROLE_ORCAMENTO: parseCurrency(row['CONTROLEORÇAMENTO']),
      VALOR_PROJETO: parseCurrency(row['VALORPROJETO']),
      CONTROLE_PROJETO: parseCurrency(row['CONTROLEPROJETO']),
      AJUSTE_VALOR_CONCEDENTE: row['AJUSTEVALORCONCEDENTE'] || '',
      TIPOENTIDADE: row.TIPOENTIDADE === '#ERROR!' ? 'Desconhecido' : row.TIPOENTIDADE,
      REGIÃO: row['REGIÃO'],
      FISCAL: fiscalInfo ? fiscalInfo.FISCAL : (row.FISCAL || ''),
      SEI: fiscalInfo ? fiscalInfo.SEI : (row.SEI || ''),
      IsCDEN: isCDEN,
      IsPrecursora: isPrecursora,
    };
  });

  return {
    cden: cdenParsed,
    precursoras: precursorasParsed,
    selecionados: selecionadosParsed
  };
};

export const appData = parseData();
