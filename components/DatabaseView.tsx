
import React, { useState, useMemo } from 'react';
import { VoteRecord, ActorNode } from '../types.ts';
import * as XLSX from 'xlsx';

interface Props {
  records: VoteRecord[];
  actors: ActorNode[];
  onDeleteRecord: (id: string) => void;
}

const DatabaseView: React.FC<Props> = ({ records, actors, onDeleteRecord }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      r.voterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.idNumber.includes(searchTerm) ||
      actors.find(a => a.id === r.actorId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm, actors]);

  const handleExportExcel = () => {
    if (records.length === 0) return;
    const data = records.map(r => ({
      'Cédula': r.idNumber,
      'Nombre': r.voterName,
      'Celular': r.phoneNumber,
      'Sector': actors.find(a => a.id === r.actorId)?.name,
      'Fecha': new Date(r.timestamp).toLocaleString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Base102_Completa");
    XLSX.writeFile(wb, `Base_Datos_Triana_102_${Date.now()}.xlsx`);
  };

  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-[450px] flex flex-col">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400/20 p-2 rounded-lg border border-amber-400/30 text-amber-400">
            <i className="fa-solid fa-database text-lg"></i>
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Centro de Datos Base 102</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Registros Consolidados Paipa</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
            <input 
              type="text" 
              placeholder="Buscar por nombre, cédula..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:border-amber-400 outline-none transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={handleExportExcel}
            disabled={records.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white p-2 rounded-xl transition-all"
            title="Exportar a Excel"
          >
            <i className="fa-solid fa-file-excel px-2"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-800 rounded-xl bg-slate-950/30">
        {filteredRecords.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-50 italic">
            <i className="fa-solid fa-folder-open text-4xl"></i>
            <p className="text-sm">No se encontraron registros en la base</p>
          </div>
        ) : (
          <table className="w-full text-left text-[11px] uppercase font-bold border-collapse">
            <thead className="sticky top-0 bg-slate-900 text-slate-500 z-10">
              <tr>
                <th className="p-4 border-b border-slate-800">Cédula</th>
                <th className="p-4 border-b border-slate-800">Nombre Completo</th>
                <th className="p-4 border-b border-slate-800">Sector / Gremio</th>
                <th className="p-4 border-b border-slate-800 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredRecords.map(r => (
                <tr key={r.id} className="hover:bg-blue-900/10 text-slate-300 group transition-colors">
                  <td className="p-4 font-mono text-amber-400/80">{r.idNumber}</td>
                  <td className="p-4 text-white font-black">{r.voterName}</td>
                  <td className="p-4">
                    <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[9px] border border-slate-700">
                      {actors.find(a => a.id === r.actorId)?.name || 'S/D'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => onDeleteRecord(r.id)} 
                      className="text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                      title="Eliminar Registro"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online</span>
          <span>Mostrando {filteredRecords.length} de {records.length} registros</span>
        </div>
        <div className="text-amber-400 italic">Paipa - Boyacá 102</div>
      </div>
    </div>
  );
};

export default DatabaseView;
