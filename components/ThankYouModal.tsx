
import React, { useRef, useState, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { SECTOR_MESSAGES } from '../constants.ts';

interface Props {
  voterName: string;
  actorId: string;
  voterCount: number;
  phoneNumber: string;
  onClose: () => void;
}

const ThankYouModal: React.FC<Props> = ({ voterName, actorId, voterCount, phoneNumber, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const motivationalMessage = useMemo(() => {
    const messages = SECTOR_MESSAGES[actorId] || [
      "¡Tu apoyo nos motiva a seguir adelante por Boyacá!",
      "Juntos somos más fuertes. ¡Bienvenido al equipo de la victoria!",
      "Tu registro es un paso más hacia el futuro que soñamos para Paipa."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, [actorId]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(cardRef.current!, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `Victoria_102_${voterName.split(' ')[0]}.png`;
        link.href = image;
        link.click();
      } catch (error) {
        console.error("Error al generar imagen:", error);
      } finally {
        setIsDownloading(false);
      }
    }, 300);
  };

  const handleWhatsAppShare = () => {
    const wsText = `*━━━━━━━━━━━━━━━*
*🔴 REGISTRO OFICIAL*
*━━━━━━━━━━━━━━━*

*NÚMERO ${voterCount}*
_CIUDADANO IDENTIFICADO BOYACÁ_

*HOLA, ${voterName.toUpperCase()}* 👋

_"${motivationalMessage}"_

*━━━━━━━━━━━━━━━*
*EDUAR TRIANA | 102*
_Cámara de Representantes_
*#UnidosPorTiBoyacá* 🇨🇴
*━━━━━━━━━━━━━━━*`;

    const encodedText = encodeURIComponent(wsText);
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
    window.open(`https://wa.me/${finalPhone}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-2xl animate-in fade-in duration-500 overflow-y-auto">
      <div className="max-w-lg w-full my-8 transform animate-in zoom-in-95 duration-300">
        
        <div className="relative mx-auto" style={{ maxWidth: '460px' }}>
          
          <div 
            ref={cardRef} 
            className="bg-white rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.4)] overflow-hidden border-[6px] border-[#facc15] relative"
          >
            {/* Header del carnet */}
            <div className="p-8 pb-10 text-center space-y-8 relative">
              
              {/* Badge superior derecho */}
              <div className="absolute top-6 right-6 z-20">
                <div className="bg-[#dc2626] text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-xl border border-white/10 transform rotate-1">
                  REGISTRO OFICIAL
                </div>
              </div>

              {/* Bloque Azul de Número */}
              <div className="bg-[#1e3a8a] py-14 px-6 rounded-[2.5rem] shadow-2xl relative mt-4 overflow-hidden">
                 {/* Patrón de puntos decorativos */}
                 <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
                 
                 <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="text-white font-black text-6xl italic tracking-tighter flex items-center gap-4">
                      NÚMERO 
                      <span className="text-[#facc15] text-8xl drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)] non-italic">
                        {voterCount}
                      </span>
                    </div>
                    <div className="text-white/80 font-black text-[14px] uppercase tracking-[0.2em] mt-6 border-t border-white/20 pt-6 w-full max-w-[80%] mx-auto">
                      CIUDADANO IDENTIFICADO BOYACÁ
                    </div>
                 </div>
              </div>

              {/* Separador de mensaje */}
              <div className="space-y-8 px-2">
                <div className="flex items-center justify-center gap-5">
                  <div className="h-[1.5px] flex-1 bg-slate-100"></div>
                  <p className="text-slate-400 font-black uppercase text-[11px] tracking-[0.4em]">Un mensaje para ti</p>
                  <div className="h-[1.5px] flex-1 bg-slate-100"></div>
                </div>
                
                {/* Cuadro de saludo personalizado */}
                <div className="bg-slate-50/80 p-10 rounded-[2.5rem] border border-slate-100 relative">
                  <p className="text-4xl font-black text-[#1e3a8a] leading-none mb-6 tracking-tighter">
                    HOLA, <span className="text-[#0ea5e9]">{voterName.split(' ')[0].toUpperCase()}</span>
                  </p>
                  <p className="text-slate-700 font-bold text-2xl leading-[1.3] italic px-2">
                    "{motivationalMessage}"
                  </p>
                </div>
              </div>
              
              {/* Botón/Bloque de Firma Triana */}
              <div className="flex flex-col items-center pt-2">
                 <div className="bg-[#1e3a8a] py-5 px-12 rounded-[1.5rem] shadow-2xl flex items-center gap-8 border-b-4 border-black/20">
                    <span className="text-[#facc15] font-black italic text-5xl">102</span>
                    <div className="h-12 w-[2px] bg-white/20"></div>
                    <span className="text-white font-black uppercase tracking-tighter text-2xl leading-none text-left">
                      Eduar<br/><span className="text-[#facc15]">Triana</span>
                    </span>
                 </div>
              </div>
            </div>
            
            {/* Footer Amarillo */}
            <div className="bg-[#facc15] py-4 text-center">
              <span className="text-[#1e3a8a] font-black text-[11px] uppercase tracking-[0.5em] italic">#UNIDOS POR TI BOYACÁ</span>
            </div>
          </div>

          {/* Acciones del Modal */}
          <div className="mt-10 space-y-4 px-4">
            <button 
              onClick={handleWhatsAppShare}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-6 rounded-[2.2rem] transition-all shadow-2xl active:scale-95 text-xl uppercase tracking-widest flex items-center justify-center gap-4"
            >
              <i className="fa-brands fa-whatsapp text-3xl"></i>
              REENVIAR POR WHATSAPP
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-[#1e293b] hover:bg-slate-800 text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-image'}`}></i>
                {isDownloading ? 'CREANDO...' : 'DESCARGAR FOTO'}
              </button>
              
              <button 
                onClick={onClose}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-600 font-black py-5 rounded-2xl transition-all text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
              >
                CERRAR Y VOLVER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouModal;
