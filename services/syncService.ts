
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// NUEVO ID DE ALTA DISPONIBILIDAD PARA TRIANA 102
const CLOUD_OBJECT_ID = "ff808181932a975a0193582f3299244c"; 
const STORAGE_NAME = "TRIANA_LIVE_CONSOLIDATOR_V6";

/**
 * Servicio de Sincronización Global
 * Asegura que los datos de todos los recolectores se fusionen sin borrarse.
 */
export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    // 1. Intentar obtener los datos actuales del servidor
    const response = await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`);
    
    if (!response.ok) {
      // Si el objeto no existe (404), intentamos crearlo
      if (response.status === 404 && localRecords.length > 0) {
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
      return localRecords;
    }

    const cloudData = await response.json();
    const cloudRecords: VoteRecord[] = Array.isArray(cloudData.data?.records) ? cloudData.data.records : [];

    // 2. FUSIÓN DETERMINISTA (Merge)
    // Usamos un Map para asegurar que cada ID de registro sea único y no se repita
    const masterMap = new Map<string, VoteRecord>();
    
    // Primero cargamos lo que está en la nube
    cloudRecords.forEach(r => { if (r?.id) masterMap.set(r.id, r); });
    
    // Luego sobreponemos lo local (por si hay nuevos)
    localRecords.forEach(r => { if (r?.id) masterMap.set(r.id, r); });

    const merged = Array.from(masterMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    // 3. ACTUALIZACIÓN PROACTIVA
    // Si la fusión tiene más datos de los que había en la nube, actualizamos el servidor
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
    console.warn("⚠️ Fallo de conexión cloud - Operando en modo local");
    return localRecords;
  }
};
