
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
    const saved = localStorage.getItem('v102_cache_prod');
    return saved ? JSON.parse(saved) : [];
  });
  
  const recordsRef = useRef<VoteRecord[]>(voteRecords);
  const isSyncingRef = useRef(false);

  const [selectedActor, setSelectedActor] = useState<ActorNode | null>(null);
  const [viewMode, setViewMode] = useState<'network' | 'participation' | 'database'>('network');
  const [lastRecord, setLastRecord] = useState<VoteRecord | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');

  useEffect(() => {
    recordsRef.current = voteRecords;
    localStorage.setItem('v102_cache_prod', JSON.stringify(voteRecords));
  }, [voteRecords]);

  const [isCollectorViewActive, setIsCollectorViewActive] = useState(() => {
    return localStorage.getItem('v102_collector_active') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('v102_collector_active', isCollectorViewActive.toString());
  }, [isCollectorViewActive]);

  // FUNCIÓN DE SINCRONIZACIÓN MEJORADA
  const performGlobalSync = async (forceData?: VoteRecord[]) => {
    if (isSyncingRef.current && !forceData) return;
    
    isSyncingRef.current = true;
    setIsSyncing(true);
    
    try {
      const currentLocal = forceData || recordsRef.current;
      const globalData = await syncWithCloud(currentLocal);
      
      if (globalData && Array.isArray(globalData)) {
        // CONDICIÓN CRÍTICA: Si el JSON es diferente, actualizamos el estado.
        // Esto obliga al computador a aceptar los datos del teléfono aunque tenga 0.
        const localHash = JSON.stringify(recordsRef.current);
        const globalHash = JSON.stringify(globalData);
        
        if (localHash !== globalHash) {
          console.log("Actualizando datos desde la red global...");
          setVoteRecords(globalData);
          setHasNewActivity(true);
          setTimeout(() => setHasNewActivity(false), 3000);
        }
      }
    } catch (e) {
      console.error("Error en sincronización viva:", e);
    } finally {
      setIsSyncing(false);
      isSyncingRef.current = false;
    }
  };

  useEffect(() => {
    performGlobalSync();
    // Refresco cada 5 segundos
    const timer = setInterval(() => performGlobalSync(), 5000);
    return () => clearInterval(timer);
  }, []);

  const handleAddVoteRecord = async (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    if (voteRecords.some(r => r.idNumber === record.idNumber)) {
      alert("Esta cédula ya está registrada.");
      return;
    }

    const newEntry: VoteRecord = {
      ...record,
      id: `v102-${Date.now()}`,
      timestamp: Date.now()
    };
    
    const nextList = [newEntry, ...voteRecords];
    setVoteRecords(nextList);
    setLastRecord(newEntry);
    
    // Subida inmediata
    await performGlobalSync(nextList);
  };

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

  if (isCollectorViewActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center animate-in fade-in duration-500 pb-20 overflow-x-hidden relative">
        <button onClick={() => setShowAdminLogin(true)} className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-slate-800 hover:text-amber-400 z-[100]"><i className="fa-solid fa-shield-halved text-xl"></i></button>

        {showAdminLogin && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl">
             <div className="bg-slate-900 border-2 border-amber-400/30 rounded-[3rem] p-10 w-full max-w-xs text-center space-y-8">
                <h3 className="text-white font-black uppercase text-xs tracking-widest">Acceso Maestro</h3>
                <div className="flex justify-center gap-3">
                   {[0, 1, 2].map(i => <div key={i} className={`w-4 h-4 rounded-full border-2 ${adminPasscode.length > i ? 'bg-amber-400 border-amber-400' : 'border-slate-700'}`}></div>)}
                </div>
                <div className="grid grid-cols-3 gap-4">
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
                     <button key={n} onClick={() => handleAdminAuth(n.toString())} className="w-full aspect-square bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-black text-white">{n}</button>
                   ))}
                   <button onClick={() => { setShowAdminLogin(false); setAdminPasscode(''); }} className="col-span-2 bg-red-950 text-red-400 text-[10px] font-black uppercase rounded-2xl">Cerrar</button>
                </div>
             </div>
          </div>
        )}

        {lastRecord && (
          <ThankYouModal 
            voterName={lastRecord.voterName} 
            actorId={lastRecord.actorId}
            voterCount={voteRecords.length}
            phoneNumber={lastRecord.phoneNumber}
            onClose={() => setLastRecord(null)} 
          />
        )}

        <div className="max-w-md w-full px-4 pt-6 space-y-6">
          <header className="text-center space-y-3">
             <div onClick={() => performGlobalSync()} className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${hasNewActivity ? 'bg-amber-400 border-amber-300 text-blue-950 scale-110' : 'bg-blue-900/40 border-blue-500/30 text-white'}`}>
                <div className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute h-full w-full rounded-full ${isSyncing ? 'bg-amber-500' : 'bg-emerald-400'}`}></span>
                  <span className={`relative rounded-full h-2 w-2 ${isSyncing ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">TOTAL PAIPA: {voteRecords.length}</span>
             </div>
             <h1 className="text-4xl font-black text-white italic uppercase">TRIANA <span className="text-amber-400">102</span></h1>
          </header>
          <div className="bg-slate-900/80 rounded-[2.5rem] border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-amber-400 to-blue-700"></div>
            <VoteRegistry actors={ACTORS} records={voteRecords} onAddRecord={handleAddVoteRecord} onDeleteRecord={() => {}} isPublic={true} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 pb-24">
      <header className="bg-white rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row min-h-[220px] md:min-h-[350px] relative">
        <div onClick={() => performGlobalSync()} className="cursor-pointer md:w-[35%] bg-amber-400 flex items-center justify-center p-6 md:p-12 text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-[0.05] flex items-center justify-center rotate-12 scale-150"><span className="text-[20rem] font-black text-blue-900">102</span></div>
           <h2 className="text-4xl md:text-7xl font-black text-blue-950 italic uppercase tracking-tighter z-10">#POR TI BOYACÁ</h2>
        </div>
        <div className="md:w-[65%] p-6 md:p-14 flex flex-col justify-center bg-slate-50">
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-blue-900 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase">CENTRO DEMOCRÁTICO</span>
                {isSyncing && <span className="text-amber-500 animate-pulse text-[8px] font-black"><i className="fa-solid fa-sync fa-spin"></i> LIVE SYNC</span>}
              </div>
              <h1 className="text-blue-950 font-black text-5xl md:text-[11rem] tracking-tighter uppercase leading-[0.8]">TRIANA</h1>
              <span className="text-sky-500 font-black text-xl md:text-6xl uppercase tracking-widest block italic leading-none">CÁMARA 102</span>
           </div>
        </div>
      </header>

      <ElectoralStats currentVotes={voteRecords.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 p-1.5 rounded-[2.5rem] border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden relative">
            <div className="flex p-2 md:p-4 gap-2">
              <button onClick={() => setViewMode('network')} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest ${viewMode === 'network' ? 'bg-sky-500 text-white shadow-xl' : 'text-slate-500'}`}>Red de Influencia</button>
              <button onClick={() => setViewMode('participation')} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest ${viewMode === 'participation' ? 'bg-red-500 text-white shadow-xl' : 'text-slate-500'}`}>Metas Paipa</button>
              <button onClick={() => setViewMode('database')} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest ${viewMode === 'database' ? 'bg-amber-400 text-blue-900 shadow-xl' : 'text-slate-500'}`}>Base Global</button>
            </div>
            <div className="h-[400px] md:h-[550px]">
               {viewMode === 'network' ? <NetworkGraph nodes={ACTORS} links={RELATIONS} onNodeClick={setSelectedActor} /> :
                viewMode === 'participation' ? <ElectoralView records={voteRecords} actors={ACTORS} /> :
                <DatabaseView records={voteRecords} actors={ACTORS} onDeleteRecord={id => setVoteRecords(prev => prev.filter(v => v.id !== id))} />}
            </div>
          </div>
        </div>
        <aside className="space-y-8">
          <AnalysisPanel selectedActor={selectedActor} />
          <div className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-slate-800 text-center space-y-4">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center border-4 ${isSyncing ? 'border-amber-400 animate-pulse' : 'border-emerald-500'}`}>
               <i className={`fa-solid ${isSyncing ? 'fa-satellite-dish' : 'fa-check'} text-2xl ${isSyncing ? 'text-amber-400' : 'text-emerald-400'}`}></i>
            </div>
            <p className="text-white font-black uppercase text-[10px] tracking-widest">{isSyncing ? 'Sincronizando...' : 'Conectado'}</p>
          </div>
        </aside>
      </div>

      <button onClick={() => setIsCollectorViewActive(true)} className="fixed bottom-6 right-6 z-[100] bg-blue-950 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-b-4 border-amber-500 hover:scale-110 active:scale-95 transition-all"><i className="fa-solid fa-plus text-2xl text-amber-400"></i></button>
    </div>
  );
};

export default App;
