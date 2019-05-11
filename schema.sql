CREATE EXTENSION IF NOT EXISTS uuid-ossp;

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
  user_id       uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  email         text UNIQUE,
  password_hash text,
  username      text,
  avatar_url    text
);

DROP TABLE IF EXISTS gists CASCADE;
CREATE TABLE IF NOT EXISTS gists (
  gist_id       uuid      PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  user_id       text      REFERENCES users (user_id),
  -- head          text      REFERENCES revisions (revision_id),
  name          text,
  description   text,
  private       boolean   DEFAULT FALSE
);

DROP TABLE IF EXISTS revisions CASCADE;
CREATE TABLE IF NOT EXISTS revisions (
  revision_id   text PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  gist_id       text REFERENCES gists (gist_id),
  -- must reference the latest revision_id
  previous_id     text REFERENCES revisions (revision_id),
  created_at    timestamp NOT NULL DEFAULT now()

);

-- Unique on created_at would also solve this issue
--
-- CREATE UNIQUE INDEX first_revision ON revisions USING btree (id) WHERE (parent_id IS NULL);
--
--
-- CREATE UNIQUE INDEX subsequent_revision ON revisions USING btree (gist_id, parent_id);

DROP TABLE IF EXISTS files CASCADE;
CREATE TABLE IF NOT EXISTS files (
  file_id       text PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  gist_id       text REFERENCES gists (gist_id),
  -- Do we still need previous_id here if we know which revision this
  -- file is a part of, and then can diff the content between this
  -- file and the file from the previously created revision ?
  -- previous_id     text,
  filename      text NOT NULL,
  content       text NOT NULL,
  diff          text
);

DROP TABLE IF EXISTS revision_files CASCADE;
CREATE TABLE IF NOT EXISTS revision_files (
  revision_id   text REFERENCES revisions (revision_id),
  file_id       text REFERENCES files (file_id),
  PRIMARY KEY (revision_id, file_id),
);

DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE IF NOT EXISTS comments (
  comment_id    text PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  gist_id       text REFERENCES gists (gist_id),
  user_id       text REFERENCES users (user_id),
  content       text NOT NULL,
  created_at    timestamp NOT NULL DEFAULT now(),
  updated_at    timestamp NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS subscriptions CASCADE;
CREATE TABLE IF NOT EXISTS subscriptions (
  gist_id       text REFERENCES gists (uuid),
  user_id       text REFERENCES users (uuid),
  PRIMARY KEY (gist_id, user_id)
);

DROP TABLE IF EXISTS stars CASCADE;
CREATE TABLE IF NOT EXISTS stars (
  gist_id       text REFERENCES gists (uuid),
  user_id       text REFERENCES users (uuid),
  PRIMARY KEY (gist_id, user_id)
);
