import { z } from 'zod';

export const entidadeSelecionadaSchema = z.object({
  ENTIDADE: z.string(),
  CNPJ: z.string().optional(),
  OBJETIVO: z.string(),
  CATEGORIA: z.string(),
  ESTADO: z.string(),
  NOTA: z.number(),
  VOTOS: z.number(),
  VALOR_REPASSE: z.number(),
  CONTROLE_ORCAMENTO: z.number().optional(),
  VALOR_PROJETO: z.number().optional(),
  CONTROLE_PROJETO: z.number().optional(),
  AJUSTE_VALOR_CONCEDENTE: z.string().optional(),
  TIPOENTIDADE: z.string().optional(),
  REGIÃO: z.string(),
  FISCAL: z.string().optional(),
  FISCAL_SUPLENTE: z.string().optional(),
  SEI: z.string(),
  IsCDEN: z.boolean(),
  IsPrecursora: z.boolean(),
  tipoRepasse: z.union([z.literal('Fomento'), z.literal('Patrocínio')]),
// Allow additional fields seamlessly
}).passthrough();

export const fomento2026ListSchema = z.array(entidadeSelecionadaSchema);
export const fomentoHistoricoListSchema = z.array(entidadeSelecionadaSchema);
export const patrocinioHistoricoListSchema = z.array(entidadeSelecionadaSchema);

export const appDataSchema = z.object({
  fomento2026: fomento2026ListSchema,
  fomentoHistorico: fomentoHistoricoListSchema,
  patrocinioHistorico: patrocinioHistoricoListSchema,
});
