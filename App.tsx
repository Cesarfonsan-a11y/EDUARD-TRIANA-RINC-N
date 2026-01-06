
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ACTORS, RELATIONS, SECTOR_MESSAGES } from './constants.ts';
import { ActorNode, VoteRecord, ElectoralZone } from './types.ts';
import NetworkGraph from './components/NetworkGraph.tsx';
import AnalysisPanel from './components/AnalysisPanel.tsx';
import VoteRegistry from './components/VoteRegistry.tsx';
import ElectoralStats from './components/ElectoralStats.tsx';
import ElectoralView from './components/ElectoralView.tsx';
import ThankYouModal from './components/ThankYouModal.tsx';
import DatabaseView from './components/DatabaseView.tsx';
import { syncWithCloud } from './services/syncService.ts';

const App: React.FC = () => {
  // Inicialización con persistencia local
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>(() => {
    const saved = localStorage.getItem('paipa_triana_v6_cache');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedActor, setSelectedActor] = useState<ActorNode | null>(null);
  const [viewMode, setViewMode] = useState<'network' | 'participation' | 'database'>('network');
  const [lastRecord, setLastRecord] = useState<VoteRecord | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  
  // Referencia siempre actualizada para evitar cierres de ámbito (closures) en el interval
  const recordsRef = useRef<VoteRecord[]>(voteRecords);

  useEffect(() => {
    recordsRef.current = voteRecords;
    localStorage.setItem('paipa_triana_v6_cache', JSON.stringify(voteRecords));
  }, [voteRecords]);

  const [isCollectorViewActive, setIsCollectorViewActive] = useState(() => {
    return localStorage.getItem('v102_collector_active') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('v102_collector_active', isCollectorViewActive.toString());
  }, [isCollectorViewActive]);

  /**
   * SINCRONIZADOR MAESTRO
   * Se ejecuta cada 2.5 segundos para reflejar cambios de otros dispositivos
   */
  const performGlobalSync = useCallback(async (manualData?: VoteRecord[]) => {
    if (isSyncing && !manualData) return;
    
    setIsSyncing(true);
    try {
      const dataToSync = manualData || recordsRef.current;
      const globalData = await syncWithCloud(dataToSync);
      
      // Solo actualizamos el estado si el número de registros cambió
      if (globalData && globalData.length !== recordsRef.current.length) {
        setVoteRecords(globalData);
        setHasNewActivity(true);
        setTimeout(() => setHasNewActivity(false), 2000);
      }
    } catch (e) {
      console.error("Error en pulso de sincronización");
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Loop de tiempo real
  useEffect(() => {
    performGlobalSync();
    const timer = setInterval(() => performGlobalSync(), 2500);
    return () => clearInterval(timer);
  }, [performGlobalSync]);

  /**
   * ACCIÓN DE REGISTRO
   */
  const handleAddVoteRecord = async (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    // Evitar duplicados rápidos
    if (voteRecords.some(r => r.idNumber === record.idNumber)) {
      alert("⚠️ Esta persona ya se encuentra registrada.");
      return;
    }

    const newEntry: VoteRecord = {
      ...record,
      id: `v102-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now()
    };
    
    // 1. Actualización inmediata local
    const nextList = [newEntry, ...voteRecords];
    setVoteRecords(nextList);
    setLastRecord(newEntry);
    
    // 2. Push forzado a la nube
    await performGlobalSync(nextList);
  };

  if (isCollectorViewActive) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center animate-in fade-in duration-500 pb-12 overflow-x-hidden">
        {lastRecord && (
          <ThankYouModal 
            voterName={lastRecord.voterName} 
            actorId={lastRecord.actorId}
            voterCount={voteRecords.length}
            phoneNumber={lastRecord.phoneNumber}
            onClose={() => setLastRecord(null)} 
          />
        )}

        <div className="max-w-md w-full px-6 pt-10 space-y-8">
          <header className="text-center space-y-4">
            <div className="relative inline-block">
               <div className={`flex items-center gap-3 px-6 py-3 rounded-full border shadow-2xl transition-all duration-500 ${hasNewActivity ? 'bg-amber-400 border-amber-300 scale-110 text-blue-950 ring-8 ring-amber-400/20' : 'bg-blue-900/40 border-blue-500/30 text-white'}`}>
                  <div className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSyncing ? 'bg-amber-500' : 'bg-emerald-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isSyncing ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  </div>
                  <span className="text-sm font-black uppercase tracking-[0.2em]">
                    VOTOS GLOBALES: {voteRecords.length}
                  </span>
               </div>
            </div>
            <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
              TRIANA <span className="text-amber-400">102</span>
            </h1>
          </header>

          <div className="bg-slate-900/60 rounded-[3.5rem] border border-slate-800 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-blue-700 via-amber-400 to-blue-700"></div>
            <VoteRegistry 
              actors={ACTORS} 
              records={[]} 
              onAddRecord={handleAddVoteRecord} 
              onDeleteRecord={() => {}} 
              isPublic={true} 
            />
          </div>
          
          <button 
            onClick={() => {
              const code = prompt("🔑 CONTRASEÑA ESTRATÉGICA:");
              if(code === "102") setIsCollectorViewActive(false);
            }}
            className="w-full text-slate-700 py-6 text-[10px] font-black uppercase tracking-[0.6em] hover:text-amber-400 transition-colors"
          >
            Modo Recolector Activo • Cloud V6
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-12 animate-in fade-in duration-700">
      <header className="bg-white rounded-[4rem] overflow-hidden shadow-[0_60px_100px_-30px_rgba(0,0,0,0.5)] border border-slate-100 flex flex-col md:flex-row min-h-[350px] relative">
        <div className="md:w-[38%] bg-amber-400 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-[0.05] flex items-center justify-center rotate-12 pointer-events-none scale-150">
              <span className="text-[30rem] font-black text-blue-900 leading-none">102</span>
           </div>
           <h2 className="text-7xl font-black text-blue-950 italic leading-[0.8] uppercase tracking-tighter z-10">#POR TI BOYACÁ</h2>
        </div>
        <div className="md:w-[62%] p-10 md:p-14 flex flex-col justify-center relative bg-slate-50">
          <div className="flex justify-between items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-blue-900 text-white px-4 py-1.5 font-black rounded-xl text-[10px] shadow-lg tracking-widest uppercase">Centro Democrático</span>
                {isSyncing && <span className="text-amber-500 animate-pulse text-[10px] font-black uppercase tracking-widest"><i className="fa-solid fa-cloud-arrow-up mr-2"></i>Sincronizando...</span>}
              </div>
              <h1 className="text-blue-950 font-black text-8xl md:text-[11rem] tracking-tighter uppercase leading-[0.7]">TRIANA</h1>
              <span className="text-sky-500 font-black text-3xl md:text-6xl uppercase tracking-[0.2em] block italic">CÁMARA 102</span>
            </div>
            <button 
              onClick={() => setIsCollectorViewActive(true)}
              className="bg-blue-950 text-white p-10 rounded-[3.5rem] shadow-2xl hover:scale-110 transition-all border-b-8 border-amber-500 active:translate-y-2 active:border-b-4 group"
            >
              <i className="fa-solid fa-tower-broadcast text-5xl text-amber-400 group-hover:rotate-12 transition-transform"></i>
            </button>
          </div>
        </div>
      </header>

      {/* CONTADOR MAESTRO EN TIEMPO REAL */}
      <ElectoralStats currentVotes={voteRecords.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="bg-slate-900/40 p-2 rounded-[4rem] border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden relative">
            <div className="flex p-4 gap-3">
              <button onClick={() => setViewMode('network')} className={`flex-1 py-6 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'network' ? 'bg-sky-500 text-white shadow-2xl scale-105' : 'text-slate-500 hover:bg-slate-800'}`}>Mapa de Influencia</button>
              <button onClick={() => setViewMode('participation')} className={`flex-1 py-6 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'participation' ? 'bg-red-500 text-white shadow-2xl scale-105' : 'text-slate-500 hover:bg-slate-800'}`}>Metas Paipa</button>
              <button onClick={() => setViewMode('database')} className={`flex-1 py-6 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'database' ? 'bg-amber-400 text-blue-900 shadow-2xl scale-105' : 'text-slate-500 hover:bg-slate-800'}`}>Base Global</button>
            </div>
            <div className="h-[550px]">
               {viewMode === 'network' ? <NetworkGraph nodes={ACTORS} links={RELATIONS} onNodeClick={setSelectedActor} /> :
                viewMode === 'participation' ? <ElectoralView records={voteRecords} actors={ACTORS} /> :
                <DatabaseView records={voteRecords} actors={ACTORS} onDeleteRecord={id => setVoteRecords(prev => prev.filter(v => v.id !== id))} />}
            </div>
          </div>
          <VoteRegistry actors={ACTORS} records={voteRecords} onAddRecord={handleAddVoteRecord} onDeleteRecord={id => setVoteRecords(prev => prev.filter(v => v.id !== id))} />
        </div>
        <aside className="space-y-12">
          <AnalysisPanel selectedActor={selectedActor} />
          <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-slate-800 text-center space-y-8 shadow-2xl relative overflow-hidden">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center border-4 transition-all duration-700 bg-white/5 ${isSyncing ? 'border-amber-400 shadow-[0_0_80px_rgba(245,158,11,0.7)] scale-110 rotate-12' : 'border-emerald-500'}`}>
               <i className={`fa-solid ${isSyncing ? 'fa-satellite-dish animate-pulse' : 'fa-network-wired'} text-6xl ${isSyncing ? 'text-amber-400' : 'text-emerald-500'}`}></i>
            </div>
            <div className="space-y-3">
              <p className="text-white font-black uppercase text-base tracking-widest">{isSyncing ? 'CONSOLIDANDO DATOS...' : 'SISTEMA ONLINE'}</p>
              <div className="h-1.5 w-16 bg-amber-400 mx-auto rounded-full"></div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.4em]">Boyacá • Central Paipa</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default App;
