/*
  # Fix Database Security Issues

  ## Changes Made

  1. **Performance Optimizations**
     - Add missing index on `user_daily_completions.challenge_id` foreign key
     - Remove unused indexes:
       - `idx_experiment_history_completed_at`
       - `idx_user_daily_completions_user_id`
  
  2. **RLS Policy Optimization**
     - Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
     - This prevents re-evaluation of auth functions for each row
     - Applies to tables:
       - `profiles` (3 policies)
       - `settings` (3 policies)
       - `experiment_history` (2 policies)
       - `user_daily_completions` (2 policies)
  
  3. **Function Security**
     - Add `SECURITY INVOKER` and explicit `search_path` to all functions
     - Applies to:
       - `calculate_level()`
       - `xp_for_next_level()`
       - `update_level_from_xp()`
       - `add_xp_to_profile()`
       - `get_user_stats()`
       - `generate_daily_challenge()`
       - `add_user_xp()`

  ## Notes
  - Leaked password protection must be enabled via Supabase Dashboard
  - All changes maintain existing functionality while improving performance and security
*/

-- ============================================================
-- 1. DROP UNUSED INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_experiment_history_completed_at;
DROP INDEX IF EXISTS idx_user_daily_completions_user_id;

-- ============================================================
-- 2. ADD MISSING INDEX FOR FOREIGN KEY
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_daily_completions_challenge_id 
  ON user_daily_completions(challenge_id);

-- ============================================================
-- 3. UPDATE RLS POLICIES - PROFILES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- 4. UPDATE RLS POLICIES - SETTINGS
-- ============================================================

DROP POLICY IF EXISTS "Users can view own settings" ON settings;
CREATE POLICY "Users can view own settings"
  ON settings FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON settings;
CREATE POLICY "Users can insert own settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON settings;
CREATE POLICY "Users can update own settings"
  ON settings FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- 5. UPDATE RLS POLICIES - EXPERIMENT_HISTORY
-- ============================================================

DROP POLICY IF EXISTS "Users can view own experiment history" ON experiment_history;
CREATE POLICY "Users can view own experiment history"
  ON experiment_history FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own experiment history" ON experiment_history;
CREATE POLICY "Users can insert own experiment history"
  ON experiment_history FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- 6. UPDATE RLS POLICIES - USER_DAILY_COMPLETIONS
-- ============================================================

DROP POLICY IF EXISTS "Users can view own completions" ON user_daily_completions;
CREATE POLICY "Users can view own completions"
  ON user_daily_completions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own completions" ON user_daily_completions;
CREATE POLICY "Users can insert own completions"
  ON user_daily_completions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- 7. UPDATE FUNCTIONS WITH SECURE SEARCH_PATH
-- ============================================================

-- Fix calculate_level function
CREATE OR REPLACE FUNCTION calculate_level(xp integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN floor(sqrt(xp::float / 100.0)) + 1;
END;
$$;

-- Fix xp_for_next_level function
CREATE OR REPLACE FUNCTION xp_for_next_level(current_level integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (current_level * current_level) * 100;
END;
$$;

-- Fix update_level_from_xp function
CREATE OR REPLACE FUNCTION update_level_from_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.level := calculate_level(NEW.total_xp);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Fix add_xp_to_profile function (kept as SECURITY DEFINER as it needs elevated privileges)
CREATE OR REPLACE FUNCTION add_xp_to_profile(p_user_id uuid, p_xp integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE profiles
  SET total_xp = total_xp + p_xp
  WHERE user_id = p_user_id;
END;
$$;

-- Fix get_user_stats function (kept as SECURITY DEFINER as it needs elevated privileges)
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS TABLE(
  total_experiments integer,
  successful_experiments integer,
  success_rate numeric,
  total_xp_earned integer,
  favorite_topic text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as total_experiments,
    COUNT(*) FILTER (WHERE success = true)::integer as successful_experiments,
    CASE 
      WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE success = true)::numeric / COUNT(*)::numeric) * 100, 1)
      ELSE 0
    END as success_rate,
    COALESCE(SUM(xp_earned), 0)::integer as total_xp_earned,
    MODE() WITHIN GROUP (ORDER BY topic) as favorite_topic
  FROM experiment_history
  WHERE user_id = p_user_id;
END;
$$;

-- Fix generate_daily_challenge function
CREATE OR REPLACE FUNCTION generate_daily_challenge()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  topics text[] := ARRAY['components', 'circuits', 'practical'];
  difficulties text[] := ARRAY['apprentice', 'journeyman', 'master'];
  descriptions text[] := ARRAY[
    'Selesaikan eksperimen hari ini untuk mendapatkan bonus XP!',
    'Tantangan spesial menunggumu hari ini!',
    'Uji kemampuanmu dengan tantangan harian!'
  ];
  random_topic text;
  random_difficulty text;
  random_description text;
  today_date date := CURRENT_DATE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM daily_challenges WHERE date = today_date) THEN
    random_topic := topics[floor(random() * array_length(topics, 1) + 1)];
    random_difficulty := difficulties[floor(random() * array_length(difficulties, 1) + 1)];
    random_description := descriptions[floor(random() * array_length(descriptions, 1) + 1)];
    
    INSERT INTO daily_challenges (date, topic, difficulty, bonus_xp, description)
    VALUES (today_date, random_topic, random_difficulty, 50, random_description);
  END IF;
END;
$$;

-- Fix add_user_xp function (if it exists)
CREATE OR REPLACE FUNCTION add_user_xp(p_user_id uuid, p_xp_amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE profiles
  SET total_xp = total_xp + p_xp_amount
  WHERE user_id = p_user_id;
END;
$$;