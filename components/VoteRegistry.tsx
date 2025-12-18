
import React, { useState } from 'react';
import { ActorNode, VoteRecord } from '../types.ts';
import * as XLSX from 'xlsx';

interface Props {
  actors: ActorNode[];
  records: VoteRecord[];
  onAddRecord: (record: Omit<VoteRecord, 'id' | 'timestamp'>) => void;
  onDeleteRecord: (id: string) => void;
}

const VoteRegistry: React.FC<Props> = ({ actors, records, onAddRecord, onDeleteRecord }) => {
  const [selectedActor, setSelectedActor] = useState(actors[0].id);
  const [voterName, setVoterName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterName.trim() || !idNumber.trim() || !phoneNumber.trim()) return;
    
    onAddRecord({ 
      actorId: selectedActor, 
      voterName: voterName.trim(), 
      idNumber: idNumber.trim(),
      phoneNumber: phoneNumber.trim()
    });
    
    setVoterName('');
    setIdNumber('');
    setPhoneNumber('');
  };

  const handleExportExcel = () => {
    if (records.length === 0) return;

    const dataToExport = records.map(record => {
      const actor = actors.find(a => a.id === record.actorId);
      return {
        'Cédula': record.idNumber,
        'Nombre Completo': record.voterName,
        'Celular': record.phoneNumber,
        'Actor Vinculado': actor?.name || 'No definido',
        'Fecha de Registro': new Date(record.timestamp).toLocaleString('es-CO')
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [
      { wch: 15 }, 
      { wch: 35 }, 
      { wch: 15 }, 
      { wch: 30 }, 
      { wch: 25 }, 
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Votantes Identificados');

    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Base_EduarTriana_102_${dateStr}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const totalRegistered = records.length;

  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-blue-900/30 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500/20 p-2 rounded-lg">
            <i className="fa-solid fa-id-card text-sky-400"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Captación de Votantes (Base 102)</h3>
            <p className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Campaña Eduar Triana - Paipa</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportExcel}
            disabled={records.length === 0}
            className="flex items-center gap-2 bg-slate-800 hover:bg-sky-900 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold border border-slate-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <i className="fa-solid fa-file-excel text-emerald-500 group-hover:scale-110 transition-transform"></i>
            Exportar Excel
          </button>
          <div className="bg-sky-500/10 text-sky-400 px-4 py-2 rounded-lg text-sm font-black border border-sky-500/20 shadow-lg shadow-sky-500/5">
            Total: {totalRegistered.toLocaleString()}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-slate-950/30 p-4 rounded-lg border border-slate-800/50">
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Cédula</label>
          <input 
            type="text" 
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="Documento..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 outline-none transition-all"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Nombre Completo</label>
          <input 
            type="text" 
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            placeholder="Nombres y Apellidos..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 outline-none transition-all"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Celular</label>
          <input 
            type="tel" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="310..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 outline-none transition-all"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Vínculo Territorial</label>
          <select 
            value={selectedActor}
            onChange={(e) => setSelectedActor(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-sky-500 outline-none appearance-none cursor-pointer"
          >
            {actors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 active:scale-95"
        >
          <i className="fa-solid fa-user-plus"></i>
          REGISTRAR
        </button>
      </form>

      <div className="mt-6 max-h-[350px] overflow-y-auto custom-scrollbar border border-slate-800 rounded-lg shadow-inner bg-slate-950/20">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-900 text-slate-500 uppercase font-black z-20 shadow-md">
            <tr>
              <th className="p-4 border-b border-slate-800">Cédula</th>
              <th className="p-4 border-b border-slate-800">Nombre</th>
              <th className="p-4 border-b border-slate-800">Celular</th>
              <th className="p-4 border-b border-slate-800">Vínculo</th>
              <th className="p-4 border-b border-slate-800 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-16 text-center text-slate-600 italic">
                  <div className="flex flex-col items-center gap-2">
                    <i className="fa-solid fa-database text-3xl opacity-10"></i>
                    <span>Inicie la consolidación de la base 102</span>
                  </div>
                </td>
              </tr>
            ) : (
              records.map(record => {
                const actorName = actors.find(a => a.id === record.actorId)?.name;
                return (
                  <tr key={record.id} className="hover:bg-blue-900/10 transition-colors group">
                    <td className="p-4 text-slate-300 font-mono tracking-tighter">{record.idNumber}</td>
                    <td className="p-4 text-slate-100 font-bold uppercase tracking-tight">{record.voterName}</td>
                    <td className="p-4 text-sky-400 font-mono">{record.phoneNumber}</td>
                    <td className="p-4 text-slate-400">
                      <span className="bg-sky-900/40 px-2.5 py-1 rounded text-[10px] border border-sky-800 font-bold text-sky-100 uppercase">
                        {actorName}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => onDeleteRecord(record.id)}
                        className="text-slate-700 hover:text-red-500 p-2 rounded-full hover:bg-red-500/10 transition-all"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VoteRegistry;
