import { readFile } from "fs/promises";
import { join } from "path";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SuttaSearchBar } from "@/components/SuttaSearchBar";

type Nikaya = {
  id: string;
  name: string;
  nameKo: string;
  count: number;
};

const nikayaDescriptions: Record<string, string> = {
  dn: "긴 설법 모음 · 34편",
  mn: "중간 길이 설법 · 152편",
  sn: "주제별로 묶은 설법",
  an: "숫자별로 묶은 설법",
  kn: "단편 경전 모음",
};

async function getNikayas() {
  const filePath = join(process.cwd(), "public", "suttas", "nikayas.json");
  const data = await readFile(filePath, "utf-8");
  return JSON.parse(data) as Nikaya[];
}

export default async function HomePage() {
  const nikayas = await getNikayas();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            도반 · Dhammamitta
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
            빨리어 경전을 읽고
            <br />
            깨달음의 의미를 만나보세요
          </h1>
          <p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-400 sm:text-base">
            다섯 니까야를 따라 경전을 탐색하고, 필요한 경우 직접 입력으로 바로 분석할 수 있습니다.
          </p>
        </section>

        <section className="mx-auto w-full max-w-2xl">
          <SuttaSearchBar />
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {nikayas.map(nikaya => (
            <Link key={nikaya.id} href={`/suttas/${nikaya.id}`} className="group block">
              <Card className="h-full rounded-xl border-neutral-200 transition-colors group-hover:border-neutral-400 dark:border-neutral-800 dark:group-hover:border-neutral-600">
                <CardHeader className="gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100">
                      {nikaya.nameKo}
                    </CardTitle>
                    <CardDescription className="text-sm">{nikaya.name}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto space-y-3">
                  <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {nikaya.id.toUpperCase()} · {nikaya.count.toLocaleString("ko-KR")}편
                  </div>
                  <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                    {nikayaDescriptions[nikaya.id] ?? "경전 모음"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        <div className="flex justify-center">
          <Button asChild variant="outline" size="lg" className="rounded-xl">
            <Link href="/translator">
              직접 입력하기
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
