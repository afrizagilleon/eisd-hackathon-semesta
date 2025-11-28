/*
  # Skema Database ElectroQuest - Riwayat Eksperimen dan Tantangan Harian

  1. Tabel Baru
    - `experiment_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, referensi ke auth.users)
      - `topic` (text) - Topik pembelajaran (components, circuits, practical)
      - `difficulty` (text) - Tingkat kesulitan (apprentice, journeyman, master)
      - `success` (boolean) - Berhasil atau tidak
      - `xp_earned` (integer) - XP yang didapat
      - `hints_used` (integer) - Jumlah hint yang digunakan
      - `time_taken` (integer) - Waktu yang dihabiskan (detik)
      - `experiment_data` (jsonb) - Data eksperimen lengkap
      - `completed_at` (timestamp)
    
    - `daily_challenges`
      - `id` (uuid, primary key)
      - `date` (date) - Tanggal tantangan
      - `topic` (text) - Topik tantangan
      - `difficulty` (text) - Tingkat kesulitan
      - `bonus_xp` (integer) - Bonus XP untuk tantangan
      - `description` (text) - Deskripsi tantangan
      - `created_at` (timestamp)
    
    - `user_daily_completions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, referensi ke auth.users)
      - `challenge_id` (uuid, referensi ke daily_challenges)
      - `completed_at` (timestamp)
      - `xp_earned` (integer)

  2. Keamanan
    - Enable RLS pada semua tabel
    - Policy untuk akses data pribadi
*/

-- Buat tabel experiment_history
CREATE TABLE IF NOT EXISTS experiment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic text NOT NULL,
  difficulty text NOT NULL,
  success boolean DEFAULT false NOT NULL,
  xp_earned integer DEFAULT 0 NOT NULL,
  hints_used integer DEFAULT 0 NOT NULL,
  time_taken integer DEFAULT 0 NOT NULL,
  experiment_data jsonb,
  completed_at timestamptz DEFAULT now() NOT NULL
);

-- Buat tabel daily_challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  topic text NOT NULL,
  difficulty text NOT NULL,
  bonus_xp integer DEFAULT 50 NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Buat tabel user_daily_completions
CREATE TABLE IF NOT EXISTS user_daily_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id uuid REFERENCES daily_challenges(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL,
  xp_earned integer DEFAULT 0 NOT NULL,
  UNIQUE(user_id, challenge_id)
);

-- Enable Row Level Security
ALTER TABLE experiment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_completions ENABLE ROW LEVEL SECURITY;

-- Policies untuk experiment_history
CREATE POLICY "Users can view own experiment history"
  ON experiment_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experiment history"
  ON experiment_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies untuk daily_challenges (semua user dapat melihat)
CREATE POLICY "Anyone can view daily challenges"
  ON daily_challenges FOR SELECT
  TO authenticated
  USING (true);

-- Policies untuk user_daily_completions
CREATE POLICY "Users can view own completions"
  ON user_daily_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON user_daily_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fungsi untuk menambah XP ke profil user
CREATE OR REPLACE FUNCTION add_xp_to_profile(p_user_id uuid, p_xp integer)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET total_xp = total_xp + p_xp
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fungsi untuk mendapatkan statistik user
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS TABLE(
  total_experiments integer,
  successful_experiments integer,
  success_rate numeric,
  total_xp_earned integer,
  favorite_topic text
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fungsi untuk generate tantangan harian
CREATE OR REPLACE FUNCTION generate_daily_challenge()
RETURNS void AS $$
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
  -- Cek apakah tantangan hari ini sudah ada
  IF NOT EXISTS (SELECT 1 FROM daily_challenges WHERE date = today_date) THEN
    -- Pilih random topic, difficulty, dan description
    random_topic := topics[floor(random() * array_length(topics, 1) + 1)];
    random_difficulty := difficulties[floor(random() * array_length(difficulties, 1) + 1)];
    random_description := descriptions[floor(random() * array_length(descriptions, 1) + 1)];
    
    -- Insert tantangan baru
    INSERT INTO daily_challenges (date, topic, difficulty, bonus_xp, description)
    VALUES (today_date, random_topic, random_difficulty, 50, random_description);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_experiment_history_user_id ON experiment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_experiment_history_completed_at ON experiment_history(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(date);
CREATE INDEX IF NOT EXISTS idx_user_daily_completions_user_id ON user_daily_completions(user_id);