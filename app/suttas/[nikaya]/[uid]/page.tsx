import { readFile } from "fs/promises";
import { join } from "path";
import { notFound } from "next/navigation";
import SuttaReaderClient from "./SuttaReaderClient";

type Nikaya = {
  id: string;
  name: string;
  nameKo: string;
  count: number;
};

type SuttaSegment = {
  id: string;
  pali: string;
};

type SuttaDocument = {
  uid: string;
  title: string;
  nikaya: string;
  segments: SuttaSegment[];
};

type SegmentGroup = {
  label: string;
  segments: SuttaSegment[];
};

async function getNikayas() {
  const filePath = join(process.cwd(), "public", "suttas", "nikayas.json");
  const data = await readFile(filePath, "utf-8");
  return JSON.parse(data) as Nikaya[];
}

async function getSutta(nikaya: string, uid: string) {
  try {
    const filePath = join(process.cwd(), "public", "suttas", nikaya, `${uid}.json`);
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data) as SuttaDocument;
  } catch {
    notFound();
  }
}

function getGroupLabel(segmentId: string) {
  const match = segmentId.match(/:(\d+)\./);
  return match?.[1] ?? "기타";
}

function groupSegments(segments: SuttaSegment[]) {
  const groups: SegmentGroup[] = [];

  for (const segment of segments) {
    const label = getGroupLabel(segment.id);
    const currentGroup = groups.at(-1);

    if (!currentGroup || currentGroup.label !== label) {
      groups.push({ label, segments: [segment] });
      continue;
    }

    currentGroup.segments.push(segment);
  }

  return groups;
}

export default async function SuttaReaderPage({
  params,
}: {
  params: Promise<{ nikaya: string; uid: string }>;
}) {
  const { nikaya, uid } = await params;
  const [nikayas, sutta] = await Promise.all([getNikayas(), getSutta(nikaya, uid)]);
  const nikayaInfo = nikayas.find(item => item.id === nikaya);

  if (!nikayaInfo || sutta.nikaya !== nikaya) {
    notFound();
  }

  const groups = groupSegments(sutta.segments);

  return (
    <SuttaReaderClient
      nikayaInfo={nikayaInfo}
      suttaUid={sutta.uid}
      suttaTitle={sutta.title}
      groups={groups}
    />
  );
}
