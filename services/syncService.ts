
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// Clave única para que todos los celulares y computadores vean LO MISMO
const DRIVE_KEY = "TRIANA_102_CAMPAÑA_OFICIAL_PRO";

let cachedObjectId: string | null = localStorage.getItem('v102_drive_id');

/**
 * Busca el disco central en la nube
 */
const getDriveId = async (): Promise<string | null> => {
  if (cachedObjectId) return cachedObjectId;
  
  try {
    const res = await fetch(`${API_BASE}?nocache=${Date.now()}`);
    if (!res.ok) return null;
    const items = await res.json();
    const drive = items.find((i: any) => i.name === DRIVE_KEY);
    if (drive) {
      localStorage.setItem('v102_drive_id', drive.id);
      cachedObjectId = drive.id;
      return drive.id;
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Lógica de Fusión (Como en Google Sheets)
 * Combina registros locales y de la nube sin borrar nada
 */
const mergeData = (local: VoteRecord[], remote: VoteRecord[]): VoteRecord[] => {
  const all = [...local, ...remote];
  const unique = new Map<string, VoteRecord>();
  all.forEach(r => {
    // Usamos la cédula como llave única para no duplicar personas
    if (!unique.has(r.idNumber)) {
      unique.set(r.idNumber, r);
    }
  });
  return Array.from(unique.values()).sort((a, b) => b.timestamp - a.timestamp);
};

export const syncWithDrive = async (localRecords: VoteRecord[]): Promise<VoteRecord[]> => {
  try {
    let driveId = await getDriveId();
    
    // Si el disco no existe en internet, lo creamos por primera vez
    if (!driveId) {
      if (localRecords.length === 0) return [];
      
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: DRIVE_KEY,
          data: { records: localRecords, lastUpdate: new Date().toISOString() }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('v102_drive_id', data.id);
        cachedObjectId = data.id;
      }
      return localRecords;
    }

    // Si el disco existe, descargamos lo que tienen otros
    const driveRes = await fetch(`${API_BASE}/${driveId}?cb=${Date.now()}`);
    if (!driveRes.ok) return localRecords;

    const driveObj = await driveRes.json();
    const cloudRecords: VoteRecord[] = driveObj.data?.records || [];
    
    // FUSIONAMOS: Local + Nube
    const finalRecords = mergeData(localRecords, cloudRecords);

    // Si hay datos nuevos tras la fusión, actualizamos el disco central
    if (finalRecords.length > cloudRecords.length || localRecords.length > cloudRecords.length) {
      await fetch(`${API_BASE}/${driveId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: DRIVE_KEY,
          data: { 
            records: finalRecords, 
            lastUpdate: new Date().toISOString() 
          }
        })
      });
    }

    return finalRecords;
  } catch (error) {
    console.error("Error de conexión con la Nube Triana:", error);
    return localRecords;
  }
};
