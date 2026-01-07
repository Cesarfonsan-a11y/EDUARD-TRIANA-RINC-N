
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
import { syncWithDrive } from './services/syncService.ts';

const App: React.FC = () => {
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

  const dailyCount = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return voteRecords.filter(r => r.timestamp >= today).length;
  }, [voteRecords]);

  useEffect(() => {
    localStorage.setItem('triana_v102_drive_local', JSON.stringify(voteRecords));
  }, [voteRecords]);

  useEffect(() => {
    localStorage.setItem('v102_leader_name', leaderName);
    localStorage.setItem('v102_google_url', googleSheetUrl);
    localStorage.setItem('v102_collector_active', isCollectorViewActive.toString());
  }, [leaderName, googleSheetUrl, isCollectorViewActive]);

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
    // SINCRONIZACIÓN EN TIEMPO REAL: Cada 15 segundos los celulares/PCs se hablan entre sí vía Hub Central
    const interval = setInterval(() => performDriveSync(), 15000); 
    return () => clearInterval(interval);
  }, [performDriveSync]);

  const handleAddVoteRecord = async (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    if (voteRecords.some(r => r.idNumber === record.idNumber)) {
      alert("⚠️ REGISTRO DUPLICADO: Esta identificación ya existe en el Consolidado Global.");
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

  // VISTA RECOLECTOR (CELULAR)
  if (isCollectorViewActive && !leaderName) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="bg-slate-900 border border-blue-500/30 rounded-[3rem] p-10 w-full max-w-sm text-center space-y-8 shadow-2xl">
          <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center border-4 border-white/10 shadow-lg">
            <i className="fa-solid fa-tower-broadcast text-3xl text-white"></i>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Estación de Captura</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed px-4">Inicie sesión para conectar este dispositivo al Hub Centralizado</p>
          </div>
          <input 
            type="text" 
            placeholder="NOMBRE DEL LÍDER" 
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center text-white focus:border-blue-500 outline-none uppercase font-black tracking-widest"
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
            className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl transition-all hover:bg-blue-500"
          >
            ACTIVAR NODO
          </button>
        </div>
      </div>
    );
  }

  if (isCollectorViewActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center pb-20 relative overflow-x-hidden font-sans">
        <button onClick={() => setShowAdminLogin(true)} className="absolute top-4 right-4 text-slate-900 z-[100] opacity-50"><i className="fa-solid fa-shield-halved"></i></button>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
             <div className="bg-slate-900 border border-amber-400/20 rounded-[3rem] p-10 w-full max-w-xs text-center space-y-8">
                <h3 className="text-white font-black uppercase text-xs tracking-widest italic">Admin Node Access</h3>
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
        
        <div className="w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl mt-4 border border-slate-800">
           <div className="flex flex-col">
              <div className="bg-[#facc15] p-10 text-center space-y-6 flex flex-col items-center">
                 <h2 className="text-4xl md:text-5xl font-black text-[#1e3a8a] italic uppercase tracking-tighter leading-none">#POR TI BOYACÁ</h2>
                 <div className="bg-[#1e3a8a] text-white px-6 py-2.5 rounded-full inline-flex items-center gap-3 shadow-lg">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-300"></span>
                   </span>
                   <span className="text-[10px] font-black uppercase tracking-widest">DRIVE GLOBAL: {voteRecords.length} REGISTROS</span>
                 </div>
              </div>
              <div className="bg-white p-8 pt-4 pb-10 space-y-1 text-center">
                 <h1 className="text-[#1e3a8a] font-black text-7xl tracking-tighter uppercase leading-none">TRIANA</h1>
                 <span className="text-[#38bdf8] font-black text-3xl uppercase tracking-tighter block italic leading-none">CÁMARA 102</span>
              </div>
           </div>
           
           <div className="px-6 pb-10">
              <VoteRegistry actors={ACTORS} records={voteRecords} onAddRecord={handleAddVoteRecord} onDeleteRecord={() => {}} isPublic={true} />
           </div>
        </div>

        <div className="mt-4 flex gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500 italic">
           <span>LIVE HUB: {lastSyncTime}</span>
           <span className="text-amber-400">NODO: {leaderName.toUpperCase()}</span>
        </div>
      </div>
    );
  }

  // VISTA CENTRO DE MANDO (PC / TABLET)
  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 pb-24 font-sans">
      <header className="bg-white rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border-b-8 border-slate-900">
        <div className="md:w-[45%] bg-[#facc15] flex flex-col items-center justify-center p-12 md:p-16 text-center space-y-8">
           <h2 className="text-5xl md:text-7xl font-black text-[#1e3a8a] italic uppercase tracking-tighter leading-[0.9]">
             #POR TI<br/>BOYACÁ
           </h2>
           <div className="bg-[#1e3a8a] text-white px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-4">
             <i className={`fa-solid fa-sync ${syncState === 'syncing' ? 'fa-spin' : ''}`}></i>
             CONSOLIDADO GLOBAL: {voteRecords.length}
           </div>
        </div>
        
        <div className="md:w-[55%] p-14 md:p-20 flex flex-col items-center md:items-start justify-center bg-white">
           <div className="text-center md:text-left">
              <h1 className="text-[#1e3a8a] font-black text-7xl md:text-[11rem] tracking-tighter uppercase leading-[0.8]">
                TRIANA
              </h1>
              <span className="text-[#38bdf8] font-black text-3xl md:text-7xl uppercase tracking-tighter block italic leading-none mt-2">
                CÁMARA 102
              </span>
           </div>
        </div>
      </header>

      <ElectoralStats currentVotes={voteRecords.length} dailyVotes={dailyCount} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 p-2 rounded-[3rem] border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden">
            <div className="flex p-3 gap-2">
              {[
                { id: 'network', label: 'MAPA DE INFLUENCIA', icon: 'fa-project-diagram' },
                { id: 'participation', label: 'ESTADO DE METAS', icon: 'fa-bullseye' },
                { id: 'database', label: 'DRIVE CENTRALIZADO', icon: 'fa-database' }
              ].map((m) => (
                <button 
                  key={m.id}
                  onClick={() => setViewMode(m.id as any)} 
                  className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${viewMode === m.id ? 'bg-white text-blue-950 shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}
                >
                  <i className={`fa-solid ${m.icon}`}></i>
                  <span className="hidden md:inline">{m.label}</span>
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
          
          <div className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-slate-800 text-center space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                <div className={`w-3 h-3 rounded-full ${syncState === 'syncing' ? 'bg-blue-400 animate-ping' : 'bg-emerald-500'}`}></div>
             </div>
             <div className="space-y-2">
                <i className="fa-solid fa-satellite text-4xl text-slate-700 mb-2"></i>
                <h4 className="text-white font-black uppercase text-xs tracking-widest italic">ESTADO DEL DATA HUB</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                  Sistema sincronizado. Cualquier registro en celular se refleja aquí automáticamente.
                </p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                   <p className="text-[8px] font-black text-slate-600 uppercase mb-1">GLOBAL</p>
                   <p className="text-xl font-black text-white">{voteRecords.length}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                   <p className="text-[8px] font-black text-slate-600 uppercase mb-1">HOY</p>
                   <p className="text-xl font-black text-[#facc15]">{dailyCount}</p>
                </div>
             </div>
          </div>
        </aside>
      </div>

      <button onClick={() => setIsCollectorViewActive(true)} className="fixed bottom-8 right-8 z-[100] bg-blue-950 text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center border-b-4 border-[#facc15] hover:scale-110 active:scale-95 transition-all"><i className="fa-solid fa-mobile-screen text-3xl text-[#facc15]"></i></button>
    </div>
  );
};

export default App;
