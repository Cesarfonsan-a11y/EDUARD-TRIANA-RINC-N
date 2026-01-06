
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

const generateSafeId = () => {
  return 'v102-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
};

const App: React.FC = () => {
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>(() => {
    const saved = localStorage.getItem('paipa_102_v13_db');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedActor, setSelectedActor] = useState<ActorNode | null>(null);
  const [viewMode, setViewMode] = useState<'network' | 'participation' | 'database'>('network');
  const [lastRecord, setLastRecord] = useState<VoteRecord | null>(null);
  const [currentVoterNumber, setCurrentVoterNumber] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [isAnimatingLogo, setIsAnimatingLogo] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [isCollectorViewActive, setIsCollectorViewActive] = useState(() => {
    const isParam = window.location.search.includes('mode=recolector') || window.location.hash.includes('mode=recolector');
    const isSaved = localStorage.getItem('v102_collector_active') === 'true';
    return isParam || isSaved;
  });

  useEffect(() => {
    localStorage.setItem('paipa_102_v13_db', JSON.stringify(voteRecords));
  }, [voteRecords]);

  useEffect(() => {
    localStorage.setItem('v102_collector_active', isCollectorViewActive.toString());
  }, [isCollectorViewActive]);

  useEffect(() => {
    const performSync = async () => {
      if (isSyncing) return;
      setIsSyncing(true);
      try {
        const synced = await syncWithCloud(voteRecords);
        if (synced && Array.isArray(synced)) {
          setVoteRecords(synced);
        }
      } catch (e) {
        console.warn("Sync deferred");
      } finally {
        setTimeout(() => setIsSyncing(false), 3000);
      }
    };

    performSync();
    const interval = setInterval(performSync, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAddVoteRecord = async (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    const newRecord: VoteRecord = {
      ...record,
      id: generateSafeId(),
      timestamp: Date.now()
    };
    
    // Calculamos el nuevo total antes de actualizar el estado para pasarlo al modal
    const nextCount = voteRecords.length + 1;
    setCurrentVoterNumber(nextCount);
    
    const updated = [newRecord, ...voteRecords];
    setVoteRecords(updated);
    setLastRecord(newRecord); 
    syncWithCloud(updated).catch(() => {});
  };

  const handleAdminAccess = useCallback(() => {
    const code = prompt("🔑 MODO ADMINISTRADOR\nIngrese código de seguridad:");
    if (code === "102") {
      setIsCollectorViewActive(false);
      setTapCount(0);
    } else if (code !== null) {
      alert("Acceso denegado");
      setTapCount(0);
    }
  }, []);

  const handleLogoTap = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    setIsAnimatingLogo(true);
    if ('vibrate' in navigator) navigator.vibrate(40);
    setTimeout(() => setIsAnimatingLogo(false), 100);
    
    const newCount = tapCount + 1;
    if (newCount >= 3) {
      setTapCount(0);
      handleAdminAccess();
    } else {
      setTapCount(newCount);
      timerRef.current = setTimeout(() => setTapCount(0), 1000);
    }
  };

  if (isCollectorViewActive) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center animate-in fade-in duration-500 selection:bg-amber-500/30 overflow-x-hidden">
        {lastRecord && (
          <ThankYouModal 
            voterName={lastRecord.voterName} 
            actorId={lastRecord.actorId}
            voterCount={currentVoterNumber}
            phoneNumber={lastRecord.phoneNumber}
            onClose={() => setLastRecord(null)} 
          />
        )}

        <div className="max-w-md w-full px-6 pt-8 pb-20 space-y-8">
          <header className="text-center space-y-4">
            <div className="flex flex-col items-center gap-3">
               <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-lg border border-white/10 animate-pulse">
                  <i className="fa-solid fa-satellite-dish"></i>
                  CAPTACIÓN ACTIVA
               </div>
               <div className="bg-blue-900/50 px-3 py-1 rounded-lg border border-blue-500/30">
                  <span className="text-sky-400 font-black text-[10px] uppercase">Registrados: {voteRecords.length}</span>
               </div>
            </div>
            
            <div 
              className={`select-none transition-all duration-75 active:scale-95 cursor-pointer py-2 ${isAnimatingLogo ? 'opacity-50' : 'opacity-100'}`} 
              onClick={handleLogoTap}
            >
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">
                TRIANA <span className="text-[#facc15] font-black">102</span>
              </h1>
              <div className="h-1 mx-auto rounded-full mt-2 w-12 bg-slate-800"></div>
            </div>
          </header>

          <div className="bg-slate-900/60 rounded-[2.5rem] border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            <VoteRegistry 
              actors={ACTORS} 
              records={[]} 
              onAddRecord={handleAddVoteRecord} 
              onDeleteRecord={() => {}} 
              isPublic={true} 
            />
          </div>

          <div className="text-center opacity-30">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Paipa, Boyacá • Red Triana 102</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-10 pb-20 animate-in fade-in duration-700 overflow-x-hidden">
      {lastRecord && (
        <ThankYouModal 
          voterName={lastRecord.voterName} 
          actorId={lastRecord.actorId}
          voterCount={currentVoterNumber}
          phoneNumber={lastRecord.phoneNumber}
          onClose={() => setLastRecord(null)} 
        />
      )}

      <header className="relative bg-white rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-100">
        <div className="md:w-[32%] bg-[#facc15] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
           <h2 className="text-3xl md:text-5xl font-black text-blue-900 italic leading-none z-10 uppercase">#POR TI BOYACÁ</h2>
        </div>
        <div className="md:w-[68%] p-6 md:p-12 flex flex-col justify-center relative bg-slate-50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="bg-blue-900 text-white px-4 py-1 font-black rounded-lg text-[10px] inline-block mb-2 shadow-lg">CENTRO DEMOCRÁTICO</span>
              <h1 className="text-blue-950 font-black text-5xl md:text-[8rem] tracking-tighter uppercase leading-[0.85]">TRIANA</h1>
              <span className="text-sky-600 font-black text-xl md:text-4xl uppercase tracking-[0.2em] block italic">CÁMARA</span>
            </div>
            <div className="relative">
              <span className="text-8xl md:text-[12rem] font-black text-amber-400 italic leading-none drop-shadow-xl">102</span>
            </div>
          </div>
          
          <div className="md:absolute md:top-8 md:right-8 mt-6 md:mt-0">
            <button 
              onClick={() => setIsCollectorViewActive(true)} 
              className="w-full md:w-auto bg-blue-900 hover:bg-blue-950 text-white px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 border border-white/10"
            >
              <i className="fa-solid fa-mobile-screen-button text-amber-400"></i>
              <span className="font-black uppercase text-[10px] tracking-wider">Modo Recolector</span>
            </button>
          </div>
        </div>
      </header>

      <ElectoralStats currentVotes={voteRecords.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 p-1.5 rounded-[2.5rem] border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex p-2 gap-2 overflow-x-auto scrollbar-hide">
              <button onClick={() => setViewMode('network')} className={`flex-1 min-w-[100px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'network' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>Red</button>
              <button onClick={() => setViewMode('participation')} className={`flex-1 min-w-[100px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'participation' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>Avance</button>
              <button onClick={() => setViewMode('database')} className={`flex-1 min-w-[100px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'database' ? 'bg-amber-400 text-blue-950 shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>Datos</button>
            </div>
            <div className="relative overflow-hidden rounded-[2rem]">
               {viewMode === 'network' ? (
                 <NetworkGraph nodes={ACTORS} links={RELATIONS} onNodeClick={setSelectedActor} />
               ) : viewMode === 'participation' ? (
                 <ElectoralView records={voteRecords} actors={ACTORS} />
               ) : (
                 <DatabaseView records={voteRecords} actors={ACTORS} onDeleteRecord={id => setVoteRecords(r => r.filter(v => v.id !== id))} />
               )}
            </div>
          </div>
          <VoteRegistry actors={ACTORS} records={voteRecords} onAddRecord={handleAddVoteRecord} onDeleteRecord={id => setVoteRecords(r => r.filter(v => v.id !== id))} />
        </div>
        <aside className="space-y-8">
          <AnalysisPanel selectedActor={selectedActor} />
          <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-800 text-center space-y-6 backdrop-blur-xl">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2 ${isSyncing ? 'border-amber-500' : 'border-emerald-500'} bg-white/5`}>
               <i className={`fa-solid ${isSyncing ? 'fa-sync fa-spin' : 'fa-check'} text-2xl ${isSyncing ? 'text-amber-400' : 'text-emerald-400'}`}></i>
            </div>
            <h4 className="text-white font-black uppercase text-[10px] tracking-[0.2em]">Sincronización Activa</h4>
          </div>
        </aside>
      </div>

      <footer className="pt-10 pb-6 text-center opacity-20">
        <p className="text-[8px] text-slate-500 uppercase tracking-widest">Control Estratégico Boyacá • v1.6</p>
      </footer>
    </div>
  );
};

export default App;
