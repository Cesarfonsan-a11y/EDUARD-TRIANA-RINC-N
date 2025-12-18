
import React from 'react';
import { ActorNode } from '../types.ts';

interface Props {
  selectedActor: ActorNode | null;
}

const AnalysisPanel: React.FC<Props> = ({ selectedActor }) => {
  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar">
      {/* Información del Actor Seleccionado */}
      <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 shadow-xl shadow-black/20">
        {!selectedActor ? (
          <div className="text-slate-500 text-center py-12 italic flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-800">
              <i className="fa-solid fa-hand-pointer text-2xl opacity-20"></i>
            </div>
            <p className="text-sm font-medium px-4">Seleccione un sector en el mapa para visualizar detalles estratégicos.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-xl shadow-lg ${
                selectedActor.category === 'CORE' ? 'bg-blue-900/50 text-blue-300' :
                selectedActor.category === 'SUPPLIER' ? 'bg-sky-500/20 text-sky-500' :
                selectedActor.category === 'CONSUMPTION' ? 'bg-slate-700 text-white' :
                'bg-amber-400 text-blue-900'
              }`}>
                <i className={`fa-solid text-xl ${
                  selectedActor.category === 'CORE' ? 'fa-industry' :
                  selectedActor.category === 'SUPPLIER' ? 'fa-truck' :
                  selectedActor.category === 'CONSUMPTION' ? 'fa-users' :
                  'fa-landmark'
                }`}></i>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Actor Estratégico</div>
                <h3 className="text-2xl font-black text-white leading-tight">{selectedActor.name}</h3>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Análisis de Influencia</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{selectedActor.description}</p>
              </div>

              {selectedActor.baseCount && (
                <div className="flex items-center justify-between p-4 bg-blue-900/10 rounded-lg border border-blue-900/30">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-users-gear text-sky-400"></i>
                    <span className="text-xs font-bold text-slate-300 uppercase">Potencial de Votos</span>
                  </div>
                  <span className="text-xl font-black text-amber-400">{selectedActor.baseCount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Estado: Prioritario
              </div>
              <div className="text-[10px] font-black text-amber-400 italic">
                Triana #102
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;
