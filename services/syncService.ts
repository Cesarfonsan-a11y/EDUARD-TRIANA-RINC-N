
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// ID ÚNICO REGENERADO PARA EVITAR CONFLICTOS DE CACHÉ
const CLOUD_OBJECT_ID = "ff808181932a975a019356ce083222f7"; 
const STORAGE_NAME = "TRIANA_REALTIME_V5_STABLE";

/**
 * Sincroniza y fusiona registros locales con los de la nube.
 * Implementa una unión de conjuntos basada en ID único para evitar pérdidas.
 */
export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    // 1. Obtener estado actual de la nube
    const response = await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`);
    
    let cloudRecords: VoteRecord[] = [];
    
    if (response.ok) {
      const cloudData = await response.json();
      cloudRecords = Array.isArray(cloudData.data?.records) ? cloudData.data.records : [];
    } else if (response.status === 404) {
      // Si no existe el objeto, lo creamos con lo que tengamos localmente
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

    // 2. LÓGICA DE FUSIÓN (Deduplicación por ID)
    const masterMap = new Map<string, VoteRecord>();
    
    // Prioridad 1: Datos que ya están en la nube
    cloudRecords.forEach(r => {
      if (r && r.id) masterMap.set(r.id, r);
    });
    
    // Prioridad 2: Datos nuevos locales
    localRecords.forEach(r => {
      if (r && r.id) masterMap.set(r.id, r);
    });

    const mergedRecords = Array.from(masterMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    // 3. ACTUALIZACIÓN SI HAY DIFERENCIAS
    // Solo subimos si nuestra fusión tiene más datos de los que la nube reportó inicialmente
    if (mergedRecords.length > cloudRecords.length) {
      await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: STORAGE_NAME,
          data: { records: mergedRecords }
        })
      });
      console.log(`✅ Sincronización Exitosa: ${mergedRecords.length} registros totales.`);
    }

    return mergedRecords;
  } catch (error) {
    console.error("⚠️ Error de Red (Trabajando en Local):", error);
    return localRecords;
  }
};
