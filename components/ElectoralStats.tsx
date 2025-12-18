
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
    { label: 'DEPARTAMENTO', value: 'BOYACA', color: 'bg-[#0a1a3a]', textColor: 'text-sky-400' },
    { label: 'CENSO PAIPA', value: potentialVoters.toLocaleString(), color: 'bg-slate-900', textColor: 'text-white' },
    { label: 'IDENTIFICADOS (102)', value: currentVotes.toLocaleString(), color: 'bg-white', textColor: 'text-blue-950', highlight: true },
    { label: 'META TERRITORIAL', value: targetVotes.toLocaleString(), color: 'bg-blue-600', textColor: 'text-white' },
    { label: 'DIFERENCIA', value: remaining.toLocaleString(), color: 'bg-slate-800', textColor: 'text-amber-400' },
  ];

  return (
    <div className="space-y-4 mb-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`${stat.color} p-4 rounded-xl shadow-lg flex flex-col justify-between min-h-[110px] transition-all duration-500 hover:scale-105 border border-blue-900/20 group`}
          >
            <span className={`text-[9px] font-black opacity-70 uppercase tracking-widest mb-2 z-10 ${stat.textColor}`}>
              {stat.label}
            </span>
            <div className="flex flex-col z-10">
              <span className={`text-2xl md:text-3xl font-black tracking-tighter ${stat.textColor}`}>
                {stat.value}
              </span>
              {stat.highlight && (
                <span className="text-[10px] font-bold text-blue-900/60 mt-1 uppercase">
                  Eduar Triana 102
                </span>
              )}
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-5 text-4xl group-hover:rotate-12 transition-transform">
              <i className="fa-solid fa-vote-yea"></i>
            </div>
          </div>
        ))}
      </div>

      {/* Barra de Progreso Campaña */}
      <div className="bg-[#0a1a3a]/80 p-5 rounded-2xl border border-blue-900 backdrop-blur-sm">
        <div className="flex justify-between items-end mb-3">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em]">Ruta a la Victoria</h4>
            <div className="text-xl font-black text-white">Consolidación Territorio 102</div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-400">
              {progressPercent.toFixed(1)}%
            </span>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">De la Meta</div>
          </div>
        </div>
        <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden p-1 border border-blue-900/30">
          <div 
            className="h-full bg-gradient-to-r from-blue-700 via-sky-500 to-amber-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(56,189,248,0.4)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 text-[10px] text-slate-500 font-bold uppercase">
          <span className="flex items-center gap-1"><i className="fa-solid fa-flag-checkered text-sky-500"></i> Inicio</span>
          <span className="text-amber-400/80 animate-pulse tracking-widest italic">Trabajando con mano firme...</span>
          <span>Meta: {targetVotes.toLocaleString()} Votos Identificados</span>
        </div>
      </div>
    </div>
  );
};

export default ElectoralStats;
