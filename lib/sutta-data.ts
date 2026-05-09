export interface Nikaya {
  id: string;
  name: string;
  nameKo: string;
  count: number;
}

export interface SuttaIndexItem {
  uid: string;
  title: string;
}

export interface Segment {
  id: string;
  pali: string;
}

export interface Sutta {
  uid: string;
  title: string;
  nikaya: string;
  segments: Segment[];
}

const BASE = "/suttas";

export async function getNikayas(): Promise<Nikaya[]> {
  const res = await fetch(`${BASE}/nikayas.json`);
  if (!res.ok) {
    throw new Error(`Failed to load nikayas: ${res.status}`);
  }
  return res.json();
}

export async function getSuttaList(nikaya: string): Promise<SuttaIndexItem[]> {
  const res = await fetch(`${BASE}/${nikaya}/index.json`);
  if (!res.ok) {
    throw new Error(`Failed to load sutta list for ${nikaya}: ${res.status}`);
  }
  return res.json();
}

export async function getSutta(nikaya: string, uid: string): Promise<Sutta> {
  const res = await fetch(`${BASE}/${nikaya}/${uid}.json`);
  if (!res.ok) {
    throw new Error(`Failed to load sutta ${uid}: ${res.status}`);
  }
  return res.json();
}
