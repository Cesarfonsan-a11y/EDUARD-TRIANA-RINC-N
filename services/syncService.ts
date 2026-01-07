
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
const DRIVE_KEY = "TRIANA_V102_CLOUD_DRIVE_PRO";

interface DrivePayload {
  records: VoteRecord[];
  rev: number;
  updatedAt: string;
  source: string;
}

let cachedObjectId: string | null = localStorage.getItem('v102_drive_id');

const getTimestamp = () => new Date().toISOString();

/**
 * Localiza el "Disco Virtual" en la nube
 */
const locateDrive = async (): Promise<string | null> => {
  try {
    const res = await fetch(`${API_BASE}?nocache=${Date.now()}`);
    if (!res.ok) return null;
    const items = await res.json();
    const drive = items.find((i: any) => i.name === DRIVE_KEY);
    if (drive) {
      localStorage.setItem('v102_drive_id', drive.id);
      return drive.id;
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Fusión inteligente de registros (Merge)
 * Evita duplicados por ID y mantiene el orden cronológico
 */
const mergeRecords = (local: VoteRecord[], remote: VoteRecord[]): VoteRecord[] => {
  const map = new Map<string, VoteRecord>();
  // Prioridad a lo que ya está en la nube (servidor central)
  remote.forEach(r => map.set(r.idNumber, r));
  // Añadir locales que no existan
  local.forEach(r => {
    if (!map.has(r.idNumber)) {
      map.set(r.idNumber, r);
    }
  });
  return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
};

export const syncWithDrive = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    let driveId = cachedObjectId || await locateDrive();
    
    // Si no existe el drive, lo inicializamos
    if (!driveId) {
      if (localRecords.length === 0) return [];
      
      const initRes = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: DRIVE_KEY,
          data: { records: localRecords, rev: 1, updatedAt: getTimestamp(), source: 'master' }
        })
      });
      
      if (initRes.ok) {
        const data = await initRes.json();
        localStorage.setItem('v102_drive_id', data.id);
        cachedObjectId = data.id;
      }
      return localRecords;
    }

    // Consultar estado actual del Drive
    const driveRes = await fetch(`${API_BASE}/${driveId}?cb=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    });

    if (driveRes.status === 404) {
      localStorage.removeItem('v102_drive_id');
      cachedObjectId = null;
      return localRecords;
    }

    const driveObj = await driveRes.json();
    const cloudRecords: VoteRecord[] = driveObj.data?.records || [];
    
    // LOGICA DE DRIVE: SIEMPRE FUSIONAR
    const finalRecords = mergeRecords(localRecords, cloudRecords);

    // Si después de la fusión hay más datos de los que tiene la nube, actualizamos la nube
    if (finalRecords.length > cloudRecords.length || localRecords.length > cloudRecords.length) {
      console.log("[DRIVE] Actualizando disco central...");
      await fetch(`${API_BASE}/${driveId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: DRIVE_KEY,
          data: { 
            records: finalRecords, 
            rev: (driveObj.data?.rev || 0) + 1, 
            updatedAt: getTimestamp() 
          }
        })
      });
    }

    return finalRecords;
  } catch (error) {
    console.error("[DRIVE ERROR]", error);
    return localRecords;
  }
};
