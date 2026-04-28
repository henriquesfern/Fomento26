import React, { useState } from 'react';
import { LayoutDashboard, TableProperties, LineChart, UserCheck, Lightbulb } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tabs
import { Overview } from './components/Overview';
import { Directory } from './components/Directory';
import { FinancialPanel } from './components/FinancialPanel';
import { FiscalView } from './components/FiscalView';
import { InsightsView } from './components/InsightsView';

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

type TabId = 'overview' | 'directory' | 'financial' | 'fiscal' | 'insights';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className={cn("min-h-screen flex h-screen overflow-hidden font-sans", t.colors.bg, t.colors.text)}>
      {/* SIDEBAR */}
      <aside className={cn("w-64 flex flex-col pt-6 shrink-0 z-10 relative shadow-xl", t.colors.sidebar)}>
        <div className="px-6 mb-8">
          <h1 className="font-bold text-xl tracking-tight leading-tight">Fomento Integrado<br/>Confea 2026</h1>
          <div className="h-1 w-12 bg-[#008f4c] mt-3"></div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={cn("w-full flex items-center px-4 py-3 rounded-md transition-colors text-left", activeTab === 'overview' ? "bg-[#002b4d] border-l-4 border-[#008f4c]" : t.colors.sidebarItemHover)}
          >
            <LayoutDashboard size={20} className="mr-3" />
            <span className="font-medium">Visão Geral</span>
          </button>
          <button 
            onClick={() => setActiveTab('directory')}
            className={cn("w-full flex items-center px-4 py-3 rounded-md transition-colors text-left", activeTab === 'directory' ? "bg-[#002b4d] border-l-4 border-[#008f4c]" : t.colors.sidebarItemHover)}
          >
            <TableProperties size={20} className="mr-3" />
            <span className="font-medium">Diretório</span>
          </button>
          <button 
            onClick={() => setActiveTab('financial')}
            className={cn("w-full flex items-center px-4 py-3 rounded-md transition-colors text-left", activeTab === 'financial' ? "bg-[#002b4d] border-l-4 border-[#008f4c]" : t.colors.sidebarItemHover)}
          >
            <LineChart size={20} className="mr-3" />
            <span className="font-medium">Painel Financeiro</span>
          </button>
          <button 
            onClick={() => setActiveTab('fiscal')}
            className={cn("w-full flex items-center px-4 py-3 rounded-md transition-colors text-left", activeTab === 'fiscal' ? "bg-[#002b4d] border-l-4 border-[#008f4c]" : t.colors.sidebarItemHover)}
          >
            <UserCheck size={20} className="mr-3" />
            <span className="font-medium">Visão do Fiscal</span>
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={cn("w-full flex items-center px-4 py-3 rounded-md transition-colors text-left", activeTab === 'insights' ? "bg-[#002b4d] border-l-4 border-[#008f4c]" : t.colors.sidebarItemHover)}
          >
            <Lightbulb size={20} className="mr-3" />
            <span className="font-medium">Insights e Análises</span>
          </button>
        </nav>

        <div className="p-4 mt-auto text-xs opacity-70 text-center border-t border-white/10 pt-4">
          Base de Dados Oficial<br/>
          Chamamento Público nº 01/2026
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className={cn("h-16 flex items-center px-8 border-b border-slate-200 bg-white/80 backdrop-blur-sm z-10 shrink-0 shadow-sm")}>
          <h2 className="text-xl font-bold text-[#003865]">
            {activeTab === 'overview' && '1. Visão Geral Administrativa'}
            {activeTab === 'directory' && '2. Diretório de Acompanhamento Integrado'}
            {activeTab === 'financial' && '3. Painel Financeiro e de Projetos'}
            {activeTab === 'fiscal' && '4. Visão Estratégica do Fiscal'}
            {activeTab === 'insights' && '5. Insights e Análises'}
          </h2>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'overview' && <Overview />}
            {activeTab === 'directory' && <Directory />}
            {activeTab === 'financial' && <FinancialPanel />}
            {activeTab === 'fiscal' && <FiscalView />}
            {activeTab === 'insights' && <InsightsView />}
          </div>
        </div>
      </main>
    </div>
  );
}
