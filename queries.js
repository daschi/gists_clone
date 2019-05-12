const queries = {
  // get user
  async getUser({ client, user_id }) {
    const result = await client.query(
      `
        SELECT user_id, email, username, avatar_url
        FROM users
        WHERE user_id = $1
        RETURNING *
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
        RETURNING *
      `,
      [gist_id]
    )
    return result.rows[0]
  },
  // get gist's current files
  async getGistFiles({ client, gist_id }) {
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

        WHERE f.gist_id = $1
        AND r.created_at = (
          SELECT MAX(created_at)
          FROM revisions
          WHERE gist_id = $1
        )

        RETURNING *
      `,
      [gist_id]
    )
    return result.rows
  }
}

module.exports = queries;
