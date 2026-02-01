import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './schema';
import type { UserNote, UserSettings } from '@/types';

// 메모 훅
export function useNotes(targetType: 'phrase' | 'word', targetId: string) {
  const notes = useLiveQuery(
    () => db.notes
      .where({ targetType, targetId })
      .reverse()
      .sortBy('createdAt'),
    [targetType, targetId]
  );

  const addNote = async (content: string) => {
    await db.notes.add({
      targetType,
      targetId,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  };

  const updateNote = async (id: number, content: string) => {
    await db.notes.update(id, {
      content,
      updatedAt: new Date()
    });
  };

  const deleteNote = async (id: number) => {
    await db.notes.delete(id);
  };

  return { notes: notes || [], addNote, updateNote, deleteNote };
}

// 설정 훅
export function useSettings() {
  const settings = useLiveQuery(() => db.settings.get('settings'));

  const defaultSettings: UserSettings = {
    id: 'settings',
    fontSize: 'large',
    theme: 'light',
    defaultView: 'both',
    onboardingCompleted: false
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const current = await db.settings.get('settings');
    if (current) {
      await db.settings.update('settings', updates);
    } else {
      await db.settings.add({ ...defaultSettings, ...updates });
    }
  };

  const getSettings = async () => {
    const current = await db.settings.get('settings');
    return current || defaultSettings;
  };

  return { settings: settings || defaultSettings, updateSettings, getSettings };
}
