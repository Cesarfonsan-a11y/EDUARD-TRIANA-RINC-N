
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
    { label: 'DPTO', value: 'BOYACA', color: 'bg-slate-900', textColor: 'text-sky-400' },
    { label: 'CENSO', value: potentialVoters.toLocaleString(), color: 'bg-slate-900', textColor: 'text-white' },
    { 
      label: 'IDENTIFICADOS', 
      value: currentVotes.toLocaleString(), 
      color: 'bg-blue-950', 
      textColor: 'text-amber-400', 
      highlight: true, 
      animate: isAnimating
    },
    { label: 'META', value: targetVotes.toLocaleString(), color: 'bg-blue-600', textColor: 'text-white' },
    { label: 'FALTA', value: remaining.toLocaleString(), color: 'bg-slate-900', textColor: 'text-amber-400' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`${stat.color} p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-xl flex flex-col justify-between min-h-[110px] md:min-h-[150px] transition-all duration-500 border border-white/5 relative overflow-hidden ${stat.highlight ? 'ring-2 ring-amber-400/30' : ''} ${stat.animate ? 'ring-4 ring-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.5)]' : ''}`}
          >
            <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 z-10 ${stat.highlight ? 'text-amber-400' : 'text-slate-500'}`}>
              {stat.label}
            </span>
            <div className="flex flex-col z-10">
              <span className={`text-2xl md:text-5xl font-black tracking-tighter ${stat.textColor} leading-none transition-all ${stat.animate ? 'scale-110' : 'scale-100'}`}>
                {stat.value}
              </span>
              {stat.highlight && (
                <div className="mt-2 flex items-center gap-1.5">
                   <span className={`w-1.5 h-1.5 rounded-full bg-amber-400 ${stat.animate ? 'animate-ping' : 'opacity-40'}`}></span>
                   <span className="text-[7px] md:text-[9px] font-black text-white uppercase tracking-tighter">RED 102</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex justify-between items-end mb-3">
          <div className="space-y-1">
            <h4 className="text-[9px] md:text-xs font-black text-sky-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              Sincronización Real
            </h4>
            <div className="text-sm md:text-2xl font-black text-white uppercase tracking-tighter italic">Triana • Fuerza Paipa</div>
          </div>
          <div className="text-right">
            <span className={`text-lg md:text-4xl font-black text-amber-400 ${isAnimating ? 'animate-bounce' : ''}`}>
              {progressPercent.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden p-1 border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-blue-700 via-sky-400 to-amber-400 rounded-full transition-all duration-[1000ms]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ElectoralStats;
