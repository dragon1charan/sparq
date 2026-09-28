'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

type Person = { id: string; name: string; age: number; area: string; tags: string[] };
type Group = { id: string; name: string; tag: string; member_count?: number };

const SWIPE_LIMIT = 5;

export default function Feed() {
  const [tab, setTab] = useState<'people' | 'groups'>('people');
  const [myTags, setMyTags] = useState<Set<string>>(new Set());
  const [people, setPeople] = useState<Person[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [swipesLeft, setSwipesLeft] = useState(SWIPE_LIMIT);
  const [uid, setUid] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    const me = userData.user?.id;
    if (!me) { router.push('/login'); return; }
    setUid(me);

    const { data: myTagRows } = await supabase.from('profile_tags').select('tag').eq('profile_id', me);
    const mine = new Set((myTagRows || []).map(r => r.tag));
    setMyTags(mine);

    const { data: profiles } = await supabase.from('profiles').select('id, name, age, area').neq('id', me);
    const { data: allTags } = await supabase.from('profile_tags').select('profile_id, tag');

    const list: Person[] = (profiles || []).map(p => ({
      ...p,
      tags: (allTags || []).filter(t => t.profile_id === p.id).map(t => t.tag),
    })).sort((a, b) => overlap(b.tags, mine) - overlap(a.tags, mine));
    setPeople(list);

    const { data: groupRows } = await supabase.from('groups').select('id, name, tag');
    setGroups(groupRows || []);

    const used = parseInt(localStorage.getItem('sparq_swipes_' + me) || '0', 10);
    setSwipesLeft(Math.max(0, SWIPE_LIMIT - used));
  }

  function overlap(tags: string[], mine: Set<string>) {
    return tags.filter(t => mine.has(t)).length;
  }

  async function sayHi(person: Person) {
    if (swipesLeft <= 0) { router.push('/paywall'); return; }
    if (!uid) return;

    const used = parseInt(localStorage.getItem('sparq_swipes_' + uid) || '0', 10);
    localStorage.setItem('sparq_swipes_' + uid, String(used + 1));
    setSwipesLeft(s => s - 1);

    await supabase.from('likes').upsert({ liker_id: uid, liked_id: person.id });
    const { data: theirLike } = await supabase.from('likes').select('*').eq('liker_id', person.id).eq('liked_id', uid).maybeSingle();

    if (theirLike) {
      const [a, b] = [uid, person.id].sort();
      const { data: match } = await supabase.from('matches').upsert({ user_a: a, user_b: b }, { onConflict: 'user_a,user_b' }).select().single();
      if (match) router.push(`/chat/${match.id}`);
    } else {
      alert(`Said hi to ${person.name} — you'll get a chat if they say hi back.`);
    }
  }

  async function joinGroup(groupId: string) {
    if (!uid) return;
    await supabase.from('group_members').upsert({ group_id: groupId, profile_id: uid });
    router.push(`/chat/group-${groupId}`);
  }

  return (
    <div className="wrap">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18 }}>
        <h2>Your people</h2>
        <span className="faint">{swipesLeft} swipes left today</span>
      </div>
      <div style={{ display: 'flex', gap: 6, background: 'var(--night-2)', padding: 4, borderRadius: 12, marginBottom: 18 }}>
        {(['people', 'groups'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: 9, borderRadius: 9, fontSize: 13.5,
              background: tab === t ? 'var(--night-3)' : 'transparent',
              color: tab === t ? 'var(--ink)' : 'var(--ink-dim)',
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t === 'people' ? 'People' : 'Group chats'}
          </button>
        ))}
      </div>

      {tab === 'people' && people.map(p => {
        const hits = p.tags.filter(t => myTags.has(t));
        return (
          <div className="card" key={p.id} style={{ marginBottom: 12 }}>
            <div className="row" style={{ marginBottom: 10 }}>
              <div className="avatar" style={{ background: 'var(--marigold)' }}>{p.name[0]}</div>
              <div>
                <p style={{ fontWeight: 600 }}>{p.name}, {p.age}</p>
                <p className="faint">{p.area}</p>
              </div>
            </div>
            <p className="faint" style={{ marginBottom: 6 }}>
              {hits.length ? `${hits.length} shared interest${hits.length > 1 ? 's' : ''}` : 'No overlap yet'}
            </p>
            <button className="btn" style={{ marginTop: 8 }} onClick={() => sayHi(p)}>Say hi</button>
          </div>
        );
      })}

      {tab === 'groups' && groups.map(g => (
        <div className="card" key={g.id} style={{ marginBottom: 12, border: myTags.has(g.tag) ? '1px solid var(--marigold)' : undefined }}>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>{g.name}</p>
          <p className="faint" style={{ marginBottom: 10 }}>{g.tag}</p>
          <button className="btn btn-ghost" onClick={() => joinGroup(g.id)}>Join chat</button>
        </div>
      ))}
    </div>
  );
}
