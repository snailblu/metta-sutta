import { NextRequest, NextResponse } from 'next/server';
import { getPhrase } from '@/data';

export async function POST(request: NextRequest) {
  try {
    const { phraseId } = await request.json();

    if (!phraseId) {
      return NextResponse.json(
        { error: 'phraseId is required' },
        { status: 400 }
      );
    }

    const phrase = getPhrase(phraseId);

    if (!phrase) {
      return NextResponse.json(
        { error: 'Phrase not found' },
        { status: 404 }
      );
    }

    // AI 해설 생성 (현재는 목업 텍스트 반환)
    // 실제로는 Claude API를 호출하거나 로컬 LLM을 사용
    const response = {
      phraseId,
      contextTranslation: `${phrase.paliText}의 문맥 번역 제안입니다.\n\n이 구절은 자비경의 핵심 가르침 중 하나로서,\n자비(메따/loving-kindness)를 기르는 수행자가 갖추어야 할 바람직한 자질을 설명합니다.`,
      practiceExplanation: `이 구절은 자비 수행(mettā bhāvanā)의 방법을 설명합니다.\n\n자비란 다음과 같은 것을 의미합니다:\n1. 자신의 이익을 타인의 이익과 구분하지 않는 것\n2. 타인의 고통을 없애고자 하는 것\n3. 모든 중생에게 공평하게 대하는 것\n\n이 구절에서는 자비의 대상을 '모든 중생'으로 확장하여,\n무한한 자비를 실천하는 자세를 제안하고 있습니다.`,
      relatedConcepts: [
        '자비 (Metta)',
        '사무량심 (Brahmavihāra)',
        '수행 (Bhāvanā)',
      ]
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI explanation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
