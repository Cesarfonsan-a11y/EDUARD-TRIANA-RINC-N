
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

    const wsText = `*HOLA, ${voterName.toUpperCase()}* 👋\n\nAquí tienes tu CARNET OFICIAL como Ciudadano Identificado N° *${voterCount}* de nuestra red en Paipa.\n\n_"${motivationalMessage}"_\n\n*EDUAR TRIANA | 102* 🇨🇴\n*#PorTiBoyacá*`;
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;

    try {
      // 1. Generar la imagen del carnet
      const canvas = await html2canvas(cardRef.current!, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("No se pudo generar el carnet");

      const file = new File([blob], `Carnet_Victoria_102_${voterName.split(' ')[0]}.png`, { type: 'image/png' });

      // 2. Intentar envío combinado (Texto + Imagen) usando Share API
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Carnet Victoria 102',
          text: wsText // Este se convierte en el pie de foto en muchas versiones de WhatsApp
        });
      } else {
        // 3. Flujo Manual (Mensaje primero, luego descarga)
        // Abrimos WhatsApp con el texto
        const encodedText = encodeURIComponent(wsText);
        window.open(`https://wa.me/${finalPhone}?text=${encodedText}`, '_blank');
        
        // Descargamos el carnet automáticamente para que lo adjunten
        const link = document.createElement('a');
        link.download = file.name;
        link.href = URL.createObjectURL(blob);
        link.click();
        
        alert("Enviando mensaje... El carnet se ha descargado para que lo adjuntes en el chat.");
      }
    } catch (error) {
      console.error("Error al compartir:", error);
      alert("Hubo un problema. Por favor, descarga el carnet y envíalo manualmente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-3xl animate-in fade-in duration-500 overflow-y-auto">
      <div className="max-w-lg w-full my-8 transform animate-in zoom-in-95 duration-300">
        
        <div className="relative mx-auto" style={{ maxWidth: '440px' }}>
          
          <div 
            ref={cardRef} 
            className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden border-[8px] border-[#facc15] relative"
          >
            <div className="p-8 pb-12 text-center space-y-10 relative">
              
              <div className="absolute top-6 right-6 z-20">
                <div className="bg-[#dc2626] text-white text-[11px] font-black px-6 py-2.5 rounded-full uppercase tracking-widest shadow-2xl border border-white/20 transform rotate-1">
                  REGISTRO OFICIAL
                </div>
              </div>

              <div className="bg-[#1e3a8a] py-16 px-6 rounded-[3rem] shadow-2xl relative mt-4 overflow-hidden">
                 <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
                 
                 <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="text-white font-black text-6xl italic tracking-tighter flex items-center gap-5">
                      NÚMERO 
                      <span className="text-[#facc15] text-[7.5rem] drop-shadow-[0_15px_20px_rgba(0,0,0,0.5)] non-italic leading-none">
                        {voterCount}
                      </span>
                    </div>
                    <div className="text-white/80 font-black text-[15px] uppercase tracking-[0.25em] mt-8 border-t border-white/20 pt-8 w-full max-w-[85%] mx-auto">
                      CIUDADANO IDENTIFICADO BOYACÁ
                    </div>
                 </div>
              </div>

              <div className="space-y-10 px-2">
                <div className="flex items-center justify-center gap-6">
                  <div className="h-[2px] flex-1 bg-slate-100"></div>
                  <p className="text-slate-400 font-black uppercase text-[12px] tracking-[0.5em]">Un mensaje para ti</p>
                  <div className="h-[2px] flex-1 bg-slate-100"></div>
                </div>
                
                <div className="bg-slate-50/90 p-12 rounded-[3rem] border border-slate-100 relative shadow-inner">
                  <p className="text-5xl font-black text-[#1e3a8a] leading-none mb-8 tracking-tighter">
                    HOLA, <span className="text-[#0ea5e9]">{voterName.split(' ')[0].toUpperCase()}</span>
                  </p>
                  <p className="text-slate-700 font-bold text-3xl leading-[1.3] italic px-2">
                    "{motivationalMessage}"
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center pt-4">
                 <div className="bg-[#1e3a8a] py-6 px-14 rounded-[2rem] shadow-3xl flex items-center gap-10 border-b-8 border-black/20 transform hover:scale-105 transition-transform">
                    <span className="text-[#facc15] font-black italic text-6xl">102</span>
                    <div className="h-16 w-[3px] bg-white/20"></div>
                    <span className="text-white font-black uppercase tracking-tighter text-3xl leading-none text-left">
                      Eduar<br/><span className="text-[#facc15]">Triana</span>
                    </span>
                 </div>
              </div>
            </div>
            
            <div className="bg-[#facc15] py-5 text-center">
              <span className="text-[#1e3a8a] font-black text-[13px] uppercase tracking-[0.6em] italic">#POR TI BOYACÁ</span>
            </div>
          </div>

          <div className="mt-12 space-y-5 px-4">
            <button 
              onClick={handleShareAndSend}
              disabled={isProcessing}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-8 rounded-[2.5rem] transition-all shadow-[0_20px_50px_rgba(16,185,129,0.4)] active:scale-95 text-2xl uppercase tracking-widest flex items-center justify-center gap-5 disabled:opacity-50"
            >
              <i className={`fa-solid ${isProcessing ? 'fa-spinner fa-spin' : 'fa-whatsapp'} text-3xl`}></i>
              {isProcessing ? 'PROCESANDO...' : 'ENVIAR MENSAJE Y CARNET'}
            </button>

            <button 
              onClick={onClose}
              className="w-full bg-amber-400 hover:bg-amber-500 text-blue-950 font-black py-7 rounded-[2.5rem] transition-all shadow-xl text-xl uppercase tracking-tighter flex items-center justify-center gap-4 border-2 border-white/20"
            >
              <i className="fa-solid fa-plus-circle"></i>
              SIGUIENTE REGISTRO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouModal;
