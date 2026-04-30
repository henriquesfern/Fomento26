import { GoogleGenAI } from '@google/genai';
import { EDITAIS_CONTEXT } from '../src/editais-context.js';

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
    
    const extraContextText = EDITAIS_CONTEXT;

    const systemInstruction = `Você é um assistente de IA integrado ao sistema de Fomento e Patrocínio.
Sua função é gerar relatórios e responder perguntas EXCLUSIVAMENTE com base nestes dados:
${JSON.stringify(contextData)}

DOCUMENTOS DE APOIO (Editais, Portarias, Leis e Decisões Normativas):
${extraContextText}

REGRAS ESTABELECIDAS:
1. RESPONDA APENAS SOBRE FOMENTO E PATROCÍNIO E COM BASE NOS REGULAMENTOS/DOCUMENTOS FORNECIDOS.
2. Recuse educadamente qualquer assunto fora deste escopo, citando regras de conduta.
3. Não emita opiniões pessoais ou invente dados. Caso seja questionado sobre algo que não está nos dados ou documentos, diga que as informações não estão no sistema.
4. Formate as respostas utilizando Markdown para criar relatórios estruturados, claros e cordiais.
5. Se o usuário solicitar gráficos ou se um gráfico for a melhor maneira de exibir os dados comparativos solicitados, você DEVE gerar um código de um gráfico em sua resposta. Para isso, utilize EXATAMENTE o bloco de código com a linguagem "json-chart" contendo um JSON com a configuração do gráfico, no seguinte formato:

\`\`\`json-chart
{
  "type": "bar", // opções: "bar", "line", "pie"
  "data": [
     { "name": "SP", "value": 150000 },
     { "name": "RJ", "value": 100000 }
  ],
  "xKey": "name", // chave para o eixo x ou nome
  "yKey": "value", // chave para o eixo y ou valor
  "color": "#4f46e5", // cor principal
  "label": "Valor repassado" // rótulo
}
\`\`\`
Somente gere o bloco "json-chart" quando houver dados reais suficientes que achem proveito da visualização, ou se o usuário expressamente pedir um gráfico. O bloco "json-chart" não renderizará código visível, mas sim um componente visual.`;

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
