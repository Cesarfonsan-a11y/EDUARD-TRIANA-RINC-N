
import React from 'react';
import { ElectoralZone } from '../types';

interface Props {
  zones: ElectoralZone[];
  onZoneClick: (zone: ElectoralZone) => void;
}

const ElectoralView: React.FC<Props> = ({ zones, onZoneClick }) => {
  // Simplified SVG shapes representing "Barrios" of Paipa
  const getFillColor = (percentage: number) => {
    // Red intensity based on voting percentage
    const intensity = Math.round((percentage / 100) * 255);
    return `rgba(239, 68, 68, ${percentage / 100})`;
  };

  return (
    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 h-[450px] relative overflow-hidden">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <i className="fa-solid fa-map-location-dot text-red-500"></i>
        Intensidad Electoral por Zona
      </h3>
      
      <div className="grid grid-cols-2 gap-4 h-full content-start">
        {zones.map(zone => (
          <button
            key={zone.id}
            onClick={() => onZoneClick(zone)}
            className="group relative h-28 rounded-lg border border-slate-800 overflow-hidden transition-all hover:border-red-500/50"
            style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
          >
            <div 
              className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-60" 
              style={{ backgroundColor: getFillColor(zone.votePercentage) }}
            />
            <div className="relative z-10 p-3 text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{zone.name}</div>
              <div className="text-2xl font-black mt-1">{zone.votePercentage}% <span className="text-sm font-normal text-slate-500">Voto</span></div>
              <div className="mt-2 text-xs flex items-center gap-1 text-slate-300">
                <i className="fa-solid fa-helmet-safety text-amber-500"></i>
                Densidad Minera: {zone.workerDensity}%
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="absolute bottom-4 right-4 bg-slate-950/80 p-2 rounded text-[10px] border border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span>% Votación Representante</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span>Concentración de Trabajadores</span>
        </div>
      </div>
    </div>
  );
};

export default ElectoralView;
