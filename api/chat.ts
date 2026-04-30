import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

let pdfContextCache: string | null = null;

async function getPdfContext() {
  if (pdfContextCache !== null) return pdfContextCache;
  const dir = path.join(process.cwd(), 'editais');
  if (!fs.existsSync(dir)) {
    pdfContextCache = "";
    return pdfContextCache;
  }

  // To require pdf-parse dynamically safely in ESM
  const require = (await import('module')).createRequire(import.meta.url);
  const pdfParse = require('pdf-parse');

  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.pdf'));
  let combinedText = "";

  for (const file of files) {
    try {
      const dataBuffer = fs.readFileSync(path.join(dir, file));
      const data = await pdfParse(dataBuffer);
      combinedText += `\n--- INÍCIO DO DOCUMENTO: ${file} ---\n`;
      combinedText += data.text;
      combinedText += `\n--- FIM DO DOCUMENTO: ${file} ---\n`;
    } catch (e) {
      console.error(`Erro ao processar o arquivo ${file}:`, e);
    }
  }

  pdfContextCache = combinedText;
  return pdfContextCache;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, userText, contextData } = req.body;
    // Utilize VITE_GEMINI_API_KEY ou GEMINI_API_KEY, mas prefira GEMINI_API_KEY no backend para não expor a chave
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY; 
    
    if (!apiKey) {
      throw new Error("A chave da API do Gemini (GEMINI_API_KEY) não está configurada no ambiente do servidor.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const extraContextText = await getPdfContext();

    const systemInstruction = `Você é um assistente de IA integrado ao sistema de Fomento e Patrocínio.
Sua função é gerar relatórios e responder perguntas EXCLUSIVAMENTE com base nestes dados:
${JSON.stringify(contextData)}

DOCUMENTOS DE APOIO (Editais, Portarias, Leis e Decisões Normativas):
${extraContextText}

REGRAS ESTABELECIDAS:
1. RESPONDA APENAS SOBRE FOMENTO E PATROCÍNIO E COM BASE NOS REGULAMENTOS/DOCUMENTOS FORNECIDOS.
2. Recuse educadamente qualquer assunto fora deste escopo, citando regras de conduta.
3. Não emita opiniões pessoais ou invente dados. Caso seja questionado sobre algo que não está nos dados ou documentos, diga que as informações não estão no sistema.
4. Formate as respostas utilizando Markdown para criar relatórios estruturados, claros e cordiais.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
          ...messages.map((m: any) => ({
             role: m.role,
             parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: userText }] }
      ],
      config: {
          systemInstruction,
          temperature: 0.1
      }
    });

    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Erro na API do Gemini:", error);
    res.status(500).json({ error: error.message || "Erro desconhecido no servidor" });
  }
}
