const queries = {
  // get user
  // GET /users/:user_id
  async getUser({ client, user_id }) {
    const result = await client.query(
      `
        SELECT user_id, email, username, avatar_url
        FROM users
        WHERE user_id = $1
      `,
      [user_id]
    )
    return result.rows[0]
  },
  // GET /users/:user_id/gists
  async getGistsByUserId({ client, user_id, page }) {
    const pageSize = 10
    const offest = pageSize * (page - 1)
    const result = await client.query(
      `
        SELECT gist_id, user_id, name, description, secret
        FROM gists
        WHERE user_id = $1
        LIMIT $2
        OFFSET $3
      `,
      [user_id, pageSize, offset]
    )
    return result.rows
  },
  // get user's gist (and also call getCurrentGistFiles?)
  // GET /gists/:gist_id
  async getGist({ client, gist_id }) {
    const result = await client.query(
      `
        SELECT gist_id, user_id, name, description, secret, (
          SELECT revision_id
          FROM revisions
          WHERE gist_id = $1
          ORDER BY created_at DESC
          LIMIT 1
        ) as latest_revision_id
        FROM gists
        WHERE gist_id = $1
      `,
      [gist_id]
    )
    return result.rows[0]
  },
  // get gist's current files
  // not a public endpoint?
  async getCurrentGistFiles({ client, gist_id }) {
    // Get the gist's most recent revision's files
    // For displaying in the code section
    const result = await client.query(
      `
        SELECT f.file_id,
               f.filename,
               f.content
        FROM files f

        JOIN revision_files rf
        ON rf.file_id = f.file_id

        JOIN revisions r
        ON r.revision_id = rf.revision_id

        WHERE r.gist_id = $1
        AND r.revision_id = (
          SELECT revision_id
          FROM revisions
          WHERE gist_id = $1
          ORDER BY created_at DESC
          LIMIT 1
        )
      `,
      [gist_id]
    )
    return result.rows
  },
  // Get all a gist's revisions paginated
  // GET /gists/:gist_id/revisions ?
  async getRevisions({ client, gist_id, page }) {
    const pageSize = 10
    const offest = pageSize * (page - 1)
    const result = await client.query(
      `
        SELECT revision_id, gist_id, previous_id, created_at
        FROM revisions r
        WHERE gist_id = $1
        ORDER BY created_at DESC
        LIMIT $2
        OFFSET $3
      `,
      [gist_id, pageSize, offset]
    )
    return result.rows
  },
  // Get all files for a gist's revisions
  // add pagination?
  async getFilesForRevisions({ client, revision_ids }) {
    const result = await client.query(
      `
        SELECT r.revision_id,
               f.file_id,
               f.filename,
               f.content,
               f.diff
        FROM files f

        JOIN revision_files rf
        ON rf.file_id = f.file_id

        JOIN revisions r
        ON r.revision_id = rf.revision_id

        WHERE r.revision_id in ($1)
      `,
      [revision_ids]
    )
    return result.rows
  },
  // Get a gist's comments
  async getComments({ client, gist_id }) {
    const result = await client.query(
      `
        SELECT comment_id, gist_id, user_id, content, created_at, updated_at
        FROM comments c
        WHERE c.gist_id = $1
      `,
      [gist_id]
    )
    return result.rows
  },
  // Get a gist's number of stars
  // not public query, used for getGist
  async getStarsCount({ client, gist_id }) {
    const result = await client.query(
      `
        SELECT count(*)
        FROM stars s
        WHERE s.gist_id = $1
      `,
      [gist_id]
    )
    return result.rows
  },
  // Get a gist's subscriptions
  // not public query, used for getGist and display
  async getSubscriptions({ client, gist_id }) {
    const result = await client.query(
      `
        SELECT user_id, gist_id
        FROM subscriptions s
        WHERE s.gist_id = $1
      `,
      [gist_id]
    )
    return result.rows
  },
}

module.exports = queries;
