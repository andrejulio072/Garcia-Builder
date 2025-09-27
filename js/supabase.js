/**
 * 🔐 SUPABASE AUTHENTICATION - GARCIA BUILDER
 * Configuração para autenticação com Supabase
 * Substitua as variáveis abaixo pelos valores do seu projeto Supabase
 */

// TODO: Substitua pelos valores do seu projeto Supabase
window.SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
window.SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";

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
