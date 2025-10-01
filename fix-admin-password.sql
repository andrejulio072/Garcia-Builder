-- RESETAR SENHA DO ADMIN PARA FUNCIONAR COM SUPABASE
-- Execute este SQL no Supabase SQL Editor

-- 1. Primeiro, vamos deletar o admin existente
DELETE FROM auth.users WHERE email = 'andregarcia.pt72@gmail.com';

-- 2. Recriar o admin usando o método correto do Supabase
-- Usar uma senha temporária que depois podemos mudar
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'andregarcia.pt72@gmail.com',
    '$2a$10$8PVE.4J8Lh.A4FQvGJBn7u7yR9X9J7vZBwS2F8QQRwWtDHv6HNfL2', -- senha: admin123
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Andre Garcia - Personal Trainer","role":"admin","full_name":"Andre Garcia - Personal Trainer"}',
    now(),
    now()
);

-- 3. Verificar se foi criado corretamente
SELECT
    id,
    email,
    raw_user_meta_data->>'name' as name,
    raw_user_meta_data->>'role' as role,
    email_confirmed_at
FROM auth.users
WHERE email = 'andregarcia.pt72@gmail.com';
