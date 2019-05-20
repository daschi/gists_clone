const {offset} = require('./helpers')

const queries = {
  async getFile({ client, file_id }) {
    console.log('getFile', file_id);
    const result = await client.query(
      `
        SELECT
          f.file_id,
          f.filename,
          f.content,
          r.created_at,
          r.revision_id
        FROM files f

        JOIN revision_files rf
        ON rf.file_id = f.file_id

        JOIN revisions r
        ON r.revision_id = rf.revision_id

        WHERE f.file_id = $1
      `,
      [file_id]
    )
    return result.rows[0]
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
  // Get all files for a gist's revisions
  // add pagination?
  async getFilesForRevisions({ client, revision_ids }) {
    const result = await client.query(
      `
        SELECT rf.revision_id,
               f.file_id,
               f.filename,
               f.content,
               f.diff
        FROM files f

        JOIN revision_files rf
        ON rf.file_id = f.file_id

        WHERE rf.revision_id = ANY($1)
      `,
      [revision_ids]
    )
    return result.rows
  },
  // get total count of current files
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
  // get gist's first file preview from current files
  async getPreviewForGists({ client, revision_ids }) {
    const result = await client.query(
      `
        SELECT
          f.filename,
          f.content,
          f.diff,
          rf.revision_id
        FROM files f

        JOIN (
          SELECT DISTINCT ON (file_id) file_id, revision_id
          FROM revision_files
          WHERE revision_id = ANY($1)
          ORDER BY file_id, sequence ASC
        ) rf

        ON rf.file_id = f.file_id
      `,
      [revision_ids]
    )
    return result.rows
  },
}
module.exports = queries
