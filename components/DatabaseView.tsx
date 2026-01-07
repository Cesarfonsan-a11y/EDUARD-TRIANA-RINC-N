
import React, { useState, useMemo } from 'react';
import { VoteRecord, ActorNode } from '../types.ts';
import * as XLSX from 'xlsx';

interface Props {
  records: VoteRecord[];
  actors: ActorNode[];
  onDeleteRecord: (id: string) => void;
  googleSheetUrl: string;
  onSetGoogleSheetUrl: (url: string) => void;
}

const DatabaseView: React.FC<Props> = ({ records, actors, onDeleteRecord, googleSheetUrl, onSetGoogleSheetUrl }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [tempUrl, setTempUrl] = useState(googleSheetUrl);

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
      'Líder': r.recordedBy || 'Admin',
      'Fecha': new Date(r.timestamp).toLocaleString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Drive_102_Central");
    XLSX.writeFile(wb, `Drive_Triana_102_Export_${Date.now()}.xlsx`);
  };

  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-[450px] flex flex-col overflow-hidden relative">
      
      {/* PANEL DE CONFIGURACIÓN DRIVE */}
      {showConfig && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl p-6 flex flex-col justify-center animate-in fade-in zoom-in duration-300">
          <button onClick={() => setShowConfig(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><i className="fa-solid fa-times text-2xl"></i></button>
          
          <div className="max-w-md mx-auto w-full space-y-6">
            {!showGuide ? (
              <>
                <div className="text-center space-y-2">
                   <div className="w-16 h-16 bg-blue-600/20 rounded-2xl mx-auto flex items-center justify-center border border-blue-500/30 mb-4">
                      <i className="fa-brands fa-google-drive text-3xl text-blue-400"></i>
                   </div>
                   <h3 className="text-xl font-black text-white uppercase italic">Sincronizar con Google Sheets</h3>
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed px-4">Conecta tu propia hoja de cálculo para tener respaldo total en tiempo real.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest ml-1">URL de Aplicación Web (Google Script)</label>
                  <input 
                    type="text" 
                    value={tempUrl} 
                    onChange={e => setTempUrl(e.target.value)} 
                    placeholder="https://script.google.com/macros/s/..." 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-[10px] text-blue-400 focus:border-blue-500 outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowGuide(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-circle-question"></i> ¿Cómo obtenerla?
                  </button>
                  <button 
                    onClick={() => { onSetGoogleSheetUrl(tempUrl); setShowConfig(false); }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-link"></i> Vincular Ahora
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-black text-amber-400 uppercase italic">Guía Paso a Paso</h4>
                  <button onClick={() => setShowGuide(false)} className="text-[9px] font-black text-slate-500 uppercase">Volver</button>
                </div>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    "1. En tu Google Sheet ve a 'Extensiones' > 'Apps Script'",
                    "2. Pega el código proporcionado.",
                    "3. Clic en botón azul 'Implementar' > 'Nueva implementación'",
                    "4. Clic en el ENGRANAJE ⚙️ y elige 'APLICACIÓN WEB'",
                    "5. En 'Quién tiene acceso' pon 'CUALQUIERA'",
                    "6. Al autorizar, clic en 'ADVANCED' y luego en 'GO TO... (UNSAFE)' para permitir el acceso.",
                    "7. Clic en 'Implementar' y COPIA la URL resultante."
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      <span className="bg-amber-400 text-blue-900 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                      <p className="text-[10px] text-slate-300 font-bold leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-table-list text-white text-xl"></i>
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Drive Console</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">Gestión de Activos Electorales</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowConfig(true)}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest shadow-lg ${googleSheetUrl ? 'bg-blue-900/50 text-blue-400 border border-blue-400/30' : 'bg-slate-800 text-slate-500 border border-transparent'}`}
          >
            <i className={`fa-brands fa-google-drive ${googleSheetUrl ? 'fa-beat-slow' : ''}`}></i> 
            {googleSheetUrl ? 'GOOGLE SHEET: ACTIVO' : 'VINCULAR DRIVE'}
          </button>
          <button 
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest shadow-lg"
          >
            <i className="fa-solid fa-download"></i> EXCEL
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar border border-slate-800 rounded-2xl bg-slate-950/30">
        <table className="w-full text-left text-[10px] uppercase font-bold border-collapse">
          <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-md text-slate-500 z-10">
            <tr>
              <th className="p-4 border-b border-slate-800 tracking-widest">Líder</th>
              <th className="p-4 border-b border-slate-800 tracking-widest">ID Cédula</th>
              <th className="p-4 border-b border-slate-800 tracking-widest">Ciudadano</th>
              <th className="p-4 border-b border-slate-800 tracking-widest">Sector</th>
              <th className="p-4 border-b border-slate-800 text-right tracking-widest">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {filteredRecords.map((r) => (
              <tr key={r.id} className="hover:bg-white/5 group transition-colors">
                <td className="p-4">
                  <span className="text-blue-400">{r.recordedBy || 'Admin'}</span>
                </td>
                <td className="p-4 font-mono text-slate-400">{r.idNumber}</td>
                <td className="p-4 text-white">{r.voterName}</td>
                <td className="p-4 text-slate-500">
                  {actors.find(a => a.id === r.actorId)?.name.split(' ')[1]}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => onDeleteRecord(r.id)} className="text-slate-800 hover:text-red-500 transition-all p-2 bg-slate-900/50 rounded-lg">
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={5} className="p-20 text-center text-slate-600 italic uppercase tracking-widest">
                  No hay registros en el Drive Central
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DatabaseView;
