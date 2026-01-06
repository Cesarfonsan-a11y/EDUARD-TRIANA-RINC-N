
import React, { useRef, useState, useMemo, useCallback } from 'react';
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
  const [showCopyHint, setShowCopyHint] = useState(false);

  const personalizedMessage = useMemo(() => {
    if (!actorId) return SECTOR_MESSAGES['sin_actividad'][0];
    const messages = SECTOR_MESSAGES[actorId] || SECTOR_MESSAGES['sin_actividad'];
    return messages[Math.floor(Math.random() * messages.length)];
  }, [actorId]);

  const handleShare = useCallback(async () => {
    if (!cardRef.current || isProcessing) return;
    setIsProcessing(true);

    const firstName = (voterName || 'AMIGO').split(' ')[0].toUpperCase();
    
    // MENSAJE ACTUALIZADO SEGÚN SOLICITUD
    const wsText = `¡YA SOMOS ${voterCount}! 🇨🇴\n\n¡Hola ${firstName}!\n\nTe doy la bienvenida al equipo de Eduar Triana. Aquí tienes tu carnet oficial.\n\nEduar Triana - Cámara 102 🦁\n#PorTiBoyacá`;
    
    const cleanPhone = (phoneNumber || '').replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
    const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(wsText)}`;

    try {
      // 1. Generar la imagen con alta calidad para descarga
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 0.9));
      if (!blob) throw new Error("No se pudo generar el carnet");

      // 2. DESCARGAR EL CARNET AUTOMÁTICAMENTE
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `CARNET_102_${firstName}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // 3. INTENTAR COMPARTIR NATIVO (Imagen + Texto si el móvil lo soporta)
      const file = new File([blob], `Carnet_102_${firstName}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            text: wsText,
            title: 'Carnet Victoria 102',
          });
          setIsProcessing(false);
          return;
        } catch (e) {
          console.log("Compartir nativo declinado");
        }
      }

      // 4. COPIAR AL PORTAPAPELES (Fallback para agilizar el proceso)
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          const data = [new ClipboardItem({ [blob.type]: blob })];
          await navigator.clipboard.write(data);
          setShowCopyHint(true);
        }
      } catch (clipError) {
        console.warn("Portapapeles no disponible");
      }

      // 5. REDIRECCIÓN A WHATSAPP
      // Pequeño retraso para que la descarga se complete visualmente
      setTimeout(() => {
        window.open(waUrl, '_blank');
        setIsProcessing(false);
      }, 1000);

    } catch (error) {
      console.error("Error en el proceso:", error);
      window.open(waUrl, '_blank');
      setIsProcessing(false);
    } finally {
      setTimeout(() => setShowCopyHint(false), 5000);
    }
  }, [voterName, voterCount, phoneNumber, isProcessing]);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-3xl overflow-y-auto">
      
      {showCopyHint && (
        <div className="fixed top-8 left-0 right-0 z-[700] flex justify-center px-6 pointer-events-none animate-in slide-in-from-top duration-500">
           <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white/20">
              <i className="fa-solid fa-check-circle"></i>
              <p className="font-black text-[11px] uppercase tracking-wider italic">¡Carnet Descargado! Pégalo ahora en WhatsApp</p>
           </div>
        </div>
      )}

      <div className="max-w-[360px] w-full flex flex-col items-center py-4">
        {/* VISTA PREVIA DEL CARNET */}
        <div 
          ref={cardRef} 
          className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-[6px] border-[#facc15] relative w-full flex flex-col min-h-[580px]"
        >
          {/* Sello de Victoria */}
          <div className="absolute bottom-6 right-1 w-24 h-24 rotate-[12deg] z-30 pointer-events-none filter drop-shadow-xl">
             <div className="w-full h-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-full border-[4px] border-white flex flex-col items-center justify-center shadow-inner relative">
                <span className="text-[6px] font-black text-blue-900/80 uppercase mb-0.5">CÁMARA</span>
                <span className="text-3xl font-black text-blue-950 italic leading-none">102</span>
                <span className="text-[7px] font-black text-blue-900 uppercase">VICTORIA</span>
             </div>
          </div>

          <div className="bg-[#1e3a8a] pt-8 pb-5 px-6 text-center shrink-0">
            <div className="w-14 h-14 bg-[#facc15] rounded-full mx-auto flex items-center justify-center border-2 border-white/20 mb-3">
              <i className="fa-solid fa-heart text-[#1e3a8a] text-2xl"></i>
            </div>
            <h2 className="text-white font-black text-xl leading-none uppercase italic">¡BIENVENIDO AL EQUIPO!</h2>
          </div>

          <div className="flex-1 px-4 py-4 flex flex-col items-center bg-white relative">
            <div className="w-full bg-[#1e3a8a] rounded-2xl py-4 px-4 shadow-lg border border-blue-400/10 flex flex-col items-center justify-center mb-4">
               <h3 className="text-white font-black text-2xl italic tracking-tighter">
                ¡YA SOMOS <span className="text-[#facc15]">{voterCount}</span>!
              </h3>
            </div>

            <div className="w-full flex-1 flex flex-col justify-center relative bg-slate-50/50 border border-slate-100 rounded-[2rem] p-6 pt-8 pb-10 overflow-hidden shadow-inner">
                <div className="relative z-10 space-y-5 w-full text-center">
                  <div className="space-y-2">
                    <h4 className="text-[#1e3a8a] font-black text-3xl italic uppercase tracking-tighter">
                      "¡Hola, {voterName.split(' ')[0].toUpperCase()}!"
                    </h4>
                    <p className="text-blue-900 font-black text-[10px] uppercase tracking-widest italic">ESTAMOS JUNTOS EN ESTO</p>
                  </div>
                  <p className="text-slate-900 font-extrabold italic text-[14px] leading-tight">"{personalizedMessage}"</p>
                </div>
            </div>

            <div className="w-full mt-4 z-10">
              <div className="bg-[#1e3a8a] rounded-2xl flex items-center overflow-hidden shadow-xl">
                <div className="px-5 py-3 bg-blue-900 text-white font-black text-2xl italic">102</div>
                <div className="flex-1 px-4 py-2 text-left">
                  <div className="text-[7px] font-black text-blue-300 uppercase tracking-widest leading-none mb-0.5">TU AMIGO Y REPRESENTANTE</div>
                  <div className="text-[14px] font-black text-[#facc15] italic">EDUAR TRIANA</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#facc15] py-3 text-center z-10">
            <span className="text-[#1e3a8a] font-black text-[11px] uppercase tracking-[0.4em] italic"># POR TI BOYACÁ</span>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="mt-8 w-full space-y-4 px-2">
          <button 
            onClick={handleShare}
            disabled={isProcessing}
            className="w-full bg-[#facc15] hover:bg-amber-500 text-blue-950 font-black py-6 rounded-[2rem] transition-all shadow-2xl active:scale-95 flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <i className={`fa-solid ${isProcessing ? 'fa-circle-notch fa-spin' : 'fa-whatsapp'} text-3xl`}></i>
              <div className="text-left">
                <span className="text-xs uppercase font-black block leading-none">
                  {isProcessing ? 'DESCARGANDO...' : 'DESCARGAR Y ENVIAR'}
                </span>
                <span className="text-[8px] uppercase tracking-widest opacity-60 mt-1 block">WhatsApp Directo</span>
              </div>
            </div>
          </button>

          <button onClick={onClose} className="w-full text-white/30 font-black py-2 text-[10px] uppercase tracking-[0.5em] hover:text-white transition-colors">
            REGRESAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouModal;
