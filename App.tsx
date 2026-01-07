
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
  // Estado de registros
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>(() => {
    const saved = localStorage.getItem('v102_prod_cache');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Referencia para evitar cierres rancios en el setInterval
  const recordsRef = useRef<VoteRecord[]>(voteRecords);
  const syncLock = useRef(false);

  const [selectedActor, setSelectedActor] = useState<ActorNode | null>(null);
  const [viewMode, setViewMode] = useState<'network' | 'participation' | 'database'>('network');
  const [lastRecord, setLastRecord] = useState<VoteRecord | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');

  // Sincronizar la referencia siempre que cambie el estado
  useEffect(() => {
    recordsRef.current = voteRecords;
    localStorage.setItem('v102_prod_cache', JSON.stringify(voteRecords));
  }, [voteRecords]);

  const [isCollectorViewActive, setIsCollectorViewActive] = useState(() => {
    return localStorage.getItem('v102_collector_active') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('v102_collector_active', isCollectorViewActive.toString());
  }, [isCollectorViewActive]);

  // FUNCIÓN DE SINCRONIZACIÓN CORREGIDA
  const performGlobalSync = async (manualData?: VoteRecord[]) => {
    if (syncLock.current && !manualData) return;
    
    syncLock.current = true;
    setIsSyncing(true);
    
    try {
      const dataToSync = manualData || recordsRef.current;
      const globalData = await syncWithCloud(dataToSync);
      
      if (globalData && Array.isArray(globalData)) {
        // Si detectamos que la nube tiene MÁS datos que nosotros, actualizamos localmente
        if (globalData.length > recordsRef.current.length) {
          console.log("¡Nuevos datos detectados desde otro dispositivo!");
          setHasNewActivity(true);
          setTimeout(() => setHasNewActivity(false), 3000);
          setVoteRecords(globalData);
        } else if (manualData) {
          // Si es un registro manual, forzamos actualización
          setVoteRecords(globalData);
        }
      }
    } catch (e) {
      console.error("Sync Error:", e);
    } finally {
      setIsSyncing(false);
      syncLock.current = false;
    }
  };

  // CONTROLADOR DE INTERVALO ROBUSTO
  useEffect(() => {
    // Sincronización inicial inmediata
    performGlobalSync();

    // Intervalo de refresco constante
    const timer = setInterval(() => {
      performGlobalSync();
    }, 4000); // Cada 4 segundos para máxima respuesta

    return () => clearInterval(timer);
  }, []);

  const handleAddVoteRecord = async (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    // Evitar duplicados locales inmediatos
    if (voteRecords.some(r => r.idNumber === record.idNumber)) {
      alert("⚠️ Esta cédula ya se encuentra registrada.");
      return;
    }

    const newEntry: VoteRecord = {
      ...record,
      id: `v102-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now()
    };
    
    const nextList = [newEntry, ...voteRecords];
    setVoteRecords(nextList);
    setLastRecord(newEntry);
    
    // Sincronización prioritaria inmediata
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
        <button 
          onClick={() => setShowAdminLogin(true)}
          className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-slate-800 hover:text-amber-400 transition-colors z-[100]"
        >
          <i className="fa-solid fa-shield-halved text-xl"></i>
        </button>

        {showAdminLogin && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in zoom-in-95 duration-200">
             <div className="bg-slate-900 border-2 border-amber-400/30 rounded-[3rem] p-10 w-full max-w-xs shadow-[0_0_100px_rgba(0,0,0,0.8)] text-center space-y-8">
                <div className="space-y-2">
                   <div className="w-16 h-16 bg-blue-900/30 rounded-full mx-auto flex items-center justify-center border border-amber-400/20">
                      <i className="fa-solid fa-lock text-amber-400 text-2xl"></i>
                   </div>
                   <h3 className="text-white font-black uppercase text-xs tracking-[0.3em]">Acceso Panel Maestro</h3>
                </div>
                <div className="flex justify-center gap-3">
                   {[0, 1, 2].map(i => (
                     <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${adminPasscode.length > i ? 'bg-amber-400 border-amber-400 scale-125' : 'border-slate-700'}`}></div>
                   ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
                     <button key={n} onClick={() => handleAdminAuth(n.toString())} className="w-full aspect-square bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-black text-white hover:bg-blue-900 active:scale-90 transition-all border border-white/5 shadow-lg">{n}</button>
                   ))}
                   <button onClick={() => { setShowAdminLogin(false); setAdminPasscode(''); }} className="col-span-2 bg-red-950/50 text-red-400 font-black text-[10px] uppercase rounded-2xl">CANCELAR</button>
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
             <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${hasNewActivity ? 'bg-amber-400 border-amber-300 text-blue-950 scale-110 shadow-[0_0_30px_rgba(245,158,11,0.5)]' : 'bg-blue-900/40 border-blue-500/30 text-white'}`}>
                <div className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSyncing ? 'bg-amber-500' : 'bg-emerald-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isSyncing ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  TOTAL PAIPA: {voteRecords.length}
                </span>
             </div>
             <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
               TRIANA <span className="text-amber-400">102</span>
             </h1>
          </header>

          <div className="bg-slate-900/80 rounded-[2.5rem] border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-amber-400 to-blue-700"></div>
            <VoteRegistry 
              actors={ACTORS} 
              records={voteRecords} 
              onAddRecord={handleAddVoteRecord} 
              onDeleteRecord={() => {}} 
              isPublic={true} 
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700 pb-24">
      <header className="bg-white rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row min-h-[220px] md:min-h-[350px] relative">
        <div className="md:w-[35%] bg-amber-400 flex items-center justify-center p-6 md:p-12 text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-[0.05] flex items-center justify-center rotate-12 pointer-events-none scale-150">
              <span className="text-[20rem] font-black text-blue-900">102</span>
           </div>
           <h2 className="text-4xl md:text-7xl font-black text-blue-950 italic uppercase tracking-tighter z-10">#POR TI BOYACÁ</h2>
        </div>
        <div className="md:w-[65%] p-6 md:p-14 flex flex-col justify-center bg-slate-50">
           <div className="space-y-1 md:space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-blue-900 text-white px-2 py-0.5 rounded text-[8px] md:text-[10px] font-black uppercase tracking-widest">CENTRO DEMOCRÁTICO</span>
                {isSyncing && <span className="text-amber-500 animate-pulse text-[8px] font-black uppercase"><i className="fa-solid fa-sync fa-spin mr-1"></i> ACTUALIZANDO...</span>}
              </div>
              <h1 className="text-blue-950 font-black text-5xl md:text-[11rem] tracking-tighter uppercase leading-[0.8]">TRIANA</h1>
              <span className="text-sky-500 font-black text-xl md:text-6xl uppercase tracking-widest block italic leading-none">CÁMARA 102</span>
           </div>
        </div>
      </header>

      <ElectoralStats currentVotes={voteRecords.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 p-1.5 rounded-[2.5rem] md:rounded-[4rem] border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden relative">
            <div className="flex p-2 md:p-4 gap-2 overflow-x-auto no-scrollbar">
              <button onClick={() => setViewMode('network')} className={`whitespace-nowrap flex-1 py-4 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'network' ? 'bg-sky-500 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}>Red de Influencia</button>
              <button onClick={() => setViewMode('participation')} className={`whitespace-nowrap flex-1 py-4 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'participation' ? 'bg-red-500 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}>Metas Paipa</button>
              <button onClick={() => setViewMode('database')} className={`whitespace-nowrap flex-1 py-4 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'database' ? 'bg-amber-400 text-blue-900 shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}>Base Global</button>
            </div>
            <div className="h-[400px] md:h-[550px]">
               {viewMode === 'network' ? <NetworkGraph nodes={ACTORS} links={RELATIONS} onNodeClick={setSelectedActor} /> :
                viewMode === 'participation' ? <ElectoralView records={voteRecords} actors={ACTORS} /> :
                <DatabaseView records={voteRecords} actors={ACTORS} onDeleteRecord={id => setVoteRecords(prev => prev.filter(v => v.id !== id))} />}
            </div>
          </div>
          <div className="hidden md:block">
            <VoteRegistry actors={ACTORS} records={voteRecords} onAddRecord={handleAddVoteRecord} onDeleteRecord={id => setVoteRecords(prev => prev.filter(v => v.id !== id))} />
          </div>
        </div>
        <aside className="space-y-8">
          <AnalysisPanel selectedActor={selectedActor} />
          <div className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-slate-800 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4 transition-all duration-700 bg-white/5 ${isSyncing ? 'border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.5)] animate-pulse' : 'border-emerald-500'}`}>
               <i className={`fa-solid ${isSyncing ? 'fa-satellite-dish' : 'fa-network-wired'} text-4xl ${isSyncing ? 'text-amber-400' : 'text-emerald-400'}`}></i>
            </div>
            <div className="space-y-2">
              <p className="text-white font-black uppercase text-xs tracking-widest">{isSyncing ? 'SINCRONIZANDO...' : 'EQUIPO CONECTADO'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Refresco Activo cada 4s</p>
            </div>
          </div>
        </aside>
      </div>

      <button 
        onClick={() => setIsCollectorViewActive(true)}
        className="fixed bottom-6 right-6 z-[100] bg-blue-950 text-white w-16 h-16 md:w-24 md:h-24 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center border-b-4 border-amber-500 hover:scale-110 active:scale-95 transition-all group"
      >
        <i className="fa-solid fa-plus text-2xl md:text-4xl text-amber-400 group-hover:rotate-90 transition-transform"></i>
      </button>
    </div>
  );
};

export default App;
