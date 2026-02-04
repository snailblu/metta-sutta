import { useEffect, useState } from 'react';
import { noteHelpers, progressHelpers, bookmarkHelpers, type UserNote, type ReadingProgress, type Bookmark } from './schema';

// 노트 훅
export function useNotes(targetType: 'phrase' | 'word', targetId: string) {
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadNote = async () => {
      setLoading(true);
      try {
        const data = await noteHelpers.get(targetType, targetId);
        setNote(data?.content || null);
      } catch (error) {
        console.error('Failed to load note:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [targetType, targetId]);

  const saveNote = async (content: string) => {
    setSaving(true);
    try {
      await noteHelpers.upsert(targetType, targetId, content);
      setNote(content);
    } catch (error) {
      console.error('Failed to save note:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async () => {
    try {
      const data = await noteHelpers.get(targetType, targetId);
      if (data?.id) {
        await noteHelpers.delete(data.id);
        setNote(null);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  };

  return {
    note,
    loading,
    saving,
    saveNote,
    deleteNote,
  };
}

// 모든 노트 목록 훅
export function useAllNotes() {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await noteHelpers.list();
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  return { notes, loading, reload: loadNotes };
}

// 진도 훅
export function useProgress(suttaId: string) {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      setLoading(true);
      try {
        const data = await progressHelpers.get(suttaId);
        setProgress(data ?? null);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [suttaId]);

  const saveProgress = async (verseNumber: number) => {
    try {
      await progressHelpers.save(suttaId, verseNumber);
      const data = await progressHelpers.get(suttaId);
      setProgress(data ?? null);
    } catch (error) {
      console.error('Failed to save progress:', error);
      throw error;
    }
  };

  const markVerseCompleted = async (verseNumber: number) => {
    try {
      await progressHelpers.save(suttaId, verseNumber, [verseNumber]);
      const data = await progressHelpers.get(suttaId);
      setProgress(data ?? null);
    } catch (error) {
      console.error('Failed to mark verse completed:', error);
      throw error;
    }
  };

  return {
    progress,
    loading,
    saveProgress,
    markVerseCompleted,
  };
}

// 북마크 훅
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const data = await bookmarkHelpers.list();
      setBookmarks(data);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (type: 'verse' | 'phrase' | 'word', targetId: string, title: string) => {
    try {
      await bookmarkHelpers.add(type, targetId, title);
      await loadBookmarks();
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      throw error;
    }
  };

  const removeBookmark = async (id: string) => {
    try {
      await bookmarkHelpers.remove(id);
      await loadBookmarks();
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      throw error;
    }
  };

  const isBookmarked = async (type: 'verse' | 'phrase' | 'word', targetId: string) => {
    try {
      return await bookmarkHelpers.exists(type, targetId);
    } catch (error) {
      console.error('Failed to check bookmark:', error);
      return false;
    }
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    reload: loadBookmarks,
  };
}
