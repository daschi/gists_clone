CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
  user_id       uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  email         text UNIQUE NOT NULL,
  password_hash text,
  username      text UNIQUE NOT NULL,
  avatar_url    text
);

DROP TABLE IF EXISTS gists CASCADE;
CREATE TABLE IF NOT EXISTS gists (
  gist_id       uuid      PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  user_id       uuid      REFERENCES users (user_id),
  name          text,
  description   text,
  private       boolean   DEFAULT FALSE
);

DROP TABLE IF EXISTS revisions CASCADE;
CREATE TABLE IF NOT EXISTS revisions (
  revision_id   uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  gist_id       uuid REFERENCES gists (gist_id),
  previous_id   uuid REFERENCES revisions (revision_id),
  created_at    timestamp NOT NULL DEFAULT now()
);
CREATE INDEX revisions_by_created_at ON revisions USING btree (created_at DESC);
CREATE UNIQUE INDEX first_revision ON revisions USING btree (revision_id) WHERE (previous_id IS NULL);
-- Each gist's revision can only have one parent
CREATE UNIQUE INDEX next_revisions ON revisions USING btree (gist_id, previous_id);

DROP TABLE IF EXISTS files CASCADE;
CREATE TABLE IF NOT EXISTS files (
  file_id       uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  filename      text NOT NULL,
  content       text NOT NULL,
  diff          text
);

DROP TABLE IF EXISTS revision_files CASCADE;
CREATE TABLE IF NOT EXISTS revision_files (
  revision_id   uuid REFERENCES revisions (revision_id),
  file_id       uuid REFERENCES files (file_id),
  PRIMARY KEY (revision_id, file_id)
);

DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE IF NOT EXISTS comments (
  comment_id    uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  gist_id       uuid REFERENCES gists (gist_id),
  user_id       uuid REFERENCES users (user_id),
  content       text NOT NULL,
  created_at    timestamp NOT NULL DEFAULT now(),
  updated_at    timestamp NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS subscriptions CASCADE;
CREATE TABLE IF NOT EXISTS subscriptions (
  gist_id       uuid REFERENCES gists (gist_id),
  user_id       uuid REFERENCES users (user_id),
  PRIMARY KEY (gist_id, user_id)
);

DROP TABLE IF EXISTS stars CASCADE;
CREATE TABLE IF NOT EXISTS stars (
  gist_id       uuid REFERENCES gists (gist_id),
  user_id       uuid REFERENCES users (user_id),
  PRIMARY KEY (gist_id, user_id)
);
