
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// ID simplificado para máxima compatibilidad
const CLOUD_OBJECT_ID = "paipa102triana"; 
const STORAGE_NAME = "TRIANA_PROD_102";

export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    // AÑADIMOS UN TIMESTAMP PARA EVITAR EL CACHÉ DEL NAVEGADOR (CACHE BUSTING)
    const timestamp = Date.now();
    const response = await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}?t=${timestamp}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    });
    
    let cloudRecords: VoteRecord[] = [];
    
    if (response.ok) {
      const cloudData = await response.json();
      cloudRecords = cloudData.data?.records || [];
    } else if (response.status === 404) {
      // Si el contenedor no existe, intentamos crearlo con lo que tengamos localmente
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

    // MEZCLA DE DATOS (MERGE)
    const masterMap = new Map<string, VoteRecord>();
    
    // 1. Cargar lo que viene de la nube (otros dispositivos)
    cloudRecords.forEach(r => {
      if (r && r.idNumber) masterMap.set(r.idNumber, r);
    });
    
    // 2. Añadir lo que tengo yo localmente
    localRecords.forEach(r => {
      if (r && r.idNumber) masterMap.set(r.idNumber, r);
    });

    const merged = Array.from(masterMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    // ACTUALIZACIÓN: Solo si el total consolidado es diferente a lo que había en la nube
    // O si mi lista local estaba vacía (estoy inicializando el computador)
    if (merged.length !== cloudRecords.length || (localRecords.length === 0 && merged.length > 0)) {
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
    console.error("Error de enlace:", error);
    return localRecords;
  }
};
