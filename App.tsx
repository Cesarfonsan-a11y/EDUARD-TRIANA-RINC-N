
import React, { useState, useEffect, useCallback } from 'react';
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [isAnimatingLogo, setIsAnimatingLogo] = useState(false);
  
  const [isCollectorViewActive, setIsCollectorViewActive] = useState(() => {
    const isParam = window.location.search.includes('mode=recolector') || window.location.hash.includes('mode=recolector');
    const isSaved = localStorage.getItem('v102_collector_active') === 'true';
    return isParam || isSaved;
  });

  // Efecto para limpiar el contador de toques si pasa mucho tiempo
  useEffect(() => {
    if (tapCount === 0) return;
    const timer = setTimeout(() => setTapCount(0), 1500);
    return () => clearTimeout(timer);
  }, [tapCount]);

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
        if (synced && synced.length !== voteRecords.length) {
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
  }, [voteRecords.length]);

  const handleAddVoteRecord = async (record: Omit<VoteRecord, 'id' | 'timestamp'>) => {
    const newRecord: VoteRecord = {
      ...record,
      id: generateSafeId(),
      timestamp: Date.now()
    };
    
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

  const handleLogoTap = (e: React.MouseEvent | React.TouchEvent) => {
    // Evitamos el comportamiento por defecto de zoom en móviles
    if (e.type === 'touchstart') {
      // e.preventDefault(); // Comentado para no romper el scroll si se toca por error
    }

    // Feedback visual y háptico
    setIsAnimatingLogo(true);
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    setTimeout(() => setIsAnimatingLogo(false), 150);
    
    const nextCount = tapCount + 1;
    if (nextCount >= 3) {
      setTapCount(0);
      // Pequeño delay para que se vea la animación antes del prompt
      setTimeout(() => handleAdminAccess(), 200);
    } else {
      setTapCount(nextCount);
    }
  };

  if (isCollectorViewActive) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center animate-in fade-in duration-500 selection:bg-amber-500/30 overflow-x-hidden">
        {lastRecord && (
          <ThankYouModal 
            voterName={lastRecord.voterName} 
            actorId={lastRecord.actorId}
            voterCount={voteRecords.length}
            phoneNumber={lastRecord.phoneNumber}
            onClose={() => setLastRecord(null)} 
          />
        )}

        <div className="max-w-md w-full px-6 pt-12 pb-24 space-y-12">
          <header className="text-center space-y-6">
            <div className="flex justify-center">
               <div className="bg-emerald-500 text-white px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-white/20 animate-pulse">
                  <i className="fa-solid fa-satellite-dish"></i>
                  CAPTACIÓN ACTIVA
               </div>
            </div>
            
            {/* AREA DE ACCESO SECRETO OPTIMIZADA */}
            <div 
              className={`group space-y-2 select-none transition-all duration-150 active:scale-90 touch-none cursor-pointer py-4 ${isAnimatingLogo ? 'opacity-40 scale-95' : 'opacity-100'}`} 
              onClick={handleLogoTap}
              onTouchStart={(e) => {
                // Solo registramos el toque si es el inicio de la interacción
                if (e.touches.length === 1) handleLogoTap(e);
              }}
            >
              <h1 className="text-7xl font-black text-white tracking-tighter uppercase leading-none italic pointer-events-none">
                TRIANA <span className={`non-italic transition-all duration-300 ${tapCount > 0 ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] scale-110 inline-block' : 'text-[#facc15]'}`}>
                  102
                </span>
              </h1>
              <div className={`h-1 mx-auto rounded-full transition-all duration-300 ${tapCount > 0 ? 'w-32 bg-amber-400' : 'w-20 bg-slate-800'}`}></div>
              {tapCount > 0 && (
                <div className="text-[10px] font-black text-amber-500/40 uppercase tracking-[0.5em] mt-2 animate-pulse">
                  PUERTA ACTIVÁNDOSE...
                </div>
              )}
            </div>
          </header>

          <div className="bg-slate-900/40 rounded-[3.5rem] border-2 border-slate-800 shadow-3xl backdrop-blur-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            <VoteRegistry 
              actors={ACTORS} 
              records={[]} 
              onAddRecord={handleAddVoteRecord} 
              onDeleteRecord={() => {}} 
              isPublic={true} 
            />
          </div>

          <div className="text-center opacity-20">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Paipa, Boyacá • Red Triana 102</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-10 pb-20 animate-in fade-in duration-700">
      {lastRecord && (
        <ThankYouModal 
          voterName={lastRecord.voterName} 
          actorId={lastRecord.actorId}
          voterCount={voteRecords.length}
          phoneNumber={lastRecord.phoneNumber}
          onClose={() => setLastRecord(null)} 
        />
      )}

      {showQRModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-xl" onClick={() => setShowQRModal(false)}>
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center border-[8px] border-amber-400 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-qrcode text-3xl text-amber-600"></i>
            </div>
            <h3 className="text-blue-900 font-black text-xl uppercase italic mb-4">Acceso Recolectores</h3>
            <p className="text-slate-500 text-xs font-bold mb-6 leading-relaxed">
              Active este modo en los dispositivos de campo para que solo vean el formulario de registro.
            </p>
            <button onClick={() => setShowQRModal(false)} className="w-full bg-blue-950 text-white font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl">Cerrar</button>
          </div>
        </div>
      )}

      <header className="relative bg-white rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:min-h-[340px] border border-slate-100 transition-all">
        <div className="md:w-[32%] bg-[#facc15] flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{backgroundImage: 'radial-gradient(circle, #1e3a8a 2px, transparent 2px)', backgroundSize: '24px 24px'}}></div>
           <h2 className="text-5xl font-black text-blue-900 italic leading-[0.9] tracking-tighter z-10 uppercase italic">#POR TI BOYACÁ</h2>
        </div>
        <div className="md:w-[68%] p-8 md:px-20 flex flex-col justify-center relative bg-gradient-to-r from-white to-slate-50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left space-y-1">
              <span className="bg-blue-900 text-white px-6 py-2 font-black rounded-xl text-xs transform -skew-x-12 inline-block mb-4 shadow-xl">CENTRO DEMOCRÁTICO</span>
              <h1 className="text-blue-950 font-black text-7xl md:text-[10rem] tracking-[-0.06em] uppercase leading-[0.8]">TRIANA</h1>
              <span className="text-[#0ea5e9] font-black text-3xl md:text-5xl uppercase tracking-[0.25em] block pl-2 italic">CÁMARA</span>
            </div>
            <div className="relative">
              <span className="text-[10rem] md:text-[14rem] font-black text-[#facc15] italic leading-none drop-shadow-2xl">102</span>
            </div>
          </div>
          
          <div className="absolute top-10 right-10 flex gap-4">
            <button 
              onClick={() => setIsCollectorViewActive(true)} 
              className="bg-blue-900 hover:bg-blue-950 text-white px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-4 border-2 border-white/20"
            >
              <i className="fa-solid fa-user-plus text-xl text-amber-400"></i>
              <span className="font-black uppercase text-xs tracking-widest">Modo Recolector</span>
            </button>
          </div>
        </div>
      </header>

      <ElectoralStats currentVotes={voteRecords.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="bg-slate-900/40 p-2 rounded-[3rem] border border-slate-800 shadow-2xl backdrop-blur-md">
            <div className="flex p-3 gap-3 overflow-x-auto scrollbar-hide">
              <button onClick={() => setViewMode('network')} className={`flex-1 min-w-[120px] py-5 rounded-[1.5rem] text-[12px] font-black uppercase tracking-widest transition-all ${viewMode === 'network' ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/20' : 'text-slate-500 hover:bg-slate-800'}`}>Matriz de Influencia</button>
              <button onClick={() => setViewMode('participation')} className={`flex-1 min-w-[120px] py-5 rounded-[1.5rem] text-[12px] font-black uppercase tracking-widest transition-all ${viewMode === 'participation' ? 'bg-red-500 text-white shadow-xl shadow-red-500/20' : 'text-slate-500 hover:bg-slate-800'}`}>Participación de Red</button>
              <button onClick={() => setViewMode('database')} className={`flex-1 min-w-[120px] py-5 rounded-[1.5rem] text-[12px] font-black uppercase tracking-widest transition-all ${viewMode === 'database' ? 'bg-[#facc15] text-blue-950 shadow-xl shadow-amber-500/20' : 'text-slate-500 hover:bg-slate-800'}`}>Base de Datos</button>
            </div>
            <div className="relative overflow-hidden rounded-[2.5rem]">
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
        <aside className="space-y-10">
          <AnalysisPanel selectedActor={selectedActor} />
          <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 p-10 rounded-[3rem] border border-slate-800 text-center space-y-8 backdrop-blur-xl">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4 ${isSyncing ? 'border-amber-500' : 'border-emerald-500'} bg-white/5`}>
               <i className={`fa-solid ${isSyncing ? 'fa-sync fa-spin' : 'fa-check'} text-4xl ${isSyncing ? 'text-amber-400' : 'text-emerald-400'}`}></i>
            </div>
            <h4 className="text-white font-black uppercase text-sm tracking-[0.3em]">Centro de Mando 102</h4>
          </div>
        </aside>
      </div>

      <footer className="pt-20 pb-10 flex justify-center opacity-10">
        <p className="text-[8px] text-slate-500 uppercase tracking-widest">Control Estratégico Boyacá • v1.4</p>
      </footer>
    </div>
  );
};

export default App;
