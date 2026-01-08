
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ACTORS, RELATIONS } from './constants.ts';
import { ActorNode, VoteRecord } from './types.ts';
import NetworkGraph from './components/NetworkGraph.tsx';
import AnalysisPanel from './components/AnalysisPanel.tsx';
import VoteRegistry from './components/VoteRegistry.tsx';
import ElectoralStats from './components/ElectoralStats.tsx';
import ElectoralView from './components/ElectoralView.tsx';
import ThankYouModal from './components/ThankYouModal.tsx';
import DatabaseView from './components/DatabaseView.tsx';
import { syncWithCloudDatabase } from './services/syncService.ts';

const App: React.FC = () => {
  const DEFAULT_GOOGLE_URL = "https://script.google.com/macros/s/AKfycbzjNPsSK1gD1e2ZxVQbRV1gt9aB-hPXHcHyXc_XIXpbd2vMOYdBWFvtISlS0YyAFDCZ5Q/exec";

  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>(() => {
    const saved = localStorage.getItem('triana_db_local');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [leaderName, setLeaderName] = useState(() => localStorage.getItem('v102_leader_name') || '');
  const [googleSheetUrl, setGoogleSheetUrl] = useState(() => localStorage.getItem('v102_google_url') || DEFAULT_GOOGLE_URL);
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [latency, setLatency] = useState(0);
  const [viewMode, setViewMode] = useState<'network' | 'participation' | 'database'>('network');
  const [selectedActor, setSelectedActor] = useState<ActorNode | null>(null);
  const [lastRecord, setLastRecord] = useState<VoteRecord | null>(null);
  const [isCollectorViewActive, setIsCollectorViewActive] = useState(() => localStorage.getItem('v102_collector_active') === 'true');

  useEffect(() => {
    localStorage.setItem('triana_db_local', JSON.stringify(voteRecords));
  }, [voteRecords]);

  const performDatabaseSync = useCallback(async (currentData?: VoteRecord[]) => {
    const dataToSync = currentData || voteRecords;
    setSyncState('syncing');
    try {
      const { records: merged, latency: lat } = await syncWithCloudDatabase(dataToSync, googleSheetUrl);
      if (JSON.stringify(merged) !== JSON.stringify(voteRecords)) {
        setVoteRecords(merged);
      }
      setLatency(lat);
      setSyncState('idle');
    } catch (e) {
      setSyncState('error');
      setLatency(-1);
    }
  }, [voteRecords, googleSheetUrl]);

  useEffect(() => {
    performDatabaseSync();
    const interval = setInterval(() => performDatabaseSync(), 12000); 
    return () => clearInterval(interval);
  }, [performDatabaseSync]);

  const handleAddVoteRecord = async (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    if (voteRecords.some(r => r.idNumber === record.idNumber)) {
      alert("⚠️ CÉDULA YA REGISTRADA: El ciudadano ya se encuentra en la Base de Datos Central.");
      return;
    }
    const newEntry: VoteRecord = { 
      ...record, 
      id: `v102-${Date.now()}`, 
      timestamp: Date.now(),
      recordedBy: leaderName || 'Admin',
      syncStatus: 'pending'
    };
    const updatedRecords = [newEntry, ...voteRecords];
    setVoteRecords(updatedRecords);
    setLastRecord(newEntry);
    await performDatabaseSync(updatedRecords);
  };

  const dailyCount = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return voteRecords.filter(r => r.timestamp >= today).length;
  }, [voteRecords]);

  // VISTAS Y LOGICA DE LOGIN (OMITIDA BREVEDAD)
  if (isCollectorViewActive && !leaderName) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-blue-500/30 rounded-[3rem] p-10 w-full max-w-sm text-center space-y-8">
           <h2 className="text-white font-black uppercase text-xl italic">Acceso Base de Datos</h2>
           <input type="text" placeholder="NOMBRE LÍDER" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center text-white font-black" onKeyDown={(e) => e.key === 'Enter' && setLeaderName(e.currentTarget.value.trim())} />
        </div>
      </div>
    );
  }

  if (isCollectorViewActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center pb-20 font-sans">
        {lastRecord && <ThankYouModal voterName={lastRecord.voterName} actorId={lastRecord.actorId} voterCount={voteRecords.length} phoneNumber={lastRecord.phoneNumber} onClose={() => setLastRecord(null)} />}
        <div className="w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl mt-4">
           <div className="bg-[#facc15] p-10 text-center flex flex-col items-center">
              <h2 className="text-4xl font-black text-[#1e3a8a] italic uppercase leading-none">PAIPA #102</h2>
              <div className="mt-4 bg-[#1e3a8a] text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full ${latency > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                 BASE DE DATOS: {voteRecords.length}
              </div>
           </div>
           <VoteRegistry actors={ACTORS} records={voteRecords} onAddRecord={handleAddVoteRecord} onDeleteRecord={() => {}} isPublic={true} />
        </div>
        <button onClick={() => setIsCollectorViewActive(false)} className="mt-8 text-slate-500 font-black text-[10px] uppercase tracking-widest">Panel Administrativo</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 pb-24 font-sans">
      <header className="bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border-b-8 border-slate-950">
        <div className="md:w-[40%] bg-[#facc15] p-12 text-center flex flex-col items-center justify-center space-y-4">
           <h2 className="text-5xl font-black text-[#1e3a8a] italic uppercase tracking-tighter">BASE DE DATOS<br/>CENTRAL</h2>
           <div className="bg-[#1e3a8a] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
             <i className={`fa-solid fa-database ${syncState === 'syncing' ? 'fa-beat' : ''}`}></i>
             RECORDS: {voteRecords.length}
           </div>
        </div>
        <div className="md:w-[60%] p-14 flex flex-col justify-center bg-white">
           <h1 className="text-[#1e3a8a] font-black text-6xl md:text-8xl tracking-tighter uppercase leading-none">TRIANA</h1>
           <span className="text-[#38bdf8] font-black text-3xl uppercase italic leading-none">CÁMARA 102</span>
        </div>
      </header>

      <ElectoralStats currentVotes={voteRecords.length} dailyVotes={dailyCount} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 p-2 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex p-3 gap-2">
              {['network', 'participation', 'database'].map((m) => (
                <button 
                  key={m}
                  onClick={() => setViewMode(m as any)} 
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === m ? 'bg-white text-blue-950 shadow-lg' : 'text-slate-500'}`}
                >
                  {m === 'network' ? 'MAPA ECOSISTEMA' : m === 'participation' ? 'METAS DE RED' : 'GESTIÓN DE BASE'}
                </button>
              ))}
            </div>
            <div className="min-h-[550px]">
               {viewMode === 'network' ? <NetworkGraph nodes={ACTORS} links={RELATIONS} onNodeClick={setSelectedActor} /> :
                viewMode === 'participation' ? <ElectoralView records={voteRecords} actors={ACTORS} /> :
                <DatabaseView 
                  records={voteRecords} 
                  actors={ACTORS} 
                  latency={latency}
                  onDeleteRecord={id => setVoteRecords(prev => prev.filter(v => v.id !== id))} 
                  googleSheetUrl={googleSheetUrl}
                  onSetGoogleSheetUrl={setGoogleSheetUrl}
                />}
            </div>
          </div>
        </div>
        
        <aside className="space-y-8">
          <AnalysisPanel selectedActor={selectedActor} />
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 text-center space-y-4">
             <div className="w-16 h-16 bg-blue-600/20 rounded-2xl mx-auto flex items-center justify-center">
                <i className={`fa-solid fa-shield-check text-2xl ${latency > 0 ? 'text-emerald-400' : 'text-slate-600'}`}></i>
             </div>
             <h4 className="text-white font-black text-xs uppercase italic tracking-widest">Seguridad de Datos</h4>
             <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">Cada registro se replica en 3 nodos del Hub para garantizar 0 pérdida de información.</p>
          </div>
        </aside>
      </div>

      <button onClick={() => setIsCollectorViewActive(true)} className="fixed bottom-8 right-8 bg-blue-950 text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center border-b-4 border-[#facc15] hover:scale-110 transition-all">
        <i className="fa-solid fa-mobile-screen text-3xl text-[#facc15]"></i>
      </button>
    </div>
  );
};

export default App;
