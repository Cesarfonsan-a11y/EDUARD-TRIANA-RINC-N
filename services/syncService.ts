
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// VERSION 4 - LIMPIEZA TOTAL DE CACHÉ
const CLOUD_OBJECT_ID = "triana-v4-master-paipa"; 
const STORAGE_NAME = "TRIANA_V4_OFFICIAL";

export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    // 1. OBTENER DATOS DE LA NUBE (FUERZA BRUTA)
    const response = await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}?nocache=${Date.now()}`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    let cloudRecords: VoteRecord[] = [];
    
    if (response.ok) {
      const cloudData = await response.json();
      cloudRecords = cloudData.data?.records || [];
    } else if (response.status === 404) {
      // Si no existe y el celular tiene datos, CREAR EL OBJETO MAESTRO
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

    // 2. REGLA DE ORO: EL QUE TENGA MÁS REGISTROS ES EL DUEÑO DE LA VERDAD
    // Caso A: La nube tiene más que yo -> Me actualizo con lo de la nube
    if (cloudRecords.length > localRecords.length) {
      console.log("Computador desactualizado. Bajando datos de la nube...");
      return cloudRecords;
    }

    // Caso B: Yo (Celular) tengo más que la nube -> Subo mis datos a la nube
    if (localRecords.length > cloudRecords.length) {
      console.log("Celular con nuevos datos. Actualizando nube...");
      await fetch(`${API_BASE}/${CLOUD_OBJECT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: STORAGE_NAME,
          data: { records: localRecords }
        })
      });
      return localRecords;
    }

    // Caso C: Son iguales -> No hacemos nada
    return cloudRecords.length > 0 ? cloudRecords : localRecords;

  } catch (error) {
    console.error("Error crítico de sincronización:", error);
    return localRecords;
  }
};
