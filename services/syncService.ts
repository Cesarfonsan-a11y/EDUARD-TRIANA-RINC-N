
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// IDENTIFICADOR ÚNICO PARA LA BASE DE DATOS DEL PROYECTO PAIPA 102
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
  if (cachedObjectId) return cachedObjectId;
  try {
    const res = await fetch(`${API_BASE}?nocache=${Date.now()}`);
    if (!res.ok) return null;
    const items = await res.json();
    const db = items.find((i: any) => i.name === DRIVE_KEY);
    if (db) {
      localStorage.setItem('v102_db_id', db.id);
      cachedObjectId = db.id;
      return db.id;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const mergeAndDeduplicate = (local: VoteRecord[], remote: VoteRecord[]): VoteRecord[] => {
  const all = [...local, ...remote];
  const unique = new Map<string, VoteRecord>();
  
  // Priorizamos registros más recientes o con estado 'synced'
  all.forEach(r => {
    const existing = unique.get(r.idNumber);
    if (!existing || r.timestamp > existing.timestamp) {
      unique.set(r.idNumber, { ...r, syncStatus: 'synced' });
    }
  });
  
  return Array.from(unique.values()).sort((a, b) => b.timestamp - a.timestamp);
};

export const syncWithCloudDatabase = async (localRecords: VoteRecord[], googleUrl?: string): Promise<{records: VoteRecord[], latency: number}> => {
  const startTime = Date.now();
  try {
    let dbId = await getDatabaseId();
    
    // Si la base de datos no existe en la nube, la creamos
    if (!dbId) {
      if (localRecords.length === 0) return { records: [], latency: 0 };
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
      return { records: localRecords, latency: Date.now() - startTime };
    }

    // Leemos la base de datos actual de la nube
    const dbRes = await fetch(`${API_BASE}/${dbId}?cb=${Date.now()}`);
    if (!dbRes.ok) {
      localStorage.removeItem('v102_db_id');
      cachedObjectId = null;
      return { records: localRecords, latency: Date.now() - startTime };
    }

    const dbObj = await dbRes.json();
    const cloudRecords: VoteRecord[] = dbObj.data?.records || [];
    const finalRecords = mergeAndDeduplicate(localRecords, cloudRecords);

    // Actualizamos la nube solo si hay cambios significativos
    if (finalRecords.length !== cloudRecords.length) {
      await fetch(`${API_BASE}/${dbId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: DRIVE_KEY,
          data: { records: finalRecords, lastUpdate: new Date().toISOString() }
        })
      });

      if (googleUrl) {
        await syncToGoogleSheets(finalRecords, googleUrl);
      }
    }

    return { records: finalRecords, latency: Date.now() - startTime };
  } catch (error) {
    console.error("Cloud Database Failure:", error);
    return { records: localRecords, latency: -1 };
  }
};
