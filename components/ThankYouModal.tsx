
import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

interface Props {
  voterName: string;
  voterCount: number;
  onClose: () => void;
}

const ThankYouModal: React.FC<Props> = ({ voterName, voterCount, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    // Pequeño delay para asegurar que el estado se refleje si hay cambios visuales
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(cardRef.current!, {
          scale: 2, // Mayor calidad
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          ignoreElements: (element) => element.classList.contains('no-export')
        });
        
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `Recuerdo_102_${voterName.replace(/\s+/g, '_')}.png`;
        link.href = image;
        link.click();
      } catch (error) {
        console.error("Error generando la imagen:", error);
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-950/90 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="max-w-lg w-full my-8 transform animate-in zoom-in-95 duration-300">
        
        {/* TARJETA PARA DESCARGAR (REF) */}
        <div 
          ref={cardRef} 
          className="bg-white rounded-[2rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden border-8 border-[#facc15] relative"
        >
          <div className="bg-[#1e3a8a] p-8 text-center relative">
            {/* Patrón de fondo sutil */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '15px 15px' }}></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-[#facc15] rounded-full mb-4 shadow-xl border-4 border-white">
                <i className="fa-solid fa-heart text-blue-900 text-5xl"></i>
              </div>
              <h2 className="text-white font-black text-4xl tracking-tighter uppercase italic leading-none">¡QUÉ BUENO TENERTE AQUÍ!</h2>
              <div className="mt-2 text-sky-400 font-bold tracking-[0.3em] text-sm">ERES PARTE DE ESTA FAMILIA</div>
            </div>
          </div>
          
          <div className="p-8 text-center space-y-8">
            {/* Mensaje de Impacto */}
            <div className="bg-[#1e3a8a] p-4 rounded-2xl shadow-lg border-2 border-[#facc15] transform -rotate-1">
               <div className="text-white font-black text-4xl leading-tight tracking-tighter italic">
                 ¡YA SOMOS <span className="text-[#facc15] text-5xl">{voterCount}</span>!
               </div>
               <div className="text-sky-400 font-black text-xl uppercase tracking-widest mt-1">
                 ¡CADA VEZ MÁS CERCA DE LA META!
               </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="h-[2px] w-8 bg-[#facc15]"></span>
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">UN MENSAJE DE EDUAR PARA TI</p>
                <span className="h-[2px] w-8 bg-[#facc15]"></span>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 shadow-inner">
                <p className="text-3xl font-black text-blue-900 leading-tight">
                  "¡Hola, <span className="text-sky-500">{voterName.toUpperCase().split(' ')[0]}</span>! <br className="hidden md:block" /> 
                  ¡Qué alegría que ya estés en el equipo!"
                </p>
                <p className="mt-4 text-slate-600 font-medium text-lg leading-relaxed italic">
                  "Tu confianza nos motiva a seguir adelante. Juntos haremos historia por nuestra querida Boyacá."
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4 bg-[#1e3a8a] py-3 px-6 rounded-xl shadow-lg">
                 <div className="text-white font-black italic text-4xl">102</div>
                 <div className="h-10 w-[2px] bg-white/20"></div>
                 <div className="text-left">
                   <div className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none">Tu Amigo</div>
                   <div className="text-sm font-black text-[#facc15] uppercase tracking-tighter">Eduar Triana</div>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#facc15] py-3 text-center">
            <span className="text-blue-900 font-black text-xs uppercase tracking-[0.5em] italic">#UNIDOS POR TI BOYACÁ</span>
          </div>

          {/* Botones de Acción (no se exportan en la imagen) */}
          <div className="p-8 pt-0 space-y-4 no-export">
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 text-lg uppercase tracking-[0.1em] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
              {isDownloading ? 'GENERANDO...' : 'DESCARGAR RECUERDO'}
            </button>

            <button 
              onClick={onClose}
              className="w-full bg-[#0ea5e9] hover:bg-[#1e3a8a] text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 text-lg uppercase tracking-[0.1em] flex items-center justify-center gap-3"
            >
              <i className="fa-solid fa-handshake"></i>
              SIGAMOS ADELANTE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouModal;
