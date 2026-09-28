'use client';
import { useRouter } from 'next/navigation';

export default function Paywall() {
  const router = useRouter();

  function fakeBuy() {
    alert('Payment isn\'t wired up yet — this is where Razorpay checkout goes.');
    router.push('/feed');
  }

  return (
    <div className="wrap">
      <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
        <div style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 700, color: 'var(--marigold)' }}>Out of swipes</div>
        <p className="dim" style={{ marginTop: 10 }}>
          You've used your 5 free swipes for today. Come back tomorrow, or unlock more now.
        </p>
      </div>
      <div className="card" style={{ border: '1px solid var(--marigold)', marginBottom: 12 }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontWeight: 600, fontFamily: 'Outfit', fontSize: 18 }}>Sparq+</p>
          <p style={{ fontWeight: 600, color: 'var(--marigold)' }}>₹149/mo</p>
        </div>
        <p style={{ fontSize: 14.5, lineHeight: 1.9 }}>
          Unlimited swipes<br />See who liked you<br />Join unlimited group chats<br />One profile boost a week
        </p>
      </div>
      <button className="btn" onClick={fakeBuy}>Unlock Sparq+</button>
      <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => router.push('/feed')}>Maybe later</button>
      <p className="faint" style={{ textAlign: 'center', marginTop: 16 }}>Payments not connected yet — see README</p>
    </div>
  );
}
