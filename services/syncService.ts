
import { VoteRecord } from "../types";

// Usamos una API de almacenamiento público para el demo (En producción se usaría Supabase/Firebase)
const SHARED_STORE_URL = "https://api.restful-api.dev/objects";
const ROOM_ID = "paipa-102-triana-v4"; // ID único para tu equipo

interface CloudData {
  id: string;
  name: string;
  data: {
    records: VoteRecord[];
    lastUpdate: number;
  };
}

export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    // 1. Intentar obtener datos existentes
    const response = await fetch(`${SHARED_STORE_URL}?id=${ROOM_ID}`);
    const results = await response.json();
    
    let cloudEntry = results.find((item: any) => item.name === ROOM_ID);

    if (!cloudEntry) {
      // 2. Si no existe, crear el "War Room" en la nube
      const createResponse = await fetch(SHARED_STORE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ROOM_ID,
          data: { records: localRecords, lastUpdate: Date.now() }
        })
      });
      const newEntry = await createResponse.json();
      return newEntry.data.records;
    }

    // 3. Si existe, fusionar datos (Cloud manda en este caso simple)
    // En un entorno real haríamos un merge inteligente por ID
    const cloudRecords = cloudEntry.data.records || [];
    
    // Si los locales son más nuevos o diferentes, actualizamos la nube
    // Para este demo, simplemente unimos y quitamos duplicados por ID
    const merged = [...cloudRecords];
    localRecords.forEach(local => {
      if (!merged.find(m => m.id === local.id)) {
        merged.push(local);
      }
    });

    // 4. Actualizar la nube con los nuevos datos fusionados
    await fetch(`${SHARED_STORE_URL}/${cloudEntry.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: ROOM_ID,
        data: { records: merged, lastUpdate: Date.now() }
      })
    });

    return merged;
  } catch (error) {
    console.error("Error de sincronización:", error);
    return localRecords; // Retornar locales si falla el internet
  }
};
