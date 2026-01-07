
import React, { useState, useEffect, useRef } from 'react';
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
  // Inicialización limpia para v4
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>(() => {
    const saved = localStorage.getItem('triana_v4_cache');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [lastSyncTime, setLastSyncTime] = useState<string>('--:--');
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'network' | 'participation' | 'database'>('network');
  const [selectedActor, setSelectedActor] = useState<ActorNode | null>(null);
  const [lastRecord, setLastRecord] = useState<VoteRecord | null>(null);
  const [isCollectorViewActive, setIsCollectorViewActive] = useState(() => localStorage.getItem('v102_collector_active') === 'true');

  // Guardar siempre lo que tengamos
  useEffect(() => {
    localStorage.setItem('triana_v4_cache', JSON.stringify(voteRecords));
  }, [voteRecords]);

  // FUNCIÓN DE SINCRONIZACIÓN FORZADA
  const performGlobalSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await syncWithCloud(voteRecords);
      // Solo actualizamos si el resultado es diferente para no causar parpadeos
      if (result.length !== voteRecords.length) {
        console.log("Cambio detectado: ", voteRecords.length, " -> ", result.length);
        setVoteRecords(result);
      }
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    performGlobalSync();
    // Cada 3 segundos revisamos la nube
    const timer = setInterval(performGlobalSync, 3000);
    return () => clearInterval(timer);
  }, [voteRecords.length]); // Se re-lanza si cambia el tamaño

  const handleAddVoteRecord = async (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    if (voteRecords.some(r => r.idNumber === record.idNumber)) {
      alert("⚠️ Esta cédula ya está en la base.");
      return;
    }
    const newEntry: VoteRecord = { ...record, id: `v4-${Date.now()}`, timestamp: Date.now() };
    const newList = [newEntry, ...voteRecords];
    setVoteRecords(newList);
    setLastRecord(newEntry);
  };

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');

  const handleAdminAuth = (val: string) => {
    const newPass = adminPasscode + val;
    setAdminPasscode(newPass);
    if (newPass === "102") {
      setIsCollectorViewActive(false);
      setShowAdminLogin(false);
      setAdminPasscode('');
    } else if (newPass.length >= 3) setAdminPasscode('');
  };

  if (isCollectorViewActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center pb-20 relative overflow-x-hidden">
        <button onClick={() => setShowAdminLogin(true)} className="absolute top-4 right-4 text-slate-900 z-[100]"><i className="fa-solid fa-lock"></i></button>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
             <div className="bg-slate-900 border border-amber-400/20 rounded-[3rem] p-10 w-full max-w-xs text-center space-y-8">
                <h3 className="text-white font-black uppercase text-xs tracking-widest">Master Admin</h3>
                <div className="flex justify-center gap-3">
                   {[0, 1, 2].map(i => <div key={i} className={`w-3 h-3 rounded-full border ${adminPasscode.length > i ? 'bg-amber-400' : 'border-slate-700'}`}></div>)}
                </div>
                <div className="grid grid-cols-3 gap-4">
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => <button key={n} onClick={() => handleAdminAuth(n.toString())} className="w-full aspect-square bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-black text-white">{n}</button>)}
                   <button onClick={() => { setShowAdminLogin(false); setAdminPasscode(''); }} className="col-span-2 bg-red-900/30 text-red-400 text-[10px] font-black uppercase rounded-2xl">Salir</button>
                </div>
             </div>
          </div>
        )}
        {lastRecord && <ThankYouModal voterName={lastRecord.voterName} actorId={lastRecord.actorId} voterCount={voteRecords.length} phoneNumber={lastRecord.phoneNumber} onClose={() => setLastRecord(null)} />}
        <div className="max-w-md w-full px-4 pt-6 space-y-6">
          <header className="text-center space-y-3">
             <div className="inline-flex flex-col items-center gap-1 px-8 py-3 rounded-[2rem] border bg-blue-900/40 border-blue-500/30 text-white">
                <div className="flex items-center gap-2">
                   <div className={`w-2.5 h-2.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                   <span className="text-[12px] font-black uppercase tracking-widest">RED: {voteRecords.length}</span>
                </div>
                <span className="text-[8px] opacity-60 font-bold uppercase">Sincronizado: {lastSyncTime}</span>
             </div>
             <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">TRIANA <span className="text-amber-400">102</span></h1>
          </header>
          <div className="bg-slate-900/80 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-blue-700 via-amber-400 to-blue-700"></div>
            <VoteRegistry actors={ACTORS} records={voteRecords} onAddRecord={handleAddVoteRecord} onDeleteRecord={() => {}} isPublic={true} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 pb-24">
      <header className="bg-white rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row min-h-[350px] relative">
        <div onClick={performGlobalSync} className="cursor-pointer md:w-[35%] bg-amber-400 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden group">
           <h2 className="text-4xl md:text-7xl font-black text-blue-950 italic uppercase tracking-tighter z-10">#POR TI BOYACÁ</h2>
           <div className="z-10 mt-6 bg-blue-950 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3">
             <i className={`fa-solid fa-sync ${isSyncing ? 'fa-spin' : ''}`}></i>
             RED TRIANA: {voteRecords.length} REGISTROS
           </div>
        </div>
        <div className="md:w-[65%] p-14 flex flex-col justify-center bg-slate-50">
           <div className="space-y-1">
              <h1 className="text-blue-950 font-black text-5xl md:text-[11rem] tracking-tighter uppercase leading-[0.8]">TRIANA</h1>
              <span className="text-sky-500 font-black text-xl md:text-6xl uppercase tracking-widest block italic">CÁMARA 102</span>
           </div>
        </div>
      </header>

      <ElectoralStats currentVotes={voteRecords.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 p-2 rounded-[3rem] border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden">
            <div className="flex p-3 gap-2">
              <button onClick={() => setViewMode('network')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase ${viewMode === 'network' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500'}`}>Red</button>
              <button onClick={() => setViewMode('participation')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase ${viewMode === 'participation' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500'}`}>Metas</button>
              <button onClick={() => setViewMode('database')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase ${viewMode === 'database' ? 'bg-amber-400 text-blue-900 shadow-lg' : 'text-slate-500'}`}>Base</button>
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
            <p className="text-white font-black uppercase text-[10px] tracking-widest">CONEXIÓN V4 ACTIVA</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase">Última Sincro: {lastSyncTime}</p>
          </div>
        </aside>
      </div>
      <button onClick={() => setIsCollectorViewActive(true)} className="fixed bottom-8 right-8 z-[100] bg-blue-950 text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center border-b-4 border-amber-500"><i className="fa-solid fa-plus text-3xl text-amber-400"></i></button>
    </div>
  );
};

export default App;
