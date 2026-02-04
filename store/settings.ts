import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type Theme = 'light' | 'dark';
export type DefaultView = 'pali' | 'korean' | 'both';
export type TranslationVersion = 'default' | 'daelim' | 'mahavihara';

export interface LastPosition {
  suttaId: string;
  verseNumber: number;
}

interface SettingsState {
  fontSize: FontSize;
  theme: Theme;
  defaultView: DefaultView;
  translationVersion: TranslationVersion;
  lastPosition: LastPosition | null;
  onboardingCompleted: boolean;

  setFontSize: (size: FontSize) => void;
  setTheme: (theme: Theme) => void;
  setDefaultView: (view: DefaultView) => void;
  setTranslationVersion: (version: TranslationVersion) => void;
  setLastPosition: (position: LastPosition) => void;
  completeOnboarding: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: 'large', // 76세 사용자 기본값
      theme: 'light',
      defaultView: 'both',
      translationVersion: 'default',
      lastPosition: null,
      onboardingCompleted: false,

      setFontSize: (size) => set({ fontSize: size }),
      setTheme: (theme) => set({ theme }),
      setDefaultView: (view) => set({ defaultView: view }),
      setTranslationVersion: (version) => set({ translationVersion: version }),
      setLastPosition: (position) => set({ lastPosition: position }),
      completeOnboarding: () => set({ onboardingCompleted: true }),
    }),
    {
      name: 'metta-sutta-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// 폰트 크기 클래스 매핑
export const getFontSizeClass = (size: FontSize): string => {
  return {
    small: 'text-base',
    medium: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl',
  }[size];
};
