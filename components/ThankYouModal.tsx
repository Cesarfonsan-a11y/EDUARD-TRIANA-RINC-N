
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
    const messages = SECTOR_MESSAGES[actorId] || ["¡Juntos por Boyacá!"];
    return messages[Math.floor(Math.random() * messages.length)];
  }, [actorId]);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsProcessing(true);

    const wsText = `*HOLA, ${voterName.toUpperCase()}* 👋\n\nBienvenido a la red de *EDUAR TRIANA - 102* 🇨🇴\n\nEres nuestro ciudadano identificado N° *${voterCount}*.\n\n_"${motivationalMessage}"_\n\n*#POR TI BOYACÁ*`;
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;

    try {
      const canvas = await html2canvas(cardRef.current!, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
      if (!blob) throw new Error("Error de imagen");

      const file = new File([blob], `Carnet_102_${voterName.split(' ')[0]}.png`, { type: 'image/png' });

      // PRIORIDAD: Intentar compartir directamente el archivo (funciona en muchos Android modernos sin guardar contacto)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Carnet Victoria 102',
          text: wsText
        });
      } else {
        // FALLBACK: Descargar imagen y abrir WhatsApp Chat
        const link = document.createElement('a');
        link.download = `Carnet_Triana_102_${voterName.split(' ')[0]}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();

        // Pequeña espera para que inicie la descarga antes de saltar a WhatsApp
        setTimeout(() => {
          window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(wsText)}`, '_blank');
          alert("1. Carnet descargado en tu galería.\n2. Se abrirá WhatsApp: Adjunta la imagen descargada.");
        }, 1000);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="max-w-xs w-full flex flex-col items-center">
        
        {/* CARNET REDISEÑADO - TIPO CREDENCIAL VIP */}
        <div 
          ref={cardRef} 
          className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden border-[6px] border-[#facc15] relative w-full aspect-[2/3.4] flex flex-col"
        >
          {/* Cabecera Dorada */}
          <div className="bg-[#facc15] py-4 text-center">
            <div className="text-blue-950 font-black text-[10px] uppercase tracking-[0.3em]">Credencial de Victoria</div>
          </div>

          <div className="flex-1 p-6 flex flex-col justify-between text-center">
            
            <div className="space-y-1">
              <div className="text-blue-900 font-black text-xs uppercase tracking-widest opacity-40">Identificado N°</div>
              <div className="text-7xl font-black text-blue-950 italic tracking-tighter drop-shadow-sm leading-none">
                {voterCount}
              </div>
            </div>

            <div className="relative py-4">
               <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] rotate-12 pointer-events-none">
                  <span className="text-9xl font-black">102</span>
               </div>
               <div className="bg-slate-50 rounded-[2rem] p-5 border border-slate-100 shadow-inner relative z-10">
                  <p className="text-slate-400 font-black text-[8px] uppercase tracking-widest mb-2">Ciudadano Registrado</p>
                  <h3 className="text-2xl font-black text-blue-900 leading-none uppercase tracking-tighter mb-3">
                    {voterName.toUpperCase()}
                  </h3>
                  <div className="h-0.5 w-8 bg-amber-400 mx-auto mb-3"></div>
                  <p className="text-slate-600 font-bold text-[11px] leading-tight italic px-2">
                    "{motivationalMessage}"
                  </p>
               </div>
            </div>

            <div className="flex flex-col items-center gap-3">
               <div className="bg-blue-950 py-3 px-6 rounded-2xl shadow-xl flex items-center gap-4 border-b-4 border-amber-500">
                  <div className="text-white text-left leading-none">
                    <div className="text-[10px] font-bold opacity-60">CAMARA</div>
                    <div className="text-xl font-black text-amber-400 italic">TRIANA</div>
                  </div>
                  <div className="w-[1px] h-8 bg-white/20"></div>
                  <div className="text-4xl font-black text-white italic leading-none">102</div>
               </div>
               <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Boyacá • 2024</div>
            </div>
          </div>
          
          <div className="bg-blue-950 py-3 text-center">
            <span className="text-amber-400 font-black text-[10px] uppercase tracking-[0.3em]">Mano Firme por Paipa</span>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="mt-8 w-full space-y-3">
          <button 
            onClick={handleShare}
            disabled={isProcessing}
            className="w-full bg-[#facc15] hover:bg-amber-500 text-blue-950 font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-3 border-b-4 border-amber-600"
          >
            <i className={`fa-solid ${isProcessing ? 'fa-circle-notch fa-spin' : 'fa-paper-plane'}`}></i>
            {isProcessing ? 'GENERANDO...' : 'ENVIAR CARNET'}
          </button>

          <button 
            onClick={onClose}
            className="w-full text-white/40 font-black py-3 text-[10px] uppercase tracking-widest hover:text-white transition-colors"
          >
            Siguiente Registro <i className="fa-solid fa-chevron-right ml-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouModal;
