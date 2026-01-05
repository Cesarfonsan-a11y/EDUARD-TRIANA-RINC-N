
import React, { useState, useEffect } from 'react';
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
  
  const [isCollectorViewActive, setIsCollectorViewActive] = useState(() => {
    const isParam = window.location.search.includes('mode=recolector') || window.location.hash.includes('mode=recolector');
    const isSaved = localStorage.getItem('v102_collector_active') === 'true';
    return isParam || isSaved;
  });

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

    // FORMATO DE MENSAJE "ESTILO TARJETA" PARA WHATSAPP
    const messages = SECTOR_MESSAGES[record.actorId] || ["¡Bienvenido al equipo de la victoria!"];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    const voterCount = updated.length;
    
    const wsText = `*━━━━━━━━━━━━━━━*
*🔴 REGISTRO OFICIAL*
*━━━━━━━━━━━━━━━*

*NÚMERO ${voterCount}*
_CIUDADANO IDENTIFICADO BOYACÁ_

*HOLA, ${record.voterName.toUpperCase()}* 👋

_"${randomMsg}"_

*━━━━━━━━━━━━━━━*
*EDUAR TRIANA | 102*
_Cámara de Representantes_
*#UnidosPorTiBoyacá* 🇨🇴
*━━━━━━━━━━━━━━━*`;

    const encodedText = encodeURIComponent(wsText);
    const cleanPhone = record.phoneNumber.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
    
    setTimeout(() => {
      window.open(`https://wa.me/${finalPhone}?text=${encodedText}`, '_blank');
    }, 800);
  };

  const handleManualAccess = () => {
    const code = prompt("Ingrese código de acceso (102 para alternar modo):");
    if (code === "102") {
      if (isCollectorViewActive) {
        handleExitCollector();
      } else {
        setIsCollectorViewActive(true);
      }
    } else if (code) {
      alert("Código incorrecto");
    }
  };

  const handleExitCollector = () => {
    localStorage.removeItem('v102_collector_active');
    const url = new URL(window.location.href);
    url.searchParams.delete('mode');
    window.history.replaceState({}, '', url.pathname + url.search);
    setIsCollectorViewActive(false);
  };

  if (isCollectorViewActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center animate-in fade-in duration-500">
        {lastRecord && (
          <ThankYouModal 
            voterName={lastRecord.voterName} 
            actorId={lastRecord.actorId}
            voterCount={voteRecords.length}
            phoneNumber={lastRecord.phoneNumber}
            onClose={() => setLastRecord(null)} 
          />
        )}
        
        <div className="max-w-md w-full px-6 pt-12 pb-24 space-y-10">
          <header className="text-center space-y-5">
            <div className="flex justify-center gap-3">
               <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <i className="fa-solid fa-cloud-bolt animate-pulse"></i>
                  SISTEMA 102 EN LÍNEA
               </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">
                TRIANA <span className="text-[#facc15]">102</span>
              </h1>
              <p className="text-sky-400 font-black text-xs tracking-[0.4em] uppercase italic opacity-70">Registro Territorial Paipa</p>
            </div>
          </header>

          <div className="bg-slate-900/60 rounded-[3rem] border border-slate-800 shadow-3xl backdrop-blur-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            <VoteRegistry 
              actors={ACTORS} 
              records={[]} 
              onAddRecord={handleAddVoteRecord} 
              onDeleteRecord={() => {}} 
              isPublic={true} 
            />
          </div>

          <div className="flex flex-col items-center gap-8">
            <button 
              onClick={() => {
                setIsSyncing(true);
                syncWithCloud(voteRecords).finally(() => {
                  setIsSyncing(false);
                });
              }}
              className="bg-slate-900/40 hover:bg-slate-800 text-slate-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-800/50 flex items-center gap-3"
            >
              <i className={`fa-solid fa-arrows-rotate ${isSyncing ? 'fa-spin' : ''}`}></i>
              {isSyncing ? 'Sincronizar Datos' : 'Sincronizar Datos'}
            </button>
            
            <button 
              onClick={handleExitCollector}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border border-red-500/20 shadow-lg shadow-red-500/5"
            >
              <i className="fa-solid fa-right-from-bracket mr-2"></i>
              Salir del Modo Recolector
            </button>
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
              <i className="fa-solid fa-triangle-exclamation text-3xl text-amber-600"></i>
            </div>
            <h3 className="text-blue-900 font-black text-xl uppercase italic mb-4">Aviso de Link Temporal</h3>
            <p className="text-slate-500 text-xs font-bold mb-6 leading-relaxed">
              En este entorno de prueba, los links de WhatsApp no funcionan. Usa el código <span className="text-blue-900 font-black">102</span>.
            </p>
            
            <div className="bg-blue-50 p-6 rounded-2xl mb-8 text-left space-y-3 border border-blue-100">
              <p className="text-blue-900 text-[10px] font-black uppercase tracking-widest">Cómo entrar en otro móvil:</p>
              <p className="text-blue-700 text-[11px] font-bold leading-tight">
                1. Abre la app en el otro celular.<br/>
                2. Toca el <i className="fa-solid fa-lock text-blue-900"></i> al final de la página.<br/>
                3. Código: <span className="bg-blue-900 text-white px-2 py-0.5 rounded ml-1">102</span>
              </p>
            </div>

            <button onClick={() => setShowQRModal(false)} className="w-full bg-blue-950 text-white font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl">Entendido</button>
          </div>
        </div>
      )}

      <header className="relative bg-white rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:min-h-[340px] border border-slate-100 transition-all">
        <div className="md:w-[32%] bg-[#facc15] flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{backgroundImage: 'radial-gradient(circle, #1e3a8a 2px, transparent 2px)', backgroundSize: '24px 24px'}}></div>
           <h2 className="text-5xl font-black text-blue-900 italic leading-[0.9] tracking-tighter z-10">#BOYACÁ SE RESPETA</h2>
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
              onClick={() => setShowQRModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all active:scale-95"
              title="Instrucciones para compartir"
            >
              <i className="fa-solid fa-circle-info text-xl"></i>
            </button>

            <button 
              onClick={() => setIsCollectorViewActive(true)} 
              className="bg-blue-900 hover:bg-blue-950 text-white px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-4 border-2 border-white/20"
            >
              <i className="fa-solid fa-users-viewfinder text-xl text-amber-400"></i>
              <span className="font-black uppercase text-xs tracking-widest">Activar Recolector</span>
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
          <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 p-10 rounded-[3rem] border border-slate-800 text-center space-y-8 backdrop-blur-xl group transition-colors">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4 ${isSyncing ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-emerald-500'} bg-white/5`}>
               <i className={`fa-solid ${isSyncing ? 'fa-sync fa-spin' : 'fa-cloud-check'} text-4xl ${isSyncing ? 'text-amber-400' : 'text-emerald-400'}`}></i>
            </div>
            <div className="space-y-3">
               <h4 className="text-white font-black uppercase text-sm tracking-[0.3em]">Central de Inteligencia</h4>
               <p className="text-white/30 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                 {isSyncing ? 'Consolidando base de datos...' : 'Red Paipa 102 Vinculada'}
               </p>
            </div>
          </div>
        </aside>
      </div>

      <footer className="pt-20 pb-10 flex justify-between items-center opacity-30 hover:opacity-100 transition-opacity">
        <button onClick={handleManualAccess} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-all shadow-lg active:scale-90">
          <i className="fa-solid fa-lock text-slate-500 text-xs"></i>
        </button>
        <div className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">
          Eduar Triana 102 • Paipa • 2024
        </div>
      </footer>
    </div>
  );
};

export default App;
