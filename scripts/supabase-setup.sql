-- Ocean Mining Game - Supabase Database Setup
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address text UNIQUE NOT NULL,
  username text NOT NULL,
  preferences jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  last_login timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create player_progress table
CREATE TABLE IF NOT EXISTS player_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address text UNIQUE NOT NULL,
  current_tier integer DEFAULT 1,
  selected_submarine integer DEFAULT 1,
  purchased_submarines integer[] DEFAULT '{1}'::integer[],
  resources jsonb DEFAULT '{"nickel": 150, "cobalt": 75, "copper": 75, "manganese": 40}'::jsonb,
  balance integer DEFAULT 500,
  player_stats jsonb DEFAULT '{"health": 100, "energy": 100, "tier": 1, "capacity": {"nickel": 0, "cobalt": 0, "copper": 0, "manganese": 0}, "maxCapacity": {"nickel": 100, "cobalt": 50, "copper": 50, "manganese": 25}, "depth": 1000, "speed": 1, "miningRate": 1}'::jsonb,
  position jsonb DEFAULT '{"x": 500, "y": 500, "rotation": 0}'::jsonb,
  total_resources_mined integer DEFAULT 0,
  total_tokens_earned integer DEFAULT 0,
  games_played integer DEFAULT 0,
  total_play_time integer DEFAULT 0,
  achievements jsonb[] DEFAULT '{}'::jsonb[],
  upgrade_history jsonb[] DEFAULT '{}'::jsonb[],
  version text DEFAULT '1.0',
  last_saved timestamp with time zone DEFAULT now()
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id text UNIQUE NOT NULL,
  wallet_address text NOT NULL,
  is_active boolean DEFAULT true,
  start_time timestamp with time zone DEFAULT now(),
  end_time timestamp with time zone,
  session_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category text NOT NULL,
  period text NOT NULL,
  rankings jsonb DEFAULT '[]'::jsonb,
  last_updated timestamp with time zone DEFAULT now(),
  UNIQUE(category, period)
);

-- Create game_events table
CREATE TABLE IF NOT EXISTS game_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  timestamp timestamp with time zone DEFAULT now()
);

-- Create health_check table
CREATE TABLE IF NOT EXISTS health_check (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  status text NOT NULL DEFAULT 'ok',
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_wallet_address_idx ON users(wallet_address);
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);
CREATE INDEX IF NOT EXISTS player_progress_wallet_address_idx ON player_progress(wallet_address);
CREATE INDEX IF NOT EXISTS player_progress_current_tier_idx ON player_progress(current_tier);
CREATE INDEX IF NOT EXISTS player_progress_total_resources_idx ON player_progress(total_resources_mined);
CREATE INDEX IF NOT EXISTS game_sessions_wallet_address_idx ON game_sessions(wallet_address);
CREATE INDEX IF NOT EXISTS game_sessions_is_active_idx ON game_sessions(is_active);
CREATE INDEX IF NOT EXISTS game_sessions_session_id_idx ON game_sessions(session_id);
CREATE INDEX IF NOT EXISTS game_events_wallet_address_idx ON game_events(wallet_address);
CREATE INDEX IF NOT EXISTS game_events_timestamp_idx ON game_events(timestamp);
CREATE INDEX IF NOT EXISTS game_events_event_type_idx ON game_events(event_type);
CREATE INDEX IF NOT EXISTS leaderboards_category_period_idx ON leaderboards(category, period);

-- Insert initial health check record
INSERT INTO health_check (status) VALUES ('ok') ON CONFLICT DO NOTHING;

-- Insert initial leaderboard categories
INSERT INTO leaderboards (category, period, rankings) VALUES 
  ('total_resources', 'all_time', '[]'::jsonb),
  ('total_tokens', 'all_time', '[]'::jsonb),
  ('games_played', 'weekly', '[]'::jsonb),
  ('total_resources', 'weekly', '[]'::jsonb),
  ('total_tokens', 'weekly', '[]'::jsonb),
  ('current_tier', 'all_time', '[]'::jsonb)
ON CONFLICT (category, period) DO NOTHING;

-- Add Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (true); -- Allow reading for now, can be restricted later

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- Create policies for player_progress table
CREATE POLICY "Players can view their own progress" ON player_progress
  FOR SELECT USING (true);

CREATE POLICY "Players can insert their own progress" ON player_progress
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Players can update their own progress" ON player_progress
  FOR UPDATE USING (true);

-- Create policies for game_sessions table
CREATE POLICY "Players can view their own sessions" ON game_sessions
  FOR SELECT USING (true);

CREATE POLICY "Players can insert their own sessions" ON game_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Players can update their own sessions" ON game_sessions
  FOR UPDATE USING (true);

-- Create policies for game_events table
CREATE POLICY "Players can view their own events" ON game_events
  FOR SELECT USING (true);

CREATE POLICY "Players can insert their own events" ON game_events
  FOR INSERT WITH CHECK (true);

-- Leaderboards and health_check are public read
CREATE POLICY "Anyone can view leaderboards" ON leaderboards
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view health check" ON health_check
  FOR SELECT USING (true);
