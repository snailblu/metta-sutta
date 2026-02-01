import Link from 'next/link';

export default function OfflinePage() {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>오프라인</title>
      <style jsx>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          max-width: 400px;
          text-align: center;
        }
        .icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 16px;
          color: #333;
        }
        p {
          font-size: 16px;
          color: #666;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background-color: #16a34a;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .btn:hover {
          background-color: #1382c6;
        }
      `}</style>
      <div className="container">
        <div className="icon">📵</div>
        <h1>오프라인</h1>
        <p>
          현재 오프라인 상태입니다.<br />
          네트워크 연결을 확인해주세요.
        </p>
        <Link href="/" className="btn">
          새로고침
        </Link>
      </div>
    </>
  );
}
