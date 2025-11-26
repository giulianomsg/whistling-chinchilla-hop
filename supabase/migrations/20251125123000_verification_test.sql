-- Verification Script
-- Run this to test the gamification logic

DO $$
DECLARE
    test_user_id uuid;
    test_workout_id uuid;
    test_client_workout_id uuid;
    manual_xp integer;
    verified_xp integer;
    new_level integer;
BEGIN
    -- 0. Cleanup previous test runs (to avoid unique constraint violations)
    DELETE FROM public.workout_sessions WHERE client_id IN (SELECT id FROM auth.users WHERE email = 'cliente1@capifit.com');
    DELETE FROM public.client_workouts WHERE client_id IN (SELECT id FROM auth.users WHERE email = 'cliente1@capifit.com');
    DELETE FROM public.workouts WHERE name = 'Test Verification Workout';
    DELETE FROM public.profiles WHERE email = 'cliente1@capifit.com';
    DELETE FROM auth.users WHERE email = 'cliente1@capifit.com';

    -- 1. Create a test user in auth.users (required for FK constraint)
    INSERT INTO auth.users (id, aud, role, email, created_at, updated_at)
    VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'cliente1@capifit.com', now(), now())
    RETURNING id INTO test_user_id;

    RAISE NOTICE 'Test Auth User Created: %', test_user_id;

    -- 2. Create/Update profile linked to the new auth user
    INSERT INTO public.profiles (id, email, role, current_xp, level)
    VALUES (test_user_id, 'cliente1@capifit.com', 'client', 0, 1)
    ON CONFLICT (id) DO UPDATE
    SET role = 'client',
        current_xp = 0,
        level = 1;

    -- 3. Create Dummy Workout (Required for FK)
    INSERT INTO public.workouts (id, name, description, professional_id)
    VALUES (gen_random_uuid(), 'Test Verification Workout', 'A dummy workout for testing', test_user_id)
    RETURNING id INTO test_workout_id;

    -- 4. Create Dummy Client Workout (Required for FK)
    INSERT INTO public.client_workouts (id, client_id, workout_id, status, professional_id, start_date)
    VALUES (gen_random_uuid(), test_user_id, test_workout_id, 'active', test_user_id, now())
    RETURNING id INTO test_client_workout_id;

    -- 5. Insert Manual Workout (Walking, 30 mins)
    -- Expected CP: (30 * 0.5) + (150/10) + (2000/100) = 15 + 15 + 20 = 50
    -- Trust Score: 0.5 -> Final XP: 25
    INSERT INTO public.workout_sessions (
        client_id, professional_id, workout_id, client_workout_id, 
        started_at, ended_at, duration_seconds, status,
        source, trust_score, activity_type, calories_burned, distance_meters
    ) VALUES (
        test_user_id, test_user_id, test_workout_id, test_client_workout_id,
        now() - interval '30 minutes', now(), 1800, 'completed',
        'manual', 0.5, 'walk', 150, 2000
    );

    SELECT final_xp INTO manual_xp FROM public.workout_sessions WHERE client_id = test_user_id AND source = 'manual';
    RAISE NOTICE 'Manual Workout XP: % (Expected ~25)', manual_xp;

    -- 6. Insert Verified Workout (Running, 60 mins, Strava)
    -- Expected CP: (60 * 1.4) + (600/10) + (10000/100) = 84 + 60 + 100 = 244
    -- Trust Score: 1.0 -> Final XP: 244
    INSERT INTO public.workout_sessions (
        client_id, professional_id, workout_id, client_workout_id, 
        started_at, ended_at, duration_seconds, status,
        source, trust_score, activity_type, calories_burned, distance_meters
    ) VALUES (
        test_user_id, test_user_id, test_workout_id, test_client_workout_id,
        now() - interval '60 minutes', now(), 3600, 'completed',
        'strava', 1.0, 'run', 600, 10000
    );

    SELECT final_xp INTO verified_xp FROM public.workout_sessions WHERE client_id = test_user_id AND source = 'strava';
    RAISE NOTICE 'Verified Workout XP: % (Expected ~244)', verified_xp;

    -- 7. Check Level Update
    -- Total XP = 25 + 244 = 269
    -- Level = sqrt(269/100) = sqrt(2.69) = 1
    -- Wait, let's add more XP to level up
    
    -- Add a huge workout
    INSERT INTO public.workout_sessions (
        client_id, professional_id, workout_id, client_workout_id, 
        started_at, ended_at, duration_seconds, status,
        source, trust_score, activity_type, calories_burned, distance_meters
    ) VALUES (
        test_user_id, test_user_id, test_workout_id, test_client_workout_id,
        now() - interval '120 minutes', now(), 7200, 'completed',
        'strava', 1.0, 'run', 1200, 20000
    );
    -- CP: (120*1.4) + 120 + 200 = 168 + 120 + 200 = 488
    -- Total XP approx 269 + 488 = 757
    -- Level = sqrt(7.57) = 2

    SELECT level INTO new_level FROM public.profiles WHERE id = test_user_id;
    RAISE NOTICE 'New Level: % (Expected > 1)', new_level;

    -- Clean up (Optional, commented out to inspect results)
    -- DELETE FROM public.profiles WHERE id = test_user_id;
END $$;
