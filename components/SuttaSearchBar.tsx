"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { parseSuttaId } from "@/lib/sutta-id";

/**
 * Homepage sutta ID search bar.
 *
 * Accepts sutta IDs like "SN56.11", "mn1", "dn10" and navigates
 * directly to the corresponding sutta reader page.
 */
export function SuttaSearchBar() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = parseSuttaId(query);
    if (!parsed) {
      setError("올바른 경전 번호를 입력해 주세요 (예: SN56.11, mn1, dn10)");
      return;
    }

    router.push(`/suttas/${parsed.nikaya}/${parsed.uid}`);
  }

  function handleChange(value: string) {
    setQuery(value);
    if (error) setError("");
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          value={query}
          onChange={event => handleChange(event.target.value)}
          placeholder="경전 번호를 입력하세요 (예: SN56.11)"
          className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-600"
        />
      </form>
      {error && <p className="px-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
