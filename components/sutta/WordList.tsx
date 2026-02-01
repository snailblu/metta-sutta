'use client';

import { Word } from '@/types';
import { getWord } from '@/data';

interface Props {
  wordIds: string[];
  onWordSelect: (wordId: string) => void;
}

export function WordList({ wordIds, onWordSelect }: Props) {
  const words = wordIds
    .map((id) => getWord(id))
    .filter((w): w is Word => w !== null && w !== undefined);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {words.map((word) => (
        <button
          key={word.id}
          onClick={() => onWordSelect(word.id)}
          className="text-left bg-muted/50 hover:bg-muted p-4 rounded-lg transition-colors group"
        >
          <div className="space-y-2">
            <p className="text-lg font-medium text-primary group-hover:text-primary/90">
              {word.pali}
            </p>
            <p className="text-sm text-muted-foreground">
              {word.pronunciation}
            </p>
            {word.root && (
              <p className="text-xs text-muted-foreground">
                어근: {word.root}
              </p>
            )}
          </div>
          <div className="text-right text-muted-foreground text-sm group-hover:text-foreground">
            →
          </div>
        </button>
      ))}
    </div>
  );
}
