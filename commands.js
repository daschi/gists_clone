const path = require('path')
const fs = require('fs-extra')
const rootDir = path.resolve(__dirname)
const knex = require('knex')

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
  async createGist({ client, user_id, name, description, secret }) {
    const result = await client.query(
      `
        INSERT INTO gists (user_id, name, description, secret)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [user_id, name, description, secret]
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
  // WIP UPDATE GIST COMMAND
  async updateGist({client, gist_id, name, description, secret, files}) {
    return await client.tx('updateGist', async client => {
      // const gist = { gist_id, revision_id, files }
      // Check first if gist attrs changed before updating them
      const gist = getGist({client, gist_id})
      // check if this works when name/desc/secret are undefined
      if(name || description || typeof secret === 'boolean') {
        await client.query(
          knex('gists')
            .update({name, description, secret})
            .where({gist_id})
            .toString()
        )
      }

      const nextRevision = await this.createRevision({
        client,
        gist_id: gist.gist_id,
        previous_id: gist.latest_revision_id,
      })
      for (const file of files) {
        const newFile = await this.createFile({
          client,
          filename: file.filename,
          content: file.content,
          diff: file.diff
        })
        await this.createRevisionFile({
          client,
          revision_id: nextRevision.revision_id,
          file_id: newFile.file_id,
        })
      }
    })
  }
}

module.exports = commands;
