"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SuttaListItem = {
  uid: string;
  title: string;
};

type Props = {
  items: SuttaListItem[];
  nikaya: string;
};

const PAGE_SIZE = 50;

export function SuttaListClient({ items, nikaya }: Props) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = normalizedQuery
    ? items.filter(item => {
        return (
          item.uid.toLowerCase().includes(normalizedQuery) ||
          item.title.toLowerCase().includes(normalizedQuery)
        );
      })
    : items;

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          value={query}
          onChange={event => handleSearchChange(event.target.value)}
          placeholder="UID 또는 제목으로 검색"
          className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-600"
        />
      </div>

      <div className="space-y-3">
        {visibleItems.map(item => (
          <Link key={item.uid} href={`/suttas/${nikaya}/${item.uid}`} className="block">
            <Card className="rounded-xl border-neutral-200 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {item.uid}
                  </p>
                  <p className="truncate text-sm text-neutral-600 dark:text-neutral-400 sm:text-base">
                    {item.title}
                  </p>
                </div>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">보기</span>
              </CardContent>
            </Card>
          </Link>
        ))}

        {filteredItems.length === 0 ? (
          <Card className="rounded-xl border-dashed border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
              검색 결과가 없습니다.
            </CardContent>
          </Card>
        ) : null}
      </div>

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
          >
            더 보기
          </Button>
        </div>
      ) : null}
    </div>
  );
}
