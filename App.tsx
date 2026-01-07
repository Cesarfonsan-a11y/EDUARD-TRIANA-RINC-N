
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ACTORS, RELATIONS } from './constants.ts';
import { ActorNode, VoteRecord } from './types.ts';
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
    const saved = localStorage.getItem('v102_v2_cache');
    return saved ? JSON.parse(saved) : [];
  });
  
  const recordsRef = useRef<VoteRecord[]>(voteRecords);
  const [lastSyncTime, setLastSyncTime] = useState<string>('--:--');
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const syncLock = useRef(false);

  useEffect(() => {
    recordsRef.current = voteRecords;
    localStorage.setItem('v102_v2_cache', JSON.stringify(voteRecords));
  }, [voteRecords]);

  const [isCollectorViewActive, setIsCollectorViewActive] = useState(() => {
    return localStorage.getItem('v102_collector_active') === 'true';
  });

  const performGlobalSync = async (forceData?: VoteRecord[]) => {
    if (syncLock.current && !forceData) return;
    syncLock.current = true;
    setIsSyncing(true);
    
    try {
      const dataToSync = forceData || recordsRef.current;
      const globalData = await syncWithCloud(dataToSync);
      
      if (globalData && Array.isArray(globalData)) {
        // Si la nube es diferente a mi estado actual, actualizo
        if (JSON.stringify(globalData) !== JSON.stringify(recordsRef.current)) {
          setVoteRecords(globalData);
          setHasNewActivity(true);
          setTimeout(() => setHasNewActivity(false), 2000);
        }
      }
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setIsSyncing(false);
      syncLock.current = false;
    }
  };

  useEffect(() => {
    // Sincronización agresiva al arrancar
    performGlobalSync();
    
    // Intervalo de chequeo cada 5 segundos
    const timer = setInterval(() => {
      performGlobalSync();
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  const handleAddVoteRecord = async (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    if (voteRecords.some(r => r.idNumber === record.idNumber)) {
      alert("⚠️ Esta cédula ya está registrada.");
      return;
    }

    const newEntry: VoteRecord = {
      ...record,
      id: `v102-${Date.now()}`,
      timestamp: Date.now()
    };
    
    const newList = [newEntry, ...voteRecords];
    setVoteRecords(newList);
    setLastRecord(newEntry);
    await performGlobalSync(newList);
  };

  const [selectedActor, setSelectedActor] = useState<ActorNode | null>(null);
  const [viewMode, setViewMode] = useState<'network' | 'participation' | 'database'>('network');
  const [lastRecord, setLastRecord] = useState<VoteRecord | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');

  const handleAdminAuth = (val: string) => {
    const newPass = adminPasscode + val;
    setAdminPasscode(newPass);
    if (newPass === "102") {
      setIsCollectorViewActive(false);
      setShowAdminLogin(false);
      setAdminPasscode('');
    } else if (newPass.length >= 3) {
      setAdminPasscode('');
    }
  };

  // VISTA COLECTOR (TELÉFONO)
  if (isCollectorViewActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center pb-20 overflow-x-hidden relative">
        <button onClick={() => setShowAdminLogin(true)} className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-slate-800 hover:text-amber-400 z-[100]"><i className="fa-solid fa-shield-halved text-xl"></i></button>

        {showAdminLogin && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl">
             <div className="bg-slate-900 border-2 border-amber-400/30 rounded-[3rem] p-10 w-full max-w-xs text-center space-y-8 shadow-2xl">
                <h3 className="text-white font-black uppercase text-xs tracking-widest">Panel Maestro</h3>
                <div className="flex justify-center gap-3">
                   {[0, 1, 2].map(i => <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${adminPasscode.length > i ? 'bg-amber-400 border-amber-400' : 'border-slate-700'}`}></div>)}
                </div>
                <div className="grid grid-cols-3 gap-4">
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
                     <button key={n} onClick={() => handleAdminAuth(n.toString())} className="w-full aspect-square bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-black text-white active:scale-90 transition-all">{n}</button>
                   ))}
                   <button onClick={() => { setShowAdminLogin(false); setAdminPasscode(''); }} className="col-span-2 bg-red-950 text-red-400 text-[10px] font-black uppercase rounded-2xl">Salir</button>
                </div>
             </div>
          </div>
        )}

        {lastRecord && <ThankYouModal voterName={lastRecord.voterName} actorId={lastRecord.actorId} voterCount={voteRecords.length} phoneNumber={lastRecord.phoneNumber} onClose={() => setLastRecord(null)} />}

        <div className="max-w-md w-full px-4 pt-6 space-y-6">
          <header className="text-center space-y-3">
             <div onClick={() => performGlobalSync()} className={`cursor-pointer inline-flex flex-col items-center gap-1 px-6 py-2 rounded-3xl border transition-all ${hasNewActivity ? 'bg-amber-400 border-amber-300 text-blue-950 scale-105' : 'bg-blue-900/40 border-blue-500/30 text-white'}`}>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                   <span className="text-[11px] font-black uppercase tracking-widest">TOTAL RED: {voteRecords.length}</span>
                </div>
                <span className="text-[7px] opacity-60 font-bold uppercase">Sincronizado: {lastSyncTime}</span>
             </div>
             <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">TRIANA <span className="text-amber-400">102</span></h1>
          </header>
          <div className="bg-slate-900/80 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-amber-400 to-blue-700"></div>
            <VoteRegistry actors={ACTORS} records={voteRecords} onAddRecord={handleAddVoteRecord} onDeleteRecord={() => {}} isPublic={true} />
          </div>
        </div>
      </div>
    );
  }

  // VISTA DASHBOARD (COMPUTADOR)
  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 pb-24">
      <header className="bg-white rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row min-h-[350px] relative">
        <div onClick={() => performGlobalSync()} className="cursor-pointer md:w-[35%] bg-amber-400 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden group">
           <div className="absolute inset-0 opacity-[0.05] flex items-center justify-center rotate-12 scale-150 group-hover:rotate-0 transition-transform duration-1000"><span className="text-[20rem] font-black text-blue-900">102</span></div>
           <h2 className="text-4xl md:text-7xl font-black text-blue-950 italic uppercase tracking-tighter z-10">#POR TI BOYACÁ</h2>
           <div className="z-10 mt-4 bg-blue-950/10 px-4 py-1 rounded-full text-[10px] font-black text-blue-950 uppercase tracking-widest">
             Actualizado: {lastSyncTime}
           </div>
        </div>
        <div className="md:w-[65%] p-14 flex flex-col justify-center bg-slate-50">
           <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="bg-blue-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">CENTRO DEMOCRÁTICO</span>
                {isSyncing && <span className="text-amber-500 animate-pulse text-[10px] font-black uppercase"><i className="fa-solid fa-satellite-dish mr-2"></i> CONECTADO</span>}
              </div>
              <h1 className="text-blue-950 font-black text-5xl md:text-[11rem] tracking-tighter uppercase leading-[0.8] transition-all">TRIANA</h1>
              <span className="text-sky-500 font-black text-xl md:text-6xl uppercase tracking-widest block italic leading-none">CÁMARA 102</span>
           </div>
        </div>
      </header>

      <ElectoralStats currentVotes={voteRecords.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 p-2 rounded-[3rem] border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden">
            <div className="flex p-3 gap-2">
              <button onClick={() => setViewMode('network')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'network' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>Red de Influencia</button>
              <button onClick={() => setViewMode('participation')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'participation' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>Metas Paipa</button>
              <button onClick={() => setViewMode('database')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'database' ? 'bg-amber-400 text-blue-900 shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>Base Global</button>
            </div>
            <div className="h-[550px]">
               {viewMode === 'network' ? <NetworkGraph nodes={ACTORS} links={RELATIONS} onNodeClick={setSelectedActor} /> :
                viewMode === 'participation' ? <ElectoralView records={voteRecords} actors={ACTORS} /> :
                <DatabaseView records={voteRecords} actors={ACTORS} onDeleteRecord={id => setVoteRecords(prev => prev.filter(v => v.id !== id))} />}
            </div>
          </div>
        </div>
        <aside className="space-y-8">
          <AnalysisPanel selectedActor={selectedActor} />
          <div className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isSyncing ? 'border-amber-400 animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.3)]' : 'border-emerald-500'}`}>
               <i className={`fa-solid ${isSyncing ? 'fa-satellite-dish' : 'fa-check'} text-2xl ${isSyncing ? 'text-amber-400' : 'text-emerald-400'}`}></i>
            </div>
            <div className="space-y-1">
              <p className="text-white font-black uppercase text-[10px] tracking-widest">{isSyncing ? 'SINCRONIZANDO...' : 'SISTEMA ONLINE'}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase">Última Ref: {lastSyncTime}</p>
            </div>
          </div>
        </aside>
      </div>

      <button onClick={() => setIsCollectorViewActive(true)} className="fixed bottom-8 right-8 z-[100] bg-blue-950 text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center border-b-4 border-amber-500 hover:scale-110 active:scale-95 transition-all"><i className="fa-solid fa-plus text-3xl text-amber-400"></i></button>
    </div>
  );
};

export default App;
