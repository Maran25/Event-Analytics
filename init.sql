-- Users table to store registered users (via Google Auth)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Apps table to register apps with API keys
CREATE TABLE apps (
  id VARCHAR(64) PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  api_key VARCHAR(64) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events table to store collected events
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  app_id VARCHAR(64) REFERENCES apps(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  actor_id VARCHAR(64) NOT NULL,
  event VARCHAR(255) NOT NULL,
  url TEXT,
  referrer TEXT,
  device JSONB,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- -- Tokens table for JWT blacklist (for logout)
-- CREATE TABLE tokens (
--   id SERIAL PRIMARY KEY,
--   token VARCHAR(512) UNIQUE NOT NULL,
--   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
--   created_at TIMESTAMP DEFAULT NOW(),
--   expires_at TIMESTAMP NOT NULL
-- );

-- Indexes for better query performance
CREATE INDEX idx_events_app_id ON events(app_id);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_event ON events(event);
