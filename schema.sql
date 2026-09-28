-- Run this once in your Supabase project: Dashboard -> SQL Editor -> paste -> Run

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  age int not null check (age >= 18),
  area text not null,
  created_at timestamptz default now()
);

create table profile_tags (
  profile_id uuid references profiles(id) on delete cascade,
  tag text not null,
  primary key (profile_id, tag)
);

create table likes (
  liker_id uuid references profiles(id) on delete cascade,
  liked_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (liker_id, liked_id)
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references profiles(id) on delete cascade,
  user_b uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_a, user_b)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tag text not null
);

create table group_members (
  group_id uuid references groups(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  primary key (group_id, profile_id)
);

create table group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- seed a few starter groups so it doesn't feel empty on day one
insert into groups (name, tag) values
  ('Hyderabad guitar circle', 'Guitar covers'),
  ('Boxing fight nights', 'Boxing'),
  ('Telugu music lovers', 'Telugu film music'),
  ('Weekend football — North Hyd', 'Football');

-- Row Level Security: people can only see/edit what they should
alter table profiles enable row level security;
alter table profile_tags enable row level security;
alter table likes enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;
alter table group_members enable row level security;
alter table group_messages enable row level security;

create policy "profiles are viewable by anyone logged in" on profiles for select using (auth.role() = 'authenticated');
create policy "users insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "users update own profile" on profiles for update using (auth.uid() = id);

create policy "tags viewable by anyone logged in" on profile_tags for select using (auth.role() = 'authenticated');
create policy "users manage own tags" on profile_tags for all using (auth.uid() = profile_id);

create policy "users manage own likes" on likes for all using (auth.uid() = liker_id);
create policy "users see likes involving them" on likes for select using (auth.uid() = liker_id or auth.uid() = liked_id);

create policy "users see their matches" on matches for select using (auth.uid() = user_a or auth.uid() = user_b);
create policy "users see messages in their matches" on messages for select using (
  exists (select 1 from matches m where m.id = match_id and (m.user_a = auth.uid() or m.user_b = auth.uid()))
);
create policy "users send messages in their matches" on messages for insert with check (
  auth.uid() = sender_id and exists (select 1 from matches m where m.id = match_id and (m.user_a = auth.uid() or m.user_b = auth.uid()))
);

create policy "groups viewable by anyone logged in" on groups for select using (auth.role() = 'authenticated');
create policy "users manage own group membership" on group_members for all using (auth.uid() = profile_id);
create policy "group members see group membership" on group_members for select using (auth.role() = 'authenticated');
create policy "group members see messages" on group_messages for select using (
  exists (select 1 from group_members gm where gm.group_id = group_messages.group_id and gm.profile_id = auth.uid())
);
create policy "group members send messages" on group_messages for insert with check (
  auth.uid() = sender_id and exists (select 1 from group_members gm where gm.group_id = group_messages.group_id and gm.profile_id = auth.uid())
);
