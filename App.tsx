
import React, { useState, useEffect, useCallback } from 'react';
import { ACTORS, RELATIONS } from './constants.ts';
import { ActorNode, VoteRecord } from './types.ts';
import NetworkGraph from './components/NetworkGraph.tsx';
import AnalysisPanel from './components/AnalysisPanel.tsx';
import VoteRegistry from './components/VoteRegistry.tsx';
import ElectoralStats from './components/ElectoralStats.tsx';
import ElectoralView from './components/ElectoralView.tsx';
import ThankYouModal from './components/ThankYouModal.tsx';
import DatabaseView from './components/DatabaseView.tsx';
import { syncWithDrive } from './services/syncService.ts';

const App: React.FC = () => {
  // URL Proporcionada por el usuario integrada como default
  const DEFAULT_GOOGLE_URL = "https://script.google.com/macros/s/AKfycbzjNPsSK1gD1e2ZxVQbRV1gt9aB-hPXHcHyXc_XIXpbd2vMOYdBWFvtISlS0YyAFDCZ5Q/exec";

  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>(() => {
    const saved = localStorage.getItem('triana_v102_drive_local');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [leaderName, setLeaderName] = useState(() => localStorage.getItem('v102_leader_name') || '');
  const [googleSheetUrl, setGoogleSheetUrl] = useState(() => localStorage.getItem('v102_google_url') || DEFAULT_GOOGLE_URL);
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string>('--:--');
  const [viewMode, setViewMode] = useState<'network' | 'participation' | 'database'>('network');
  const [selectedActor, setSelectedActor] = useState<ActorNode | null>(null);
  const [lastRecord, setLastRecord] = useState<VoteRecord | null>(null);
  const [isCollectorViewActive, setIsCollectorViewActive] = useState(() => localStorage.getItem('v102_collector_active') === 'true');

  useEffect(() => {
    localStorage.setItem('triana_v102_drive_local', JSON.stringify(voteRecords));
  }, [voteRecords]);

  useEffect(() => {
    localStorage.setItem('v102_leader_name', leaderName);
  }, [leaderName]);

  useEffect(() => {
    localStorage.setItem('v102_google_url', googleSheetUrl);
  }, [googleSheetUrl]);

  const performDriveSync = useCallback(async (currentData?: VoteRecord[]) => {
    const dataToSync = currentData || voteRecords;
    setSyncState('syncing');
    try {
      const merged = await syncWithDrive(dataToSync, googleSheetUrl);
      if (JSON.stringify(merged) !== JSON.stringify(voteRecords)) {
        setVoteRecords(merged);
      }
      setSyncState('idle');
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      setSyncState('error');
    }
  }, [voteRecords, googleSheetUrl]);

  useEffect(() => {
    performDriveSync();
    const interval = setInterval(() => performDriveSync(), 6000);
    return () => clearInterval(interval);
  }, [performDriveSync]);

  const handleAddVoteRecord = async (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    if (voteRecords.some(r => r.idNumber === record.idNumber)) {
      alert("⚠️ Esta cédula ya fue registrada.");
      return;
    }
    const newEntry: VoteRecord = { 
      ...record, 
      id: `v102-${Date.now()}`, 
      timestamp: Date.now(),
      recordedBy: leaderName || 'Admin'
    };
    const updatedRecords = [newEntry, ...voteRecords];
    setVoteRecords(updatedRecords);
    setLastRecord(newEntry);
    await performDriveSync(updatedRecords);
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

  // PANTALLA DE REGISTRO INICIAL DE LÍDER (RECOLECTOR)
  if (isCollectorViewActive && !leaderName) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-blue-500/30 rounded-[3rem] p-10 w-full max-w-sm text-center space-y-8 shadow-2xl">
          <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center border-4 border-white/10 shadow-lg">
            <i className="fa-solid fa-user-tie text-3xl text-white"></i>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Identificación Líder</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ingrese su nombre para reportar al Drive Central</p>
          </div>
          <input 
            type="text" 
            placeholder="Escriba su nombre..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center text-white focus:border-blue-500 outline-none uppercase font-black"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                setLeaderName(e.currentTarget.value.trim());
              }
            }}
          />
          <button 
            onClick={(e) => {
              const input = e.currentTarget.previousSibling as HTMLInputElement;
              if (input.value.trim()) setLeaderName(input.value.trim());
            }}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl active:scale-95"
          >
            Empezar a Recolectar
          </button>
        </div>
      </div>
    );
  }

  if (isCollectorViewActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center pb-20 relative overflow-x-hidden">
        <button onClick={() => setShowAdminLogin(true)} className="absolute top-4 right-4 text-slate-900 z-[100]"><i className="fa-solid fa-lock"></i></button>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
             <div className="bg-slate-900 border border-amber-400/20 rounded-[3rem] p-10 w-full max-w-xs text-center space-y-8">
                <h3 className="text-white font-black uppercase text-xs tracking-widest italic">Drive Admin Access</h3>
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
             <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border bg-blue-900/20 border-blue-400/30 text-white">
                <i className={`fa-solid fa-cloud ${syncState === 'syncing' ? 'fa-beat' : ''} text-blue-400`}></i>
                <span className="text-[9px] font-black uppercase tracking-widest">DRIVE: {leaderName.toUpperCase()}</span>
             </div>
             <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">TRIANA <span className="text-amber-400">102</span></h1>
          </header>
          <div className="bg-slate-900/80 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="h-1.5 w-full bg-[#facc15]"></div>
            <VoteRegistry actors={ACTORS} records={voteRecords} onAddRecord={handleAddVoteRecord} onDeleteRecord={() => {}} isPublic={true} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 pb-24">
      <header className="bg-white rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[400px]">
        <div className="md:w-[45%] bg-[#facc15] flex flex-col items-center justify-center p-12 text-center relative">
           <div className="space-y-8">
             <h2 className="text-5xl md:text-8xl font-black text-[#1e3a8a] italic uppercase tracking-tighter leading-none">
               #POR TI BOYACÁ
             </h2>
             <button 
               onClick={() => performDriveSync()}
               className="bg-[#1e3a8a] text-white px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 mx-auto active:scale-95 transition-all"
             >
               <i className={`fa-solid fa-cloud-arrow-down ${syncState === 'syncing' ? 'fa-bounce' : ''}`}></i>
               DRIVE TRIANA: {voteRecords.length}
             </button>
           </div>
        </div>
        <div className="md:w-[55%] p-14 flex flex-col justify-center bg-white relative">
           <div className="space-y-0">
              <h1 className="text-[#1e3a8a] font-black text-6xl md:text-[10rem] tracking-tighter uppercase leading-[0.85]">
                TRIANA
              </h1>
              <span className="text-[#38bdf8] font-black text-2xl md:text-6xl uppercase tracking-tighter block italic leading-none ml-1">
                CÁMARA 102
              </span>
           </div>
        </div>
      </header>

      <ElectoralStats currentVotes={voteRecords.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 p-2 rounded-[3rem] border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden">
            <div className="flex p-3 gap-2">
              {['network', 'participation', 'database'].map((m) => (
                <button 
                  key={m}
                  onClick={() => setViewMode(m as any)} 
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === m ? 'bg-white text-blue-950 shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}
                >
                  {m === 'network' ? 'Red' : m === 'participation' ? 'Metas' : 'Base de Datos'}
                </button>
              ))}
            </div>
            <div className="h-[550px]">
               {viewMode === 'network' ? <NetworkGraph nodes={ACTORS} links={RELATIONS} onNodeClick={setSelectedActor} /> :
                viewMode === 'participation' ? <ElectoralView records={voteRecords} actors={ACTORS} /> :
                <DatabaseView 
                  records={voteRecords} 
                  actors={ACTORS} 
                  onDeleteRecord={id => setVoteRecords(prev => prev.filter(v => v.id !== id))} 
                  googleSheetUrl={googleSheetUrl}
                  onSetGoogleSheetUrl={setGoogleSheetUrl}
                />}
            </div>
          </div>
        </div>
        <aside className="space-y-8">
          <AnalysisPanel selectedActor={selectedActor} />
          
          <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-800 text-center space-y-3">
             <div className="flex items-center justify-center gap-2 mb-2">
                <i className={`fa-solid ${googleSheetUrl ? 'fa-link text-blue-400' : 'fa-shield-halved text-emerald-500'}`}></i>
                <span className="text-[9px] font-black text-white uppercase tracking-widest">
                  {googleSheetUrl ? 'SINCRO DRIVE GOOGLE OK' : 'RESPALDO EN NUBE SEGURO'}
                </span>
             </div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Sync: {lastSyncTime}</p>
          </div>
        </aside>
      </div>
      <button onClick={() => setIsCollectorViewActive(true)} className="fixed bottom-8 right-8 z-[100] bg-blue-950 text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center border-b-4 border-amber-500 hover:scale-110 active:scale-95 transition-all"><i className="fa-solid fa-mobile-screen-button text-3xl text-amber-400"></i></button>
    </div>
  );
};

export default App;
