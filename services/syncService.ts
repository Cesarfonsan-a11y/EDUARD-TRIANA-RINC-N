
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// ID TOTALMENTE NUEVO PARA EVITAR CACHÉ ANTIGUO
const CLOUD_OBJECT_ID = "paipa_v2_102_live"; 
const STORAGE_NAME = "TRIANA_V2_SYNC";

export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    // 1. FORZAR DESCARGA SIEMPRE (Cache-Busting Agresivo)
    const response = await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}?nocache=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    let cloudRecords: VoteRecord[] = [];
    
    if (response.ok) {
      const cloudData = await response.json();
      cloudRecords = cloudData.data?.records || [];
    } else if (response.status === 404) {
      // Si no existe, lo creamos solo si tenemos algo local
      if (localRecords.length > 0) {
        await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: CLOUD_OBJECT_ID,
            name: STORAGE_NAME,
            data: { records: localRecords }
          })
        });
      }
      return localRecords;
    }

    // 2. FUSIÓN INTELIGENTE (MERGE)
    const masterMap = new Map<string, VoteRecord>();
    
    // Cargamos primero la nube (La Verdad Universal)
    cloudRecords.forEach(r => {
      if (r && r.idNumber) masterMap.set(r.idNumber, r);
    });
    
    // Cargamos lo local (Nuevas capturas)
    localRecords.forEach(r => {
      if (r && r.idNumber) masterMap.set(r.idNumber, r);
    });

    const merged = Array.from(masterMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    // 3. SOLO SUBIMOS SI HAY CAMBIOS REALES Y NO ESTAMOS VACÍOS INTENTANDO BORRAR LA NUBE
    const hasNewData = merged.length > cloudRecords.length;
    
    if (hasNewData) {
      console.log("Subiendo nuevos registros a la nube...");
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
    console.error("Error en puente de datos:", error);
    return localRecords;
  }
};
