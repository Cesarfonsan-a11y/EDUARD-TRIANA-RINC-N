
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// ID de nivel profesional para asegurar persistencia global
const CLOUD_OBJECT_ID = "triana-paipa-2024-v3"; 
const STORAGE_NAME = "TRIANA_V3_MASTER";

export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    // 1. PETICIÓN CON ROMPE-CACHÉ TOTAL
    const response = await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}?v=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    let cloudRecords: VoteRecord[] = [];
    
    if (response.ok) {
      const cloudData = await response.json();
      cloudRecords = cloudData.data?.records || [];
    } else if (response.status === 404) {
      // Si la nube está vacía, intentamos crearla con lo local
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

    // 2. LÓGICA DE FUSIÓN DE EMERGENCIA
    const masterMap = new Map<string, VoteRecord>();
    
    // Lo de la nube siempre manda si el computador está en blanco
    cloudRecords.forEach(r => {
      if (r && r.idNumber) masterMap.set(r.idNumber, r);
    });
    
    // Añadimos lo local (nuevos registros del celular)
    localRecords.forEach(r => {
      if (r && r.idNumber) masterMap.set(r.idNumber, r);
    });

    const merged = Array.from(masterMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    // 3. ACTUALIZACIÓN FORZADA
    // Si mi lista mezclada es más grande que la nube, subo.
    // O si la nube tiene datos y mi local no, simplemente acepto lo de la nube.
    if (merged.length > cloudRecords.length) {
      console.log("Sincronizando nuevos datos hacia la nube...");
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
    console.error("Falla de red crítica:", error);
    return localRecords;
  }
};
