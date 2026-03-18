import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MettaTranslator from '../components/features/MettaTranslator';

// useObject mock
vi.mock('@ai-sdk/react', () => ({
  experimental_useObject: vi.fn(() => ({
    object: null,
    submit: vi.fn(),
    isLoading: false,
    error: null,
  })),
}));

describe('MettaTranslator', () => {
  it('renders the translator title', () => {
    render(<MettaTranslator />);
    expect(screen.getByText(/경전 분석기/i)).toBeInTheDocument();
  });

  it('renders the input label', () => {
    render(<MettaTranslator />);
    expect(screen.getByLabelText(/빨리어 또는 영어 문구를 입력하세요/i)).toBeInTheDocument();
  });

  it('renders the analyze button', () => {
    render(<MettaTranslator />);
    expect(screen.getByRole('button', { name: /분석 시작/i })).toBeInTheDocument();
  });

  it('renders history toggle button', () => {
    render(<MettaTranslator />);
    expect(screen.getByText(/히스토리 보기/i)).toBeInTheDocument();
  });
});
