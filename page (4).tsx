'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    setErr('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    router.push('/feed');
  }

  return (
    <div className="wrap">
      <h2 style={{ marginBottom: 22 }}>Log in</h2>
      <label className="faint" htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ margin: '6px 0 16px' }} />
      <label className="faint" htmlFor="password">Password</label>
      <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ margin: '6px 0 4px' }} />
      {err && <p className="err">{err}</p>}
      <button className="btn" style={{ marginTop: 22 }} onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in…' : 'Log in'}
      </button>
    </div>
  );
}
