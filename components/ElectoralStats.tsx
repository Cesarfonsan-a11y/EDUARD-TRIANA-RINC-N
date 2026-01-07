
import React, { useEffect, useState, useRef } from 'react';

interface Props {
  currentVotes: number;
  dailyVotes: number;
}

const ElectoralStats: React.FC<Props> = ({ currentVotes, dailyVotes }) => {
  const targetVotes = 1005;
  const potentialVoters = 30226;
  const progressPercent = Math.min((currentVotes / targetVotes) * 100, 100);
  const remaining = Math.max(targetVotes - currentVotes, 0);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const prevVotes = useRef(currentVotes);

  useEffect(() => {
    if (currentVotes !== prevVotes.current) {
      setIsAnimating(true);
      if ('vibrate' in navigator) navigator.vibrate([20, 50]);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        prevVotes.current = currentVotes;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentVotes]);

  const stats = [
    { label: 'CENSO PAIPA', value: potentialVoters.toLocaleString(), color: 'bg-slate-900', textColor: 'text-white' },
    { 
      label: 'CONSOLIDADO HUB', 
      value: currentVotes.toLocaleString(), 
      color: 'bg-blue-950', 
      textColor: 'text-amber-400', 
      highlight: true, 
      animate: isAnimating
    },
    { 
      label: 'CAPTURA DIARIA', 
      value: dailyVotes.toLocaleString(), 
      color: 'bg-emerald-950/40', 
      textColor: 'text-emerald-400',
      icon: 'fa-calendar-day'
    },
    { label: 'META VICTORIA', value: targetVotes.toLocaleString(), color: 'bg-blue-600', textColor: 'text-white' },
    { label: 'POR CONSOLIDAR', value: remaining.toLocaleString(), color: 'bg-slate-900', textColor: 'text-amber-400' },
  ];

  return (
    <div className="space-y-4">
      {/* Indicador de Estado Global */}
      <div className="flex items-center gap-3 justify-center md:justify-start px-4">
         <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
         </span>
         <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] italic">Data Hub Centralizado • Sincronización Global Activa</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-5">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`${stat.color} p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-2xl flex flex-col justify-between min-h-[130px] md:min-h-[170px] transition-all duration-500 border border-white/5 relative overflow-hidden ${stat.highlight ? 'ring-2 ring-amber-400/30' : ''} ${stat.animate ? 'ring-4 ring-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.6)]' : ''}`}
          >
            <div className="flex justify-between items-start z-10">
              <span className={`text-[9px] md:text-[11px] font-black uppercase tracking-widest mb-1 ${stat.highlight ? 'text-amber-400' : 'text-slate-500'}`}>
                {stat.label}
              </span>
              {stat.icon && <i className={`fa-solid ${stat.icon} text-[10px] ${stat.textColor} opacity-50`}></i>}
            </div>
            
            <div className="flex flex-col z-10">
              <span className={`text-3xl md:text-6xl font-black tracking-tighter ${stat.textColor} leading-none transition-all ${stat.animate ? 'scale-110' : 'scale-100'}`}>
                {stat.value}
              </span>
              {stat.highlight && (
                <div className="mt-3 flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full bg-amber-400 ${stat.animate ? 'animate-ping' : 'opacity-60'}`}></span>
                   <span className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-tighter">TOTAL DATA HUB</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
           <i className="fa-solid fa-chart-column text-9xl text-white"></i>
        </div>
        
        <div className="flex justify-between items-end mb-4 relative z-10">
          <div className="space-y-2">
            <h4 className="text-[10px] md:text-xs font-black text-sky-400 uppercase tracking-widest flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
              PROGRESO DE VICTORIA 102
            </h4>
            <div className="text-lg md:text-3xl font-black text-white uppercase tracking-tighter italic">Consolidado Nacional • Hub Centralizado</div>
          </div>
          <div className="text-right">
            <span className={`text-2xl md:text-5xl font-black text-amber-400 ${isAnimating ? 'animate-bounce' : ''}`}>
              {progressPercent.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden p-1.5 border border-slate-800 shadow-inner relative z-10">
          <div 
            className="h-full bg-gradient-to-r from-blue-700 via-sky-400 to-amber-400 rounded-full transition-all duration-[1200ms] shadow-[0_0_15px_rgba(56,189,248,0.4)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ElectoralStats;
