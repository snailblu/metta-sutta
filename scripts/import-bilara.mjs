import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_DIR = "/tmp/bilara-data/root/pli/ms/sutta";
const OUTPUT_DIR = path.resolve("public/suttas");

const NIKAYA_META = {
  dn: { name: "Dīgha Nikāya", nameKo: "장아함" },
  mn: { name: "Majjhima Nikāya", nameKo: "중아함" },
  sn: { name: "Saṁyutta Nikāya", nameKo: "상응부" },
  an: { name: "Aṅguttara Nikāya", nameKo: "증지부" },
  kn: { name: "Khuddaka Nikāya", nameKo: "소부" },
};

async function findBilaraFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = await Promise.all(
    entries.map(async entry => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return findBilaraFiles(fullPath);
      }
      if (entry.isFile() && entry.name.endsWith("_root-pli-ms.json")) {
        return [fullPath];
      }
      return [];
    })
  );

  return results.flat();
}

function extractUid(filePath) {
  return path.basename(filePath, "_root-pli-ms.json");
}

function getNikaya(uid) {
  if (/^dn\d/.test(uid)) return "dn";
  if (/^mn\d/.test(uid)) return "mn";
  if (/^sn\d/.test(uid)) return "sn";
  if (/^an\d/.test(uid)) return "an";
  return "kn";
}

function getTitle(uid, bilaraData) {
  return bilaraData[`${uid}:0.3`] ?? bilaraData[`${uid}:0.2`] ?? uid;
}

function isContentSegment(segmentId) {
  const [, ref = ""] = segmentId.split(":");
  const parts = ref.split(".");
  if (parts.length < 2) return false;

  const [first, second] = parts;
  if (first === "0") return false;
  if (second === "0") return false;

  return true;
}

function naturalSortByUid(a, b) {
  return a.uid.localeCompare(b.uid, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  const filePaths = await findBilaraFiles(SOURCE_DIR);
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  const suttasByNikaya = {
    dn: [],
    mn: [],
    sn: [],
    an: [],
    kn: [],
  };

  for (const filePath of filePaths) {
    const raw = await readFile(filePath, "utf8");
    const bilaraData = JSON.parse(raw);
    const uid = extractUid(filePath);
    const nikaya = getNikaya(uid);
    const title = getTitle(uid, bilaraData).trim() || uid;
    const segments = Object.entries(bilaraData)
      .filter(([segmentId]) => isContentSegment(segmentId))
      .map(([id, pali]) => ({
        id,
        pali: String(pali).trim(),
      }))
      .filter(segment => segment.pali.length > 0);

    const sutta = {
      uid,
      title,
      nikaya,
      segments,
    };

    suttasByNikaya[nikaya].push({ uid, title });
    await writeJson(path.join(OUTPUT_DIR, nikaya, `${uid}.json`), sutta);
  }

  for (const nikaya of Object.keys(suttasByNikaya)) {
    suttasByNikaya[nikaya].sort(naturalSortByUid);
    await writeJson(path.join(OUTPUT_DIR, nikaya, "index.json"), suttasByNikaya[nikaya]);
  }

  const nikayas = ["dn", "mn", "sn", "an", "kn"].map(id => ({
    id,
    name: NIKAYA_META[id].name,
    nameKo: NIKAYA_META[id].nameKo,
    count: suttasByNikaya[id].length,
  }));

  await writeJson(path.join(OUTPUT_DIR, "nikayas.json"), nikayas);

  console.log(`Imported ${filePaths.length} suttas into ${OUTPUT_DIR}`);
  for (const nikaya of nikayas) {
    console.log(`${nikaya.id}: ${nikaya.count}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
