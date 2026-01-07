
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// ID ÚNICO PARA DESPLIEGUE EN VERCEL - PAIPA_102_PROD
const CLOUD_OBJECT_ID = "ff808181932a975a019359e19e07255d"; 
const STORAGE_NAME = "TRIANA_102_PRODUCTION_SYNC";

export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    // 1. OBTENER ESTADO ACTUAL DE LA NUBE (LA VERDAD COMPARTIDA)
    const response = await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`);
    
    let cloudRecords: VoteRecord[] = [];
    
    if (response.ok) {
      const cloudData = await response.json();
      // Verificamos que la estructura sea la esperada
      cloudRecords = cloudData.data?.records && Array.isArray(cloudData.data.records) 
        ? cloudData.data.records 
        : [];
    } else if (response.status === 404) {
      // Si el contenedor no existe (primer despliegue), lo creamos
      const createResponse = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: CLOUD_OBJECT_ID,
          name: STORAGE_NAME,
          data: { records: localRecords }
        })
      });
      if (!createResponse.ok) throw new Error("No se pudo inicializar la base de datos");
      return localRecords;
    }

    // 2. MEZCLA INTELIGENTE (MERGE): No permitimos duplicados por cédula
    // Esta parte es vital si 10 personas están registrando a la vez
    const masterMap = new Map<string, VoteRecord>();
    
    // Primero procesamos lo de la nube (que es lo que otros han subido)
    cloudRecords.forEach(r => {
      if (r && r.idNumber) {
        masterMap.set(r.idNumber, r);
      }
    });
    
    // Luego procesamos lo local (registros nuevos de este dispositivo)
    localRecords.forEach(r => {
      if (r && r.idNumber) {
        // Si ya existe en la nube, el Map mantendrá el registro 
        // Si es nuevo, se agregará.
        if (!masterMap.has(r.idNumber)) {
          masterMap.set(r.idNumber, r);
        }
      }
    });

    // Convertimos el Map de vuelta a una lista ordenada por tiempo
    const merged = Array.from(masterMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    // 3. ACTUALIZACIÓN SI HAY NOVEDADES
    // Si el total mezclado es mayor a lo que había en la nube, subimos la nueva verdad
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
    console.error("Error Crítico de Sincronización en Producción:", error);
    // En caso de error de red, devolvemos lo local para que el usuario no se detenga
    return localRecords;
  }
};
