
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
    { label: 'DEPTO', value: 'BOYACA', color: 'bg-[#82c682]', textColor: 'text-slate-900' },
    { label: 'POTENCIAL MUNICIPIO', value: potentialVoters.toLocaleString(), color: 'bg-[#e75a24]', textColor: 'text-slate-900' },
    { label: 'VOTOS CAPTADOS (ID)', value: currentVotes.toLocaleString(), color: 'bg-[#f6cd4a]', textColor: 'text-slate-900', highlight: true },
    { label: 'META EDUARD TRIANA', value: targetVotes.toLocaleString(), color: 'bg-[#ffa68b]', textColor: 'text-slate-900' },
    { label: 'FALTANTES PARA META', value: remaining.toLocaleString(), color: 'bg-[#f06292]', textColor: 'text-slate-900' },
  ];

  return (
    <div className="space-y-4 mb-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`${stat.color} p-4 rounded shadow-lg flex flex-col justify-between min-h-[110px] transition-all duration-500 transform hover:scale-105 relative overflow-hidden group`}
          >
            {/* Background pattern for dynamic feel */}
            <div className="absolute -right-4 -bottom-4 opacity-10 text-4xl group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            
            <span className="text-[10px] font-black opacity-70 uppercase tracking-tighter leading-none mb-2 z-10">
              {stat.label}
            </span>
            <div className="flex flex-col z-10">
              <span className={`text-2xl md:text-3xl font-black tracking-tighter ${stat.textColor} transition-all duration-300`}>
                {stat.value}
              </span>
              {stat.highlight && (
                <span className="text-[10px] font-bold text-slate-800/60 mt-1">
                  Actualizado en tiempo real
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Progress Bar */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Progreso de Consolidación Territorial
          </span>
          <span className="text-sm font-black text-amber-500">
            {progressPercent.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div 
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(251,191,36,0.3)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[9px] text-slate-500 font-bold uppercase tracking-tight">
          <span>Punto Cero</span>
          <span className="text-slate-400 italic">Captando base electoral...</span>
          <span>Meta: {targetVotes.toLocaleString()} Votos</span>
        </div>
      </div>
    </div>
  );
};

export default ElectoralStats;
