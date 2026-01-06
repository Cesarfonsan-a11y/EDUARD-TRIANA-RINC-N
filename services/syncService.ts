
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// NUEVO ID LIMPIO: Asegura una base de datos fresca para la red Triana 102
const CLOUD_OBJECT_ID = "ff808181932a975a01934ec764952264"; 
const STORAGE_NAME = "TRIANA_LIVE_CONSOLIDADO_V3";

/**
 * Sincroniza los registros locales con la nube.
 * Realiza un merge basado en el ID único de cada registro para evitar duplicados y pérdidas.
 */
export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    // 1. Intentamos obtener la base de datos global actual
    const response = await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`);
    
    let cloudRecords: VoteRecord[] = [];
    
    if (response.ok) {
      const cloudData = await response.json();
      cloudRecords = Array.isArray(cloudData.data?.records) ? cloudData.data.records : [];
    } else if (response.status === 404) {
      // 2. Si no existe (primera vez), intentamos crear el objeto base
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

    // 3. LÓGICA DE FUSIÓN (MERGE) - El corazón de la suma real
    const masterMap = new Map<string, VoteRecord>();
    
    // Agregamos primero lo que está en la nube
    cloudRecords.forEach(r => {
      if (r && r.id) masterMap.set(r.id, r);
    });
    
    // Sumamos lo que tenemos localmente (si hay nuevos, el Map crece)
    localRecords.forEach(r => {
      if (r && r.id) masterMap.set(r.id, r);
    });

    const mergedRecords = Array.from(masterMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    // 4. ACTUALIZACIÓN SI HAY NOVEDADES
    // Si después de combinar, tenemos más de lo que había en nube, actualizamos la nube inmediatamente
    if (mergedRecords.length > cloudRecords.length) {
      await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: STORAGE_NAME,
          data: { records: mergedRecords }
        })
      });
      console.log(`✅ Sincronizado: ${mergedRecords.length} registros totales.`);
    }

    return mergedRecords;
  } catch (error) {
    console.error("⚠️ Error de conexión. Trabajando en modo local:", error);
    return localRecords;
  }
};
