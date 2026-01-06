
import React from 'react';

interface Props {
  currentVotes: number;
}

const ElectoralStats: React.FC<Props> = ({ currentVotes }) => {
  const targetVotes = 1005;
  const potentialVoters = 30226;
  const progressPercent = Math.min((currentVotes / targetVotes) * 100, 100);
  const remaining = Math.max(targetVotes - currentVotes, 0);

  const stats = [
    { label: 'DEPARTAMENTO', value: 'BOYACA', color: 'bg-slate-900', textColor: 'text-sky-400' },
    { label: 'CENSO PAIPA', value: potentialVoters.toLocaleString(), color: 'bg-slate-900', textColor: 'text-white' },
    { label: 'IDENTIFICADOS', value: currentVotes.toLocaleString(), color: 'bg-blue-950', textColor: 'text-amber-400', highlight: true, number: '102' },
    { label: 'META TERRITORIAL', value: targetVotes.toLocaleString(), color: 'bg-blue-600', textColor: 'text-white' },
    { label: 'DIFERENCIA', value: remaining.toLocaleString(), color: 'bg-slate-900', textColor: 'text-amber-400' },
  ];

  return (
    <div className="space-y-4 mb-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`${stat.color} p-4 rounded-2xl shadow-xl flex flex-col justify-between min-h-[120px] transition-all duration-500 border border-white/5 relative group overflow-hidden ${stat.highlight ? 'ring-2 ring-amber-400/50 scale-105 z-20 shadow-amber-900/20' : ''}`}
          >
            <span className={`text-[8px] font-black uppercase tracking-widest mb-1 z-10 ${stat.highlight ? 'text-amber-400' : 'text-slate-500'}`}>
              {stat.label} {stat.number && `(${stat.number})`}
            </span>
            <div className="flex flex-col z-10">
              <span className={`text-3xl md:text-4xl font-black tracking-tighter ${stat.textColor} leading-none`}>
                {stat.value}
              </span>
              {stat.highlight && (
                <span className="text-[10px] font-black text-white uppercase mt-2 tracking-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                  EDUAR TRIANA 102
                </span>
              )}
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 text-6xl group-hover:rotate-12 transition-transform text-white pointer-events-none">
              <i className="fa-solid fa-vote-yea"></i>
            </div>
          </div>
        ))}
      </div>

      {/* Barra de Progreso Campaña */}
      <div className="bg-slate-900 p-5 rounded-[2rem] border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-end mb-3">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em]">Ruta a la Victoria</h4>
            <div className="text-xl font-black text-white uppercase tracking-tighter">Consolidación Territorio Eduar Triana 102</div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-400">
              {progressPercent.toFixed(1)}%
            </span>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Cumplimiento</div>
          </div>
        </div>
        <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden p-1 border border-slate-800 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-700 via-sky-500 to-amber-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(251,191,36,0.3)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
          <span className="flex items-center gap-1 opacity-50"><i className="fa-solid fa-flag-checkered text-sky-500"></i> Paipa</span>
          <span className="text-amber-400 font-black animate-pulse tracking-widest italic">MANO FIRME POR BOYACÁ</span>
          <span className="opacity-50">Meta: {targetVotes.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ElectoralStats;
