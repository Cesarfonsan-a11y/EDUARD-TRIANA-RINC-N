
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
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>(() => {
    const saved = localStorage.getItem('paipa_triana_v5_cache');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedActor, setSelectedActor] = useState<ActorNode | null>(null);
  const [viewMode, setViewMode] = useState<'network' | 'participation' | 'database'>('network');
  const [lastRecord, setLastRecord] = useState<VoteRecord | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  
  // Referencia para acceder al estado más reciente dentro de funciones asíncronas
  const recordsRef = useRef<VoteRecord[]>(voteRecords);

  useEffect(() => {
    recordsRef.current = voteRecords;
    localStorage.setItem('paipa_triana_v5_cache', JSON.stringify(voteRecords));
  }, [voteRecords]);

  const [isCollectorViewActive, setIsCollectorViewActive] = useState(() => {
    const isParam = window.location.search.includes('mode=recolector');
    return isParam || localStorage.getItem('v102_collector_active') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('v102_collector_active', isCollectorViewActive.toString());
  }, [isCollectorViewActive]);

  /**
   * FUNCIÓN MAESTRA DE SINCRONIZACIÓN
   */
  const performSync = useCallback(async (forcedRecords?: VoteRecord[]) => {
    if (isSyncing && !forcedRecords) return;
    
    setIsSyncing(true);
    try {
      const currentData = forcedRecords || recordsRef.current;
      const globalData = await syncWithCloud(currentData);
      
      // Actualizar estado solo si hay cambios reales para evitar re-renders infinitos
      if (globalData && globalData.length !== recordsRef.current.length) {
        setVoteRecords(globalData);
        setHasNewActivity(true);
        setTimeout(() => setHasNewActivity(false), 2000);
      }
    } catch (e) {
      console.error("Falla de sincronización temporal");
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // INTERVALO DE ESCUCHA (3 SEGUNDOS)
  useEffect(() => {
    performSync();
    const interval = setInterval(() => performSync(), 3000);
    return () => clearInterval(interval);
  }, []);

  /**
   * REGISTRO DE VOTO CON EMPUJE INMEDIATO
   */
  const handleAddVoteRecord = async (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    // Verificación de duplicados local rápida
    const isDuplicate = voteRecords.some(r => r.idNumber === record.idNumber);
    if (isDuplicate) {
      alert("🛑 ERROR: Esta cédula ya se encuentra en la base de datos.");
      return;
    }

    const newRecord: VoteRecord = {
      ...record,
      id: 'v102-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      timestamp: Date.now()
    };
    
    // 1. Actualización Visual Inmediata (Optimista)
    const updated = [newRecord, ...voteRecords];
    setVoteRecords(updated);
    setLastRecord(newRecord);
    
    // 2. EMPUJE FORZADO (Sin esperar al intervalo)
    await performSync(updated);
  };

  if (isCollectorViewActive) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center animate-in fade-in duration-500 overflow-x-hidden pb-10">
        {lastRecord && (
          <ThankYouModal 
            voterName={lastRecord.voterName} 
            actorId={lastRecord.actorId}
            voterCount={voteRecords.length}
            phoneNumber={lastRecord.phoneNumber}
            onClose={() => setLastRecord(null)} 
          />
        )}

        <div className="max-w-md w-full px-6 pt-8 space-y-6">
          <header className="text-center space-y-4">
            <div className={`transition-all duration-300 transform ${hasNewActivity ? 'scale-110' : 'scale-100'}`}>
               <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full border shadow-2xl transition-all ${hasNewActivity ? 'bg-amber-400 border-amber-300 text-blue-950 ring-8 ring-amber-400/20' : 'bg-blue-900/40 border-blue-500/30 text-white'}`}>
                  <div className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSyncing ? 'bg-amber-500' : 'bg-emerald-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isSyncing ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em]">
                    RED 102 EN VIVO: {voteRecords.length}
                  </span>
               </div>
            </div>
            <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
              TRIANA <span className="text-amber-400">102</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Plataforma de Consolidación Paipa</p>
          </header>

          <div className="bg-slate-900/60 rounded-[3.5rem] border border-slate-800 shadow-[0_0_80px_-20px_rgba(30,58,138,0.6)] backdrop-blur-xl relative overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-blue-700 via-amber-400 to-blue-700 animate-shimmer"></div>
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
              const code = prompt("🔑 ACCESO ESTRATÉGICO:");
              if(code === "102") setIsCollectorViewActive(false);
            }}
            className="w-full text-slate-700 py-8 text-[10px] font-black uppercase tracking-[0.6em] active:text-amber-400 transition-colors"
          >
            Sincronización Cloud-Live v5.0
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
      <header className="bg-white rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-30px_rgba(0,0,0,0.4)] border border-slate-100 flex flex-col md:flex-row min-h-[320px] relative">
        <div className="md:w-[38%] bg-amber-400 flex items-center justify-center p-12 text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-[0.08] flex items-center justify-center rotate-12 pointer-events-none scale-150">
              <span className="text-[25rem] font-black text-blue-900 leading-none">102</span>
           </div>
           <h2 className="text-6xl md:text-7xl font-black text-blue-950 italic leading-[0.85] uppercase tracking-tighter z-10">#POR TI BOYACÁ</h2>
        </div>
        <div className="md:w-[62%] p-10 md:p-14 flex flex-col justify-center relative bg-slate-50">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <span className="bg-blue-900 text-white px-4 py-1.5 font-black rounded-xl text-[10px] inline-block shadow-xl tracking-widest">CENTRO DEMOCRÁTICO</span>
              <h1 className="text-blue-950 font-black text-7xl md:text-[10rem] tracking-tighter uppercase leading-[0.75]">TRIANA</h1>
              <span className="text-sky-500 font-black text-3xl md:text-6xl uppercase tracking-[0.2em] block italic">CÁMARA 102</span>
            </div>
            <button 
              onClick={() => setIsCollectorViewActive(true)}
              className="bg-blue-950 text-white p-8 rounded-[3rem] shadow-2xl hover:scale-110 transition-all border-b-8 border-amber-500 active:translate-y-2 active:border-b-4"
            >
              <i className="fa-solid fa-satellite-dish text-4xl text-amber-400 animate-pulse"></i>
            </button>
          </div>
        </div>
      </header>

      {/* PANEL PRINCIPAL: ESTADÍSTICAS REACTIVAS */}
      <ElectoralStats currentVotes={voteRecords.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-slate-900/40 p-2 rounded-[4rem] border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden relative">
            {isSyncing && (
              <div className="absolute top-4 right-8 z-50 flex items-center gap-2 px-3 py-1 bg-amber-400 rounded-full text-blue-950 text-[9px] font-black animate-bounce">
                <i className="fa-solid fa-sync fa-spin"></i> SYNC
              </div>
            )}
            <div className="flex p-4 gap-3">
              <button onClick={() => setViewMode('network')} className={`flex-1 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'network' ? 'bg-sky-500 text-white shadow-2xl scale-105' : 'text-slate-500 hover:bg-slate-800'}`}>Red de Influencia</button>
              <button onClick={() => setViewMode('participation')} className={`flex-1 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'participation' ? 'bg-red-500 text-white shadow-2xl scale-105' : 'text-slate-500 hover:bg-slate-800'}`}>Meta Territorial</button>
              <button onClick={() => setViewMode('database')} className={`flex-1 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'database' ? 'bg-amber-400 text-blue-900 shadow-2xl scale-105' : 'text-slate-500 hover:bg-slate-800'}`}>Base de Datos</button>
            </div>
            <div className="h-[520px]">
               {viewMode === 'network' ? <NetworkGraph nodes={ACTORS} links={RELATIONS} onNodeClick={setSelectedActor} /> :
                viewMode === 'participation' ? <ElectoralView records={voteRecords} actors={ACTORS} /> :
                <DatabaseView records={voteRecords} actors={ACTORS} onDeleteRecord={id => setVoteRecords(r => r.filter(v => v.id !== id))} />}
            </div>
          </div>
          <VoteRegistry actors={ACTORS} records={voteRecords} onAddRecord={handleAddVoteRecord} onDeleteRecord={id => setVoteRecords(r => r.filter(v => v.id !== id))} />
        </div>
        <aside className="space-y-10">
          <AnalysisPanel selectedActor={selectedActor} />
          <div className="bg-slate-900/60 p-12 rounded-[3.5rem] border border-slate-800 text-center space-y-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center border-4 transition-all duration-700 ${isSyncing ? 'border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.6)] scale-110' : 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'} bg-white/5`}>
               <i className={`fa-solid ${isSyncing ? 'fa-tower-broadcast animate-pulse' : 'fa-check-double'} text-5xl ${isSyncing ? 'text-amber-400' : 'text-emerald-400'}`}></i>
            </div>
            <div className="space-y-2">
              <p className="text-white font-black uppercase text-sm tracking-widest">{isSyncing ? 'CONSOLIDANDO VOTOS...' : 'CONEXIÓN ESTABLE'}</p>
              <div className="h-1 w-12 bg-amber-400 mx-auto rounded-full"></div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Central de Operaciones Boyacá</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default App;
