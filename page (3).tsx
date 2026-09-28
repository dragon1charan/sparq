'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup() {
    setErr('');
    if (!email.includes('@')) { setErr('Enter a valid email'); return; }
    if (password.length < 6) { setErr('Password needs at least 6 characters'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    router.push('/profile-setup');
  }

  return (
    <div className="wrap">
      <h2 style={{ marginBottom: 6 }}>Create your account</h2>
      <p className="dim" style={{ marginBottom: 22 }}>You'll check your email to confirm it.</p>
      <label className="faint" htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ margin: '6px 0 16px' }} />
      <label className="faint" htmlFor="password">Password</label>
      <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ margin: '6px 0 4px' }} />
      {err && <p className="err">{err}</p>}
      <button className="btn" style={{ marginTop: 22 }} onClick={handleSignup} disabled={loading}>
        {loading ? 'Creating account…' : 'Continue'}
      </button>
    </div>
  );
}
