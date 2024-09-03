CREATE TABLE IF NOT EXISTS github_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  bio VARCHAR(255),
  location VARCHAR(255),
  company VARCHAR(255),
  followers INTEGER,
  following INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_languages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES github_users(id) ON DELETE CASCADE,
  language VARCHAR(255) NOT NULL,
  UNIQUE (user_id, language)
);
