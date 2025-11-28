/*
  # Skema Database ElectroQuest - Sistem Profil dan Pengaturan Pengguna

  1. Tabel Baru
    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, referensi ke auth.users)
      - `display_name` (text) - Nama tampilan pengguna
      - `avatar_url` (text) - URL avatar pengguna
      - `total_xp` (integer) - Total XP yang dikumpulkan
      - `level` (integer) - Level saat ini
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, referensi ke auth.users)
      - `music_enabled` (boolean) - Musik latar aktif/tidak
      - `effects_enabled` (boolean) - Efek suara aktif/tidak
      - `music_volume` (integer) - Volume musik (0-100)
      - `effects_volume` (integer) - Volume efek suara (0-100)
      - `updated_at` (timestamp)

  2. Keamanan
    - Enable RLS pada semua tabel
    - Policy untuk pengguna hanya dapat mengakses data mereka sendiri
*/

-- Buat tabel profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT 'Petualang Baru',
  avatar_url text,
  total_xp integer DEFAULT 0 NOT NULL,
  level integer DEFAULT 1 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Buat tabel settings
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  music_enabled boolean DEFAULT true NOT NULL,
  effects_enabled boolean DEFAULT true NOT NULL,
  music_volume integer DEFAULT 30 NOT NULL,
  effects_volume integer DEFAULT 50 NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies untuk profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies untuk settings
CREATE POLICY "Users can view own settings"
  ON settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fungsi untuk menghitung level dari XP
CREATE OR REPLACE FUNCTION calculate_level(xp integer)
RETURNS integer AS $$
BEGIN
  -- Formula: Level = floor(sqrt(XP / 100)) + 1
  -- Level 1: 0 XP, Level 2: 100 XP, Level 3: 400 XP, Level 4: 900 XP, dst
  RETURN floor(sqrt(xp::float / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fungsi untuk mendapatkan XP yang dibutuhkan untuk level berikutnya
CREATE OR REPLACE FUNCTION xp_for_next_level(current_level integer)
RETURNS integer AS $$
BEGIN
  -- XP yang dibutuhkan untuk mencapai level berikutnya
  RETURN (current_level * current_level) * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger untuk auto-update level ketika XP berubah
CREATE OR REPLACE FUNCTION update_level_from_xp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := calculate_level(NEW.total_xp);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_level
  BEFORE UPDATE OF total_xp ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_level_from_xp();

-- Trigger untuk auto-create profile dan settings ketika user baru mendaftar
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Petualang Baru'));
  
  INSERT INTO settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();