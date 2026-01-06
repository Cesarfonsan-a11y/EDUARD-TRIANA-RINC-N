
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// ID DE CONSOLIDACIÓN GLOBAL - ACTUALIZADO PARA ESTA SESIÓN
const CLOUD_OBJECT_ID = "ff808181932a975a019358db3a8e24c5"; 
const STORAGE_NAME = "TRIANA_102_MASTER_SYNC_V2";

export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    // 1. Intentar obtener los datos actuales de la nube
    const response = await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`);
    
    let cloudRecords: VoteRecord[] = [];
    
    if (response.ok) {
      const cloudData = await response.json();
      cloudRecords = cloudData.data?.records && Array.isArray(cloudData.data.records) 
        ? cloudData.data.records 
        : [];
    } else if (response.status === 404) {
      // Si el objeto no existe, intentamos crearlo con los registros locales
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

    // 2. MEZCLA INTELIGENTE Y DEDUPLICACIÓN (Basada en Cédula)
    const masterMap = new Map<string, VoteRecord>();
    
    // Primero cargamos lo de la nube (que es la verdad compartida)
    cloudRecords.forEach(r => {
      if (r && r.idNumber) masterMap.set(r.idNumber, r);
    });
    
    // Luego añadimos lo local (que tiene los registros nuevos)
    localRecords.forEach(r => {
      if (r && r.idNumber) masterMap.set(r.idNumber, r);
    });

    const merged = Array.from(masterMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    // 3. ACTUALIZACIÓN PERSISTENTE
    // Si la mezcla tiene más datos que la nube, o si es un registro nuevo, forzamos el guardado
    const needsUpdate = merged.length > cloudRecords.length || 
                      (localRecords.length > 0 && merged.length > 0);

    if (needsUpdate) {
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
    console.error("Error Crítico de Sincronización:", error);
    return localRecords;
  }
};
