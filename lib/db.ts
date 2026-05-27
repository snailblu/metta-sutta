import Dexie, { type EntityTable } from "dexie";

interface TranslationRecord {
  id: number;
  original: string;
  result: string; // JSON stringified AnalysisResult
  createdAt: number;
}

const db = new Dexie("metta-sutta-db") as Dexie & {
  translations: EntityTable<TranslationRecord, "id">;
};

db.version(1).stores({
  translations: "++id, original, createdAt",
});

export { db };
export type { TranslationRecord };
