
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// NUEVA LLAVE MAESTRA ÚNICA PARA PAIPA - REGENERADA PARA EVITAR CACHÉ
const CLOUD_OBJECT_ID = "v102_paipa_master_live_2024_final"; 
const STORAGE_NAME = "TRIANA_102_LIVE_SYNC_SYSTEM";

export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    // 1. INTENTAR OBTENER LA VERDAD DE LA NUBE
    const response = await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`);
    
    let cloudRecords: VoteRecord[] = [];
    
    if (response.ok) {
      const cloudData = await response.json();
      // Verificamos la estructura exacta del API sandbox
      cloudRecords = cloudData.data?.records || [];
    } else if (response.status === 404) {
      // Si no existe, es el primer arranque: creamos el contenedor
      console.log("Inicializando contenedor de datos global...");
      await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: CLOUD_OBJECT_ID,
          name: STORAGE_NAME,
          data: { records: localRecords }
        })
      });
      return localRecords;
    }

    // 2. FUSIÓN TOTAL (MERGE ESTRATÉGICO)
    // Usamos las cédulas como llave única para que no importe en qué dispositivo se creó
    const masterMap = new Map<string, VoteRecord>();
    
    // Prioridad 1: Lo que ya está en la nube (votos de otros recolectores)
    cloudRecords.forEach(r => {
      if (r && r.idNumber) masterMap.set(r.idNumber, r);
    });
    
    // Prioridad 2: Lo que tengo yo localmente (votos nuevos que acabo de capturar)
    localRecords.forEach(r => {
      if (r && r.idNumber) masterMap.set(r.idNumber, r);
    });

    const merged = Array.from(masterMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    // 3. ACTUALIZACIÓN INTELIGENTE
    // Solo escribimos en la nube si nuestra mezcla tiene datos que la nube NO tenía
    // O si la nube tiene datos que nosotros NO teníamos (para mantenernos al día)
    if (merged.length > cloudRecords.length || (localRecords.length === 0 && cloudRecords.length > 0)) {
      console.log(`Sincronizando: Nube(${cloudRecords.length}) vs Consolidado(${merged.length})`);
      
      await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: STORAGE_NAME,
          data: { records: merged }
        })
      });
    }

    return merged;
  } catch (error) {
    console.error("Fallo de conexión con el Panel Central:", error);
    return localRecords;
  }
};
