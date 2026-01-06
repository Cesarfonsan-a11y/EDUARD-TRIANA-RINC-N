
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// ID ÚNICO REFORZADO
const CLOUD_OBJECT_ID = "ff808181932a975a019358b5e29a245d"; 
const STORAGE_NAME = "TRIANA_102_ULTRA_LIVE";

export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    const response = await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`);
    
    let cloudRecords: VoteRecord[] = [];
    
    if (response.ok) {
      const cloudData = await response.json();
      // Verificamos que la estructura de datos sea correcta
      cloudRecords = cloudData.data?.records && Array.isArray(cloudData.data.records) 
        ? cloudData.data.records 
        : [];
    } else if (response.status === 404 && localRecords.length > 0) {
      // Si el objeto no existe, lo creamos con lo que tenemos localmente
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

    // MEZCLA INTELIGENTE: Deduplicación por cédula (idNumber) para mayor seguridad
    const masterMap = new Map<string, VoteRecord>();
    
    // 1. Cargamos lo que hay en la nube
    cloudRecords.forEach(r => {
      if (r && r.idNumber) masterMap.set(r.idNumber, r);
    });
    
    // 2. Sobrescribimos o añadimos con lo local (esto asegura que lo recién creado no se pierda)
    localRecords.forEach(r => {
      if (r && r.idNumber) masterMap.set(r.idNumber, r);
    });

    const merged = Array.from(masterMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    // 3. ACTUALIZACIÓN DE LA NUBE (Solo si tenemos datos nuevos o diferentes)
    // Usamos un set para comparar contenidos únicos rápidamente
    const cloudIds = new Set(cloudRecords.map(r => r.idNumber));
    const hasNewData = merged.some(r => !cloudIds.has(r.idNumber));

    if (hasNewData || merged.length !== cloudRecords.length) {
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
    console.error("Cloud Error:", error);
    // En caso de error, siempre devolvemos lo local para no bajar el contador
    return localRecords;
  }
};
