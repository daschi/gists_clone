const queries = {
  // get user
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
  // get user's gist
  async getGist({ client, gist_id }) {
    const result = await client.query(
      `
        SELECT gist_id, user_id, name, description, private
        FROM gists
        WHERE gist_id = $1
      `,
      [gist_id]
    )
    return result.rows[0]
  },
  // get gist's current files
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
}

module.exports = queries;
