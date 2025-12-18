
import React, { useState, useCallback, useRef } from 'react';
import { ACTORS, RELATIONS } from './constants.ts';
import { ActorNode, VoteRecord, ElectoralZone } from './types.ts';
import NetworkGraph from './components/NetworkGraph.tsx';
import AnalysisPanel from './components/AnalysisPanel.tsx';
import VoteRegistry from './components/VoteRegistry.tsx';
import ElectoralStats from './components/ElectoralStats.tsx';
import ElectoralView from './components/ElectoralView.tsx';
import ThankYouModal from './components/ThankYouModal.tsx';

// Zonas simuladas de Paipa para la visualización territorial
const MOCK_ZONES: ElectoralZone[] = [
  { id: 'z1', name: 'Barrio El Rosario', votePercentage: 65, workerDensity: 80 },
  { id: 'z2', name: 'Vereda Palermo', votePercentage: 45, workerDensity: 90 },
  { id: 'z3', name: 'Centro Paipa', votePercentage: 30, workerDensity: 20 },
  { id: 'z4', name: 'Vereda Salitre', votePercentage: 55, workerDensity: 70 },
];

const App: React.FC = () => {
  const [selectedActor, setSelectedActor] = useState<ActorNode | null>(null);
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>([]);
  const [viewMode, setViewMode] = useState<'network' | 'map'>('network');
  const [lastRegisteredName, setLastRegisteredName] = useState<string | null>(null);

  const registryRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const onNodeClick = useCallback((node: ActorNode) => {
    setSelectedActor(node);
  }, []);

  const handleAddVoteRecord = (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    const newRecord: VoteRecord = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    setVoteRecords(prev => [newRecord, ...prev]);
    setLastRegisteredName(record.voterName); 
  };

  const handleDeleteVoteRecord = (id: string) => {
    setVoteRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleMetricClick = (type: string) => {
    if (type === 'voters') {
      registryRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (type === 'sectors' || type === 'relations') {
      mapRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    setSelectedActor(null);
  };

  const metrics = [
    { id: 'voters', label: 'Registros 102', val: voteRecords.length.toLocaleString(), icon: 'fa-id-card-clip', color: 'text-sky-500' },
    { id: 'relations', label: 'Nodos Estratégicos', val: RELATIONS.length, icon: 'fa-diagram-project', color: 'text-amber-500' },
    { id: 'sectors', label: 'Base Territorial', val: ACTORS.length, icon: 'fa-industry', color: 'text-white' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 pb-20">
      
      {lastRegisteredName && (
        <ThankYouModal 
          voterName={lastRegisteredName} 
          voterCount={voteRecords.length}
          onClose={() => setLastRegisteredName(null)} 
        />
      )}

      {/* HEADER PREMIUM - SIN FOTO, IMPACTO TIPOGRÁFICO PURO */}
      <header className="relative bg-white rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] flex flex-col md:flex-row h-auto md:h-[320px] border border-slate-100 group">
        
        {/* LADO IZQUIERDO: BRANDING GRÁFICO (SIN IMAGEN) */}
        <div className="md:w-[28%] relative bg-gradient-to-br from-[#facc15] to-[#eab308] flex items-center justify-center overflow-hidden">
          {/* Corte diagonal estilizado */}
          <div className="absolute top-0 right-0 h-full w-full bg-white transform translate-x-1/2 -skew-x-[15deg] z-10"></div>
          
          <div className="relative z-30 text-center transform -rotate-2">
            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter drop-shadow-xl flex flex-col leading-none mb-2">
              <span className="text-blue-900">#POR TÍ</span>
              <span className="text-[#0ea5e9]">BOYACÁ</span>
            </h2>
            <div className="h-1.5 w-full bg-blue-900/20 mt-4 rounded-full overflow-hidden">
               <div className="h-full bg-blue-900 w-1/2"></div>
            </div>
          </div>

          {/* Banner Acción Inferior */}
          <div className="absolute bottom-0 w-full z-40 bg-[#0ea5e9] py-3 text-center overflow-hidden">
             <span className="relative text-white font-black text-[10px] md:text-xs tracking-[0.5em] uppercase italic">VOTA ASÍ A LA CÁMARA</span>
          </div>
        </div>

        {/* LADO DERECHO: COMPOSICIÓN ESTRATÉGICA */}
        <div className="md:w-[72%] bg-white p-8 md:px-14 flex flex-col justify-center relative">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, #1e3a8a 1.2px, transparent 1.2px)', backgroundSize: '30px 30px' }}>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
            
            {/* BLOQUE NOMBRE */}
            <div className="flex flex-col items-center md:items-start flex-1">
              <div className="bg-[#1e3a8a] text-white px-10 py-1.5 font-black text-xl shadow-[0_10px_20px_rgba(30,58,138,0.2)] transform -skew-x-12 mb-6 inline-block">
                YO VOTO
              </div>
              
              <div className="flex flex-col space-y-1 md:space-y-2">
                <span className="text-[#1e3a8a] font-black text-4xl md:text-5xl tracking-tighter uppercase ml-2 drop-shadow-sm">EDUAR</span>
                <h1 className="text-[#1e3a8a] font-black text-6xl md:text-[9.5rem] tracking-tighter uppercase leading-[0.8] mb-4">TRIANA</h1>
              </div>

              {/* PARTIDO LOGO COMPACTO */}
              <div className="hidden md:flex bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100 items-center gap-6 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-blue-900/40 uppercase tracking-widest leading-none mb-1">PARTIDO</span>
                  <span className="text-base font-black text-blue-900 uppercase leading-none tracking-tight">CENTRO DEMOCRÁTICO</span>
                  <span className="text-[8px] font-bold text-red-500 uppercase italic mt-1 leading-none">MANO FIRME, CORAZÓN GRANDE</span>
                </div>
                <div className="h-12 w-[2px] bg-slate-200"></div>
                <div className="flex items-center justify-center w-14 h-14 bg-white border-2 border-[#1e3a8a] rounded-2xl shadow-inner transform rotate-3">
                   <span className="text-3xl font-black text-[#1e3a8a] italic">102</span>
                </div>
              </div>
            </div>

            {/* BLOQUE NÚMERO 102 CENTRAL */}
            <div className="flex flex-col items-center justify-center relative scale-90 md:scale-100 mt-4 md:mt-0">
              <div className="relative">
                <span className="absolute inset-0 text-[7rem] md:text-[13rem] font-black text-[#1e3a8a] leading-none italic translate-x-2 translate-y-2">102</span>
                <span className="relative text-[7rem] md:text-[13rem] font-black text-[#facc15] leading-none italic">102</span>
              </div>
              
              <div className="flex items-center gap-4 -mt-4 md:-mt-8">
                <div className="h-[2px] md:h-[3px] w-8 md:w-10 bg-[#0ea5e9]"></div>
                <span className="text-[#0ea5e9] font-black text-2xl md:text-6xl tracking-[0.1em] uppercase">CÁMARA</span>
                <div className="h-[2px] md:h-[3px] w-8 md:w-10 bg-[#0ea5e9]"></div>
              </div>
            </div>

          </div>
        </div>

        {/* Victory Tag */}
        <div className="absolute top-6 right-10 hidden lg:block">
           <div className="bg-emerald-50 text-emerald-600 px-5 py-2 rounded-full border border-emerald-100 flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-sm">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
             CENTRO DE MANDO ACTIVO
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
                onClick={() => handleMetricClick(stat.id)}
                className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 flex flex-col items-center text-center group hover:border-sky-500/50 hover:bg-blue-950/20 transition-all active:scale-95 shadow-lg"
              >
                <div className={`${stat.color} mb-3 text-xl group-hover:scale-125 transition-transform duration-300`}>
                  <i className={`fa-solid ${stat.icon}`}></i>
                </div>
                <div className="text-3xl font-black text-white mb-1">
                  {stat.val}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest group-hover:text-sky-300 transition-colors">
                  {stat.label}
                </div>
              </button>
            ))}
          </div>

          <div ref={mapRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                <button 
                  onClick={() => setViewMode('network')}
                  className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'network' ? 'bg-[#0ea5e9] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Matriz de Poder
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-[#facc15] text-blue-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Mapa Paipa
                </button>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-[#0ea5e9]">
                  <span className="w-2 h-0.5 bg-[#0ea5e9]"></span> FLUJO ECONÓMICO
                </span>
                <span className="flex items-center gap-1 text-[#facc15]">
                  <span className="w-2 h-0.5 border-t border-dashed border-[#facc15]"></span> LEALTAD 102
                </span>
              </div>
            </div>
            
            {viewMode === 'network' ? (
              <NetworkGraph 
                nodes={ACTORS} 
                links={RELATIONS} 
                onNodeClick={onNodeClick} 
              />
            ) : (
              <ElectoralView 
                zones={MOCK_ZONES} 
                onZoneClick={(z) => console.log(z)} 
              />
            )}
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

        <aside className="lg:sticky lg:top-8 h-fit space-y-6">
          <AnalysisPanel selectedActor={selectedActor} />

          <div className="bg-[#1e3a8a] p-6 rounded-2xl border border-blue-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-sky-400 uppercase tracking-widest">Estado Operativo</h4>
              <span className="bg-emerald-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black animate-pulse">ACTIVO</span>
            </div>
            <p className="text-xs text-blue-100/70 leading-relaxed italic">
              "Control de base electoral 102 en sectores de minería y comercio para asegurar la victoria legislativa de Eduar Triana."
            </p>
            <div className="pt-4 border-t border-blue-800 flex items-center justify-center">
               <div className="bg-white p-5 rounded-xl flex items-center gap-4 border border-slate-200 shadow-lg">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-blue-900 uppercase opacity-40 leading-none mb-1">Candidato</span>
                    <span className="text-sm font-black text-blue-900 uppercase tracking-tight">Eduar Triana</span>
                    <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest">Boyacá 102</span>
                  </div>
                  <div className="w-12 h-12 bg-[#facc15] rounded flex items-center justify-center text-2xl font-black text-blue-900 italic shadow-md">
                    102
                  </div>
               </div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="mt-20 pt-8 border-t border-slate-900 text-slate-600 text-[10px] text-center max-w-3xl mx-auto space-y-2">
        <p className="font-black tracking-[0.3em] text-blue-600 uppercase">War Room Paipa - Centro de Comando 102</p>
        <p>CAMPAÑA EDUAR TRIANA - CÁMARA DE REPRESENTANTES</p>
        <p>© 2024 Visualización Territorio Ganador</p>
      </footer>
    </div>
  );
};

export default App;
