-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'maker', 'pro', 'agency')),
  plan_expires_at timestamptz,
  ls_customer_id text,
  ls_subscription_id text,
  apps_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Apps table
create table public.apps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  slug text,
  description text,
  category text,
  icon_url text,
  current_version int not null default 1,
  status text not null default 'draft' check (status in ('draft', 'ready', 'building', 'published')),
  package_name text,
  color_primary text not null default '#6366f1',
  color_secondary text not null default '#8b5cf6',
  theme text not null default 'dark',
  screens jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.apps enable row level security;

create policy "Users can view own apps" on public.apps
  for select using (auth.uid() = user_id);
create policy "Users can insert own apps" on public.apps
  for insert with check (auth.uid() = user_id);
create policy "Users can update own apps" on public.apps
  for update using (auth.uid() = user_id);
create policy "Users can delete own apps" on public.apps
  for delete using (auth.uid() = user_id);

create index idx_apps_user_id on public.apps(user_id);

-- Chat messages table
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.apps(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  version_number int,
  tokens_used int,
  model text,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "Users can view own messages" on public.chat_messages
  for select using (auth.uid() = user_id);
create policy "Users can insert own messages" on public.chat_messages
  for insert with check (auth.uid() = user_id);

create index idx_messages_app_id on public.chat_messages(app_id);

-- Usage tracking table
create table public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default current_date,
  prompts_used int not null default 0,
  tokens_used int not null default 0,
  unique(user_id, date)
);

alter table public.usage enable row level security;

create policy "Users can view own usage" on public.usage
  for select using (auth.uid() = user_id);
create policy "Users can upsert own usage" on public.usage
  for insert with check (auth.uid() = user_id);
create policy "Users can update own usage" on public.usage
  for update using (auth.uid() = user_id);

-- Function to update apps_count on profile
create or replace function update_apps_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles set apps_count = apps_count + 1, updated_at = now() where id = NEW.user_id;
  elsif TG_OP = 'DELETE' then
    update public.profiles set apps_count = apps_count - 1, updated_at = now() where id = OLD.user_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_app_change
  after insert or delete on public.apps
  for each row execute function update_apps_count();

-- Function to auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at();
create trigger update_apps_updated_at before update on public.apps
  for each row execute function update_updated_at();
