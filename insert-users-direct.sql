-- INSERIR USUÁRIOS DIRETAMENTE NO SUPABASE
-- Execute este SQL no Supabase SQL Editor

-- PRIMEIRO: Limpar usuários existentes (se necessário)
DELETE FROM auth.users WHERE email IN (
    'andregarcia.pt72@gmail.com',
    'trainer1@garciabuilder.com',
    'maria.santos@example.com',
    'joao.oliveira@example.com'
);

-- 1. ADMIN REAL - Andre Garcia
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'andregarcia.pt72@gmail.com',
    crypt('admingarciabuilder', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Andre Garcia - Personal Trainer","role":"admin","full_name":"Andre Garcia - Personal Trainer"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
);

-- 2. USUÁRIO FICTÍCIO 1 - Trainer
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'trainer1@garciabuilder.com',
    crypt('trainer123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Carlos Silva - Personal Trainer","role":"trainer","full_name":"Carlos Silva - Personal Trainer"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
);

-- 3. USUÁRIO FICTÍCIO 2 - Cliente
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'maria.santos@example.com',
    crypt('client123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Maria Santos","role":"client","full_name":"Maria Santos"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
);

-- 4. USUÁRIO FICTÍCIO 3 - Cliente
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'joao.oliveira@example.com',
    crypt('client456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"João Oliveira","role":"client","full_name":"João Oliveira"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
);

-- 5. VERIFICAR USUÁRIOS CRIADOS
SELECT
    id,
    email,
    raw_user_meta_data->>'name' as name,
    raw_user_meta_data->>'role' as role,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email IN (
    'andregarcia.pt72@gmail.com',
    'trainer1@garciabuilder.com',
    'maria.santos@example.com',
    'joao.oliveira@example.com'
)
ORDER BY created_at DESC;

-- 6. VERIFICAR PERFIS CRIADOS AUTOMATICAMENTE
SELECT
    p.id,
    p.full_name,
    p.role,
    u.email,
    p.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email IN (
    'andregarcia.pt72@gmail.com',
    'trainer1@garciabuilder.com',
    'maria.santos@example.com',
    'joao.oliveira@example.com'
)
ORDER BY p.created_at DESC;
