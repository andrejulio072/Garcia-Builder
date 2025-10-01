-- INSERIR USUÁRIOS APENAS SE NÃO EXISTIREM
-- Execute este SQL no Supabase SQL Editor

-- Inserir apenas usuários fictícios (pular admin se já existe)
DO $$
BEGIN
    -- ADMIN REAL - Apenas se não existir
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'andregarcia.pt72@gmail.com') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, recovery_sent_at, last_sign_in_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
            confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'andregarcia.pt72@gmail.com',
            crypt('admingarciabuilder', gen_salt('bf')),
            now(), now(), now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Andre Garcia - Personal Trainer","role":"admin","full_name":"Andre Garcia - Personal Trainer"}',
            now(), now(), '', '', '', ''
        );
        RAISE NOTICE 'Admin real criado: andregarcia.pt72@gmail.com';
    ELSE
        RAISE NOTICE 'Admin real já existe: andregarcia.pt72@gmail.com';
    END IF;

    -- TRAINER FICTÍCIO
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'trainer1@garciabuilder.com') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, recovery_sent_at, last_sign_in_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
            confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'trainer1@garciabuilder.com',
            crypt('trainer123', gen_salt('bf')),
            now(), now(), now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Carlos Silva - Personal Trainer","role":"trainer","full_name":"Carlos Silva - Personal Trainer"}',
            now(), now(), '', '', '', ''
        );
        RAISE NOTICE 'Trainer criado: trainer1@garciabuilder.com';
    END IF;

    -- CLIENTE 1
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'maria.santos@example.com') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, recovery_sent_at, last_sign_in_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
            confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'maria.santos@example.com',
            crypt('client123', gen_salt('bf')),
            now(), now(), now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Maria Santos","role":"client","full_name":"Maria Santos"}',
            now(), now(), '', '', '', ''
        );
        RAISE NOTICE 'Cliente criado: maria.santos@example.com';
    END IF;

    -- CLIENTE 2
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'joao.oliveira@example.com') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, recovery_sent_at, last_sign_in_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
            confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'joao.oliveira@example.com',
            crypt('client456', gen_salt('bf')),
            now(), now(), now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"João Oliveira","role":"client","full_name":"João Oliveira"}',
            now(), now(), '', '', '', ''
        );
        RAISE NOTICE 'Cliente criado: joao.oliveira@example.com';
    END IF;

END $$;

-- VERIFICAR USUÁRIOS CRIADOS
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

-- VERIFICAR PERFIS CRIADOS AUTOMATICAMENTE
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
