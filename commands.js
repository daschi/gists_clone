const path = require('path')
const fs = require('fs-extra')
const rootDir = path.resolve(__dirname)
const knex = require('knex')
const queries = require('./queries')

const commands = {
  async resetDb({client}) {
    const sql = (await fs.readFile(rootDir + '/schema.sql')).toString()
    await client.query(sql)
  },
  async createUser({ client, email, password, username }) {
    // hash the password
    const password_hash = password
    const result = await client.query(
      `
        INSERT INTO users (email, password_hash, username)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [email, password_hash, username]
    ).catch((error) => {
      if(error.message.includes('duplicate key')) {
        throw new Error('User with that email address already exists')
      } else {
        throw error
      }
    })
    return result.rows[0]
  },
  async createGist({ client, user_id, description, secret }) {
    const result = await client.query(
      `
        INSERT INTO gists (user_id, description, secret)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [user_id, description, secret]
    )
    return result.rows[0]
  },
  async createRevision({ client, gist_id, previous_id }) {
    const result = await client.query(
      `
        INSERT INTO revisions (gist_id, previous_id)
        VALUES ($1, $2)
        RETURNING *
      `,
      [gist_id, previous_id]
    )
    return result.rows[0]
  },
  async createFile({ client, filename, content, diff }) {
    const result = await client.query(
      `
        INSERT INTO files (filename, content, diff)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [filename, content, diff]
    )
    return result.rows[0]
  },
  async createRevisionFile({ client, revision_id, file_id }) {
    const result = await client.query(
      `
        INSERT INTO revision_files (revision_id, file_id)
        VALUES ($1, $2)
        RETURNING *
      `,
      [revision_id, file_id]
    )
    return result.rows[0]
  },
  async starGist({ client, gist_id, user_id }) {
    const result = await client.query(
      `
        INSERT INTO stars (gist_id, user_id)
        VALUES ($1, $2)
        RETURNING *
      `,
      [gist_id, user_id]
    )
    return result.rows[0]
  },
  async createSubscription({ client, gist_id, user_id }) {
    const result = await client.query(
      `
        INSERT INTO subscriptions (gist_id, user_id)
        VALUES ($1, $2)
        RETURNING *
      `,
      [gist_id, user_id]
    )
    return result.rows[0]
  },
  async createComment({ client, gist_id, user_id, content }) {
    const result = await client.query(
      `
        INSERT INTO comments (gist_id, user_id, content)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [gist_id, user_id, content]
    )
    return result.rows[0]
  },
  async updateComment({ client, comment_id, content }) {
    const result = await client.query(
      `
        UPDATE comments
        SET content = $2, updated_at = now()
        WHERE comment_id = $1
        RETURNING *
      `,
      [comment_id, content]
    )
    return result.rows[0]
  },
  async deleteComment({ client, comment_id }) {
    await client.query(
      `
        UPDATE comments
        SET deleted_at = now()
        WHERE comment_id = $1
        AND deleted_at IS NULL
      `,
      [comment_id]
    )
  },
  async deleteGist({ client, gist_id }) {
    await client.query(
      `
        UPDATE gists
        SET deleted_at = now()
        WHERE gist_id = $1
        AND deleted_at IS NULL
      `,
      [gist_id]
    )
  },
}

module.exports = commands;
