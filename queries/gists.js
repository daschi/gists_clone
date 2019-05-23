const {offset} = require('./helpers')

const queries = {
  // get /gists
  async getGists({ client, page, pageSize }) {
    console.log('getGists', page, pageSize);
    const result = await client.query(
      `
        SELECT
          g.gist_id,
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
  // get user's gist
  // GET /gists/:gist_id
  async getGist({ client, gist_id }) {
    console.log('getGist', gist_id);
    const result = await client.query(
      `
        SELECT
          g.gist_id,
          g.user_id,
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


}

module.exports = queries;
