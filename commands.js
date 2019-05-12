const path = require('path')
const fs = require('fs-extra')
const rootDir = path.resolve(__dirname)


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
  async createGist({ client, user_id, name, description, private }) {
    const result = await client.query(
      `
        INSERT INTO gists (user_id, name, description, private)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [user_id, name, description, private]
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
  async createFile({ client, gist_id, filename, content, diff }) {
    const result = await client.query(
      `
        INSERT INTO files (gist_id, filename, content, diff)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [gist_id, filename, content, diff]
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
}

module.exports = commands;
