
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// ID Único y dedicado para la campaña Triana 102 - Paipa
const CLOUD_OBJECT_ID = "ff808181932a975a01934c56e29a2190"; 
const STORAGE_NAME = "TRIANA_102_GLOBAL_DB_V2";

export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    // 1. Obtener datos actuales de la nube
    const response = await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`);
    
    let cloudRecords: VoteRecord[] = [];
    
    if (response.ok) {
      const cloudData = await response.json();
      // Verificamos la estructura del objeto según la API
      cloudRecords = cloudData.data?.records || [];
    } else if (response.status === 404) {
      // Si el objeto no existe, lo creamos por primera vez
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
    // Usamos un Map para evitar duplicados por ID único de registro
    const masterMap = new Map<string, VoteRecord>();
    
    // Agregamos registros de la nube
    cloudRecords.forEach(r => {
      if (r && r.id) masterMap.set(r.id, r);
    });
    
    // Agregamos registros locales (prevalecen si hay conflicto por ser la fuente actual)
    localRecords.forEach(r => {
      if (r && r.id) masterMap.set(r.id, r);
    });

    const mergedRecords = Array.from(masterMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    // 3. ACTUALIZAR NUBE SI HAY CAMBIOS
    // Solo subimos si el total fusionado es mayor a lo que había en la nube
    if (mergedRecords.length > cloudRecords.length) {
      await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: STORAGE_NAME,
          data: { records: mergedRecords }
        })
      });
    }

    return mergedRecords;
  } catch (error) {
    console.error("Falla crítica de sincronización:", error);
    // En caso de error, devolvemos lo local para no perder datos en el dispositivo
    return localRecords;
  }
};
