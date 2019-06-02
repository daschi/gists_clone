const {offset} = require('./helpers')

const queries = {
  // get users
  // GET /users?user_ids=[]
  async getUsers({ client, user_ids }) {
    console.log("getUsers", user_ids);
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
    console.log("getUser", user_ids);
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
  async getGistsByUserId({ client, user_id, page, limit }) {
    console.log('getGistsByUserId', user_id);
    const result = await client.query(
      `
        SELECT gist_id, user_id, name, description, secret
        FROM gists
        WHERE user_id = $1
        LIMIT $2
        OFFSET $3
      `,
      [user_id, limit, offset(page)]
    )
    return result.rows
  },
}

module.exports = queries
