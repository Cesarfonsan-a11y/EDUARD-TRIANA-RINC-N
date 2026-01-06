
import React, { useRef, useState, useMemo, useEffect } from 'react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
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
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const motivationalMessage = useMemo(() => {
    const messages = SECTOR_MESSAGES[actorId] || ["¡Juntos por Boyacá!"];
    return messages[Math.floor(Math.random() * messages.length)];
  }, [actorId]);

  useEffect(() => {
    // Generar un QR decorativo que lleva a la web de la campaña o un mensaje de validación
    QRCode.toDataURL(`REG-102-${voterCount}-${phoneNumber}`, { margin: 1, width: 100 })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error(err));
  }, [voterCount, phoneNumber]);

  const downloadVCard = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${voterName.toUpperCase()} (RED 102)
TEL;TYPE=CELL:${cleanPhone}
NOTE:Registrado en Red Triana 102 Paipa
END:VCARD`;
    
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${voterName.split(' ')[0]}_102.vcf`;
    link.click();
    URL.revokeObjectURL(url);
  };

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

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Carnet Victoria 102',
          text: wsText
        });
      } else {
        const link = document.createElement('a');
        link.download = `Carnet_Triana_102_${voterName.split(' ')[0]}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();

        setTimeout(() => {
          window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(wsText)}`, '_blank');
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
        
        {/* CARNET PREMIUM 102 */}
        <div 
          ref={cardRef} 
          className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden border-[6px] border-[#facc15] relative w-full aspect-[2/3.4] flex flex-col"
        >
          <div className="bg-[#facc15] py-4 text-center">
            <div className="text-blue-950 font-black text-[10px] uppercase tracking-[0.3em]">Credencial de Victoria</div>
          </div>

          <div className="flex-1 p-6 flex flex-col justify-between text-center relative">
            <div className="absolute top-2 right-4 opacity-20">
              {qrCodeUrl && <img src={qrCodeUrl} alt="QR" className="w-12 h-12" />}
            </div>

            <div className="space-y-1 mt-4">
              <div className="text-blue-900 font-black text-[10px] uppercase tracking-widest opacity-40">Identificado N°</div>
              <div className="text-7xl font-black text-blue-950 italic tracking-tighter drop-shadow-sm leading-none">
                {voterCount}
              </div>
            </div>

            <div className="relative py-4">
               <div className="bg-slate-50 rounded-[2rem] p-5 border border-slate-100 shadow-inner relative z-10">
                  <p className="text-slate-400 font-black text-[8px] uppercase tracking-widest mb-1">Ciudadano Avalado</p>
                  <h3 className="text-2xl font-black text-blue-900 leading-none uppercase tracking-tighter mb-2">
                    {voterName.toUpperCase()}
                  </h3>
                  <div className="h-1 w-10 bg-amber-400 mx-auto mb-3 rounded-full"></div>
                  <p className="text-slate-600 font-bold text-[10px] leading-tight italic px-2">
                    "{motivationalMessage}"
                  </p>
               </div>
            </div>

            <div className="flex flex-col items-center gap-2">
               <div className="bg-blue-950 py-3 px-6 rounded-2xl shadow-xl flex items-center gap-4 border-b-4 border-amber-500">
                  <div className="text-white text-left leading-none">
                    <div className="text-[10px] font-bold opacity-60">CÁMARA</div>
                    <div className="text-xl font-black text-amber-400 italic">TRIANA</div>
                  </div>
                  <div className="w-[1px] h-8 bg-white/20"></div>
                  <div className="text-4xl font-black text-white italic leading-none">102</div>
               </div>
               <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Paipa • Boyacá</div>
            </div>
          </div>
          
          <div className="bg-blue-950 py-3 text-center">
            <span className="text-amber-400 font-black text-[9px] uppercase tracking-[0.3em]">#ManoFirmePorPaipa</span>
          </div>
        </div>

        {/* ACCIONES ESTRATÉGICAS */}
        <div className="mt-8 w-full space-y-3">
          <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={downloadVCard}
                className="bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-2xl transition-all flex flex-col items-center justify-center gap-1 border border-white/10"
             >
                <i className="fa-solid fa-address-book text-amber-400"></i>
                <span className="text-[9px] uppercase tracking-widest">Guardar Contacto</span>
             </button>
             <button 
                onClick={handleShare}
                disabled={isProcessing}
                className="bg-[#facc15] hover:bg-amber-500 text-blue-950 font-black py-4 rounded-2xl transition-all shadow-xl flex flex-col items-center justify-center gap-1 border-b-4 border-amber-600"
             >
                <i className={`fa-solid ${isProcessing ? 'fa-circle-notch fa-spin' : 'fa-whatsapp'} text-lg`}></i>
                <span className="text-[9px] uppercase tracking-widest">Enviar Carnet</span>
             </button>
          </div>

          <button 
            onClick={onClose}
            className="w-full text-white/40 font-black py-3 text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors"
          >
            Siguiente Registro <i className="fa-solid fa-chevron-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouModal;
