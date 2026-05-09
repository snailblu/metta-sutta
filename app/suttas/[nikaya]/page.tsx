import { readFile } from "fs/promises";
import { join } from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuttaListClient } from "./SuttaListClient";

type Nikaya = {
  id: string;
  name: string;
  nameKo: string;
  count: number;
};

type SuttaListItem = {
  uid: string;
  title: string;
};

async function getNikayas() {
  const filePath = join(process.cwd(), "public", "suttas", "nikayas.json");
  const data = await readFile(filePath, "utf-8");
  return JSON.parse(data) as Nikaya[];
}

async function getSuttaIndex(nikaya: string) {
  try {
    const filePath = join(process.cwd(), "public", "suttas", nikaya, "index.json");
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data) as SuttaListItem[];
  } catch {
    notFound();
  }
}

export default async function NikayaPage({ params }: { params: Promise<{ nikaya: string }> }) {
  const { nikaya } = await params;
  const [nikayas, items] = await Promise.all([getNikayas(), getSuttaIndex(nikaya)]);
  const nikayaInfo = nikayas.find(item => item.id === nikaya);

  if (!nikayaInfo) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="space-y-4">
          <Button asChild variant="ghost" className="w-fit rounded-xl px-0 hover:bg-transparent">
            <Link href="/">
              <ArrowLeft className="size-4" />
              홈으로
            </Link>
          </Button>

          <div className="space-y-1">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{nikayaInfo.name}</p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {nikayaInfo.nameKo}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {nikayaInfo.count.toLocaleString("ko-KR")}편의 경전
            </p>
          </div>
        </header>

        <SuttaListClient items={items} nikaya={nikaya} />
      </div>
    </main>
  );
}
