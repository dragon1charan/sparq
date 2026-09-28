'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

type Msg = { id: string; sender_id: string; content: string; created_at: string };

export default function Chat() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.id as string;
  const isGroup = rawId.startsWith('group-');
  const id = isGroup ? rawId.replace('group-', '') : rawId;

  const [uid, setUid] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { init(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  async function init() {
    const { data: userData } = await supabase.auth.getUser();
    const me = userData.user?.id;
    if (!me) { router.push('/login'); return; }
    setUid(me);

    const table = isGroup ? 'group_messages' : 'messages';
    const col = isGroup ? 'group_id' : 'match_id';

    if (isGroup) {
      const { data: g } = await supabase.from('groups').select('name').eq('id', id).single();
      setTitle(g?.name || 'Group chat');
    } else {
      const { data: m } = await supabase.from('matches').select('user_a, user_b').eq('id', id).single();
      const otherId = m ? (m.user_a === me ? m.user_b : m.user_a) : null;
      if (otherId) {
        const { data: p } = await supabase.from('profiles').select('name').eq('id', otherId).single();
        setTitle(p?.name || 'Chat');
      }
    }

    const { data: history } = await supabase.from(table).select('*').eq(col, id).order('created_at', { ascending: true });
    setMsgs(history || []);

    const channel = supabase
      .channel(`${table}-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table, filter: `${col}=eq.${id}` }, payload => {
        setMsgs(prev => [...prev, payload.new as Msg]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }

  async function send() {
    if (!input.trim() || !uid) return;
    const table = isGroup ? 'group_messages' : 'messages';
    const col = isGroup ? 'group_id' : 'match_id';
    await supabase.from(table).insert({ [col]: id, sender_id: uid, content: input.trim() });
    setInput('');
  }

  return (
    <div className="wrap">
      <button className="faint" style={{ marginBottom: 16 }} onClick={() => router.push('/feed')}>&larr; Back</button>
      <h2 style={{ marginBottom: 16 }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {msgs.map(m => (
          <div key={m.id} className={`bubble ${m.sender_id === uid ? 'me' : 'them'}`}>{m.content}</div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="row" style={{ gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Say something" style={{ flex: 1 }} />
        <button className="btn" style={{ width: 'auto', padding: '13px 20px' }} onClick={send}>Send</button>
      </div>
    </div>
  );
}
