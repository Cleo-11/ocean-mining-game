// This script creates the necessary tables in Supabase
// You can run this directly in the Supabase SQL Editor or via Node.js

import { createClient } from "@supabase/supabase-js"

async function setupSupabase() {
  console.log("Setting up Supabase tables...")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing environment variables:")
    console.error("- NEXT_PUBLIC_SUPABASE_URL")
    console.error("- SUPABASE_SERVICE_KEY")
    console.error("\nPlease add these to your .env.local file or Vercel environment variables")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log("🔧 Creating tables...")

    // Execute the SQL directly
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
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
          player_stats jsonb DEFAULT '{"health": 100, "energy": 100, "tier": 1}'::jsonb,
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
        CREATE INDEX IF NOT EXISTS player_progress_wallet_address_idx ON player_progress(wallet_address);
        CREATE INDEX IF NOT EXISTS player_progress_current_tier_idx ON player_progress(current_tier);
        CREATE INDEX IF NOT EXISTS game_sessions_wallet_address_idx ON game_sessions(wallet_address);
        CREATE INDEX IF NOT EXISTS game_sessions_is_active_idx ON game_sessions(is_active);
        CREATE INDEX IF NOT EXISTS game_events_wallet_address_idx ON game_events(wallet_address);
        CREATE INDEX IF NOT EXISTS game_events_timestamp_idx ON game_events(timestamp);
        CREATE INDEX IF NOT EXISTS leaderboards_category_period_idx ON leaderboards(category, period);

        -- Insert initial health check record
        INSERT INTO health_check (status) VALUES ('ok') ON CONFLICT DO NOTHING;

        -- Insert sample leaderboard data
        INSERT INTO leaderboards (category, period, rankings) VALUES 
          ('total_resources', 'all_time', '[]'::jsonb),
          ('total_tokens', 'all_time', '[]'::jsonb),
          ('games_played', 'weekly', '[]'::jsonb)
        ON CONFLICT (category, period) DO NOTHING;
      `,
    })

    if (error) {
      throw error
    }

    console.log("✅ All tables created successfully!")
    console.log("✅ Indexes created for optimal performance!")
    console.log("✅ Sample data inserted!")
    console.log("\n🎮 Your Ocean Mining game database is ready!")
  } catch (error) {
    console.error("❌ Error setting up Supabase:", error)
    process.exit(1)
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupSupabase()
}

export default setupSupabase
