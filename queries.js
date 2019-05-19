const offset = function (page, pageSize) {
  return pageSize * (page - 1)
}

const queries = {
  offset: offset,
  // get /gists
  async getGists({ client, page, pageSize }) {
    const result = await client.query(
      `
        SELECT
          g.gist_id,
          g.name,
          g.description,
          g.user_id,
          revision.revision_id as latest_revision_id,
          revision.created_at
        FROM gists g

        JOIN (
          SELECT DISTINCT ON (r.gist_id) revision_id, gist_id, created_at
          FROM revisions r
          ORDER BY r.gist_id, r.created_at DESC
        ) revision

        ON g.gist_id = revision.gist_id

        LIMIT $1
        OFFSET $2
      `,
      [pageSize, offset(page, pageSize)]
    )
    return result.rows
  },
  // get users
  // GET /users?user_ids=[]
  async getUsers({ client, user_ids }) {
    console.log({user_ids})
    const result = await client.query(
      `
        SELECT user_id, email, username, avatar_url
        FROM users
        WHERE user_id = ANY($1)
      `,
      [user_ids]
    )
    return result.rows
  },
  // get user
  // GET /users/:user_id
  async getUser({ client, user_ids }) {
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
  // get user's gist
  // GET /gists/:gist_id
  async getGist({ client, gist_id }) {
    const result = await client.query(
      `
        SELECT
          g.gist_id,
          g.user_id,
          g.name,
          g.description,
          g.secret,
          revision.revision_id as latest_revision_id,
          revision.created_at
        FROM gists g

        JOIN (
          SELECT DISTINCT ON (r.gist_id)
            r.revision_id,
            r.gist_id,
            r.created_at
          FROM revisions r
          ORDER BY r.gist_id, r.created_at DESC
        ) revision
        ON revision.gist_id = g.gist_id

        WHERE g.gist_id = $1
      `,
      [gist_id]
    )
    return result.rows[0]
  },
  // get gist's first file preview
  async getPreviewForGists({ client, revision_ids }) {
    const result = await client.query(
      `
        SELECT
          f.filename,
          f.content,
          f.diff,
          rf.revision_id
        FROM revision_files rf

        JOIN (
          SELECT
            revision_id,
            MIN(sequence) as sequence
          FROM revision_files
          WHERE revision_id = ANY($1)
          GROUP BY revision_id
        ) rf2
        ON rf.revision_id = rf2.revision_id
        AND rf.sequence = rf2.sequence

        JOIN files f
        ON f.file_id = rf.file_id
      `,
      [revision_ids]
    )
    return result.rows
  },
  // Used for GET /gists/:gist_id
  async getCurrentGistFiles({ client, revision_id, page, pageSize }) {
    const result = await client.query(
      `
        SELECT f.file_id,
               f.filename,
               f.content
        FROM files f

        JOIN revision_files rf
        ON rf.file_id = f.file_id

        WHERE revision_id = $1
        LIMIT $2
        OFFSET $3
      `,
      [revision_id, pageSize, offset(page, pageSize)]
    )
    return result.rows
  },
  // Get all a gist's revisions paginated
  // GET /gists/:gist_id/revisions ?
  async getRevisions({ client, gist_id, page }) {
    const result = await client.query(
      `
        SELECT revision_id, gist_id, previous_id, created_at
        FROM revisions r
        WHERE gist_id = $1
        ORDER BY created_at DESC
        LIMIT $2
        OFFSET $3
      `,
      [gist_id, pageSize, offset(page)]
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
  async getCurrentFilesCount({ client, revision_id }) {
    const result = await client.query(
      `
        SELECT count(*)
        FROM files f

        JOIN revision_files rf
        ON rf.file_id = f.file_id

        WHERE rf.revision_id = $1
      `,
      [revision_id]
    )
    return result.rows[0]
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
