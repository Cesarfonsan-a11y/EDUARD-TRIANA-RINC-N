
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// ID único para la campaña de Eduar Triana en Paipa
const STORAGE_ID = "paipa_triana_v14_live"; 

export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error("API Offline");
    
    const allObjects = await response.json();
    const existing = Array.isArray(allObjects) 
      ? allObjects.find((o: any) => o.name === STORAGE_ID)
      : null;

    if (!existing) {
      if (localRecords.length === 0) return [];
      
      const createRes = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: STORAGE_ID,
          data: { records: localRecords }
        })
      });
      const created = await createRes.json();
      return created.data?.records || localRecords;
    }

    const cloudRecords: VoteRecord[] = existing.data?.records || [];
    
    // Diccionario para evitar duplicados por ID
    const map = new Map<string, VoteRecord>();
    
    // Importante: La nube manda sobre la base local para que el administrador
    // reciba lo que los recolectores están subiendo.
    cloudRecords.forEach(r => map.set(r.id, r));
    localRecords.forEach(r => map.set(r.id, r));

    const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);

    // Si hay datos nuevos (ya sea locales o de otros dispositivos), actualizamos la nube
    if (merged.length > cloudRecords.length || merged.length > localRecords.length) {
      await fetch(`${API_BASE}/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: STORAGE_ID,
          data: { records: merged }
        })
      });
    }

    return merged;
  } catch (error) {
    console.warn("Sync Mode: Local Recovery", error);
    return localRecords;
  }
};
