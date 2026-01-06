
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

  // EFECTO VISUAL DE CAMBIO
  useEffect(() => {
    if (currentVotes !== prevVotes.current) {
      setIsAnimating(true);
      // Feedback táctico si está disponible
      if ('vibrate' in navigator) navigator.vibrate([10, 30, 10]);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        prevVotes.current = currentVotes;
      }, 2500);
      
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
    <div className="space-y-6 mb-12">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`${stat.color} p-6 rounded-[2.5rem] shadow-2xl flex flex-col justify-between min-h-[160px] transition-all duration-700 border border-white/5 relative group overflow-hidden ${stat.highlight ? 'ring-2 ring-amber-400/50 scale-105 z-20' : ''} ${stat.animate ? 'ring-8 ring-amber-400 shadow-[0_0_100px_rgba(245,158,11,0.8)] bg-blue-900' : ''}`}
          >
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 z-10 ${stat.highlight ? 'text-amber-400' : 'text-slate-500'}`}>
              {stat.label} {stat.number && `(${stat.number})`}
            </span>
            <div className="flex flex-col z-10">
              <span className={`text-5xl md:text-6xl font-black tracking-tighter ${stat.textColor} leading-none transition-all duration-500 ${stat.animate ? 'scale-125 translate-x-2' : 'scale-100'}`}>
                {stat.value}
              </span>
              {stat.highlight && (
                <div className="mt-4 flex items-center gap-3">
                   <div className="flex gap-1">
                      <span className={`w-2 h-2 rounded-full bg-amber-400 ${stat.animate ? 'animate-bounce' : 'opacity-20'}`}></span>
                      <span className={`w-2 h-2 rounded-full bg-amber-400 ${stat.animate ? 'animate-bounce delay-150' : 'opacity-20'}`}></span>
                      <span className={`w-2 h-2 rounded-full bg-amber-400 ${stat.animate ? 'animate-bounce delay-300' : 'opacity-20'}`}></span>
                   </div>
                   <span className="text-[11px] font-black text-white uppercase tracking-widest">
                     {stat.animate ? '¡DATO ENTRANTE!' : 'CONTEO EN VIVO'}
                   </span>
                </div>
              )}
            </div>
            <div className={`absolute -right-8 -bottom-8 opacity-[0.05] text-[10rem] transition-all duration-1000 ${stat.animate ? 'rotate-[45deg] scale-150 opacity-40 translate-x-4' : 'group-hover:rotate-12'}`}>
              <i className="fa-solid fa-bolt text-white"></i>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        {isAnimating && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent animate-shimmer pointer-events-none"></div>
        )}
        <div className="flex justify-between items-end mb-5">
          <div className="space-y-2">
            <h4 className="text-xs font-black text-sky-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
              CENTRAL DE DATOS 102
            </h4>
            <div className="text-3xl font-black text-white uppercase tracking-tighter italic">Triana • Fuerza Paipa Boyacá</div>
          </div>
          <div className="text-right">
            <span className={`text-4xl font-black text-amber-400 transition-all block ${isAnimating ? 'scale-125 translate-y-[-4px]' : ''}`}>
              {progressPercent.toFixed(2)}%
            </span>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em]">Porcentaje de Victoria</div>
          </div>
        </div>
        <div className="w-full bg-slate-950 h-6 rounded-full overflow-hidden p-2 border border-slate-800 shadow-inner relative">
          <div 
            className="h-full bg-gradient-to-r from-blue-800 via-sky-500 to-amber-400 rounded-full transition-all duration-[2000ms] ease-out shadow-[0_0_30px_rgba(251,191,36,0.5)] relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute top-0 right-0 h-full w-12 bg-white/30 blur-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectoralStats;
