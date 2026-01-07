
import React, { useState, useEffect } from 'react';
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
    const saved = localStorage.getItem('triana_v102_records');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [lastSyncTime, setLastSyncTime] = useState<string>('--:--');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [viewMode, setViewMode] = useState<'network' | 'participation' | 'database'>('network');
  const [selectedActor, setSelectedActor] = useState<ActorNode | null>(null);
  const [lastRecord, setLastRecord] = useState<VoteRecord | null>(null);
  const [isCollectorViewActive, setIsCollectorViewActive] = useState(() => localStorage.getItem('v102_collector_active') === 'true');

  // Persistencia local
  useEffect(() => {
    localStorage.setItem('triana_v102_records', JSON.stringify(voteRecords));
  }, [voteRecords]);

  const performSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncError(false);
    try {
      const result = await syncWithCloud(voteRecords);
      // Solo actualizamos el estado si hay cambios reales en la data
      if (JSON.stringify(result) !== JSON.stringify(voteRecords)) {
        setVoteRecords(result);
      }
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (e) {
      setSyncError(true);
    } finally {
      setIsSyncing(false);
    }
  };

  // Polling de alta frecuencia para demo (5 segundos)
  useEffect(() => {
    performSync();
    const timer = setInterval(performSync, 5000);
    return () => clearInterval(timer);
  }, [voteRecords.length]);

  const handleAddVoteRecord = (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    if (voteRecords.some(r => r.idNumber === record.idNumber)) {
      alert("⚠️ Cédula ya registrada.");
      return;
    }
    const newEntry: VoteRecord = { ...record, id: `v102-${Date.now()}`, timestamp: Date.now() };
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

  const activeChannelId = localStorage.getItem('v102_cloud_id');

  if (isCollectorViewActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center pb-20 relative overflow-x-hidden">
        <button onClick={() => setShowAdminLogin(true)} className="absolute top-4 right-4 text-slate-800 z-[100]"><i className="fa-solid fa-lock"></i></button>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
             <div className="bg-slate-900 border border-amber-400/20 rounded-[3rem] p-10 w-full max-w-xs text-center space-y-8">
                <h3 className="text-white font-black uppercase text-xs tracking-widest">Master Control</h3>
                <div className="flex justify-center gap-3">
                   {[0, 1, 2].map(i => <div key={i} className={`w-3 h-3 rounded-full border ${adminPasscode.length > i ? 'bg-amber-400 border-amber-400' : 'border-slate-700'}`}></div>)}
                </div>
                <div className="grid grid-cols-3 gap-4">
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => <button key={n} onClick={() => handleAdminAuth(n.toString())} className="w-full aspect-square bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-black text-white">{n}</button>)}
                </div>
             </div>
          </div>
        )}
        {lastRecord && <ThankYouModal voterName={lastRecord.voterName} actorId={lastRecord.actorId} voterCount={voteRecords.length} phoneNumber={lastRecord.phoneNumber} onClose={() => setLastRecord(null)} />}
        <div className="max-w-md w-full px-4 pt-6 space-y-6">
          <header className="text-center space-y-3">
             <div className="inline-flex flex-col items-center gap-1 px-8 py-3 rounded-[2rem] border bg-blue-900/40 border-blue-500/30 text-white shadow-lg">
                <div className="flex items-center gap-2">
                   <div className={`w-2.5 h-2.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : syncError ? 'bg-red-500' : 'bg-emerald-400'}`}></div>
                   <span className="text-[12px] font-black uppercase tracking-widest">SISTEMA: {voteRecords.length}</span>
                </div>
                <span className="text-[8px] opacity-40 font-bold uppercase tracking-widest">CANAL: {activeChannelId ? activeChannelId.substring(0,8) : 'SINCERANDO...'}</span>
             </div>
             <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">TRIANA <span className="text-amber-400">102</span></h1>
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
        <div onClick={performSync} className="cursor-pointer md:w-[35%] bg-amber-400 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden group">
           <h2 className="text-4xl md:text-7xl font-black text-blue-950 italic uppercase tracking-tighter z-10">#POR TI BOYACÁ</h2>
           <div className="z-10 mt-6 bg-blue-950 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all">
             <i className={`fa-solid fa-sync ${isSyncing ? 'fa-spin' : ''}`}></i>
             CONSOLIDADO: {voteRecords.length} REGISTROS
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
              <button onClick={() => setViewMode('network')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'network' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>Red</button>
              <button onClick={() => setViewMode('participation')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'participation' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>Metas</button>
              <button onClick={() => setViewMode('database')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'database' ? 'bg-amber-400 text-blue-900 shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>Base</button>
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
          <div onClick={performSync} className="cursor-pointer bg-slate-900/60 p-10 rounded-[2.5rem] border border-slate-800 text-center space-y-4 shadow-2xl group active:scale-95 transition-all">
            <p className="text-white font-black uppercase text-[10px] tracking-widest">CANAL ACTIVO: {activeChannelId ? activeChannelId.substring(0,10) : 'BUSCANDO...'}</p>
            <p className={`text-[9px] font-bold uppercase tracking-widest ${syncError ? 'text-red-500' : 'text-slate-500'}`}>
               {syncError ? 'ERROR DE CONEXIÓN' : `Última Sincro: ${lastSyncTime}`}
            </p>
          </div>
        </aside>
      </div>
      <button onClick={() => setIsCollectorViewActive(true)} className="fixed bottom-8 right-8 z-[100] bg-blue-950 text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center border-b-4 border-amber-500 hover:scale-110 active:scale-95 transition-all"><i className="fa-solid fa-plus text-3xl text-amber-400"></i></button>
    </div>
  );
};

export default App;
