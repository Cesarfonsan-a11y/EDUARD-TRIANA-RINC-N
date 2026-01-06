
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
  const [isProcessing, setIsProcessing] = useState(false);

  const motivationalMessage = useMemo(() => {
    const messages = SECTOR_MESSAGES[actorId] || [
      "¡Tu apoyo nos motiva a seguir adelante por Boyacá!",
      "Juntos somos más fuertes. ¡Bienvenido al equipo de la victoria!",
      "Tu registro es un paso más hacia el futuro que soñamos para Paipa."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, [actorId]);

  const handleShareAndSend = async () => {
    if (!cardRef.current) return;
    setIsProcessing(true);

    const wsText = `*HOLA, ${voterName.toUpperCase()}* 👋\n\nAquí tienes tu CARNET OFICIAL como Ciudadano Identificado N° *${voterCount}* de nuestra red en Paipa.\n\n_"${motivationalMessage}"_\n\n*EDUAR TRIANA | 102* 🇨🇴\n*#POR TI BOYACÁ*`;
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;

    try {
      const canvas = await html2canvas(cardRef.current!, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("No se pudo generar el carnet");

      const file = new File([blob], `Carnet_102_${voterName.split(' ')[0]}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Carnet Victoria 102',
          text: wsText
        });
      } else {
        const encodedText = encodeURIComponent(wsText);
        window.open(`https://wa.me/${finalPhone}?text=${encodedText}`, '_blank');
        
        const link = document.createElement('a');
        link.download = file.name;
        link.href = URL.createObjectURL(blob);
        link.click();
        
        alert("Mensaje enviado. El carnet se descargó para que lo adjuntes.");
      }
    } catch (error) {
      console.error("Error al compartir:", error);
      alert("Error al enviar. Intenta de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-2 md:p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="max-w-[280px] md:max-w-xs w-full animate-in zoom-in-95 duration-300 flex flex-col items-center">
        
        {/* CARNET COMPACTO PARA MOVILES */}
        <div 
          ref={cardRef} 
          className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border-[4px] border-amber-400 relative w-full aspect-[2/3.2] flex flex-col"
        >
          <div className="p-3 pt-5 text-center flex-1 flex flex-col justify-between">
            
            <div className="flex justify-center mb-1">
              <div className="bg-red-600 text-white text-[7px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                REGISTRO OFICIAL
              </div>
            </div>

            <div className="bg-blue-900 py-4 px-3 rounded-[1.5rem] shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                  <div className="text-white font-black text-lg italic tracking-tighter uppercase mb-0">
                    NÚMERO
                  </div>
                  <div className="text-amber-400 text-6xl font-black leading-none drop-shadow-lg">
                    {voterCount}
                  </div>
                  <div className="text-white/60 font-black text-[7px] uppercase tracking-[0.1em] mt-2 border-t border-white/10 pt-2">
                    CIUDADANO IDENTIFICADO BOYACÁ
                  </div>
               </div>
            </div>

            <div className="py-2 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="h-[1px] flex-1 bg-slate-100"></div>
                <p className="text-slate-300 font-black uppercase text-[6px] tracking-widest">Agradecimiento</p>
                <div className="h-[1px] flex-1 bg-slate-100"></div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-[1.2rem] border border-slate-100 shadow-inner">
                <p className="text-lg font-black text-blue-900 tracking-tighter mb-1">
                  HOLA, <span className="text-sky-500">{voterName.split(' ')[0].toUpperCase()}</span>
                </p>
                <p className="text-slate-700 font-bold text-[11px] italic leading-tight">
                  "{motivationalMessage}"
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
               <div className="bg-blue-900 py-2 px-4 rounded-xl shadow-lg flex items-center gap-3 border-b-2 border-black/10">
                  <span className="text-amber-400 font-black italic text-2xl">102</span>
                  <div className="h-4 w-[1px] bg-white/20"></div>
                  <div className="text-white font-black uppercase tracking-tighter text-[8px] leading-none text-left">
                    Eduar<br/><span className="text-amber-400">Triana</span>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="bg-amber-400 py-2 text-center mt-auto">
            <span className="text-blue-950 font-black text-[8px] uppercase tracking-[0.3em] italic">#POR TI BOYACÁ</span>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN COMPACTOS */}
        <div className="mt-6 w-full space-y-2">
          <button 
            onClick={handleShareAndSend}
            disabled={isProcessing}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl transition-all shadow-lg active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <i className={`fa-solid ${isProcessing ? 'fa-spinner fa-spin' : 'fa-whatsapp'}`}></i>
            {isProcessing ? 'PROCESANDO...' : 'ENVIAR WHATSAPP'}
          </button>

          <button 
            onClick={onClose}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-3 rounded-xl transition-all text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10"
          >
            <i className="fa-solid fa-plus-circle"></i>
            SIGUIENTE REGISTRO
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouModal;
