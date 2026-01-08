
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

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
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
    setSyncState('syncing');
    try {
      const { records: merged, latency: lat, changed } = await syncWithCloudDatabase(currentData || voteRecords, googleSheetUrl);
      
      if (changed) {
        setVoteRecords(merged);
      }
      
      setLatency(lat);
      setSyncState('idle');
      return true;
    } catch (e) {
      setSyncState('error');
      setLatency(-1);
      return false;
    }
  }, [voteRecords, googleSheetUrl]);

  // Handshake inicial con la MASTER_DATABASE_V4: Bloqueante para asegurar sincronía
  useEffect(() => {
    const initConnection = async () => {
      let success = false;
      let attempts = 0;
      
      // Intentamos sincronizar hasta 3 veces al inicio si falla
      while (!success && attempts < 3) {
        success = await performDatabaseSync();
        if (!success) await new Promise(r => setTimeout(r, 1000));
        attempts++;
      }
      
      setIsConnecting(false);
    };
    
    initConnection();
    
    // Sincronización en segundo plano cada 10 segundos para mayor frescura de datos
    const interval = setInterval(() => performDatabaseSync(), 10000); 
    return () => clearInterval(interval);
  }, [performDatabaseSync]);

  const handleAddVoteRecord = async (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    // Verificación local inmediata
    if (voteRecords.some(r => r.idNumber === record.idNumber)) {
      alert("⚠️ CÉDULA YA REGISTRADA: El ciudadano ya existe en el Hub Central.");
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
    
    // Sincronización forzada inmediata tras añadir un registro
    await performDatabaseSync(updatedRecords);
  };

  const dailyCount = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return voteRecords.filter(r => r.timestamp >= today).length;
  }, [voteRecords]);

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="relative">
          <div className="w-40 h-40 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <i className="fa-solid fa-satellite-dish text-5xl text-blue-500 animate-pulse mb-2"></i>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Sincronizando</span>
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-white font-black uppercase text-2xl italic tracking-tighter">Descargando Hub Central</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] max-w-xs leading-relaxed">
            Obteniendo registros de todos los dispositivos conectados...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isCollectorViewActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500 rounded-full blur-[150px]"></div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-slate-800 p-12 rounded-[3.5rem] w-full max-w-lg shadow-2xl relative z-10 space-y-10">
          <div className="text-center space-y-4">
            <div className="bg-blue-600 text-white w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 mb-6">
               <i className="fa-solid fa-lock-open text-3xl"></i>
            </div>
            <h2 className="text-white font-black text-3xl uppercase tracking-tighter italic">MASTER GATEWAY</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Boyacá 102 • Hub de Datos Triana</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <button 
              onClick={() => setIsAuthenticated(true)}
              className="group bg-blue-600 hover:bg-blue-500 p-8 rounded-[2rem] text-left transition-all hover:scale-[1.02] active:scale-95"
             >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-black text-xl uppercase italic">Estratega Nacional</h3>
                    <p className="text-blue-200 text-[10px] font-bold uppercase mt-1">Acceso total • Análisis • Gestión</p>
                  </div>
                  <i className="fa-solid fa-chevron-right text-blue-300 group-hover:translate-x-2 transition-transform"></i>
                </div>
             </button>

             <button 
              onClick={() => { setIsCollectorViewActive(true); }}
              className="group bg-slate-800 hover:bg-slate-700 p-8 rounded-[2rem] text-left transition-all hover:scale-[1.02] active:scale-95"
             >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-black text-xl uppercase italic">Líder de Captura</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">Modo Móvil • Registro Rápido</p>
                  </div>
                  <i className="fa-solid fa-mobile-screen text-slate-500 group-hover:translate-x-2 transition-transform"></i>
                </div>
             </button>
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-center gap-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                SINCRO OK: {voteRecords.length} REGISTROS
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCollectorViewActive && !leaderName) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-blue-500/30 rounded-[3rem] p-10 w-full max-w-sm text-center space-y-8">
           <div className="w-16 h-16 bg-blue-600/20 rounded-2xl mx-auto flex items-center justify-center border border-blue-500/30 mb-2">
              <i className="fa-solid fa-user-tag text-blue-400 text-2xl"></i>
           </div>
           <div className="space-y-2">
              <h2 className="text-white font-black uppercase text-xl italic">Identificación de Líder</h2>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Sus registros se vincularán a este nombre</p>
           </div>
           <input 
            type="text" 
            placeholder="NOMBRE Y APELLIDO" 
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center text-white font-black uppercase tracking-widest placeholder:opacity-30 focus:border-blue-500 outline-none transition-all" 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const name = e.currentTarget.value.trim();
                if (name) {
                  setLeaderName(name);
                  localStorage.setItem('v102_leader_name', name);
                }
              }
            }} 
           />
           <button onClick={() => setIsCollectorViewActive(false)} className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-slate-400 transition-colors">Regresar al Portal</button>
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
                 SINCRO HUB: {voteRecords.length}
              </div>
           </div>
           <VoteRegistry actors={ACTORS} records={voteRecords} onAddRecord={handleAddVoteRecord} onDeleteRecord={() => {}} isPublic={true} />
        </div>
        <button onClick={() => setIsCollectorViewActive(false)} className="mt-8 text-slate-500 font-black text-[10px] uppercase tracking-widest">Cerrar Sesión de Líder</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 pb-24 font-sans">
      <header className="bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border-b-8 border-slate-950">
        <div className="md:w-[40%] bg-[#facc15] p-12 text-center flex flex-col items-center justify-center space-y-4">
           <h2 className="text-5xl font-black text-[#1e3a8a] italic uppercase tracking-tighter leading-none">HUB ESTRATÉGICO<br/><span className="text-3xl">BOYACÁ 102</span></h2>
           <div className="bg-[#1e3a8a] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
             <i className={`fa-solid fa-server ${syncState === 'syncing' ? 'fa-beat' : ''}`}></i>
             DB V4: {voteRecords.length} REGISTROS TOTALES
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
                  {m === 'network' ? 'MAPA ECOSISTEMA' : m === 'participation' ? 'METAS DE RED' : 'GESTIÓN DE HUB'}
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
                <i className={`fa-solid fa-cloud-check text-2xl ${latency > 0 ? 'text-emerald-400' : 'text-slate-600'}`}></i>
             </div>
             <h4 className="text-white font-black text-xs uppercase italic tracking-widest">Enlace Maestro Sincronizado</h4>
             <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">Viendo datos en tiempo real de toda la red.</p>
             <button onClick={() => setIsAuthenticated(false)} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 mt-4 block mx-auto">Cerrar Sesión Segura</button>
          </div>
        </aside>
      </div>

      <button onClick={() => setIsCollectorViewActive(true)} className="fixed bottom-8 right-8 bg-blue-950 text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center border-b-4 border-[#facc15] hover:scale-110 transition-all z-[100]">
        <i className="fa-solid fa-mobile-screen text-3xl text-[#facc15]"></i>
      </button>
    </div>
  );
};

export default App;
