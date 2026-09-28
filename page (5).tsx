'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { TAGS } from '../../lib/tags';

export default function ProfileSetup() {
  const [step, setStep] = useState<'basics' | 'tags'>('basics');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [area, setArea] = useState('');
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function continueFromBasics() {
    const ageNum = parseInt(age, 10);
    if (!name.trim()) { setErr('Enter your name to continue'); return; }
    if (!ageNum || ageNum < 18) { setErr('You need to be 18 or older to use Sparq'); return; }
    if (!area.trim()) { setErr('Enter your area so we can find people near you'); return; }
    setErr('');
    setStep('tags');
  }

  function toggleTag(t: string) {
    const next = new Set(tags);
    next.has(t) ? next.delete(t) : next.add(t);
    setTags(next);
    setErr('');
  }

  async function finish() {
    if (tags.size < 3) { setErr('Pick a few more — this is how we find people like you.'); return; }
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { setErr('Session expired, log in again'); setLoading(false); return; }

    const { error: profErr } = await supabase.from('profiles').insert({
      id: uid, name: name.trim(), age: parseInt(age, 10), area: area.trim(),
    });
    if (profErr) { setErr(profErr.message); setLoading(false); return; }

    const rows = Array.from(tags).map(tag => ({ profile_id: uid, tag }));
    const { error: tagErr } = await supabase.from('profile_tags').insert(rows);
    setLoading(false);
    if (tagErr) { setErr(tagErr.message); return; }

    router.push('/feed');
  }

  if (step === 'basics') {
    return (
      <div className="wrap">
        <h2>First, the basics</h2>
        <p className="dim" style={{ margin: '6px 0 22px' }}>Just enough so people know who they're talking to.</p>
        <label className="faint" htmlFor="name">Your name</label>
        <input id="name" value={name} onChange={e => setName(e.target.value)} style={{ margin: '6px 0 16px' }} />
        <label className="faint" htmlFor="age">Age</label>
        <input id="age" type="number" min={18} value={age} onChange={e => setAge(e.target.value)} style={{ margin: '6px 0 16px' }} />
        <label className="faint" htmlFor="area">Area</label>
        <input id="area" value={area} onChange={e => setArea(e.target.value)} style={{ margin: '6px 0 4px' }} />
        {err && <p className="err">{err}</p>}
        <button className="btn" style={{ marginTop: 22 }} onClick={continueFromBasics}>Continue</button>
      </div>
    );
  }

  return (
    <div className="wrap">
      <h2>What are you into?</h2>
      <p className="dim" style={{ marginTop: 6 }}>Pick at least 3. This is how we find people like you — not by looks.</p>
      {Object.entries(TAGS).map(([cat, list]) => (
        <div key={cat} style={{ marginTop: 22 }}>
          <p className="faint" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{cat}</p>
          <div className="chips">
            {list.map(t => (
              <button key={t} className={`chip${tags.has(t) ? ' active' : ''}`} onClick={() => toggleTag(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      ))}
      {err && <p className="err">{err}</p>}
      <button className="btn" style={{ marginTop: 22 }} onClick={finish} disabled={loading}>
        {loading ? 'Saving…' : 'Find my people'}
      </button>
    </div>
  );
}
