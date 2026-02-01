import Dexie, { Table } from 'dexie';

export interface UserNote {
  id?: string;
  targetType: 'phrase' | 'word';
  targetId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingProgress {
  id?: string;
  suttaId: string;
  verseNumber: number;
  lastReadAt: Date;
  completedVerses: number[];
}

export interface Bookmark {
  id?: string;
  type: 'verse' | 'phrase' | 'word';
  targetId: string;
  title: string;
  createdAt: Date;
}

class MettaSuttaDB extends Dexie {
  notes!: Table<UserNote>;
  progress!: Table<ReadingProgress>;
  bookmarks!: Table<Bookmark>;

  constructor() {
    super('MettaSuttaDB');

    // 스키마 정의
    this.version(1).stores({
      notes: '++id, targetType, targetId, createdAt, updatedAt',
      progress: '++id, suttaId, verseNumber, lastReadAt',
      bookmarks: '++id, type, targetId, createdAt',
    });
  }
}

// DB 인스턴스 싱글톤
export const db = new MettaSuttaDB();

// 헬퍼 함수: 노트 CRUD
export const noteHelpers = {
  // 노트 추가/업데이트
  async upsert(targetType: UserNote['targetType'], targetId: string, content: string) {
    const existing = await db.notes
      .where({ targetType, targetId })
      .first();

    if (existing) {
      await db.notes.update(existing.id!, {
        content,
        updatedAt: new Date(),
      });
      return await db.notes.get(existing.id!);
    } else {
      const note: UserNote = {
        targetType,
        targetId,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return await db.notes.add(note);
    }
  },

  // 노트 조회
  async get(targetType: UserNote['targetType'], targetId: string) {
    return await db.notes.where({ targetType, targetId }).first();
  },

  // 노트 삭제
  async delete(id: string) {
    return await db.notes.delete(id);
  },

  // 모든 노트 목록
  async list() {
    return await db.notes.orderBy('updatedAt').reverse().toArray();
  },
};

// 헬퍼 함수: 진도 관리
export const progressHelpers = {
  // 진도 저장
  async save(suttaId: string, verseNumber: number, completedVerses: number[] = []) {
    const existing = await db.progress.where({ suttaId }).first();

    if (existing) {
      await db.progress.update(existing.id!, {
        verseNumber,
        lastReadAt: new Date(),
        completedVerses: [...new Set([...existing.completedVerses, ...completedVerses])],
      });
    } else {
      await db.progress.add({
        suttaId,
        verseNumber,
        lastReadAt: new Date(),
        completedVerses,
      });
    }
  },

  // 진도 조회
  async get(suttaId: string) {
    return await db.progress.where({ suttaId }).first();
  },
};

// 헬퍼 함수: 북마크
export const bookmarkHelpers = {
  // 북마크 추가
  async add(type: Bookmark['type'], targetId: string, title: string) {
    return await db.bookmarks.add({
      type,
      targetId,
      title,
      createdAt: new Date(),
    });
  },

  // 북마크 삭제
  async remove(id: string) {
    return await db.bookmarks.delete(id);
  },

  // 북마크 목록
  async list() {
    return await db.bookmarks.orderBy('createdAt').reverse().toArray();
  },

  // 북마크 여부 확인
  async exists(type: Bookmark['type'], targetId: string) {
    return await db.bookmarks.where({ type, targetId }).count() > 0;
  },
};
