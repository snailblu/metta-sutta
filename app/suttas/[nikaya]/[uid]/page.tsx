import { readFile } from "fs/promises";
import { join } from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="space-y-4">
          <Button asChild variant="ghost" className="w-fit rounded-xl px-0 hover:bg-transparent">
            <Link href={`/suttas/${nikaya}`}>
              <ArrowLeft className="size-4" />
              {nikayaInfo.nameKo}
            </Link>
          </Button>

          <div className="space-y-2">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{nikayaInfo.name}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
              {sutta.title}
            </h1>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
              {sutta.uid}
            </p>
          </div>
        </header>

        <section className="space-y-6">
          {groups.map((group, index) => (
            <div key={`${group.label}-${index}`} className="space-y-4">
              {index > 0 ? (
                <div className="border-t border-neutral-200 dark:border-neutral-800" />
              ) : null}

              <div className="pl-1 text-xs font-semibold tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                {group.label}
              </div>

              <div className="space-y-3">
                {group.segments.map(segment => (
                  <Card
                    key={segment.id}
                    className="rounded-xl border-neutral-200 bg-white/80 py-0 dark:border-neutral-800 dark:bg-neutral-900/80"
                  >
                    <CardContent className="p-5">
                      <p className="text-base leading-8 text-neutral-900 dark:text-neutral-100 sm:text-lg">
                        {segment.pali}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
