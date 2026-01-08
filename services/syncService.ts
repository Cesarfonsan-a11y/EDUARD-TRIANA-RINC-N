
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// IDENTIFICADOR ÚNICO GLOBAL - DEBE SER EL MISMO PARA TODOS LOS DISPOSITIVOS
const DRIVE_KEY = "MASTER_DATABASE_TRIANA_102_PAIPA_V4";

let cachedObjectId: string | null = localStorage.getItem('v102_db_id');

export const syncToGoogleSheets = async (records: VoteRecord[], webAppUrl: string) => {
  if (!webAppUrl || !webAppUrl.startsWith('http')) return;
  try {
    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(records)
    });
  } catch (e) {
    console.error("Backup Sync Error:", e);
  }
};

const getDatabaseId = async (): Promise<string | null> => {
  // Siempre intentamos buscar primero para asegurar que estamos en la misma rama que otros dispositivos
  try {
    const res = await fetch(`${API_BASE}?nocache=${Date.now()}`);
    if (!res.ok) return cachedObjectId;
    const items = await res.json();
    
    // Buscamos el objeto global por nombre
    const db = items.find((i: any) => i.name === DRIVE_KEY);
    if (db) {
      localStorage.setItem('v102_db_id', db.id);
      cachedObjectId = db.id;
      return db.id;
    }
    return cachedObjectId;
  } catch (e) {
    return cachedObjectId;
  }
};

const mergeAndDeduplicate = (local: VoteRecord[], remote: VoteRecord[]): VoteRecord[] => {
  const unique = new Map<string, VoteRecord>();
  
  // Procesamos remotos primero (la verdad de la nube)
  remote.forEach(r => {
    unique.set(r.idNumber, { ...r, syncStatus: 'synced' });
  });

  // Procesamos locales, sobrescribiendo solo si el timestamp es más reciente
  local.forEach(r => {
    const existing = unique.get(r.idNumber);
    if (!existing || r.timestamp > existing.timestamp) {
      unique.set(r.idNumber, { ...r, syncStatus: 'synced' });
    }
  });
  
  return Array.from(unique.values()).sort((a, b) => b.timestamp - a.timestamp);
};

export const syncWithCloudDatabase = async (localRecords: VoteRecord[], googleUrl?: string): Promise<{records: VoteRecord[], latency: number, changed: boolean}> => {
  const startTime = Date.now();
  let changed = false;

  try {
    let dbId = await getDatabaseId();
    
    // Si la base de datos no existe en absoluto en la nube
    if (!dbId) {
      if (localRecords.length === 0) return { records: [], latency: 0, changed: false };
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: DRIVE_KEY,
          data: { records: localRecords, lastUpdate: new Date().toISOString() }
        })
      });
      const data = await response.json();
      localStorage.setItem('v102_db_id', data.id);
      cachedObjectId = data.id;
      return { records: localRecords, latency: Date.now() - startTime, changed: true };
    }

    // Traer data de la nube
    const dbRes = await fetch(`${API_BASE}/${dbId}?cb=${Date.now()}`);
    if (!dbRes.ok) throw new Error("Cloud fetch failed");

    const dbObj = await dbRes.json();
    const cloudRecords: VoteRecord[] = dbObj.data?.records || [];
    
    // Merge inteligente
    const mergedRecords = mergeAndDeduplicate(localRecords, cloudRecords);

    // Verificamos si hay diferencias reales comparando el contenido JSON
    const localHash = JSON.stringify(localRecords.map(r => r.idNumber).sort());
    const cloudHash = JSON.stringify(cloudRecords.map(r => r.idNumber).sort());
    const finalHash = JSON.stringify(mergedRecords.map(r => r.idNumber).sort());

    // Si el resultado del merge es diferente a lo que hay en la nube, actualizamos la nube
    if (finalHash !== cloudHash) {
      await fetch(`${API_BASE}/${dbId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: DRIVE_KEY,
          data: { records: mergedRecords, lastUpdate: new Date().toISOString() }
        })
      });
      changed = true;
      if (googleUrl) await syncToGoogleSheets(mergedRecords, googleUrl);
    }

    // Si el resultado es diferente a lo que teníamos localmente, informamos a la UI
    if (finalHash !== localHash) {
      changed = true;
    }

    return { 
      records: mergedRecords, 
      latency: Date.now() - startTime, 
      changed 
    };
  } catch (error) {
    console.error("CRITICAL SYNC ERROR:", error);
    return { records: localRecords, latency: -1, changed: false };
  }
};
