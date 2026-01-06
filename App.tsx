
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
    const saved = localStorage.getItem('paipa_triana_v4_cache');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedActor, setSelectedActor] = useState<ActorNode | null>(null);
  const [viewMode, setViewMode] = useState<'network' | 'participation' | 'database'>('network');
  const [lastRecord, setLastRecord] = useState<VoteRecord | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const recordsRef = useRef<VoteRecord[]>(voteRecords);

  useEffect(() => {
    recordsRef.current = voteRecords;
    localStorage.setItem('paipa_triana_v4_cache', JSON.stringify(voteRecords));
  }, [voteRecords]);

  const [isCollectorViewActive, setIsCollectorViewActive] = useState(() => {
    return localStorage.getItem('v102_collector_active') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('v102_collector_active', isCollectorViewActive.toString());
  }, [isCollectorViewActive]);

  // SINCRONIZACIÓN ULTRA-RÁPIDA (3 SEGUNDOS)
  useEffect(() => {
    const performSync = async () => {
      if (isSyncing) return;
      setIsSyncing(true);
      try {
        const currentLocal = recordsRef.current;
        const globalData = await syncWithCloud(currentLocal);
        
        if (globalData && globalData.length !== currentLocal.length) {
          setVoteRecords(globalData);
          setHasNewActivity(true);
          setTimeout(() => setHasNewActivity(false), 2000);
        }
      } catch (e) {
        console.warn("Sync deferred");
      } finally {
        setIsSyncing(false);
      }
    };

    performSync();
    const interval = setInterval(performSync, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAddVoteRecord = async (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    const isDuplicate = voteRecords.some(r => r.idNumber === record.idNumber);
    if (isDuplicate) {
      alert("⚠️ Esta cédula ya está registrada.");
      return;
    }

    const newRecord: VoteRecord = {
      ...record,
      id: 'v-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      timestamp: Date.now()
    };
    
    const updated = [newRecord, ...voteRecords];
    setVoteRecords(updated);
    setLastRecord(newRecord);
    
    // Push inmediato
    syncWithCloud(updated).then(res => setVoteRecords(res)).catch(() => {});
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
               <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${hasNewActivity ? 'bg-amber-400 border-amber-300 text-blue-950' : 'bg-blue-900/50 border-blue-500/30 text-white'}`}>
                  <i className={`fa-solid fa-tower-broadcast ${isSyncing ? 'animate-pulse' : ''}`}></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    RED GLOBAL: {voteRecords.length}
                  </span>
               </div>
            </div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">
              TRIANA <span className="text-amber-400">102</span>
            </h1>
          </header>

          <div className="bg-slate-900/60 rounded-[3rem] border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-amber-400 to-blue-600"></div>
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
              const code = prompt("MODO ADMIN:");
              if(code === "102") setIsCollectorViewActive(false);
            }}
            className="w-full text-slate-700 py-4 text-[9px] font-black uppercase tracking-[0.4em]"
          >
            Acceso Estratégico
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <header className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row min-h-[300px]">
        <div className="md:w-[35%] bg-amber-400 flex items-center justify-center p-10">
           <h2 className="text-6xl font-black text-blue-950 italic leading-none uppercase tracking-tighter">#POR TI BOYACÁ</h2>
        </div>
        <div className="md:w-[65%] p-10 flex flex-col justify-center relative bg-slate-50">
          <div className="flex justify-between items-center">
            <div>
              <span className="bg-blue-900 text-white px-3 py-1 font-black rounded text-[9px] inline-block mb-3">CENTRO DEMOCRÁTICO</span>
              <h1 className="text-blue-950 font-black text-6xl md:text-9xl tracking-tighter uppercase leading-[0.8]">TRIANA</h1>
              <span className="text-sky-500 font-black text-2xl md:text-5xl uppercase tracking-widest block italic">CÁMARA 102</span>
            </div>
            <button 
              onClick={() => setIsCollectorViewActive(true)}
              className="bg-blue-950 text-white p-5 rounded-3xl shadow-xl hover:scale-105 transition-all"
            >
              <i className="fa-solid fa-mobile-screen-button text-3xl text-amber-400"></i>
            </button>
          </div>
        </div>
      </header>

      {/* ESTADÍSTICAS VINCULADAS AL CONTEO GLOBAL */}
      <ElectoralStats currentVotes={voteRecords.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 p-1.5 rounded-[3rem] border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden">
            <div className="flex p-3 gap-2">
              <button onClick={() => setViewMode('network')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'network' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500'}`}>RED</button>
              <button onClick={() => setViewMode('participation')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'participation' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500'}`}>AVANCE</button>
              <button onClick={() => setViewMode('database')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'database' ? 'bg-amber-400 text-blue-900 shadow-lg' : 'text-slate-500'}`}>BASE</button>
            </div>
            <div className="h-[450px]">
               {viewMode === 'network' ? <NetworkGraph nodes={ACTORS} links={RELATIONS} onNodeClick={setSelectedActor} /> :
                viewMode === 'participation' ? <ElectoralView records={voteRecords} actors={ACTORS} /> :
                <DatabaseView records={voteRecords} actors={ACTORS} onDeleteRecord={id => setVoteRecords(r => r.filter(v => v.id !== id))} />}
            </div>
          </div>
          <VoteRegistry actors={ACTORS} records={voteRecords} onAddRecord={handleAddVoteRecord} onDeleteRecord={id => setVoteRecords(r => r.filter(v => v.id !== id))} />
        </div>
        <aside className="space-y-8">
          <AnalysisPanel selectedActor={selectedActor} />
          <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-slate-800 text-center space-y-4">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center border-2 ${isSyncing ? 'border-amber-400 animate-pulse' : 'border-emerald-500'}`}>
               <i className={`fa-solid ${isSyncing ? 'fa-sync fa-spin' : 'fa-check'} text-3xl ${isSyncing ? 'text-amber-400' : 'text-emerald-500'}`}></i>
            </div>
            <p className="text-white font-black uppercase text-[10px] tracking-widest">{isSyncing ? 'CONSOLIDANDO...' : 'SISTEMA ONLINE'}</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default App;
