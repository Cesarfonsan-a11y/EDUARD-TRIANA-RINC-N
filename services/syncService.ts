
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// ID ÚNICO REFORZADO PARA EVITAR CONFLICTOS
const CLOUD_OBJECT_ID = "ff808181932a975a019358b5e29a245d"; 
const STORAGE_NAME = "TRIANA_102_ULTRA_LIVE";

export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    const response = await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`);
    
    let cloudRecords: VoteRecord[] = [];
    
    if (response.ok) {
      const cloudData = await response.json();
      cloudRecords = Array.isArray(cloudData.data?.records) ? cloudData.data.records : [];
    } else if (response.status === 404 && localRecords.length > 0) {
      // Crear base si no existe
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

    // FUSIÓN DE DATOS (Deduplicación por ID)
    const masterMap = new Map<string, VoteRecord>();
    cloudRecords.forEach(r => { if (r?.id) masterMap.set(r.id, r); });
    localRecords.forEach(r => { if (r?.id) masterMap.set(r.id, r); });

    const merged = Array.from(masterMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    // Si tenemos más datos de los que la nube tiene, los subimos inmediatamente
    if (merged.length > cloudRecords.length) {
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
    return localRecords;
  }
};
