
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
    XLSX.utils.book_append_sheet(wb, ws, "Drive_102_Central");
    XLSX.writeFile(wb, `Drive_Triana_102_Export_${Date.now()}.xlsx`);
  };

  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-[450px] flex flex-col overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-table-list text-white text-xl"></i>
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Drive Console <span className="text-blue-500">v1.02</span></h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">Gestión de Activos Electorales</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
            <input 
              type="text" 
              placeholder="Filtro rápido Drive..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all shadow-inner uppercase font-bold"
            />
          </div>
          <button 
            onClick={handleExportExcel}
            disabled={records.length === 0}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white px-6 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg"
          >
            <i className="fa-solid fa-download"></i> EXCEL
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar border border-slate-800 rounded-2xl bg-slate-950/30">
        <table className="w-full text-left text-[10px] uppercase font-bold border-collapse">
          <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-md text-slate-500 z-10">
            <tr>
              <th className="p-4 border-b border-slate-800 tracking-widest">Status</th>
              <th className="p-4 border-b border-slate-800 tracking-widest">ID Cédula</th>
              <th className="p-4 border-b border-slate-800 tracking-widest">Ciudadano</th>
              <th className="p-4 border-b border-slate-800 tracking-widest">Sector</th>
              <th className="p-4 border-b border-slate-800 text-right tracking-widest">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <i className="fa-solid fa-folder-open text-6xl"></i>
                    <p className="text-xs italic">El Drive está vacío. Comience a recolectar.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((r, i) => (
                <tr key={r.id} className="hover:bg-white/5 group transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                       <span className="text-[8px] text-emerald-500">VIBRANTE</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-400">{r.idNumber}</td>
                  <td className="p-4 text-white">{r.voterName}</td>
                  <td className="p-4">
                    <span className="bg-slate-800/50 text-slate-400 px-3 py-1 rounded-lg border border-slate-800 text-[8px]">
                      {actors.find(a => a.id === r.actorId)?.name.split(' ')[1] || 'GENERAL'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => onDeleteRecord(r.id)} 
                      className="text-slate-800 hover:text-red-500 transition-all p-2 bg-slate-900/50 rounded-lg"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-600">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><i className="fa-solid fa-check-double text-emerald-500"></i> Drive Protegido</span>
          <span>Nodos Conectados: {Math.floor(records.length / 5) + 1}</span>
        </div>
        <div className="text-blue-500">CLOUD SYNC ACTIVE • PAIPA 2024</div>
      </div>
    </div>
  );
};

export default DatabaseView;
