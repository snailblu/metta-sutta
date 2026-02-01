'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Save } from 'lucide-react';
import { useNotes } from '@/lib/db/hooks';

interface Props {
  targetType: 'phrase' | 'word';
  targetId: string;
  onClose: () => void;
}

export function NoteEditor({ targetType, targetId, onClose }: Props) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { note, loading, saveNote, deleteNote } = useNotes(targetType, targetId);

  useEffect(() => {
    if (note && !saving) {
      setContent(note);
    }
  }, [note, saving]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveNote(content);
    } catch (err) {
      alert('메모 저장에 실패했습니다.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 메모를 삭제하시겠습니까?')) return;

    setDeleting(true);
    try {
      await deleteNote();
    } catch (err) {
      alert('메모 삭제에 실패했습니다.');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-neutral-50 dark:bg-neutral-950 border rounded-lg p-6 max-w-md w-full shadow-2xl">
          <p className="text-center text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-neutral-50 dark:bg-neutral-950 border rounded-lg max-w-md w-full p-6 shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">📝 메모 {note ? '편집' : '추가'}</h2>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 텍스트 에리어 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="메모를 입력하세요..."
          className="w-full min-h-[200px] p-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          disabled={saving}
        />

        {/* 버튼 */}
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={saving || deleting}
            className="flex-1"
          >
            취소
          </Button>
          {note && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving || deleting}
              className="flex-1"
            >
              {deleting ? '삭제 중...' : '삭제'}
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || deleting || !content.trim()}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>

        {/* 푸터 */}
        <p className="text-xs text-center text-muted-foreground mt-4">
          자동 저장됩니다. 저장 버튼을 클릭해주세요.
        </p>
      </div>
    </div>
  );
}
