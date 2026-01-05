
import React from 'react';
import { ActorNode, VoteRecord } from '../types';

interface Props {
  records: VoteRecord[];
  actors: ActorNode[];
}

const ElectoralView: React.FC<Props> = ({ records, actors }) => {
  // Filtramos actores políticos para enfocarnos en la red de influencia
  const influenceActors = actors.filter(a => a.id !== 'rep_camara');

  // Calculamos participación por actor
  const participationData = influenceActors.map(actor => {
    const actorRecords = records.filter(r => r.actorId === actor.id);
    const count = actorRecords.length;
    const target = Math.ceil((actor.baseCount || 100) * 0.2); // Meta interna: 20% de su base potencial
    const percentage = Math.min((count / target) * 100, 100);
    
    return {
      ...actor,
      count,
      target,
      percentage
    };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-[450px] relative overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black flex items-center gap-3 uppercase tracking-tight text-white">
          <i className="fa-solid fa-chart-line text-emerald-500"></i>
          Participación de la Red de Influencia
        </h3>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
          Actualizado: Hoy
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {participationData.map(actor => (
          <div 
            key={actor.id}
            className="group relative bg-slate-950/50 rounded-2xl border border-slate-800 p-4 transition-all hover:border-emerald-500/30 hover:bg-slate-900/80"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
                  {actor.name.split(' ')[0]}
                </div>
                <div>
                  <div className="text-sm font-black text-white uppercase tracking-tight">{actor.name.replace(/[^a-z0-9 ]/gi, '')}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{actor.category}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-emerald-400 leading-none">{actor.count}</div>
                <div className="text-[9px] font-black text-slate-600 uppercase mt-1">Registros</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">Compromiso de Red</span>
                <span className={actor.percentage > 70 ? 'text-emerald-500' : actor.percentage > 30 ? 'text-amber-500' : 'text-red-500'}>
                  {actor.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    actor.percentage > 70 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 
                    actor.percentage > 30 ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 
                    'bg-gradient-to-r from-red-600 to-red-400'
                  }`}
                  style={{ width: `${actor.percentage}%` }}
                />
              </div>
            </div>

            {/* Indicador de posición */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-slate-800 rounded-full group-hover:bg-emerald-500 transition-colors"></div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><i className="fa-solid fa-circle text-emerald-500 text-[6px]"></i> Alta</span>
          <span className="flex items-center gap-1.5"><i className="fa-solid fa-circle text-amber-500 text-[6px]"></i> Media</span>
          <span className="flex items-center gap-1.5"><i className="fa-solid fa-circle text-red-500 text-[6px]"></i> Baja</span>
        </div>
        <div className="text-sky-500 italic">Ranking de Victoria 102</div>
      </div>
    </div>
  );
};

export default ElectoralView;
