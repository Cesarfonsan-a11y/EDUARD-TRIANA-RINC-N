
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
const MASTER_CHANNEL_NAME = "TRIANA_V102_MASTER_REVISION_PRO";

interface CloudPayload {
  records: VoteRecord[];
  rev: number;
  lastUpdate: string;
}

// Variable persistente en sesión para evitar búsquedas constantes
let activeObjectId: string | null = localStorage.getItem('v102_cloud_id');

/**
 * Busca el ID del objeto maestro en la API pública usando el nombre como clave
 */
const discoverMasterId = async (): Promise<string | null> => {
  try {
    const res = await fetch(`${API_BASE}?t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    });
    if (!res.ok) return null;
    const items = await res.json();
    const master = items.find((i: any) => i.name === MASTER_CHANNEL_NAME);
    if (master) {
      localStorage.setItem('v102_cloud_id', master.id);
      return master.id;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const syncWithCloud = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    // 1. Asegurar Conexión al Canal
    let objectId = activeObjectId;
    if (!objectId) {
      objectId = await discoverMasterId();
      activeObjectId = objectId;
    }

    // 2. Si el canal no existe, el primer dispositivo con datos lo crea
    if (!objectId) {
      if (localRecords.length === 0) return [];
      
      const createRes = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: MASTER_CHANNEL_NAME,
          data: { records: localRecords, rev: 1, lastUpdate: new Date().toISOString() }
        })
      });
      
      if (createRes.ok) {
        const created = await createRes.json();
        activeObjectId = created.id;
        localStorage.setItem('v102_cloud_id', created.id);
      }
      return localRecords;
    }

    // 3. Obtener Estado Remoto
    const remoteRes = await fetch(`${API_BASE}/${objectId}?t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" }
    });

    if (remoteRes.status === 404) {
      localStorage.removeItem('v102_cloud_id');
      activeObjectId = null;
      return localRecords;
    }

    if (!remoteRes.ok) return localRecords;

    const remoteObj = await remoteRes.json();
    const remoteData: CloudPayload = remoteObj.data;
    
    // 4. LÓGICA DE SINCRONIZACIÓN POR REVISIÓN
    // Caso A: La nube tiene una versión más nueva (o más registros) -> Ganador Nube
    if (remoteData.records.length > localRecords.length) {
      console.log(`[SYNC] Nube gana: ${remoteData.records.length} registros.`);
      return remoteData.records;
    }

    // Caso B: El local tiene más registros -> Ganador Local (Actualizar Nube)
    if (localRecords.length > remoteData.records.length) {
      console.log(`[SYNC] Local gana: Subiendo ${localRecords.length} registros.`);
      await fetch(`${API_BASE}/${objectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: MASTER_CHANNEL_NAME,
          data: { 
            records: localRecords, 
            rev: (remoteData.rev || 0) + 1, 
            lastUpdate: new Date().toISOString() 
          }
        })
      });
      return localRecords;
    }

    // Caso C: Empate -> Devolvemos registros remotos por seguridad de integridad
    return remoteData.records || localRecords;

  } catch (error) {
    console.error("[SYNC ERROR]", error);
    return localRecords;
  }
};
