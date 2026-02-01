import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      <div className="max-w-[400px] text-center px-5">
        <div className="text-[64px] mb-5">📵</div>
        <h1 className="text-[24px] mb-4 text-[#333]">오프라인</h1>
        <p className="text-[16px] text-[#666] leading-[1.6] mb-6">
          현재 오프라인 상태입니다.<br />
          네트워크 연결을 확인해주세요.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#16a34a] text-white rounded-lg font-medium transition-colors hover:bg-[#1382c6]"
        >
          새로고침
        </Link>
      </div>
    </div>
  );
}
