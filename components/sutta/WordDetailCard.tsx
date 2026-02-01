import { Word } from '@/types';

interface Props {
  word: Word;
  onWordSelect?: (wordId: string) => void;
}

export function WordDetailCard({ word, onWordSelect }: Props) {
  return (
    <div 
      onClick={() => onWordSelect?.(word.id)}
      className="bg-card border rounded-lg p-6 hover:border-primary/50 cursor-pointer transition-all"
    >
      <div className="space-y-4">
        {/* 단어 제목 */}
        <div>
          <h3 className="text-2xl font-bold text-primary mb-2">
            {word.pali}
          </h3>
          <p className="text-lg text-muted-foreground">
            {word.pronunciation}
          </p>
        </div>

        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-md p-4">
            <p className="text-xs text-muted-foreground mb-1">품사</p>
            <p className="text-base font-medium">{word.partOfSpeech}</p>
          </div>
          <div className="bg-muted/30 rounded-md p-4">
            <p className="text-xs text-muted-foreground mb-1">어근</p>
            <p className="text-base font-medium">{word.root}</p>
          </div>
        </div>

        {/* 사전적 의미 */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">📖 사전적 의미</h4>
          <div className="space-y-2">
            {word.meanings.map((meaning, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-base">{meaning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 어원 */}
        {word.etymology && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">📚 어원</h4>
            <div className="bg-muted/30 rounded-md p-4">
              <p className="text-base leading-relaxed">{word.etymology}</p>
            </div>
          </div>
        )}

        {/* 관련 용어 */}
        {word.relatedTerms && word.relatedTerms.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">🔗 관련 용어</h4>
            <div className="flex flex-wrap gap-2">
              {word.relatedTerms.map((term, i) => (
                <span key={i} className="px-3 py-1.5 bg-muted rounded-full text-sm">
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
