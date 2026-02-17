import MettaTranslator from '@/components/features/MettaTranslator';

export default function TranslatorPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        경전 분석기 (도반)
      </h1>
      <p className="text-lg text-gray-600 text-center mb-12">
        빨리어 경전을 수행자의 관점으로 명쾌하게 풀어드립니다.
      </p>
      <MettaTranslator />
    </div>
  );
}
