-- Users and Authentication
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    total_games_played INTEGER DEFAULT 0,
    profile_picture_url VARCHAR(500)
);

-- Friendship system
CREATE TABLE friendships (
    id BIGSERIAL PRIMARY KEY,
    requester_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(requester_id, addressee_id)
);

-- Game modes configuration
CREATE TABLE game_modes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('single_player', 'multiplayer')),
    description TEXT,
    default_settings JSONB,
    is_active BOOLEAN DEFAULT true
);

-- Insert default game modes
INSERT INTO game_modes (name, type, description, default_settings) VALUES
('blitz', 'single_player', '2 minute time limit - best score wins', '{"time_limit": 120, "goal_type": "score"}'),
('40_lines', 'single_player', 'Clear 40 lines as fast as possible', '{"lines_to_clear": 40, "goal_type": "time"}'),
('custom_single', 'single_player', 'Custom single player settings', '{"customizable": true}'),
('quick_play', 'multiplayer', 'Always-on battle royale', '{"max_players": 99, "type": "battle_royale"}'),
('custom_multiplayer', 'multiplayer', 'Custom multiplayer room', '{"customizable": true}');

-- Multiplayer rooms
CREATE TABLE multiplayer_rooms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    host_id BIGINT NOT NULL REFERENCES users(id),
    game_mode_id INTEGER NOT NULL REFERENCES game_modes(id),
    settings JSONB NOT NULL,
    max_players INTEGER DEFAULT 4,
    current_players INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'finished')),
    is_private BOOLEAN DEFAULT false,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    finished_at TIMESTAMP
);

-- Room participants
CREATE TABLE room_participants (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES multiplayer_rooms(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    is_ready BOOLEAN DEFAULT false,
    UNIQUE(room_id, user_id)
);

-- Games (both single and multiplayer)
CREATE TABLE games (
    id BIGSERIAL PRIMARY KEY,
    game_mode_id INTEGER NOT NULL REFERENCES game_modes(id),
    room_id BIGINT REFERENCES multiplayer_rooms(id),
    settings JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'finished', 'abandoned')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game participants and results
CREATE TABLE game_participants (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    final_score INTEGER DEFAULT 0,
    lines_cleared INTEGER DEFAULT 0,
    level_reached INTEGER DEFAULT 1,
    placement INTEGER, -- for multiplayer ranking
    eliminated_at TIMESTAMP,
    finished_at TIMESTAMP,
    statistics JSONB, -- additional stats like tetrises, t-spins, etc.
    UNIQUE(game_id, user_id)
);

-- Event sourcing for replays
CREATE TABLE game_events (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    sequence_number INTEGER NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    timestamp_ms BIGINT NOT NULL, -- milliseconds since game start
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, user_id, sequence_number)
);

-- Index for efficient event replay
CREATE INDEX idx_game_events_replay ON game_events(game_id, user_id, sequence_number);

-- Leaderboards (materialized views for performance)
CREATE TABLE leaderboard_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    game_mode_id INTEGER NOT NULL REFERENCES game_modes(id),
    score_value BIGINT NOT NULL, -- score for blitz, time in ms for 40_lines, rating for quick_play
    score_type VARCHAR(20) NOT NULL CHECK (score_type IN ('score', 'time', 'rating')),
    game_id BIGINT REFERENCES games(id),
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    season VARCHAR(20), -- for seasonal leaderboards
    UNIQUE(user_id, game_mode_id, season)
);

-- Indexes for leaderboard queries
CREATE INDEX idx_leaderboard_mode_score ON leaderboard_entries(game_mode_id, score_value DESC, achieved_at);
CREATE INDEX idx_leaderboard_user ON leaderboard_entries(user_id, game_mode_id);

-- User statistics (aggregated data)
CREATE TABLE user_statistics (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    game_mode_id INTEGER NOT NULL REFERENCES game_modes(id),
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    total_score BIGINT DEFAULT 0,
    total_lines_cleared INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    best_time_ms INTEGER, -- for timed modes
    average_pps DECIMAL(5,2), -- pieces per second
    current_rating INTEGER DEFAULT 1000, -- for ranked modes
    peak_rating INTEGER DEFAULT 1000,
    last_played_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_mode_id)
);

-- Replay metadata for easy browsing
CREATE TABLE replays (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for authentication
CREATE TABLE user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_friendships_users ON friendships(requester_id, addressee_id, status);
CREATE INDEX idx_games_mode_status ON games(game_mode_id, status, finished_at);
CREATE INDEX idx_game_participants_user ON game_participants(user_id, game_id);
CREATE INDEX idx_multiplayer_rooms_status ON multiplayer_rooms(status, is_private, created_at);

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_replays_updated_at BEFORE UPDATE ON replays
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
