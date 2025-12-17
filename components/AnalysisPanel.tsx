
import React from 'react';
import { ActorNode, AnalysisResponse } from '../types';

interface Props {
  selectedActor: ActorNode | null;
  analysis: AnalysisResponse | null;
  analysisType: 'actor' | 'registry' | 'general' | null;
  loading: boolean;
  onAnalyze: () => void;
}

const AnalysisPanel: React.FC<Props> = ({ selectedActor, analysis, analysisType, loading, onAnalyze }) => {
  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar">
      {/* Context Banners */}
      {analysisType === 'registry' && !loading && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
          <i className="fa-solid fa-circle-check text-emerald-500"></i>
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Análisis de impacto por registro reciente</span>
        </div>
      )}

      {analysisType === 'general' && !loading && (
        <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
          <i className="fa-solid fa-chart-pie text-blue-500"></i>
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Análisis General de Cobertura Territorial</span>
        </div>
      )}

      {/* Selection Details */}
      <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-xl shadow-black/20">
        {!selectedActor ? (
          <div className="text-slate-500 text-center py-8 italic flex flex-col items-center gap-3">
            <i className="fa-solid fa-hand-pointer text-2xl opacity-20 animate-bounce"></i>
            Toca un gremio o una métrica para activar la inteligencia.
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-500">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${
                selectedActor.category === 'CORE' ? 'bg-slate-700' :
                selectedActor.category === 'SUPPLIER' ? 'bg-amber-500/20 text-amber-500' :
                selectedActor.category === 'CONSUMPTION' ? 'bg-blue-500/20 text-blue-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                <i className={`fa-solid ${
                  selectedActor.category === 'CORE' ? 'fa-industry' :
                  selectedActor.category === 'SUPPLIER' ? 'fa-truck' :
                  selectedActor.category === 'CONSUMPTION' ? 'fa-users' :
                  'fa-building-columns'
                }`}></i>
              </div>
              <h3 className="text-xl font-bold">{selectedActor.name}</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{selectedActor.description}</p>
          </div>
        )}
      </div>

      {/* AI Analysis Section */}
      <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 min-h-[400px] relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <i className="fa-solid fa-shield-halved text-purple-400"></i>
            {analysisType === 'registry' ? 'Impacto Electoral' : 
             analysisType === 'general' ? 'Balance General' : 'Inteligencia Táctica'}
          </h3>
          <button 
            onClick={onAnalyze}
            disabled={loading}
            className="text-[10px] bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white px-3 py-1.5 rounded border border-purple-500/30 transition-all font-black uppercase tracking-widest disabled:opacity-20"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-sync"></i>}
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-purple-500/20 rounded-full animate-ping absolute inset-0"></div>
              <div className="w-16 h-16 border-t-4 border-purple-500 rounded-full animate-spin"></div>
            </div>
            <div className="text-center px-4">
              <p className="text-purple-400 text-sm font-black uppercase tracking-[0.2em] mb-1">
                {analysisType === 'general' ? 'Evaluando Red Completa' : 'Analizando Datos'}
              </p>
              <p className="text-slate-500 text-[10px] animate-pulse italic">
                Cruzando variables territoriales en tiempo real...
              </p>
            </div>
          </div>
        ) : analysis ? (
          <div className="space-y-6 animate-in fade-in duration-700">
            <div className="bg-purple-500/5 p-4 rounded border-l-4 border-purple-500">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-2">Resumen de Inteligencia</h4>
              <p className="text-sm text-slate-100 leading-relaxed font-medium">
                {analysis.summary}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Vínculos Estratégicos</h4>
              <ul className="space-y-2">
                {analysis.correlations.map((c, i) => (
                  <li key={i} className="text-xs flex gap-3 text-slate-300 bg-slate-950/40 p-3 rounded border border-slate-800 hover:border-blue-500/30 transition-colors">
                    <i className="fa-solid fa-link text-blue-500 mt-0.5"></i>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-1">Línea de Acción</h4>
              <div className="space-y-3">
                {analysis.strategicInsights.map((insight, i) => (
                  <div key={i} className="bg-slate-950/60 p-3 rounded border border-slate-800 text-xs text-slate-300 leading-relaxed relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 opacity-5">
                      <i className="fa-solid fa-bullseye text-4xl"></i>
                    </div>
                    <span className="text-amber-500 font-black mr-2">#{i+1}</span>
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 px-4 opacity-40">
            <i className="fa-solid fa-satellite-dish text-5xl text-slate-700 mb-4 block"></i>
            <p className="text-slate-500 text-sm font-medium">
              Esperando disparador (Métricas, Mapa o Registro) para procesar inteligencia real.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;
