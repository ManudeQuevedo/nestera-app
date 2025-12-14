-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Categories table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null, -- Categories are user-specific for privacy
  name text not null,
  type text check (type in ('income', 'expense')) not null,
  budget_limit numeric(12,2) default 0,
  icon text, -- Lucide icon name
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Categories
alter table categories enable row level security;
create policy "Users can view own categories" on categories for select using (auth.uid() = user_id);
create policy "Users can insert own categories" on categories for insert with check (auth.uid() = user_id);
create policy "Users can update own categories" on categories for update using (auth.uid() = user_id);

-- Transactions table
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  category_id uuid references categories,
  amount numeric(12,2) not null,
  type text check (type in ('income', 'expense')) not null,
  date date default CURRENT_DATE not null,
  description text,
  is_recurring boolean default false,
  recurring_frequency text, -- 'monthly', 'weekly', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Transactions
alter table transactions enable row level security;
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on transactions for delete using (auth.uid() = user_id);

-- Debts table
create table debts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  current_balance numeric(12,2) not null,
  interest_rate numeric(5,2) not null, -- Percentage
  min_payment numeric(12,2) default 0,
  due_date integer, -- Day of month (1-31)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Debts
alter table debts enable row level security;
create policy "Users can view own debts" on debts for select using (auth.uid() = user_id);
create policy "Users can manage own debts" on debts for all using (auth.uid() = user_id);

-- AI Insights table (for caching suggestions)
create table ai_insights (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  type text check (type in ('spending_leak', 'debt_strategy', 'general_health', 'other')) not null,
  content text not null, -- The AI generated advice
  is_dismissed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for AI Insights
alter table ai_insights enable row level security;
create policy "Users can view own insights" on ai_insights for select using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (new.id, new.email, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
