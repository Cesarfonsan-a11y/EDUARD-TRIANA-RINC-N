
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ACTORS, RELATIONS } from './constants.ts';
import { ActorNode, VoteRecord, ElectoralZone } from './types.ts';
import NetworkGraph from './components/NetworkGraph.tsx';
import AnalysisPanel from './components/AnalysisPanel.tsx';
import VoteRegistry from './components/VoteRegistry.tsx';
import ElectoralStats from './components/ElectoralStats.tsx';
import ElectoralView from './components/ElectoralView.tsx';
import ThankYouModal from './components/ThankYouModal.tsx';
import { syncWithCloud } from './services/syncService.ts';

// Zonas simuladas de Paipa
const MOCK_ZONES: ElectoralZone[] = [
  { id: 'z1', name: 'Barrio El Rosario', votePercentage: 65, workerDensity: 80 },
  { id: 'z2', name: 'Vereda Palermo', votePercentage: 45, workerDensity: 90 },
  { id: 'z3', name: 'Centro Paipa', votePercentage: 30, workerDensity: 20 },
  { id: 'z4', name: 'Vereda Salitre', votePercentage: 55, workerDensity: 70 },
];

const App: React.FC = () => {
  const [selectedActor, setSelectedActor] = useState<ActorNode | null>(null);
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>(() => {
    // Carga inicial desde localStorage para evitar perder datos al recargar
    const saved = localStorage.getItem('base_102_local');
    return saved ? JSON.parse(saved) : [];
  });
  const [viewMode, setViewMode] = useState<'network' | 'map'>('network');
  const [lastRegisteredName, setLastRegisteredName] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Referencia para evitar cierres obsoletos en los intervalos de sincronización
  const recordsRef = useRef<VoteRecord[]>(voteRecords);
  
  // Actualizar la referencia y localStorage cada vez que cambien los registros
  useEffect(() => {
    recordsRef.current = voteRecords;
    localStorage.setItem('base_102_local', JSON.stringify(voteRecords));
  }, [voteRecords]);

  // EFECTO DE SINCRONIZACIÓN PERIÓDICA (Corregido)
  useEffect(() => {
    const performSync = async () => {
      if (isSyncing) return;
      setIsSyncing(true);
      try {
        const currentLocal = recordsRef.current;
        const syncedData = await syncWithCloud(currentLocal);
        
        // Solo actualizamos si hay cambios reales para evitar re-renders infinitos
        if (JSON.stringify(syncedData) !== JSON.stringify(currentLocal)) {
          setVoteRecords(syncedData);
        }
      } catch (err) {
        console.error("Fallo de sync en intervalo:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    // Sincronización inicial
    performSync();
    
    // Polling cada 15 segundos para mantener a todos los usuarios al día
    const interval = setInterval(performSync, 15000);
    return () => clearInterval(interval);
  }, []);

  const onNodeClick = useCallback((node: ActorNode) => {
    setSelectedActor(node);
  }, []);

  const handleAddVoteRecord = async (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    const newRecord: VoteRecord = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    // Actualización inmediata del estado para feedback visual
    setVoteRecords(prev => [newRecord, ...prev]);
    setLastRegisteredName(record.voterName); 

    // Forzar sincronización inmediata con los nuevos datos
    setIsSyncing(true);
    try {
      const currentFullList = [newRecord, ...recordsRef.current];
      const synced = await syncWithCloud(currentFullList);
      setVoteRecords(synced);
    } catch (err) {
      console.error("Error al sincronizar nuevo registro:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteVoteRecord = async (id: string) => {
    const updated = voteRecords.filter(r => r.id !== id);
    setVoteRecords(updated);
    
    setIsSyncing(true);
    try {
      await syncWithCloud(updated);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleMetricClick = (type: string) => {
    if (type === 'voters') {
      registryRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (type === 'sectors' || type === 'relations') {
      mapRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    setSelectedActor(null);
  };

  const registryRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

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

      {/* HEADER */}
      <header className="relative bg-white rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] flex flex-col md:flex-row h-auto md:h-[320px] border border-slate-100 group">
        <div className="md:w-[28%] relative bg-gradient-to-br from-[#facc15] to-[#eab308] flex items-center justify-center overflow-hidden min-h-[160px] md:min-h-0">
          <div className="absolute top-0 right-0 h-full w-full bg-white transform translate-x-1/2 -skew-x-[15deg] z-10 hidden md:block"></div>
          <div className="relative z-30 text-center transform md:-rotate-2">
            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter drop-shadow-xl flex flex-col leading-none mb-2">
              <span className="text-blue-900">#POR TÍ</span>
              <span className="text-[#0ea5e9]">BOYACÁ</span>
            </h2>
            <div className="h-1.5 w-full bg-blue-900/20 mt-4 rounded-full overflow-hidden px-10">
               <div className="h-full bg-blue-900 w-1/2 rounded-full"></div>
            </div>
          </div>
          <div className="absolute bottom-0 w-full z-40 bg-[#0ea5e9] py-3 text-center overflow-hidden">
             <span className="relative text-white font-black text-[10px] md:text-xs tracking-[0.5em] uppercase italic">VOTA ASÍ A LA CÁMARA</span>
          </div>
        </div>

        <div className="md:w-[72%] bg-white p-6 md:px-14 flex flex-col justify-center relative overflow-hidden pt-12 md:pt-6">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, #1e3a8a 1.2px, transparent 1.2px)', backgroundSize: '30px 30px' }}>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 h-full">
            <div className="flex flex-col items-center md:items-start flex-1 w-full md:w-auto">
              <div className="bg-[#1e3a8a] text-white px-8 md:px-10 py-1.5 font-black text-lg md:text-xl shadow-[0_10px_20px_rgba(30,58,138,0.2)] transform -skew-x-12 mb-4 md:mb-6 inline-block mt-2">
                YO VOTO
              </div>
              <div className="flex flex-col space-y-1 md:space-y-2 text-center md:text-left">
                <span className="text-[#1e3a8a] font-black text-3xl md:text-5xl tracking-tighter uppercase md:ml-2 drop-shadow-sm">EDUAR</span>
                <h1 className="text-[#1e3a8a] font-black text-5xl md:text-7xl lg:text-[8.5rem] tracking-tighter uppercase leading-[0.8] mb-2 md:mb-4">TRIANA</h1>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center relative scale-90 md:scale-95 lg:scale-100 mt-2 md:mt-0 md:pr-4">
              <div className="relative">
                <span className="absolute inset-0 text-[5.5rem] md:text-[9rem] lg:text-[11rem] font-black text-[#1e3a8a] leading-none italic translate-x-1 translate-y-1 md:translate-x-2 md:translate-y-2 opacity-80">102</span>
                <span className="relative text-[5.5rem] md:text-[9rem] lg:text-[11rem] font-black text-[#facc15] leading-none italic">102</span>
              </div>
              <div className="flex items-center gap-3 md:gap-4 -mt-3 md:-mt-6">
                <div className="h-[2px] md:h-[3px] w-6 md:w-10 bg-[#0ea5e9]"></div>
                <span className="text-[#0ea5e9] font-black text-xl md:text-4xl lg:text-5xl tracking-[0.1em] uppercase">CÁMARA</span>
                <div className="h-[2px] md:h-[3px] w-6 md:w-10 bg-[#0ea5e9]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Indicator */}
        <div className="absolute top-4 right-6 hidden lg:block z-50">
           <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors ${isSyncing ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
             <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`}></span>
             {isSyncing ? 'SINCRONIZANDO...' : 'EQUIPO CONECTADO'}
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
            </div>
            
            {viewMode === 'network' ? (
              <NetworkGraph nodes={ACTORS} links={RELATIONS} onNodeClick={onNodeClick} />
            ) : (
              <ElectoralView zones={MOCK_ZONES} onZoneClick={(z) => console.log(z)} />
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
          <div className="bg-[#1e3a8a] p-6 rounded-2xl border border-blue-700 shadow-xl space-y-4 text-center">
            <h4 className="text-xs font-black text-sky-400 uppercase tracking-widest">Estado Multi-usuario</h4>
            <p className="text-xs text-blue-100/70 leading-relaxed italic">
              Toda tu información está protegida localmente y se comparte con el equipo automáticamente.
            </p>
            <div className="bg-white/10 p-4 rounded-xl border border-white/10 mt-2">
               <span className="text-[10px] font-bold text-white uppercase block mb-1">Último Voto Registrado</span>
               <span className="text-sm font-black text-amber-400 uppercase tracking-tight">
                 {voteRecords[0]?.voterName || 'Buscando datos...'}
               </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default App;
