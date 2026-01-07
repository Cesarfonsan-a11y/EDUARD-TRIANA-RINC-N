
import { VoteRecord } from "../types";

const API_BASE = "https://api.restful-api.dev/objects";
// CLAVE ÚNICA GLOBAL: Esto asegura que PC y Celulares vean lo mismo
const DRIVE_KEY = "MASTER_HUB_TRIANA_102_PAIPA_PRO_V3";

let cachedObjectId: string | null = localStorage.getItem('v102_drive_id');

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
    console.error("Google Hub Sync Error:", e);
  }
};

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

const mergeData = (local: VoteRecord[], remote: VoteRecord[]): VoteRecord[] => {
  const all = [...local, ...remote];
  const unique = new Map<string, VoteRecord>();
  all.forEach(r => {
    // La cédula es la clave de unicidad para el Hub Central
    if (!unique.has(r.idNumber)) unique.set(r.idNumber, r);
  });
  return Array.from(unique.values()).sort((a, b) => b.timestamp - a.timestamp);
};

export const syncWithDrive = async (localRecords: VoteRecord[], googleUrl?: string): Promise<VoteRecord[]> => {
  try {
    let driveId = await getDriveId();
    
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
        if (googleUrl) await syncToGoogleSheets(localRecords, googleUrl);
      }
      return localRecords;
    }

    const driveRes = await fetch(`${API_BASE}/${driveId}?cb=${Date.now()}`);
    if (!driveRes.ok) {
      // Si el objeto fue borrado del servidor, reseteamos el ID local
      localStorage.removeItem('v102_drive_id');
      cachedObjectId = null;
      return localRecords;
    }

    const driveObj = await driveRes.json();
    const cloudRecords: VoteRecord[] = driveObj.data?.records || [];
    const finalRecords = mergeData(localRecords, cloudRecords);

    // Si hay discrepancia, actualizamos el Hub Global
    if (finalRecords.length !== cloudRecords.length) {
      await fetch(`${API_BASE}/${driveId}`, {
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

    return finalRecords;
  } catch (error) {
    console.error("Critical Sync Failure:", error);
    return localRecords;
  }
};
