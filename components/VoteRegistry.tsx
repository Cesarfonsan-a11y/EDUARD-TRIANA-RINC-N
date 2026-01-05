
import React, { useState } from 'react';
import { ActorNode, VoteRecord } from '../types.ts';
import * as XLSX from 'xlsx';

interface Props {
  actors: ActorNode[];
  records: VoteRecord[];
  onAddRecord: (record: Omit<VoteRecord, 'id' | 'timestamp'>) => void;
  onDeleteRecord: (id: string) => void;
  isPublic?: boolean;
}

const VoteRegistry: React.FC<Props> = ({ actors, records, onAddRecord, onDeleteRecord, isPublic = false }) => {
  const filteredActors = actors.filter(a => a.id !== 'rep_camara');
  const [selectedActor, setSelectedActor] = useState(filteredActors[0].id);
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
    const data = records.map(r => ({
      'Cédula': r.idNumber,
      'Nombre': r.voterName,
      'Celular': r.phoneNumber,
      'Sector': actors.find(a => a.id === r.actorId)?.name,
      'Fecha': new Date(r.timestamp).toLocaleString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Base102");
    XLSX.writeFile(wb, `Base_Triana_102_${Date.now()}.xlsx`);
  };

  // VISTA PÚBLICA (MODO RECOLECTOR - SOLO 4 CAMPOS)
  if (isPublic) {
    return (
      <div className="p-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {/* 1. CEDULA */}
            <div className="space-y-2">
              <label className="text-[11px] text-[#facc15] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                <i className="fa-solid fa-id-card"></i> Número de Cédula
              </label>
              <input 
                type="text" 
                inputMode="numeric"
                value={idNumber} 
                onChange={e => setIdNumber(e.target.value.replace(/\D/g, ''))} 
                placeholder="000.000.000" 
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 text-2xl text-white focus:border-[#facc15] outline-none transition-all shadow-inner placeholder:text-slate-800 font-mono" 
                required 
              />
            </div>

            {/* 2. NOMBRE */}
            <div className="space-y-2">
              <label className="text-[11px] text-[#facc15] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                <i className="fa-solid fa-user"></i> Nombre Completo
              </label>
              <input 
                type="text" 
                value={voterName} 
                onChange={e => setVoterName(e.target.value)} 
                placeholder="Nombre del ciudadano..." 
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 text-xl text-white focus:border-[#facc15] outline-none transition-all shadow-inner placeholder:text-slate-800" 
                required 
              />
            </div>

            {/* 3. CELULAR */}
            <div className="space-y-2">
              <label className="text-[11px] text-[#facc15] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                <i className="fa-solid fa-phone"></i> Celular / WhatsApp
              </label>
              <input 
                type="tel" 
                inputMode="tel"
                value={phoneNumber} 
                onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
                placeholder="300 000 0000" 
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 text-xl text-white focus:border-[#facc15] outline-none transition-all shadow-inner placeholder:text-slate-800" 
                required 
              />
            </div>

            {/* 4. SECTOR */}
            <div className="space-y-2">
              <label className="text-[11px] text-[#facc15] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                <i className="fa-solid fa-map-pin"></i> Sector de Registro
              </label>
              <div className="relative">
                <select 
                  value={selectedActor} 
                  onChange={e => setSelectedActor(e.target.value)} 
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 text-xl text-white focus:border-[#facc15] outline-none cursor-pointer appearance-none shadow-inner"
                >
                  {filteredActors.map(a => <option key={a.id} value={a.id} className="bg-slate-900">{a.name}</option>)}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-[#facc15] pointer-events-none"></i>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              className="w-full bg-[#facc15] hover:bg-amber-500 text-blue-950 font-black py-8 rounded-[2.5rem] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 text-2xl uppercase tracking-tighter"
            >
              <i className="fa-solid fa-save"></i>
              GUARDAR REGISTRO
            </button>
            <p className="text-center text-[9px] text-slate-600 mt-6 uppercase tracking-widest">
              Al guardar, se genera automáticamente el carnet de victoria
            </p>
          </div>
        </form>
      </div>
    );
  }

  // VISTA ADMINISTRADOR (ORIGINAL CON TODAS LAS OPCIONES)
  return (
    <div className="bg-slate-900/40 p-6 md:p-8 rounded-[2rem] border border-slate-800 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-sky-500/20 p-3 rounded-xl border border-sky-500/30">
            <i className="fa-solid fa-id-card text-sky-400 text-xl"></i>
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Consolidación Territorio 102</h3>
            <p className="text-[10px] text-sky-400 font-black uppercase tracking-[0.2em]">Registro Centralizado - Paipa</p>
          </div>
        </div>
        <button onClick={handleExportExcel} disabled={records.length === 0} className="bg-slate-800 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 flex items-center gap-2">
          <i className="fa-solid fa-file-excel"></i> Exportar Base Completa
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Cédula</label>
            <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value.replace(/\D/g, ''))} placeholder="Cédula..." className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-sky-500 outline-none transition-all shadow-inner" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Nombre</label>
            <input type="text" value={voterName} onChange={e => setVoterName(e.target.value)} placeholder="Nombre..." className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-sky-500 outline-none transition-all shadow-inner" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Celular</label>
            <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} placeholder="Celular..." className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-sky-500 outline-none transition-all shadow-inner" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Sector</label>
            <select value={selectedActor} onChange={e => setSelectedActor(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-sky-500 outline-none cursor-pointer shadow-inner appearance-none">
              {filteredActors.map(a => <option key={a.id} value={a.id} className="bg-slate-900">{a.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 pt-6 border-t border-slate-800/50">
          <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group">
            <i className="fa-solid fa-plus-circle"></i>
            <span className="tracking-widest uppercase">Añadir Registro Manual</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default VoteRegistry;
