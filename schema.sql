-- PostgreSQL 16

CREATE TYPE friendship_status AS ENUM ('pending', 'accepted');
CREATE TYPE game_mode AS ENUM ('blitz', '40_lines', 'custom', 'quick_play');
CREATE TYPE game_status AS ENUM ('in_progress', 'finished', 'abandoned');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash CHAR(128) NOT NULL, -- crypto.scrypt(keylen = 64).toString("hex")
    salt CHAR(32) NOT NULL, -- crypto.randomBytes(16).toString("hex")
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_sessions (
    token CHAR(128) PRIMARY KEY, -- crypto.randomBytes(64).toString("hex")
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP NOT NULL
);

CREATE TABLE friendships (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status friendship_status DEFAULT 'pending',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(requester_id, addressee_id)
);

CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    mode game_mode NOT NULL,
    settings JSONB NOT NULL,
    status game_status DEFAULT 'in_progress',
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- event sourcing for replays and leaderboards
CREATE TABLE game_events (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(24) NOT NULL,
    event_data JSONB NOT NULL,
    ms_since_game_start INTEGER NOT NULL -- performance.now()
);

-- CREATE INDEX idx_users_username ON users(username);
-- CREATE INDEX idx_friendships_users ON friendships(requester_id, addressee_id);
-- CREATE INDEX idx_games_mode_status ON games(mode, status);
-- CREATE INDEX idx_game_events_replay ON game_events(game_id, user_id, ms_since_game_start);
-- CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
