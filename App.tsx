
import React, { useState, useCallback, useRef } from 'react';
import { ACTORS, RELATIONS } from './constants.ts';
import { ActorNode, AnalysisResponse, VoteRecord } from './types.ts';
import NetworkGraph from './components/NetworkGraph.tsx';
import AnalysisPanel from './components/AnalysisPanel.tsx';
import VoteRegistry from './components/VoteRegistry.tsx';
import ElectoralStats from './components/ElectoralStats.tsx';
import { getEcosystemAnalysis, AnalysisMode } from './services/geminiService.ts';

const App: React.FC = () => {
  const [selectedActor, setSelectedActor] = useState<ActorNode | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [analysisType, setAnalysisType] = useState<'actor' | 'registry' | 'general' | null>(null);
  const [loading, setLoading] = useState(false);
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>([]);

  const registryRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (params: {
    mode: AnalysisMode;
    actor?: ActorNode | null;
    record?: VoteRecord | null;
    metricType?: string;
  }) => {
    setLoading(true);
    if (params.mode === 'ACTOR_TACTICAL') setAnalysisType('actor');
    else if (params.mode === 'VOTE_REGISTRY_IMPACT') setAnalysisType('registry');
    else setAnalysisType('general');
    
    const result = await getEcosystemAnalysis(ACTORS, RELATIONS, {
      mode: params.mode,
      selectedActor: params.actor,
      lastRecord: params.record,
      totalRecords: voteRecords.length + (params.record ? 1 : 0),
      metricType: params.metricType
    });
    
    if (result) {
      setAnalysis(result);
    }
    setLoading(false);
  };

  const onNodeClick = useCallback((node: ActorNode) => {
    setSelectedActor(node);
    handleAnalyze({ mode: 'ACTOR_TACTICAL', actor: node });
  }, [voteRecords.length]);

  const handleAddVoteRecord = (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    const newRecord: VoteRecord = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    setVoteRecords(prev => {
      const updated = [newRecord, ...prev];
      handleAnalyze({ mode: 'VOTE_REGISTRY_IMPACT', record: newRecord });
      return updated;
    });
  };

  const handleDeleteVoteRecord = (id: string) => {
    setVoteRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleMetricClick = (type: string, label: string) => {
    if (type === 'voters') {
      registryRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (type === 'sectors' || type === 'relations') {
      mapRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    
    setSelectedActor(null);
    handleAnalyze({ 
      mode: 'METRIC_PROJECTION', 
      metricType: label 
    });
  };

  const metrics = [
    { id: 'voters', label: 'Identificados Triana', val: voteRecords.length.toLocaleString(), icon: 'fa-id-card-clip', color: 'text-blue-400' },
    { id: 'relations', label: 'Relaciones Activas', val: RELATIONS.length, icon: 'fa-diagram-project', color: 'text-sky-300' },
    { id: 'sectors', label: 'Sectores Clave', val: ACTORS.length, icon: 'fa-industry', color: 'text-white' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-blue-900 pb-6">
        <div>
          <div className="text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Campaña a la Cámara - Partido Conservador</div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            EDUARD <span className="text-blue-500">TRIANA RINCÓN</span>
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl font-medium">
            Control Territorial Paipa: Inteligencia predictiva y gestión de base electoral minera bajo principios de orden y desarrollo.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/40 rounded-xl border border-blue-800 text-blue-100 font-bold shadow-lg shadow-blue-500/5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
            SISTEMA DE INTELIGENCIA ACTIVO
          </div>
        </div>
      </header>

      <ElectoralStats currentVotes={voteRecords.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((stat) => (
              <button 
                key={stat.id} 
                onClick={() => handleMetricClick(stat.id, stat.label)}
                className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 flex flex-col items-center text-center group hover:border-blue-500/50 hover:bg-blue-950/20 transition-all active:scale-95 shadow-lg shadow-black/20"
              >
                <div className={`${stat.color} mb-3 text-xl group-hover:scale-125 transition-transform duration-300`}>
                  <i className={`fa-solid ${stat.icon}`}></i>
                </div>
                <div className="text-3xl font-black text-white mb-1 tabular-nums animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {stat.val}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest group-hover:text-blue-300 transition-colors">
                  {stat.label}
                </div>
              </button>
            ))}
          </div>

          <div ref={mapRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Matriz de Influencia Económico-Política</span>
              <div className="flex items-center gap-4 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-blue-500">
                  <span className="w-2 h-0.5 bg-blue-500"></span> FLUJO ECONÓMICO
                </span>
                <span className="flex items-center gap-1 text-red-500">
                  <span className="w-2 h-0.5 border-t border-dashed border-red-500"></span> VOTO / PODER
                </span>
              </div>
            </div>
            <NetworkGraph 
              nodes={ACTORS} 
              links={RELATIONS} 
              onNodeClick={onNodeClick} 
            />
          </div>

          <div ref={registryRef}>
            <VoteRegistry 
              actors={ACTORS}
              records={voteRecords}
              onAddRecord={handleAddVoteRecord}
              onDeleteRecord={handleDeleteVoteRecord}
            />
          </div>
        </div>

        <aside className="lg:sticky lg:top-8 h-fit">
          <AnalysisPanel 
            selectedActor={selectedActor} 
            analysis={analysis}
            analysisType={analysisType}
            loading={loading}
            onAnalyze={() => handleAnalyze({ 
              mode: selectedActor ? 'ACTOR_TACTICAL' : 'GENERAL_ECOSYSTEM', 
              actor: selectedActor 
            })}
          />
        </aside>
      </div>

      <footer className="mt-20 pt-8 border-t border-slate-900 text-slate-600 text-[10px] text-center max-w-3xl mx-auto space-y-2">
        <p className="font-black tracking-[0.3em] text-blue-600 uppercase">War Room Paipa - Consolidación Conservadora</p>
        <p>REPRESENTANTE EDUARD TRIANA RINCÓN - CENTRO DE INTELIGENCIA ELECTORAL</p>
        <p>© 2024 Estrategia Territorial Basada en Datos</p>
      </footer>
    </div>
  );
};

export default App;
