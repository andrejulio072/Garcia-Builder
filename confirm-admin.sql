-- FORÇAR CONFIRMAÇÃO DO ADMIN
-- Execute este SQL no Supabase SQL Editor

-- 1. Confirmar email do admin (SEM confirmed_at que é coluna gerada)
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'andregarcia.pt72@gmail.com';-- 2. Verificar se usuário existe e está confirmado
SELECT id, email, email_confirmed_at, confirmed_at, raw_user_meta_data
FROM auth.users
WHERE email = 'andregarcia.pt72@gmail.com';

-- 3. Verificar perfil criado automaticamente
SELECT * FROM public.profiles
WHERE id = (
    SELECT id FROM auth.users
    WHERE email = 'andregarcia.pt72@gmail.com'
);
