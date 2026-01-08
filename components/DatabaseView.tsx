
import React, { useState, useMemo } from 'react';
import { VoteRecord, ActorNode } from '../types.ts';
import * as XLSX from 'xlsx';

interface Props {
  records: VoteRecord[];
  actors: ActorNode[];
  onDeleteRecord: (id: string) => void;
  googleSheetUrl: string;
  onSetGoogleSheetUrl: (url: string) => void;
  latency: number;
}

const DatabaseView: React.FC<Props> = ({ records, actors, onDeleteRecord, googleSheetUrl, onSetGoogleSheetUrl, latency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [tempUrl, setTempUrl] = useState(googleSheetUrl);

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      r.voterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.idNumber.includes(searchTerm)
    );
  }, [records, searchTerm]);

  const stats = useMemo(() => {
    const today = new Date().setHours(0,0,0,0);
    return {
      total: records.length,
      today: records.filter(r => r.timestamp >= today).length,
      sectors: new Set(records.map(r => r.actorId)).size
    };
  }, [records]);

  const handleExportExcel = () => {
    if (records.length === 0) return;
    const data = records.map(r => ({
      'CÉDULA': r.idNumber,
      'CIUDADANO': r.voterName.toUpperCase(),
      'TELÉFONO': r.phoneNumber,
      'SECTOR ESTRATÉGICO': actors.find(a => a.id === r.actorId)?.name || 'General',
      'REGISTRADO POR': r.recordedBy || 'ADMIN',
      'FECHA DE REGISTRO': new Date(r.timestamp).toLocaleString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DATABASE_MASTER_102");
    XLSX.writeFile(wb, `DB_TRIANA_102_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-slate-900/40 p-0 rounded-3xl border border-slate-800 h-[550px] flex flex-col overflow-hidden">
      {/* HEADER DE BASE DE DATOS */}
      <div className="bg-slate-950/80 p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
              <i className="fa-solid fa-server text-blue-400 text-xl"></i>
            </div>
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center ${latency > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full bg-white ${latency > 0 ? 'animate-pulse' : ''}`}></div>
            </div>
          </div>
          <div>
            <h3 className="text-white font-black uppercase text-sm italic tracking-widest">Base de Datos Centralizada</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span>Estado: {latency > 0 ? 'Conectado' : 'Sin Conexión'}</span>
              <span className="text-slate-700">•</span>
              <span className={latency > 300 ? 'text-amber-500' : 'text-emerald-500'}>{latency > 0 ? `${latency}ms` : '--'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <input 
            type="text" 
            placeholder="BUSCAR EN LA BASE..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-[10px] text-white focus:border-blue-500 outline-none w-48 font-black uppercase tracking-widest"
           />
           <button onClick={handleExportExcel} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
             <i className="fa-solid fa-file-excel"></i> EXPORTAR
           </button>
        </div>
      </div>

      {/* MINI STATS */}
      <div className="grid grid-cols-3 bg-slate-900/20 border-b border-slate-800/50">
        <div className="p-3 text-center border-r border-slate-800/50">
          <p className="text-[8px] font-black text-slate-600 uppercase">Total Registros</p>
          <p className="text-lg font-black text-white">{stats.total}</p>
        </div>
        <div className="p-3 text-center border-r border-slate-800/50">
          <p className="text-[8px] font-black text-slate-600 uppercase">Ingresos Hoy</p>
          <p className="text-lg font-black text-blue-400">{stats.today}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-[8px] font-black text-slate-600 uppercase">Sectores Activos</p>
          <p className="text-lg font-black text-amber-400">{stats.sectors}</p>
        </div>
      </div>

      {/* TABLA DE DATOS */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/20">
        <table className="w-full text-left text-[11px] font-bold">
          <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-md text-slate-500 border-b border-slate-800 z-10">
            <tr>
              <th className="px-6 py-4 uppercase tracking-widest">Ciudadano</th>
              <th className="px-6 py-4 uppercase tracking-widest">Identificación</th>
              <th className="px-6 py-4 uppercase tracking-widest">Líder Captor</th>
              <th className="px-6 py-4 uppercase tracking-widest">Sector</th>
              <th className="px-6 py-4 text-right uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {filteredRecords.map(r => (
              <tr key={r.id} className="hover:bg-blue-500/5 group transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white uppercase font-black">
                      {r.voterName.charAt(0)}
                    </div>
                    <span className="text-white font-black uppercase tracking-tight">{r.voterName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-slate-400">{r.idNumber}</td>
                <td className="px-6 py-4 italic text-blue-400">{r.recordedBy || 'Admin'}</td>
                <td className="px-6 py-4">
                   <span className="px-2 py-1 bg-slate-900 rounded text-[9px] text-slate-500 border border-slate-800">
                    {actors.find(a => a.id === r.actorId)?.name.split(' ')[1] || 'S/A'}
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onDeleteRecord(r.id)} className="text-slate-700 hover:text-red-500 transition-all p-2">
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecords.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-4">
             <i className="fa-solid fa-database text-4xl text-slate-800"></i>
             <p className="text-slate-600 font-black uppercase text-xs tracking-[0.3em]">No se encontraron registros en el Hub</p>
          </div>
        )}
      </div>

      {/* FOOTER DE ESTADO */}
      <div className="bg-slate-900/50 p-4 border-t border-slate-800 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Base de Datos Operativa • Boyacá 102</span>
         </div>
         <button onClick={() => setShowConfig(true)} className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 hover:text-blue-300">
           <i className="fa-solid fa-gears"></i> Parámetros de Red
         </button>
      </div>

      {showConfig && (
        <div className="absolute inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl p-8 flex flex-col justify-center items-center text-center">
           <div className="max-w-xs w-full space-y-6">
              <h3 className="text-white font-black uppercase text-sm italic tracking-widest">Enlace de Respaldo</h3>
              <input 
                type="text" 
                value={tempUrl} 
                onChange={e => setTempUrl(e.target.value)}
                placeholder="Google App Script URL..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-[10px] text-blue-400 font-mono outline-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowConfig(false)} className="flex-1 py-3 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase">Cancelar</button>
                <button onClick={() => {onSetGoogleSheetUrl(tempUrl); setShowConfig(false);}} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">Guardar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseView;
