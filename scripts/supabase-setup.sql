-- Create player_sessions table
CREATE TABLE IF NOT EXISTS player_sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_address text UNIQUE NOT NULL,
  last_login timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  session_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id text PRIMARY KEY,
  player_count integer DEFAULT 0,
  max_players integer DEFAULT 20,
  session_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create player_stats table
CREATE TABLE IF NOT EXISTS player_stats (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_address text UNIQUE NOT NULL,
  submarine_tier integer DEFAULT 1,
  level integer DEFAULT 1,
  total_resources_mined integer DEFAULT 0,
  total_tokens_earned numeric DEFAULT 0,
  games_played integer DEFAULT 0,
  last_played timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_player_sessions_wallet ON player_sessions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_player_sessions_active ON player_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created ON game_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_player_stats_wallet ON player_stats(wallet_address);

-- Insert initial data
INSERT INTO player_sessions (wallet_address, session_data) 
VALUES ('0x0000000000000000000000000000000000000000', '{"demo": true}')
ON CONFLICT (wallet_address) DO NOTHING;
