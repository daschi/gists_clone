CREATE EXTENSION IF NOT EXISTS uuid-ossp;

CREATE TABLE IF NOT EXISTS users (
  user_id       uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  email         text UNIQUE,
  password_hash text,
  username      text,
  avatar_url    text
);

CREATE TABLE IF NOT EXISTS versions (
  verion_id     text PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  previous_id   text,
  created_at    timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS files (
  file_id       text PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  gist_id       text REFERENCES gists (uuid),
  previous_id   text,
  filename      text NOT NULL,
  content       text NOT NULL,
  diff          text
);

CREATE TABLE IF NOT EXISTS version_files (
  version_id text REFERENCES versions (version_id),
  file_id   text REFERENCES files (file_id),
  PRIMARY KEY (version_id, file_id),
);

CREATE TABLE IF NOT EXISTS gists (
  gist_id     uuid      PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  user_id     text      REFERENCES users (user_id)
  head        text      REFERENCES versions (version_id),
  name        text,
  description text,
  private     boolean
);

CREATE TABLE IF NOT EXISTS comments (
  comment_id text PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  gist_id text REFERENCES gists (gist_id),
  user_id text REFERENCES users (user_id),
  content text NOT NULL,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  gist_id text REFERENCES gists (uuid),
  user_id text REFERENCES users (uuid),
  PRIMARY KEY (gist_id, user_id)
);

CREATE TABLE IF NOT EXISTS stars (
  gist_id text REFERENCES gists (uuid),
  user_id text REFERENCES users (uuid),
  PRIMARY KEY (gist_id, user_id)
);
