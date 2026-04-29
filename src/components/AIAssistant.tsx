import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, AlertCircle, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import Markdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import { appData } from '../data/parser';

export function AIAssistant() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Preparing context with compact representation
      const contextData = {
        fomento2025: appData.fomentoHistorico.map(d => ({ Entidade: d.ENTIDADE, UF: d.ESTADO, Repasse: d.VALOR_REPASSE, Objetivo: d.OBJETIVO })),
        fomento2026: appData.fomento2026.map(d => ({ Entidade: d.ENTIDADE, UF: d.ESTADO, Repasse: d.VALOR_REPASSE, Objetivo: d.OBJETIVO })),
        patrocinio2025: appData.patrocinioHistorico.map(d => ({ Entidade: d.ENTIDADE, UF: d.ESTADO, Repasse: d.VALOR_REPASSE, Projeto: d.OBJETIVO }))
      };

      const systemInstruction = `Você é um assistente de IA integrado ao sistema de Fomento e Patrocínio.
Sua função é gerar relatórios e responder perguntas EXCLUSIVAMENTE com base nestes dados:
${JSON.stringify(contextData)}

REGRAS ESTABELECIDAS:
1. RESPONDA APENAS SOBRE FOMENTO E PATROCÍNIO.
2. Recuse educadamente qualquer assunto fora deste escopo, citando regras de conduta.
3. Não emita opiniões pessoais ou invente dados.
4. Formate as respostas utilizando Markdown para criar relatórios estruturados, claros e cordiais.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
            ...messages.map(m => ({
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

      setMessages(prev => [...prev, { role: 'model', text: response.text || '' }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: `**Erro ao consultar a base de dados via IA:** ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3 shrink-0">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Assistente de IA</h2>
          <p className="text-sm text-slate-500">Consulta inteligente aos dados de fomento e patrocínio</p>
        </div>
      </div>

      {/* Warning Alert */}
      <div className="bg-indigo-50 border-b border-indigo-100 p-4 shrink-0 flex items-start gap-3">
        <AlertCircle size={20} className="text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-800 leading-relaxed">
          <strong>Aviso:</strong> Este assistente responde exclusivamente baseando-se nos projetos de fomento e patrocínio armazenados neste app. 
          Respondendo a regras de conduta, a IA foi instruída a não abordar outros assuntos ou solicitações alheias à base de dados.
        </p>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto opacity-60">
            <Bot size={64} className="text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">Como posso ajudar?</h3>
            <p className="text-slate-500 text-sm">
              Você pode pedir relatórios específicos, comparações entre estados, 
              entidades que mais receberam verba, ou resumos dos projetos.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Bot size={18} className="text-indigo-600" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-[#003865] text-white rounded-br-none' 
                : 'bg-white border border-slate-200 shadow-sm rounded-bl-none text-slate-700'
            }`}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="markdown-body prose prose-sm max-w-none prose-slate prose-p:leading-relaxed prose-pre:bg-slate-100 prose-pre:text-slate-800">
                  <Markdown 
                    remarkPlugins={[remarkGfm, remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.text}
                  </Markdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <Bot size={18} className="text-indigo-600" />
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-bl-none p-4 flex gap-2 items-center">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0">
        <form 
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto flex gap-3 relative"
        >
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Pergunte sobre os projetos de fomento e patrocínio (Ex: Qual estado recebeu mais verba em 2026?)..."
            className="flex-1 resize-none h-14 bg-slate-100 border-transparent rounded-xl px-4 py-4 pr-14 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-lg text-white transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-slate-400">Inteligência Artificial por Gemini - Flash Model</span>
        </div>
      </div>
    </div>
  );
}
