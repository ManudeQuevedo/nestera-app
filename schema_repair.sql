DO $$
BEGIN
    ----------------------------------------------------------------
    -- 1. REPAIR MISSING user_id COLUMNS
    ----------------------------------------------------------------
    
    -- Table: accounts
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'accounts') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'user_id') THEN
            ALTER TABLE public.accounts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_id to accounts';
        END IF;
    END IF;

    -- Table: transactions
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transactions') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'user_id') THEN
            ALTER TABLE public.transactions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_id to transactions';
        END IF;
    END IF;

    -- Table: debts
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'debts') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'debts' AND column_name = 'user_id') THEN
            ALTER TABLE public.debts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_id to debts';
        END IF;
    END IF;

    -- Table: meal_library
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meal_library') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'meal_library' AND column_name = 'user_id') THEN
            ALTER TABLE public.meal_library ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_id to meal_library';
        END IF;
    END IF;

    -- Table: grocery_items
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'grocery_items') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'grocery_items' AND column_name = 'user_id') THEN
            ALTER TABLE public.grocery_items ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_id to grocery_items';
        END IF;
    END IF;

    -- Table: family_events
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'family_events') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'family_events' AND column_name = 'user_id') THEN
            ALTER TABLE public.family_events ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_id to family_events';
        END IF;
    END IF;

    -- Table: chat_history
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_history') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chat_history' AND column_name = 'user_id') THEN
            ALTER TABLE public.chat_history ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_id to chat_history';
        END IF;
    END IF;

    ----------------------------------------------------------------
    -- 2. REPAIR PROFILES TABLE
    ----------------------------------------------------------------
    
    -- Ensure profiles exists (it should, but safety first)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        
        -- Column: family_name
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'family_name') THEN
            ALTER TABLE public.profiles ADD COLUMN family_name text;
            RAISE NOTICE 'Added family_name to profiles';
        END IF;

        -- Column: subscription_tier
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'subscription_tier') THEN
            ALTER TABLE public.profiles ADD COLUMN subscription_tier text DEFAULT 'FREE';
            RAISE NOTICE 'Added subscription_tier to profiles';
        END IF;

        -- Column: is_onboarded
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_onboarded') THEN
            ALTER TABLE public.profiles ADD COLUMN is_onboarded boolean DEFAULT false;
            RAISE NOTICE 'Added is_onboarded to profiles';
        END IF;

    END IF;

END $$;
