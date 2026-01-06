
import React, { useEffect, useState, useRef } from 'react';

interface Props {
  currentVotes: number;
}

const ElectoralStats: React.FC<Props> = ({ currentVotes }) => {
  const targetVotes = 1005;
  const potentialVoters = 30226;
  const progressPercent = Math.min((currentVotes / targetVotes) * 100, 100);
  const remaining = Math.max(targetVotes - currentVotes, 0);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const prevVotes = useRef(currentVotes);

  // Efecto visual de "Movimiento" cuando el contador cambia
  useEffect(() => {
    if (currentVotes !== prevVotes.current) {
      setIsAnimating(true);
      if ('vibrate' in navigator) navigator.vibrate(50);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      prevVotes.current = currentVotes;
      return () => clearTimeout(timer);
    }
  }, [currentVotes]);

  const stats = [
    { label: 'DEPARTAMENTO', value: 'BOYACA', color: 'bg-slate-900', textColor: 'text-sky-400' },
    { label: 'CENSO PAIPA', value: potentialVoters.toLocaleString(), color: 'bg-slate-900', textColor: 'text-white' },
    { 
      label: 'IDENTIFICADOS', 
      value: currentVotes.toLocaleString(), 
      color: 'bg-blue-950', 
      textColor: 'text-amber-400', 
      highlight: true, 
      number: '102',
      animate: isAnimating
    },
    { label: 'META TERRITORIAL', value: targetVotes.toLocaleString(), color: 'bg-blue-600', textColor: 'text-white' },
    { label: 'DIFERENCIA', value: remaining.toLocaleString(), color: 'bg-slate-900', textColor: 'text-amber-400' },
  ];

  return (
    <div className="space-y-4 mb-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`${stat.color} p-5 rounded-[2rem] shadow-2xl flex flex-col justify-between min-h-[140px] transition-all duration-500 border border-white/5 relative group overflow-hidden ${stat.highlight ? 'ring-2 ring-amber-400/50 scale-105 z-20' : ''} ${stat.animate ? 'ring-4 ring-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.6)] bg-blue-900' : ''}`}
          >
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 z-10 ${stat.highlight ? 'text-amber-400' : 'text-slate-500'}`}>
              {stat.label} {stat.number && `(${stat.number})`}
            </span>
            <div className="flex flex-col z-10">
              <span className={`text-4xl md:text-5xl font-black tracking-tighter ${stat.textColor} leading-none transition-all duration-300 ${stat.animate ? 'scale-125 translate-x-1' : 'scale-100'}`}>
                {stat.value}
              </span>
              {stat.highlight && (
                <div className="mt-3 flex items-center gap-2">
                   <div className="flex gap-0.5">
                      <span className={`w-1 h-1 rounded-full bg-amber-400 ${stat.animate ? 'animate-bounce' : 'opacity-20'}`}></span>
                      <span className={`w-1 h-1 rounded-full bg-amber-400 ${stat.animate ? 'animate-bounce delay-75' : 'opacity-20'}`}></span>
                      <span className={`w-1 h-1 rounded-full bg-amber-400 ${stat.animate ? 'animate-bounce delay-150' : 'opacity-20'}`}></span>
                   </div>
                   <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                     {stat.animate ? 'ACTUALIZANDO...' : 'RED EN VIVO'}
                   </span>
                </div>
              )}
            </div>
            <div className={`absolute -right-6 -bottom-6 opacity-10 text-7xl transition-transform duration-700 ${stat.animate ? 'rotate-45 scale-150 opacity-30' : 'group-hover:rotate-12'}`}>
              <i className="fa-solid fa-bolt text-white"></i>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        {isAnimating && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-shimmer pointer-events-none"></div>
        )}
        <div className="flex justify-between items-end mb-4">
          <div className="space-y-1">
            <h4 className="text-[11px] font-black text-sky-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              Sincronización Global
            </h4>
            <div className="text-2xl font-black text-white uppercase tracking-tighter italic">Triana 102 • Paipa Victoriosa</div>
          </div>
          <div className="text-right">
            <span className={`text-3xl font-black text-amber-400 transition-all block ${isAnimating ? 'scale-110' : ''}`}>
              {progressPercent.toFixed(1)}%
            </span>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Avance de Meta</div>
          </div>
        </div>
        <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden p-1.5 border border-slate-800 shadow-inner relative">
          <div 
            className="h-full bg-gradient-to-r from-blue-700 via-sky-400 to-amber-400 rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_20px_rgba(251,191,36,0.4)] relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute top-0 right-0 h-full w-8 bg-white/20 blur-sm animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectoralStats;
