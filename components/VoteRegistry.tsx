
import React, { useState } from 'react';
import { ActorNode, VoteRecord } from '../types.ts';

interface Props {
  actors: ActorNode[];
  records: VoteRecord[];
  onAddRecord: (record: Omit<VoteRecord, 'id' | 'timestamp'>) => Promise<void>;
  onDeleteRecord: (id: string) => void;
  isPublic?: boolean;
}

const VoteRegistry: React.FC<Props> = ({ actors, records, onAddRecord, onDeleteRecord, isPublic = false }) => {
  const filteredActors = actors.filter(a => a.id !== 'rep_camara');
  const [selectedActor, setSelectedActor] = useState(filteredActors[0].id);
  const [voterName, setVoterName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterName.trim() || !idNumber.trim() || !phoneNumber.trim() || isSaving) return;
    
    setIsSaving(true);
    try {
      await onAddRecord({ 
        actorId: selectedActor, 
        voterName: voterName.trim(), 
        idNumber: idNumber.trim(),
        phoneNumber: phoneNumber.trim()
      });
      
      setVoterName('');
      setIdNumber('');
      setPhoneNumber('');
    } finally {
      setIsSaving(false);
    }
  };

  if (isPublic) {
    return (
      <div className="p-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
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
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 text-2xl text-white focus:border-[#facc15] outline-none transition-all shadow-inner font-mono" 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-[#facc15] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                <i className="fa-solid fa-user"></i> Nombre Completo
              </label>
              <input 
                type="text" 
                value={voterName} 
                onChange={e => setVoterName(e.target.value)} 
                placeholder="Nombre del ciudadano..." 
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 text-xl text-white focus:border-[#facc15] outline-none transition-all shadow-inner" 
                required 
              />
            </div>

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
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 text-xl text-white focus:border-[#facc15] outline-none transition-all shadow-inner" 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-[#facc15] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                <i className="fa-solid fa-map-pin"></i> Sector de Registro
              </label>
              <select 
                value={selectedActor} 
                onChange={e => setSelectedActor(e.target.value)} 
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 text-xl text-white focus:border-[#facc15] outline-none cursor-pointer appearance-none shadow-inner"
              >
                {filteredActors.map(a => <option key={a.id} value={a.id} className="bg-slate-900">{a.name}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={isSaving}
              className={`w-full font-black py-8 rounded-[2.5rem] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 text-2xl uppercase tracking-tighter ${isSaving ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-[#facc15] hover:bg-amber-500 text-blue-950'}`}
            >
              <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-database'}`}></i>
              {isSaving ? 'CIFRANDO EN NUBE...' : 'GUARDAR EN BASE'}
            </button>
            <p className="text-center text-[9px] text-slate-600 mt-6 uppercase tracking-widest">
              Conexión encriptada con el Hub Central Paipa 102
            </p>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value.replace(/\D/g, ''))} placeholder="Cédula..." className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-white outline-none" required />
          <input type="text" value={voterName} onChange={e => setVoterName(e.target.value)} placeholder="Nombre..." className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-white outline-none" required />
          <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} placeholder="Celular..." className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-white outline-none" required />
          <select value={selectedActor} onChange={e => setSelectedActor(e.target.value)} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-white outline-none">
            {filteredActors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-4 rounded-xl transition-all flex items-center gap-3 disabled:opacity-50">
          <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'}`}></i>
          {isSaving ? 'ENVIANDO A BASE...' : 'AÑADIR A BASE CENTRAL'}
        </button>
      </form>
    </div>
  );
};

export default VoteRegistry;
