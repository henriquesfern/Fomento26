import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, AlertCircle, Sparkles, Trash2 } from 'lucide-react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import Markdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import { appData } from '../data/parser';
import { infraData } from '../data/infraBR_parser';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ChartRenderer({ node, className, children, ...props }: any) {
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const codeString = String(children).trim();

  const isChartConfig = 
    lang === 'json-chart' || 
    lang === 'jsonchart' ||
    (lang === 'json' && codeString.includes('"type":') && codeString.includes('"data":'));

  if (isChartConfig) {
    try {
      // Strip any potential comments or fix trailing commas the AI might mistakenly generate
      const cleanJson = codeString
        .replace(/\/\/.*$/gm, '') 
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
        
      const config = JSON.parse(cleanJson);
      const COLORS = [config.color || '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      
      return (
        <div className="w-full h-72 my-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm not-prose">
          <ResponsiveContainer width="100%" height="100%">
            {config.type === 'bar' ? (
              <BarChart data={config.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey={config.xKey} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} width={80} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}} 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey={config.yKey} name={config.label || "Valor"} fill={config.color || "#4f46e5"} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : config.type === 'line' ? (
              <LineChart data={config.data}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey={config.xKey} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                 <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} width={80} />
                 <Tooltip 
                   contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                 />
                 <Line type="monotone" dataKey={config.yKey} name={config.label || "Valor"} stroke={config.color || "#4f46e5"} strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            ) : config.type === 'pie' ? (
              <PieChart>
                 <Pie
                   data={config.data}
                   cx="50%"
                   cy="50%"
                   labelLine={false}
                   outerRadius={90}
                   fill="#8884d8"
                   dataKey={config.yKey}
                   nameKey={config.xKey}
                   label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                 >
                   {config.data.map((entry: any, index: number) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500">Tipo de gráfico não suportado.</div>
            )}
          </ResponsiveContainer>
        </div>
      );
    } catch(e: any) {
      console.error("Error rendering chart:", e);
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200 my-4 not-prose">
          Erro ao renderizar gráfico. Verifique o console: {e.message}
        </div>
      );
    }
  }
  return <code className={className} {...props}>{children}</code>;
}

export function AIAssistant() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>(() => {
    const saved = sessionStorage.getItem('ai_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionStorage.setItem('ai_chat_history', JSON.stringify(messages));
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem('ai_chat_history');
  };

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
      // Preparing context with compact representation
      const contextData = {
        fomento2025: appData.fomentoHistorico.map(d => ({ Entidade: d.ENTIDADE, UF: d.ESTADO, Repasse: d.VALOR_REPASSE, Objetivo: d.OBJETIVO })),
        fomento2026: appData.fomento2026.map(d => ({ Entidade: d.ENTIDADE, UF: d.ESTADO, Repasse: d.VALOR_REPASSE, Objetivo: d.OBJETIVO })),
        patrocinio2025: appData.patrocinioHistorico.map(d => ({ Entidade: d.ENTIDADE, UF: d.ESTADO, Repasse: d.VALOR_REPASSE, Projeto: d.OBJETIVO })),
        infraBR_detalhamento: infraData.detalhamento.map(d => ({
          Dimensao: d.DIMENSAO,
          Componente: d.COMPONENTE,
          Indicador: d.INDICADOR,
          Interpretacao: d.INTERPRETACAO,
          Descricao: d.DESCRICAO
        })),
        infraBR_dimensoes: infraData.dimensoes.map(d => ({ UF: d.sigla_uf, Dimensao: d.dimension_name, Valor: d.value })),
        infraBR_estados: infraData.infraEstados.map(d => ({ UF: d.sigla_uf, Nota: d.infra_br, Rank: d.rank }))
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          userText,
          contextData
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro desconhecido no servidor.');
      }

      setMessages(prev => [...prev, { role: 'model', text: data.text || '' }]);
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
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Assistente de IA</h2>
            <p className="text-sm text-slate-500">Consulta inteligente aos dados de fomento, patrocínio e Infra-BR</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            title="Limpar Histórico"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Limpar Histórico</span>
          </button>
        )}
      </div>

      {/* Warning Alert */}
      <div className="bg-indigo-50 border-b border-indigo-100 p-4 shrink-0 flex items-start gap-3">
        <AlertCircle size={20} className="text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-800 leading-relaxed">
          <strong>Aviso:</strong> Este assistente responde exclusivamente baseando-se nos projetos de fomento, patrocínio e na avaliação do Infra-BR armazenados neste app. 
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
              entidades que mais receberam verba, ou detalhamentos e componentes dos indicadores do Infra-BR.
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
                <div className="markdown-body prose prose-sm max-w-none prose-slate prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-pre:text-slate-800">
                  <Markdown 
                    remarkPlugins={[remarkGfm, remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                    components={{ code: ChartRenderer }}
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
            placeholder="Pergunte sobre fomento, patrocínio e Infra-BR (Ex: Qual o detalhamento e as notas do indicador de mobilidade?)..."
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
