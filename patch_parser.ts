import fs from 'fs';

let parser = fs.readFileSync('src/data/parser.ts', 'utf8');

// remove imports no longer needed
parser = parser.replace("import { fiscalCSV } from './fiscal';\n", "");
parser = parser.replace("import { anexoCSV } from './anexo';\n", "");

// modify EntidadeSelecionada
parser = parser.replace("PUBLICO_ALVO?: string;\n}", `PUBLICO_ALVO?: string;
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
}`);

// remove fomento2026Raw mapping and logic related to anexo / fiscals
const fomento2026Block = /const fomento2026Parsed: EntidadeSelecionada\[\] = fomento2026Raw\.map\(\(row: any\) => \{[\s\S]*?\}\);\n/s;
const newFomento2026Logic = `const fomento2026Parsed: EntidadeSelecionada[] = fomento2026Raw.map((row: any) => {
    const isCDEN = cdenParsed.some(cden => cden.CNPJ === row.CNPJ);
    const isPrecursora = precursorasParsed.some(prec => prec.CNPJ === row.CNPJ);
    
    return {
      ENTIDADE: row.ENTIDADE || '',
      CNPJ: row.CNPJ || '',
      OBJETIVO: row.OBJETIVO || '',
      CATEGORIA: row.OBJETIVO || '',
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
`;

parser = parser.replace(fomento2026Block, newFomento2026Logic);

// also remove anexoRaw parsing
parser = parser.replace("  const anexoRaw = Papa.parse<any>(anexoCSV.trim(), { header: true, skipEmptyLines: true }).data;\n", "");
parser = parser.replace("  const fiscaisParsed = Papa.parse<EntidadeFiscal>(fiscalCSV.trim(), { header: true, skipEmptyLines: true }).data;\n", "");

// fix the fiscal lookup loop for fomento 2025 since fiscalCSV is no longer extracted at top
// Actually, fomentoHistoricoParsed in parser.ts uses fiscaisParsed: 
// const fiscalInfo = fiscaisParsed.find(f => f.CNPJ === row.CNPJ);
// Let's replace the fomentoHistorico parser reference to fiscaisParsed too, it's not needed if we are just looking at Fomento 2025 where fiscal might not exist or we can define fiscaisParsed as empty array for now or keep fiscalCSV around for 2025!
// BUT WAIT, fiscal.ts is currently just a copy of the new fiscal data, wait! Let's check `src/data/fiscal.ts` again!

fs.writeFileSync('src/data/parser.ts', parser);
