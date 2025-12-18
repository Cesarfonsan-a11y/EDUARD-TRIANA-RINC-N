
import { VoteRecord } from "../types";

// API de almacenamiento público (Para producción usar Supabase/Firebase)
const SHARED_STORE_URL = "https://api.restful-api.dev/objects";
const ROOM_ID = "paipa-102-triana-vfinal"; // Nuevo ID para asegurar consistencia

export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    // 1. Obtener la versión actual de la nube
    const response = await fetch(`${SHARED_STORE_URL}?id=${ROOM_ID}`);
    const results = await response.json();
    let cloudEntry = results.find((item: any) => item.name === ROOM_ID);

    // 2. Si no existe en la nube, la creamos con los datos locales
    if (!cloudEntry) {
      const createResponse = await fetch(SHARED_STORE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ROOM_ID,
          data: { records: localRecords, lastUpdate: Date.now() }
        })
      });
      const newEntry = await createResponse.json();
      return newEntry.data.records || [];
    }

    // 3. Fusión inteligente: Unimos locales y nube sin duplicados por ID
    const cloudRecords: VoteRecord[] = cloudEntry.data?.records || [];
    
    // El mapa nos ayuda a evitar duplicados eficientemente
    const recordsMap = new Map<string, VoteRecord>();
    
    // Primero agregamos lo de la nube
    cloudRecords.forEach(r => recordsMap.set(r.id, r));
    
    // Luego agregamos lo local (si hay conflicto, lo local es más nuevo)
    localRecords.forEach(r => recordsMap.set(r.id, r));

    const merged = Array.from(recordsMap.values())
      .sort((a, b) => b.timestamp - a.timestamp); // Ordenar por fecha (más reciente arriba)

    // 4. Actualizamos la nube solo si hay algo nuevo para no saturar
    if (merged.length > cloudRecords.length || JSON.stringify(merged) !== JSON.stringify(cloudRecords)) {
      await fetch(`${SHARED_STORE_URL}/${cloudEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ROOM_ID,
          data: { records: merged, lastUpdate: Date.now() }
        })
      });
    }

    return merged;
  } catch (error) {
    console.error("Error crítico de sincronización:", error);
    // En caso de error, devolvemos los locales para no perder el progreso del usuario
    return localRecords;
  }
};
