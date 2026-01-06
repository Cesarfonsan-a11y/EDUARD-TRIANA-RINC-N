
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// ID fijo para esta campaña. Esto asegura que todos los recolectores apunten a la misma base.
// Nota: En producción real, este ID se generaría una vez y se guardaría en una base de datos.
const CLOUD_OBJECT_ID = "ff808181932a975a0193437299a41630"; 
const STORAGE_KEY = "paipa_triana_v16_live";

export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    // 1. Intentamos obtener la base consolidada de la nube
    const response = await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`);
    
    if (!response.ok) {
      // Si el objeto no existe (404), intentamos crearlo con los datos locales
      if (response.status === 404 && localRecords.length > 0) {
        await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: CLOUD_OBJECT_ID,
            name: STORAGE_KEY,
            data: { records: localRecords }
          })
        });
      }
      return localRecords;
    }

    const cloudData = await response.json();
    const cloudRecords: VoteRecord[] = cloudData.data?.records || [];
    
    // 2. Lógica de Fusión (Merge): Evitamos duplicados y sumamos todo
    const map = new Map<string, VoteRecord>();
    
    // Primero agregamos lo de la nube
    cloudRecords.forEach(r => map.set(r.id, r));
    // Luego agregamos lo local (si hay conflicto de ID, lo local podría ser más reciente, 
    // pero usualmente los IDs generados por tiempo son únicos)
    localRecords.forEach(r => map.set(r.id, r));

    const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);

    // 3. Si hay datos nuevos después de la fusión, actualizamos la nube para que otros los vean
    if (merged.length > cloudRecords.length) {
      await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: STORAGE_KEY,
          data: { records: merged }
        })
      });
    }

    return merged;
  } catch (error) {
    console.error("Error en sincronización:", error);
    return localRecords;
  }
};
