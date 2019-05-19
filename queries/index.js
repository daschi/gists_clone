const gists = require('./gists');
const files = require('./files');
const users = require('./users');

const queries = {
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

module.exports = {
  ...queries,
  ...gists,
  ...files,
  ...users
}
