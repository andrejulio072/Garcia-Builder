/**
 * 🔐 SUPABASE AUTHENTICATION - GARCIA BUILDER
 * Configuração para autenticação com Supabase
 * Substitua as variáveis abaixo pelos valores do seu projeto Supabase
 */

// Credenciais do projeto Supabase - Garcia Builder
window.SUPABASE_URL = "https://qejtjcaldnuokoofpqap.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlanRqY2FsZG51b2tvb2ZwcWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTY2MjgsImV4cCI6MjA3NDU3MjYyOH0.-4KmNNRpmNLu4-xPtnC4-FJJTBbvrSk03v2WCaT5Kyw";

// Criar cliente Supabase
if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');
} else {
    console.error('❌ Supabase library not loaded');
}

/**
 * Configurações para o seu projeto:
 *
 * 1. Acesse https://supabase.com
 * 2. Crie um novo projeto
 * 3. Vá em Settings > API
 * 4. Copie:
 *    - Project URL → substitua SUPABASE_URL acima
 *    - anon public key → substitua SUPABASE_ANON_KEY acima
 *
 * 5. Configure Authentication:
 *    - Auth > Providers > Email: habilite "Confirm Email"
 *    - Auth > URL Configuration: adicione "https://andrejulio072.github.io/Garcia-Builder/*"
 *
 * 6. No SQL Editor, execute o SQL para criar tabela de perfis (opcional):
 *
 *    create table if not exists public.profiles (
 *      id uuid primary key references auth.users(id) on delete cascade,
 *      full_name text,
 *      created_at timestamp with time zone default now()
 *    );
 *
 *    create or replace function public.handle_new_user()
 *    returns trigger as $$
 *    begin
 *      insert into public.profiles (id, full_name)
 *      values (new.id, new.raw_user_meta_data->>'full_name');
 *      return new;
 *    end;
 *    $$ language plpgsql security definer;
 *
 *    drop trigger if exists on_auth_user_created on auth.users;
 *    create trigger on_auth_user_created
 *    after insert on auth.users
 *    for each row execute function public.handle_new_user();
 *
 *    alter table public.profiles enable row level security;
 *
 *    create policy "Read own profile"
 *      on public.profiles for select
 *      using (id = auth.uid());
 *
 *    create policy "Update own profile"
 *      on public.profiles for update
 *      using (id = auth.uid());
 */
