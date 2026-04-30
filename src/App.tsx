import React, { useState } from 'react';
import { LayoutDashboard, TableProperties, LineChart, UserCheck, Lightbulb, History, Users, List, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tabs
import { Overview } from './components/Overview';
import { Directory } from './components/Directory';
import { GlobalDirectory } from './components/GlobalDirectory';
import { GlobalEntitiesOverview } from './components/GlobalEntitiesOverview';
import { FinancialPanel } from './components/FinancialPanel';
import { FiscalView } from './components/FiscalView';
import { InsightsView } from './components/InsightsView';
import { StateForceView } from './components/StateForceView';
import { AIAssistant } from './components/AIAssistant';
import { appData } from './data/parser';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Institucional Confea Theme
const t = {
  name: 'Institucional Confea',
  colors: {
    bg: 'bg-slate-50',
    text: 'text-slate-900',
    primary: 'bg-[#003865] text-white',
    accent: 'text-[#008f4c]',
    card: 'bg-white border-[#003865]/20 shadow-sm rounded-none border',
    sidebar: 'bg-[#003865] text-white',
    sidebarItemHover: 'hover:bg-[#002b4d]',
  }
};

type TabId = 
  | 'overview' 
  | 'current_directory'
  | 'current_fiscal' 
  | 'current_financial' 
  | 'history'
  | 'history_fomento'
  | 'history_fomento_dir'
  | 'history_fomento_fin'
  | 'history_patrocinio'
  | 'history_patrocinio_dir'
  | 'history_patrocinio_fin'
  | 'history_entidades'
  | 'history_entidades_dir'
  | 'insights'
  | 'insights_forca'
  | 'ai_assistant';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderMenuItem = (id: TabId, label: string, Icon: React.ElementType, depth: number = 0) => {
    return (
      <button 
        onClick={() => setActiveTab(id)}
        className={cn(
          "w-full flex items-center py-2.5 rounded-md transition-colors text-left",
          depth === 0 ? "px-4" : depth === 1 ? "pl-8 pr-4 text-sm" : "pl-12 pr-4 text-sm",
          activeTab === id ? "bg-[#002b4d] border-l-4 border-[#008f4c] text-white" : t.colors.sidebarItemHover,
          activeTab !== id && depth > 0 ? "text-slate-300" : "text-white"
        )}
      >
        <Icon size={depth === 0 ? 20 : 16} className={cn("shrink-0", depth === 0 ? "mr-3" : "mr-2")} />
        <span className={cn(depth === 0 ? "font-medium" : "")}>{label}</span>
      </button>
    );
  };

  const getHeaderTitle = (tab: TabId) => {
    switch(tab) {
      case 'overview': return 'Visão Geral Corrente';
      case 'current_directory': return 'Diretório de Entidades';
      case 'current_fiscal': return 'Visão do Fiscal';
      case 'current_financial': return 'Painel Financeiro';
      case 'history': return 'Histórico (2025)';
      case 'history_fomento': return 'Histórico - Fomento (2025)';
      case 'history_fomento_dir': return 'Diretório de Entidades (Fomento - 2025)';
      case 'history_fomento_fin': return 'Painel Financeiro (Fomento - 2025)';
      case 'history_patrocinio': return 'Histórico - Patrocínio (2025)';
      case 'history_patrocinio_dir': return 'Diretório de Entidades (Patrocínio - 2025)';
      case 'history_patrocinio_fin': return 'Painel Financeiro (Patrocínio - 2025)';
      case 'history_entidades': return 'Histórico - Entidades (2025)';
      case 'history_entidades_dir': return 'Diretório de Entidades (Histórico - 2025)';
      case 'insights': return 'Insights e Análises';
      case 'insights_forca': return 'Força por Estado';
      case 'ai_assistant': return 'IA - Consulta de Dados';
    }
  };

  return (
    <div className={cn("min-h-screen flex h-screen overflow-hidden font-sans", t.colors.bg, t.colors.text)}>
      {/* SIDEBAR */}
      <aside className={cn("w-64 flex flex-col pt-6 shrink-0 z-10 relative shadow-xl overflow-y-auto overflow-x-hidden", t.colors.sidebar)}>
        <div className="px-6 mb-8">
          <h1 className="font-bold text-xl tracking-tight leading-tight">Gestão de<br/>Repasses</h1>
          <div className="h-1 w-12 bg-[#008f4c] mt-3"></div>
        </div>
        
        <nav className="flex-1 space-y-1 pb-6 px-3">
          {renderMenuItem('overview', 'Visão Geral Corrente', LayoutDashboard, 0)}
          {renderMenuItem('current_directory', 'Diretório de Entidades', List, 1)}
          {renderMenuItem('current_fiscal', 'Visão do Fiscal', UserCheck, 1)}
          {renderMenuItem('current_financial', 'Painel Financeiro', LineChart, 1)}
          
          <div className="my-4 border-t border-white/10 mx-2"></div>
          
          {renderMenuItem('history', 'Histórico (2025)', History, 0)}
          {renderMenuItem('history_fomento', 'Fomento (2025)', TableProperties, 1)}
          {renderMenuItem('history_fomento_dir', 'Diretório de Entidades', List, 2)}
          {renderMenuItem('history_fomento_fin', 'Painel Financeiro', LineChart, 2)}
          
          {renderMenuItem('history_patrocinio', 'Patrocínio (2025)', TableProperties, 1)}
          {renderMenuItem('history_patrocinio_dir', 'Diretório de Entidades', List, 2)}
          {renderMenuItem('history_patrocinio_fin', 'Painel Financeiro', LineChart, 2)}
          
          {renderMenuItem('history_entidades', 'Entidades (2025)', Users, 1)}
          {renderMenuItem('history_entidades_dir', 'Diretório de Entidades', List, 2)}
          
          <div className="my-4 border-t border-white/10 mx-2"></div>
          
          {renderMenuItem('insights', 'Insights e Análises', Lightbulb, 0)}
          {renderMenuItem('insights_forca', 'Força por Estado', LayoutDashboard, 1)}

          <div className="my-4 border-t border-white/10 mx-2"></div>
          
          {renderMenuItem('ai_assistant', 'IA - Consulta', Sparkles, 0)}
        </nav>

        <div className="p-4 mt-auto text-xs opacity-70 text-center border-t border-white/10 pt-4 shrink-0">
          Base de Dados Oficial<br/>
          Fomento e Patrocínio
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className={cn("h-16 flex items-center px-8 border-b border-slate-200 bg-white/80 backdrop-blur-sm z-10 shrink-0 shadow-sm")}>
          <h2 className="text-xl font-bold text-[#003865]">
            {getHeaderTitle(activeTab)}
          </h2>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="w-full max-w-[1920px] mx-auto h-full">
            {activeTab === 'overview' && <Overview />}
            {activeTab === 'current_directory' && <Directory />}
            {activeTab === 'current_fiscal' && <FiscalView />}
            {activeTab === 'current_financial' && <FinancialPanel />}
            
            {activeTab === 'history_fomento' && <Overview data={appData.fomentoHistorico} theme="fomento" />} 
            {activeTab === 'history_fomento_dir' && <Directory data={appData.fomentoHistorico} />}
            {activeTab === 'history_fomento_fin' && <FinancialPanel data={appData.fomentoHistorico} theme="fomento" />}
            {activeTab === 'history_patrocinio' && <Overview data={appData.patrocinioHistorico} theme="patrocinio" />}
            {activeTab === 'history_patrocinio_dir' && <Directory data={appData.patrocinioHistorico} />}
            {activeTab === 'history_patrocinio_fin' && <FinancialPanel data={appData.patrocinioHistorico} theme="patrocinio" />}
            
            {activeTab === 'history_entidades' && <GlobalEntitiesOverview />}
            {activeTab === 'history_entidades_dir' && <GlobalDirectory />}

            {activeTab === 'history' && <Overview data={[...appData.fomentoHistorico, ...appData.patrocinioHistorico]} theme="history" showEntityCount={true} />}
            
            {activeTab === 'insights' && <InsightsView />}
            {activeTab === 'insights_forca' && <StateForceView />}
            {activeTab === 'ai_assistant' && <AIAssistant />}
          </div>
        </div>
      </main>
    </div>
  );
}
