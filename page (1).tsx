import Link from 'next/link';

export default function Home() {
  return (
    <div className="wrap">
      <div style={{ padding: '48px 0 32px' }}>
        <div
          style={{
            fontFamily: 'Outfit',
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(90deg, var(--marigold), var(--coral))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Sparq
        </div>
        <h1 style={{ marginTop: 20, fontSize: 28 }}>Meet people through what you actually love.</h1>
        <p className="dim" style={{ marginTop: 14, fontSize: 16 }}>
          Not another swipe-on-photos app. You match on the music, the sport, the thing you'd talk about for an hour anyway.
        </p>
      </div>
      <Link href="/signup" className="btn" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
        Get started
      </Link>
      <p className="faint" style={{ textAlign: 'center', marginTop: 14 }}>
        18+ only
      </p>
    </div>
  );
}
