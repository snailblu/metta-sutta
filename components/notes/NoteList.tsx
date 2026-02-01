'use client';

import { useAllNotes } from '@/lib/db/hooks';
import { Card, CardContent } from '@/components/ui/card';

export function NoteList() {
  const { notes, loading } = useAllNotes();

  if (loading) {
    return <p className="text-muted-foreground">로딩 중...</p>;
  }

  if (notes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          아직 메모가 없습니다
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <Card key={note.id}>
          <CardContent className="p-4">
            <p className="text-foreground whitespace-pre-wrap">{note.content}</p>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{note.targetType === 'phrase' ? '구절' : '단어'}</span>
              <span>{new Date(note.updatedAt).toLocaleDateString('ko-KR')}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
